import type { AppState, DiaryKind, TaskType } from './types'
import type { VoicePlan } from './voice'
import { dosesFor } from './meds'
import { daysLeft } from './store'
import { TASK_TYPES } from './content'
import { addDays, nowTime, today, uid, weekday, weekdayShort } from './utils'

// KI-Assistent (online): schickt die Frage und einen knappen Auszug der Pflegedaten an
// die Server-Funktion api/assistant.ts (Claude). Bewusst NICHT enthalten: Telefonnummern,
// Adressen, Diagnosen, Notfallmappe, Belastungs-Check. Vorgeschlagene Aktionen werden hier
// gegen die echten Daten geprüft und erst nach „Ja“ gespeichert.

export interface AiAction {
  type: 'mark_dose' | 'add_diary' | 'add_appointment' | 'assign_task' | 'offer_swap' | 'create_task' | 'assign_med_round' | 'complete_task' | 'navigate'
  summary: string
  task_id: string | null
  person_id: string | null
  med_id: string | null
  date: string | null
  time: string | null
  slot: 'morgens' | 'abends' | null
  title: string | null
  text: string | null
  place: string | null
  diary_kind: DiaryKind | null
  task_type: TaskType | null
  path: string | null
}

export interface AiTurn {
  role: 'user' | 'assistant'
  content: string
}

const NAV_PATHS = ['/heute', '/medikamente', '/dienstplan', '/dienstplan/monat', '/ich', '/mehr/tagebuch', '/mehr/notfallmappe', '/mehr/familie', '/mehr/einstellungen', '/krise']
const isDate = (s: string | null): s is string => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s)
const isTime = (s: string | null): s is string => !!s && /^([01]\d|2[0-3]):[0-5]\d$/.test(s)

// KI-Assistent vorerst ausgeschaltet (kostenlos, ohne API-Schlüssel). Zum Einschalten auf true setzen
// und ANTHROPIC_API_KEY in Vercel hinterlegen, siehe README.
export const AI_FEATURE = false

export const aiAvailable = () => typeof navigator === 'undefined' || navigator.onLine

export function buildContext(s: AppState) {
  const t = today()
  const name = (id: string | null) => s.people.find((p) => p.id === id)?.name ?? null
  const patient = s.people.find((p) => p.role === 'gepflegt')
  return {
    heute: `${t} (${weekday(t)})`,
    uhrzeit: nowTime(),
    ich: { id: s.activePerson, name: name(s.activePerson) },
    anrede: patient ? `${patient.name} (für die Familie: ${patient.relation.split(',')[0] === 'Mutter' ? 'Mama' : patient.name})` : null,
    personen: s.people.map((p) => ({ id: p.id, name: p.name, rolle: p.roleLabel, beziehung: p.relation.split(',')[0], verfuegbar: p.availability.map((d) => ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][d]) })),
    heute_medikamente: dosesFor(s, t).map((d) => ({ med_id: d.med.id, name: d.med.name, zeit: d.time, gegeben: d.log ? { von: name(d.log.givenBy), um: d.log.givenAt } : null })),
    medikamente: s.medications.map((m) => ({ id: m.id, name: m.name, staerke: m.strength, zeiten: m.times, hinweis: m.note, reicht_noch_tage: daysLeft(m) })),
    tabletten_dienst: s.medRounds.filter((r) => r.date >= t && r.date <= addDays(t, 6)).map((r) => ({ datum: `${r.date} ${weekdayShort(r.date)}`, slot: r.slot, person_id: r.person })),
    aufgaben: s.tasks
      .filter((x) => !x.done && x.date >= t && x.date <= addDays(t, 13))
      .map((x) => ({ id: x.id, typ: x.type, titel: x.title, datum: `${x.date} ${weekdayShort(x.date)}`, zeit: x.time ?? null, person_id: x.assignee, zum_tausch: x.swapOffered })),
    termine: s.appointments.filter((a) => a.date >= t).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).slice(0, 10).map((a) => ({ titel: a.title, datum: `${a.date} ${weekdayShort(a.date)}`, zeit: a.time, ort: a.place, begleitung: name(a.companion) })),
    tagebuch_7_tage: s.diary.filter((e) => e.at >= addDays(t, -7)).slice(0, 20).map((e) => ({ wann: e.at.slice(0, 16), art: e.kind, text: e.text, von: name(e.by) })),
    abwesenheiten: s.absences.filter((a) => a.to >= t).map((a) => ({ person: name(a.person), von: a.from, bis: a.to })),
  }
}

export async function askAssistant(text: string, s: AppState, history: AiTurn[]): Promise<{ reply: string; actions: AiAction[] }> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 25_000)
  try {
    const res = await fetch('/api/assistant', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text, context: buildContext(s), history: history.slice(-6) }),
      signal: ctrl.signal,
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = (await res.json()) as { reply?: string; actions?: AiAction[] }
    if (typeof data.reply !== 'string' || !Array.isArray(data.actions)) throw new Error('Antwort unvollständig')
    return { reply: data.reply, actions: data.actions }
  } finally {
    clearTimeout(timer)
  }
}

