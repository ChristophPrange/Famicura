import type { AppState, DiaryKind, TaskType } from './types'
import { dosesFor } from './meds'
import { daysLeft } from './store'
import { DIARY_KINDS, TASK_TYPES } from './content'
import { addDays, formatDateLong, nowTime, pad, relativeDay, today, uid } from './utils'

// Sprachsteuerung: einfache, regelbasierte Erkennung deutscher Sätze.
// Läuft komplett im Browser, ohne KI-Dienst. Die Spracherkennung selbst (Audio → Text)
// übernimmt die Web Speech API des Browsers, siehe components/Voice.tsx.

export interface VoicePlan {
  reply: string // wird angezeigt und vorgelesen
  // Eingaben werden nie sofort gespeichert, sondern erst nach „Ja“
  confirm?: { question: string; run: (d: AppState) => void; done: string; items?: string[] }
  nav?: string
}

export const EXAMPLES = {
  fragen: ['Was steht heute an?', 'Wann gibt es die nächsten Tabletten?', 'Hatte Mama ihre Tabletten?', 'Wann ist der nächste Arzttermin?', 'Wer ist morgen dran?', 'Was ist noch offen?', 'Wie lange reichen die Tabletten?'],
  eingaben: ['Ich habe die Morgentabletten gegeben', 'Blutdrucktablette gegeben', 'Ins Tagebuch: Mama hat heute wenig getrunken', 'Termin beim Zahnarzt am Freitag um 10 Uhr', 'Ich übernehme den Einkauf', 'Gib den Einkauf am Donnerstag an Markus weiter', 'Lena soll diese Woche abends die Tabletten geben', 'Ich kann den Besuch am Samstag nicht'],
}

const WEEKDAYS = ['sonntag', 'montag', 'dienstag', 'mittwoch', 'donnerstag', 'freitag', 'samstag']
const MONTHS = ['januar', 'februar', 'märz', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'dezember']
const NUMBER_WORDS: Record<string, number> = {
  eins: 1, zwei: 2, drei: 3, vier: 4, fünf: 5, sechs: 6, sieben: 7, acht: 8, neun: 9, zehn: 10, elf: 11, zwölf: 12,
  dreizehn: 13, vierzehn: 14, fünfzehn: 15, sechzehn: 16, siebzehn: 17, achtzehn: 18, neunzehn: 19, zwanzig: 20,
}