// Vorschläge der KI prüfen und in einen Plan mit Bestätigung umwandeln
export function planFromAi(reply: string, actions: AiAction[], s: AppState): VoicePlan {
  const person = (id: string | null) => s.people.find((p) => p.id === id && p.role !== 'gepflegt')
  const task = (id: string | null) => s.tasks.find((x) => x.id === id)
  const t = today()
  const ok: AiAction[] = []
  let nav: string | undefined

  for (const a of actions) {
    switch (a.type) {
      case 'navigate':
        if (a.path && NAV_PATHS.includes(a.path)) nav = a.path
        break
      case 'mark_dose':
        if (dosesFor(s, t).some((d) => d.med.id === a.med_id && d.time === a.time && !d.log)) ok.push(a)
        break
      case 'add_diary':
        if (a.text?.trim()) ok.push(a)
        break
      case 'add_appointment':
        if (a.title?.trim() && isDate(a.date) && isTime(a.time)) ok.push(a)
        break
      case 'assign_task':
        if (task(a.task_id) && person(a.person_id)) ok.push(a)
        break
      case 'offer_swap':
      case 'complete_task':
        if (task(a.task_id)) ok.push(a)
        break
      case 'create_task':
        if (a.task_type && a.task_type in TASK_TYPES && isDate(a.date) && (!a.person_id || person(a.person_id))) ok.push(a)
        break
      case 'assign_med_round':
        if (isDate(a.date) && a.slot && person(a.person_id)) ok.push(a)
        break
    }
  }

  const dropped = actions.filter((a) => a.type !== 'navigate').length - ok.length
  const note = dropped > 0 ? 'Einen Teil konnte ich nicht zuordnen, bitte im Dienstplan prüfen. ' : ''
  if (!ok.length) return { reply: note + reply, nav }

  const lines = ok.map((a) => a.summary)
  return {
    reply: note + reply,
    nav,
    confirm: {
      question: 'Stimmt das?',
      items: lines,
      run: (d) => ok.forEach((a) => apply(a, d)),
      done: ok.length > 1 ? `Erledigt: ${lines.join('; ')}.` : `Erledigt: ${lines[0]}.`,
    },
  }
}

function apply(a: AiAction, d: AppState) {
  const me = d.activePerson
  const meName = d.people.find((p) => p.id === me)?.name ?? 'Jemand'
  const notice = (text: string) => d.notices.unshift({ id: uid(), at: new Date().toISOString(), text, read: false })
  const x = d.tasks.find((y) => y.id === a.task_id)
  switch (a.type) {
    case 'mark_dose': {
      if (d.doseLogs.some((l) => l.medId === a.med_id && l.date === today() && l.time === a.time)) return
      d.doseLogs.push({ medId: a.med_id!, date: today(), time: a.time!, givenBy: me, givenAt: nowTime() })
      const med = d.medications.find((m) => m.id === a.med_id)
      if (med) med.stock = Math.max(0, med.stock - med.perDose)
      return
    }
    case 'add_diary':
      d.diary.unshift({ id: uid(), at: new Date().toISOString(), kind: a.diary_kind ?? 'sonstiges', text: a.text!.trim(), by: me })
      return
    case 'add_appointment':
      d.appointments.push({ id: uid(), title: a.title!.trim(), date: a.date!, time: a.time!, place: a.place ?? '', companion: null })
      return
    case 'assign_task':
      if (!x) return
      Object.assign(x, { assignee: a.person_id, swapOffered: false })
      if (a.person_id !== me) notice(`${meName} hat „${x.title}“ an ${d.people.find((p) => p.id === a.person_id)?.name} weitergegeben (simuliert benachrichtigt).`)
      return
    case 'offer_swap':
      if (x) x.swapOffered = true
      if (x) notice(`${meName} bietet „${x.title}“ zum Tausch an.`)
      return
    case 'complete_task':
      if (x) x.done = true
      return
    case 'create_task':
      d.tasks.push({ id: uid(), type: a.task_type!, title: a.title?.trim() || TASK_TYPES[a.task_type!].label, date: a.date!, time: isTime(a.time) ? a.time : undefined, assignee: a.person_id, swapOffered: false, done: false })
      return
    case 'assign_med_round': {
      const r = d.medRounds.find((y) => y.date === a.date && y.slot === a.slot)
      if (r) r.person = a.person_id
      else d.medRounds.push({ date: a.date!, slot: a.slot!, person: a.person_id })
      if (a.person_id !== me) notice(`Tabletten ${a.slot} am ${a.date}: jetzt ${d.people.find((p) => p.id === a.person_id)?.name}.`)
      return
    }
  }
}