export function normalize(text: string) {
  let t = ' ' + text.toLowerCase().replace(/[!?,;„“"]/g, ' ').replace(/\.(?=\s|$)/g, ' ').replace(/\s+/g, ' ') + ' '
  t = t.replace(/ ein uhr /g, ' 1 uhr ')
  for (const [w, n] of Object.entries(NUMBER_WORDS)) t = t.replace(new RegExp(` ${w} `, 'g'), ` ${n} `)
  return t.replace(/\s+/g, ' ').trim()
}

const has = (t: string, ...words: (string | RegExp)[]) => words.some((w) => (typeof w === 'string' ? t.includes(w) : w.test(t)))

// Datum aus einem Satz lesen: heute, morgen, übermorgen, Wochentag, „am 5.11.“, „am 5. November“
// Hinweis: \b funktioniert in JS nicht mit Umlauten, daher Leerzeichen als Wortgrenze.
export function parseDate(text: string): { date: string; match: string } | null {
  const t = ` ${text} `
  const base = today()
  let m: RegExpMatchArray | null
  if ((m = t.match(/ übermorgen /))) return { date: addDays(base, 2), match: m[0].trim() }
  if ((m = t.match(/ morgen /))) return { date: addDays(base, 1), match: m[0].trim() }
  if ((m = t.match(/ heute /))) return { date: base, match: m[0].trim() }
  if ((m = t.match(/ (?:am )?(\d{1,2})\. ?(\d{1,2})\.?(?: ?(\d{4}))?(?= )/)) && +m[2] >= 1 && +m[2] <= 12 && +m[1] >= 1 && +m[1] <= 31)
    return { date: fixYear(+m[1], +m[2], m[3]), match: m[0].trim() }
  if ((m = t.match(new RegExp(` (?:am )?(\\d{1,2})\\.? (${MONTHS.join('|')})(?= )`)))) return { date: fixYear(+m[1], MONTHS.indexOf(m[2]) + 1), match: m[0].trim() }
  if ((m = t.match(new RegExp(` (?:am |nächsten |kommenden )?(${WEEKDAYS.join('|')})(?= )`)))) {
    const target = WEEKDAYS.indexOf(m[1])
    const cur = new Date(base + 'T12:00:00').getDay()
    return { date: addDays(base, (target - cur + 7) % 7 || 7), match: m[0].trim() }
  }
  return null
}

function fixYear(day: number, month: number, year?: string) {
  const y = year ? +year : new Date().getFullYear()
  let iso = `${y}-${pad(month)}-${pad(day)}`
  if (!year && iso < today()) iso = `${y + 1}-${pad(month)}-${pad(day)}`
  return iso
}

// Uhrzeit: „um 10 Uhr“, „um 10:30“, „10 Uhr 30“, „um halb 11“
export function parseTime(text: string): { time: string; match: string } | null {
  let m: RegExpMatchArray | null
  const t = ` ${text} `
  if ((m = t.match(/ (?:um )?halb (\d{1,2})(?: uhr)?(?= )/))) return { time: `${pad((+m[1] + 23) % 24)}:30`, match: m[0].trim() }
  if ((m = t.match(/ (?:um )?(\d{1,2})[:.](\d{2}) uhr(?= )/))) return valid(+m[1], +m[2], m[0])
  if ((m = t.match(/ um (\d{1,2})[:.](\d{2})(?= )/))) return valid(+m[1], +m[2], m[0])
  if ((m = t.match(/ (\d{1,2}):(\d{2})(?= )/))) return valid(+m[1], +m[2], m[0])
  if ((m = t.match(/ (?:um )?(\d{1,2}) uhr(?: (\d{1,2}))?(?= )/))) return valid(+m[1], m[2] ? +m[2] : 0, m[0])
  if ((m = t.match(/ um (\d{1,2})(?= )/))) return valid(+m[1], 0, m[0])
  return null
}

const valid = (h: number, min: number, match: string) => (h < 24 && min < 60 ? { time: `${pad(h)}:${pad(min)}`, match: match.trim() } : null)

const slotOf = (time: string) => (time < '12:00' ? 'morgens' : 'abends')
const list = (items: string[]) => (items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} und ${items[items.length - 1]}`)
const day = (iso: string) => (iso === today() || iso === addDays(today(), 1) ? relativeDay(iso).toLowerCase() : `am ${formatDateLong(iso)}`)
const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

// Alltagsnamen für Medikamente (Demo-Plan). Im echten Einsatz pflegt die Familie diese selbst.
const MED_ALIASES: Record<string, string[]> = {
  pantoprazol: ['magen', 'magentablette', 'magenschutz'],
  ramipril: ['blutdruck', 'blutdrucktablette', 'herztablette'],
  metformin: ['zucker', 'zuckertablette', 'diabetes'],
  donepezil: ['gedächtnis', 'demenz', 'gedächtnistablette'],
}

const mentionedMeds = (t: string, s: AppState) =>
  s.medications.filter((m) => {
    const n = m.name.toLowerCase()
    return t.includes(n) || (MED_ALIASES[n] ?? []).some((a) => t.includes(a))
  })

const TASK_WORDS: [TaskType, RegExp][] = [
  ['einkaufen', /einkauf|einkaufen/],
  ['besuch', /besuch|vorbeischauen|nach (mama|ihr) sehen/],
  ['arzt', /arzt|ärztin|begleit/],
  ['waesche', /wäsche|waschen/],
  ['nacht', /nacht/],
  ['rezept', /rezept/],
]

const DIARY_WORDS: [DiaryKind, RegExp][] = [
  ['sturz', /gestürzt|sturz|hingefallen|gefallen/],
  ['schlaf', /schlaf|geschlafen|nacht|müde|wach/],
  ['trinken', /trink|getrunken/],
  ['essen', /\bess|gegessen|appetit|mahlzeit/],
  ['stimmung', /stimmung|gelaunt|traurig|fröhlich|unruhig|ängstlich|verwirrt/],
]

const NAV: [RegExp, string, string][] = [
  [/medikament|tabletten ?plan/, '/medikamente', 'Medikamente'],
  [/dienstplan|kalender/, '/dienstplan', 'Dienstplan'],
  [/tagebuch/, '/mehr/tagebuch', 'Pflegetagebuch'],
  [/notfallmappe/, '/mehr/notfallmappe', 'Notfallmappe'],
  [/familie/, '/mehr/familie', 'Familie'],
  [/einstellung/, '/mehr/einstellungen', 'Einstellungen'],
  [/belastung|check|wie geht es mir/, '/ich', 'Belastungs-Check'],
  [/startseite|übersicht|heute/, '/heute', 'Heute'],
]

export function interpret(raw: string, s: AppState): VoicePlan {
  const t = normalize(raw)
  const meId = s.activePerson
  const name = (id: string | null | undefined) => (id === meId ? 'Sie' : s.people.find((p) => p.id === id)?.name ?? 'niemand')
  const byName = (id: string) => (id === meId ? 'Ihnen' : name(id)) // „gegeben von Ihnen“
  const patient = s.people.find((p) => p.role === 'gepflegt')?.name ?? 'die gepflegte Person'
  const now = nowTime()
  const doses = dosesFor(s, today())
  const open = doses.filter((d) => !d.log)

  if (!t) return { reply: 'Ich habe nichts verstanden. Bitte noch einmal.' }

  // ---------- Eingabe: Tagebuch ----------
  const clean = raw.trim().replace(/\s+/g, ' ').replace(/[„“"]/g, '')
  const diary = clean.match(/^(?:bitte )?(?:ins |in das )?(?:pflege)?tagebuch(?: eintragen| notieren| schreiben)?:? (.+)$/i) ?? clean.match(/^(?:bitte )?(?:notiere|notier|schreib|schreibe|trag|trage)(?: bitte)?,?(?: ins tagebuch| in das tagebuch| auf)?:? (.+?)(?: ein| ins tagebuch)?[.!]?$/i)
  if (diary) {
    const text = capital(diary[1].replace(/^(dass|das) /i, '').trim())
    const kind = DIARY_WORDS.find(([, re]) => re.test(text))?.[0] ?? 'sonstiges'
    return {
      reply: `Ich habe verstanden: Tagebuch-Eintrag (${DIARY_KINDS[kind].label}): „${text}“.`,
      confirm: {
        question: 'Stimmt das?',
        run: (d) => void d.diary.unshift({ id: uid(), at: new Date().toISOString(), kind, text, by: d.activePerson }),
        done: 'Eingetragen im Pflegetagebuch.',
      },
    }
  }

  // ---------- Notfall (nach ausdrücklichen Tagebuch-Einträgen) ----------
  if (has(t, 'notfall', 'krise', 'brauche hilfe', /^hilfe$/, /^hilfe bitte$/, 'notarzt', 'krankenwagen', / 112\b/, /^112/)) {
    return { reply: 'Bei Lebensgefahr rufen Sie sofort die 112. Ich öffne den Krisen-Assistenten.', nav: '/krise' }
  }

  // ---------- Hilfe ----------
  if (has(t, 'was kann ich sagen', 'was kannst du', 'beispiel', 'wie funktioniert')) {
    return { reply: `Sie können zum Beispiel fragen: „${EXAMPLES.fragen[0]}“ oder „${EXAMPLES.fragen[1]}“. Oder eintragen: „${EXAMPLES.eingaben[0]}“ oder „${EXAMPLES.eingaben[2]}“.` }
  }

  // ---------- Eingabe: Medikament gegeben ----------
  if (has(t, 'gegeben', 'genommen hat', 'abhaken', 'abgehakt', 'verabreicht', 'eingenommen hat') && !has(t, /^(hat|haben|wurde|wurden|sind|ist) /, /\?$/)) {
    const named = mentionedMeds(t, s)
    let pick = open
    if (named.length) pick = open.filter((d) => named.some((m) => m.id === d.med.id)).slice(0, named.length)
    else if (has(t, 'morgen', 'früh', 'frühstück')) pick = open.filter((d) => slotOf(d.time) === 'morgens')
    else if (has(t, 'abend', 'mittag', 'nachmittag')) pick = open.filter((d) => slotOf(d.time) === 'abends')
    else pick = open.filter((d) => d.time <= now).length ? open.filter((d) => d.time <= now) : open.filter((d) => d.time === open[0]?.time)
    if (named.length && !pick.length) return { reply: `${named.map((m) => m.name).join(' und ')} ist heute schon abgehakt oder steht heute nicht im Plan.` }
    if (!pick.length) return { reply: 'Es sind heute keine passenden Medikamente mehr offen. Alles abgehakt.' }
    const items = pick.map((d) => `${d.med.name} (${d.time} Uhr)`)
    return {
      reply: `Ich habe verstanden: ${list(items)} wurde gegeben.`,
      confirm: {
        question: 'Stimmt das?',
        run: (d) => {
          for (const p of pick) {
            if (d.doseLogs.some((l) => l.medId === p.med.id && l.date === today() && l.time === p.time)) continue
            d.doseLogs.push({ medId: p.med.id, date: today(), time: p.time, givenBy: d.activePerson, givenAt: nowTime() })
            const med = d.medications.find((m) => m.id === p.med.id)
            if (med) med.stock = Math.max(0, med.stock - med.perDose)
          }
        },
        done: `Abgehakt: ${list(pick.map((d) => d.med.name))}.`,
      },
    }
  }

  // ---------- Eingabe: Termin ----------
  if (has(t, 'termin') && (has(t, 'neuer termin', 'trag', 'eintragen', 'notier', 'termin beim', 'termin bei') || parseDate(t)) && !has(t, 'wann', 'nächste', 'welche', 'habe ich', 'haben wir', 'gibt es')) {
    const d = parseDate(t)
    const tm = parseTime(t)
    if (!d) return { reply: 'Für welchen Tag? Sagen Sie zum Beispiel: „Termin beim Zahnarzt am Freitag um 10 Uhr“.' }
    let title = t
    for (const part of [d.match, tm?.match ?? '']) if (part) title = title.replace(part, ' ')
    title = title
      .split(' ')
      .filter((w) => !['bitte', 'neuer', 'neuen', 'einen', 'ein', 'termin', 'trag', 'trage', 'eintragen', 'notiere', 'notier', 'für', 'mama', 'anna'].includes(w))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/^(beim|bei der|bei dem|bei|zum|zur) /, '')
    const label = title ? capital(title) : 'Termin'
    const time = tm?.time ?? '09:00'
    return {
      reply: `Ich habe verstanden: neuer Termin ${label}, ${day(d.date)} um ${time} Uhr${tm ? '' : ' (keine Uhrzeit genannt, bitte später anpassen)'}.`,
      confirm: {
        question: 'Stimmt das?',
        run: (draft) => void draft.appointments.push({ id: uid(), title: label, date: d.date, time, place: '', companion: null }),
        done: 'Der Termin steht jetzt im Kalender.',
      },
    }
  }

  // ---------- Eingabe: Tablettendienst an jemanden geben ----------
  const helper = s.people.find((p) => p.id !== meId && p.role !== 'gepflegt' && p.role !== 'pflegedienst' && new RegExp(`(^| )${p.name.toLowerCase()}( |$)`).test(t))
  const handOver = has(t, 'weiter', 'gib ', 'gebe ', 'geben ', 'gibt ', 'soll', 'übernimmt', 'übernehmen', 'macht', 'abgeben')
  if (helper && handOver && has(t, 'tablette', 'medikament', 'pille') && has(t, 'abend', 'morgen', 'früh')) {
    const slot = has(t, 'abend') ? 'abends' : 'morgens'
    const week = has(t, 'diese woche', 'ganze woche', 'nächste woche', 'sieben tage', '7 tage')
    const start = has(t, 'nächste woche') ? addDays(today(), 7) : (parseDate(t)?.date ?? today())
    const dates = week ? Array.from({ length: 7 }, (_, i) => addDays(start, i)) : [start]
    const label = week ? `vom ${formatDateLong(dates[0])} bis ${formatDateLong(dates[6])}` : day(start)
    return {
      reply: `Ich habe verstanden: ${helper.name} gibt ${label} ${slot === 'morgens' ? 'früh' : !week && (label === 'heute' || label === 'morgen') ? 'Abend' : 'abends'} die Tabletten.`,
      confirm: {
        question: 'Stimmt das?',
        run: (d) => {
          for (const date of dates) {
            const r = d.medRounds.find((x) => x.date === date && x.slot === slot)
            if (r) r.person = helper.id
            else d.medRounds.push({ date, slot, person: helper.id })
          }
          d.notices.unshift({ id: uid(), at: new Date().toISOString(), text: `Tabletten ${slot} ${label}: jetzt ${helper.name} (simuliert benachrichtigt).`, read: false })
        },
        done: `Eingetragen. ${helper.name} wird benachrichtigt.`,
      },
    }
  }

  // ---------- Eingabe: Aufgabe an jemanden weitergeben ----------
  if (helper && handOver) {
    const type = TASK_WORDS.find(([, re]) => re.test(t))?.[0]
    const d = parseDate(t)
    const cands = s.tasks
      .filter((x) => !x.done && x.date >= today() && x.assignee !== helper.id)
      .filter((x) => (!type || x.type === type) && (!d || x.date === d.date))
      // zuerst eigene Aufgaben, dann offene, dann die der anderen
      .sort((a, b) => rank(a.assignee) - rank(b.assignee) || a.date.localeCompare(b.date))
    function rank(id: string | null) {
      return id === meId ? 0 : id === null ? 1 : 2
    }
    const task = cands[0]
    if (!type && !d) return { reply: `Welche Aufgabe soll ${helper.name} übernehmen? Sagen Sie zum Beispiel: „Gib den Einkauf am Donnerstag an ${helper.name} weiter“.` }
    if (!task) return { reply: `Ich finde ${type ? `für „${TASK_TYPES[type].label}“ ` : ''}${d ? day(d.date) + ' ' : ''}keine passende Aufgabe. Im Dienstplan sehen Sie alle Aufgaben.` }
    const from = task.assignee === meId ? 'von Ihnen ' : task.assignee ? `von ${name(task.assignee)} ` : ''
    const off = !helper.availability.includes(new Date(task.date + 'T12:00:00').getDay())
    return {
      reply: `Ich habe verstanden: ${task.title} ${day(task.date)}${task.time ? ` um ${task.time} Uhr` : ''} geht ${from}an ${helper.name}.${off ? ` Hinweis: ${helper.name} ist an diesem Tag normalerweise nicht verfügbar.` : ''}`,
      confirm: {
        question: 'Stimmt das?',
        run: (draft) => {
          const x = draft.tasks.find((y) => y.id === task.id)
          if (x) Object.assign(x, { assignee: helper.id, swapOffered: false })
          draft.notices.unshift({ id: uid(), at: new Date().toISOString(), text: `„${task.title}“ ${day(task.date)} ist jetzt bei ${helper.name} (simuliert benachrichtigt).`, read: false })
        },
        done: `Erledigt. ${helper.name} wird benachrichtigt.`,
      },
    }
  }

  // ---------- Eingabe: Ich kann nicht -> zum Tausch anbieten ----------
  if (has(t, /\bkann\b.*\bnicht\b/, /\bschaffe?\b.*\bnicht\b/, 'zum tausch', 'tauschen')) {
    const type = TASK_WORDS.find(([, re]) => re.test(t))?.[0]
    const d = parseDate(t)
    const task = s.tasks
      .filter((x) => !x.done && x.date >= today() && x.assignee === meId && (!type || x.type === type) && (!d || x.date === d.date))
      .sort((a, b) => a.date.localeCompare(b.date))[0]
    if (task && (type || d)) {
      return {
        reply: `Ich habe verstanden: Sie bieten ${task.title} ${day(task.date)} zum Tausch an. Die Familie sieht das im Dienstplan.`,
        confirm: {
          question: 'Stimmt das?',
          run: (draft) => {
            const x = draft.tasks.find((y) => y.id === task.id)
            if (x) x.swapOffered = true
          },
          done: 'Zum Tausch angeboten.',
        },
      }
    }
    return { reply: `Ich finde keine passende Aufgabe von Ihnen${d ? ' ' + day(d.date) : ''}. Sagen Sie zum Beispiel: „Ich kann den Einkauf am Donnerstag nicht“, oder sehen Sie im Dienstplan nach.` }
  }

  // ---------- Eingabe: Aufgabe übernehmen ----------
  if (has(t, 'übernehme', 'mach ich', 'mache ich', 'kümmere mich')) {
    const type = TASK_WORDS.find(([, re]) => re.test(t))?.[0]
    const d = parseDate(t)
    const cands = s.tasks
      .filter((x) => !x.done && x.date >= today() && x.assignee !== meId && (x.assignee === null || x.swapOffered))
      .filter((x) => (!type || x.type === type) && (!d || x.date === d.date))
      .sort((a, b) => a.date.localeCompare(b.date))
    const task = cands[0]
    if (!task) return { reply: `Ich finde ${type ? `für „${TASK_TYPES[type].label}“ ` : ''}${d ? day(d.date) + ' ' : ''}keine offene Aufgabe. Im Dienstplan sehen Sie alle Aufgaben.` }
    return {
      reply: `Ich habe verstanden: Sie übernehmen ${task.title}, ${day(task.date)}${task.time ? ` um ${task.time} Uhr` : ''}.`,
      confirm: {
        question: 'Stimmt das?',
        run: (draft) => {
          const x = draft.tasks.find((y) => y.id === task.id)
          if (x) Object.assign(x, { assignee: draft.activePerson, swapOffered: false })
        },
        done: 'Erledigt, die Aufgabe steht jetzt bei Ihnen.',
      },
    }
  }

  // ---------- Frage: Wurden Medikamente gegeben? ----------
  if (has(t, 'bekommen', 'genommen', 'gegeben', 'eingenommen', 'hatte', 'schon gehabt') && (has(t, 'tablette', 'medikament', 'pille') || mentionedMeds(t, s).length)) {
    const asked = mentionedMeds(t, s)
    const due = doses.filter((d) => d.time <= now && (!asked.length || asked.some((m) => m.id === d.med.id)))
    if (!due.length) return { reply: `Heute war bisher noch nichts davon fällig. Als Nächstes um ${(asked.length ? doses.find((d) => asked.some((m) => m.id === d.med.id)) : doses[0])?.time ?? '–'} Uhr.` }
    const given = due.filter((d) => d.log)
    const missing = due.filter((d) => !d.log)
    if (!missing.length) return { reply: `Ja. Alles, was bis jetzt fällig war, ist gegeben: ${list(given.map((d) => `${d.med.name} von ${byName(d.log!.givenBy)} um ${d.log!.givenAt} Uhr`))}.` }
    return { reply: `Noch nicht alles. Offen ist: ${list(missing.map((d) => `${d.med.name} (${d.time} Uhr)`))}.${given.length ? ` Gegeben: ${list(given.map((d) => d.med.name))}.` : ''}` }
  }

  // ---------- Frage: Nächste Tabletten ----------
  if (has(t, 'tablette', 'medikament', 'pille') && has(t, 'nächste', 'wann', 'welche', 'als nächstes', 'noch')) {
    if (open.length) {
      const first = open[0].time
      const group = open.filter((d) => d.time === first)
      const round = s.medRounds.find((r) => r.date === today() && r.slot === slotOf(first))
      const late = first < now ? ' Die sind schon fällig.' : ''
      return { reply: `Als Nächstes um ${first} Uhr: ${list(group.map((d) => `${d.med.name} ${d.med.strength}`))}.${late} Zuständig ist ${name(round?.person)}.` }
    }
    const tomorrow = dosesFor(s, addDays(today(), 1))[0]
    return { reply: `Heute ist alles gegeben. Morgen geht es um ${tomorrow?.time ?? '–'} Uhr weiter.` }
  }

  // ---------- Frage: Vorrat ----------
  if (has(t, 'reich', 'vorrat', 'packung', 'nachbestell')) {
    const low = s.medications.map((m) => ({ m, days: daysLeft(m) })).sort((a, b) => a.days - b.days)
    const warn = low.filter((x) => x.days <= 7)
    return {
      reply: warn.length
        ? `Bald nachbestellen: ${list(warn.map((x) => `${x.m.name} reicht noch ${x.days} Tage`))}. Die anderen reichen länger als eine Woche.`
        : `Alles reicht noch länger als eine Woche. Am knappsten ist ${low[0].m.name} mit ${low[0].days} Tagen.`,
    }
  }

  // ---------- Frage: Termine ----------
  if (has(t, 'termin', 'arzt', 'ärztin')) {
    const on = parseDate(t)?.date
    if (on) {
      const appts = s.appointments.filter((a) => a.date === on).sort((a, b) => a.time.localeCompare(b.time))
      return { reply: appts.length ? `${capital(day(on))}: ${list(appts.map((a) => `${a.title} um ${a.time} Uhr`))}.` : `${capital(day(on))} steht kein Termin an.` }
    }
    const next = [...s.appointments].filter((a) => a.date >= today()).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0]
    if (!next) return { reply: 'Es steht kein Termin an.' }
    return { reply: `Der nächste Termin: ${next.title}, ${day(next.date)} um ${next.time} Uhr${next.place ? `, ${next.place}` : ''}. Begleitung: ${next.companion ? name(next.companion) : 'noch niemand eingeteilt'}.` }
  }

  // ---------- Frage: Was ist offen / unbesetzt ----------
  if (has(t, 'offen', 'unbesetzt', 'fehlt', 'niemand')) {
    const gaps = s.tasks.filter((x) => !x.done && x.assignee === null && x.date >= today() && x.date <= addDays(today(), 2))
    const rounds = s.medRounds.filter((r) => r.person === null && r.date >= today() && r.date <= addDays(today(), 2))
    if (!gaps.length && !rounds.length) return { reply: 'Bis übermorgen ist alles besetzt.' }
    const items = [...gaps.map((x) => `${x.title} ${day(x.date)}`), ...rounds.map((r) => `Tabletten ${r.slot} ${day(r.date)}`)]
    return { reply: `Noch niemand eingeteilt für: ${list(items)}. Sagen Sie zum Beispiel „Ich übernehme den Einkauf“.` }
  }

  // ---------- Frage: Wer ist dran ----------
  if (has(t, 'wer ', 'dran', 'zuständig', 'dienst')) {
    const d = parseDate(t)?.date ?? today()
    const tasks = s.tasks.filter((x) => x.date === d && !x.done)
    const slot = has(t, 'abend') ? 'abends' : has(t, 'morgens', 'früh') ? 'morgens' : null
    const rounds = s.medRounds.filter((r) => r.date === d && (!slot || r.slot === slot))
    const parts = [
      ...rounds.map((r) => `Tabletten ${r.slot}: ${name(r.person)}`),
      ...(slot ? [] : tasks).map((x) => `${x.title}: ${x.assignee ? name(x.assignee) : 'noch offen'}`),
    ]
    return { reply: parts.length ? `${capital(day(d))}: ${list(parts)}.` : `${capital(day(d))} ist nichts eingeplant.` }
  }

  // ---------- Frage: Was steht heute (morgen) an ----------
  if (has(t, 'steht', 'ansteht', 'was ist', 'was gibt', 'tagesplan', 'heute', 'morgen', 'überblick', 'zusammenfassung')) {
    const d = parseDate(t)?.date ?? today()
    const isToday = d === today()
    const dd = isToday ? open : dosesFor(s, d)
    const tasks = s.tasks.filter((x) => x.date === d && !x.done)
    const appts = s.appointments.filter((a) => a.date === d)
    const parts: string[] = []
    parts.push(dd.length ? `${dd.length} ${isToday ? 'offene ' : ''}Medikamenten-Gaben, die nächste um ${dd[0].time} Uhr` : 'alle Medikamente sind gegeben')
    if (tasks.length) parts.push(`Aufgaben: ${list(tasks.map((x) => `${x.title} (${x.assignee ? name(x.assignee) : 'noch offen'})`))}`)
    if (appts.length) parts.push(`Termin: ${list(appts.map((a) => `${a.title} um ${a.time} Uhr`))}`)
    if (!tasks.length && !appts.length) parts.push('keine weiteren Aufgaben oder Termine')
    return { reply: `${capital(day(d))} für ${patient}: ${parts.join('. ')}.` }
  }

  // ---------- Navigation ----------
  if (has(t, 'öffne', 'zeig', 'geh zu', 'gehe zu', 'wechsel')) {
    const target = NAV.find(([re]) => re.test(t))
    if (target) return { reply: `Ich öffne ${target[2]}.`, nav: target[1] }
  }

  return { reply: `Das habe ich leider nicht verstanden: „${raw.trim()}“. Fragen Sie „Was kann ich sagen?“, dann nenne ich Beispiele.` }
}
