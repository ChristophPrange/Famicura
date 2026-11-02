import type { AppState, CareTask, DoseLog, Medication, MedRound, Person, PersonId, SensorEvent, TaskType, UsageEvent } from './types'
import { DEFAULT_RELIEF } from './content'
import { INSTRUMENT, instrumentKey } from './instrument'
import { addDays, nowTime, today, uid } from './utils'
import { DEMO_CODE } from './invites'

export const STATE_VERSION = 3

// Demo-Familie Huber in der intensiven Pflegephase. Alle Daten sind erfunden.
// Demo-Antworten mit gewünschtem Summenwert, gleichmäßig auf alle Aussagen verteilt
function answersFor(total: number, n = INSTRUMENT.items.length): number[] {
  const base = Math.floor(total / n)
  const extra = total - base * n
  return Array.from({ length: n }, (_, i) => Math.min(3, base + ((i * 11) % n < extra ? 1 : 0)))
}

const people: Person[] = [
  { id: 'anna', name: 'Anna', role: 'gepflegt', roleLabel: 'Wird gepflegt', relation: 'Mutter, 82 Jahre, Pflegegrad 3', phone: '0941 123456', color: 'bg-amber-200 text-amber-900', availability: [] },
  { id: 'christina', name: 'Christina', role: 'hauptpflege', roleLabel: 'Kümmert sich hauptsächlich', relation: 'Tochter', phone: '0170 1234567', color: 'bg-sage-200 text-sage-900', availability: [0, 1, 2, 3, 4, 5, 6], hoursPerWeek: 30 },
  { id: 'markus', name: 'Markus', role: 'unterstuetzung', roleLabel: 'Hilft regelmäßig', relation: 'Sohn', phone: '0151 7654321', color: 'bg-sky-200 text-sky-900', availability: [0, 1, 3, 5, 6], hoursPerWeek: 8 },
  { id: 'lena', name: 'Lena', role: 'gelegentlich', roleLabel: 'Hilft ab und zu', relation: 'Enkelin', phone: '0160 2468024', color: 'bg-rose-200 text-rose-900', availability: [2, 4, 6], hoursPerWeek: 4 },
  { id: 'berger', name: 'Frau Berger', role: 'pflegedienst', roleLabel: 'Pflegefachkraft (Partner-Pflegedienst)', relation: 'Pflegedienst Sonnenhof', phone: '0941 778899', color: 'bg-violet-200 text-violet-900', availability: [] },
]

const medications: Medication[] = [
  { id: 'm1', name: 'Pantoprazol', strength: '20 mg', times: ['07:30'], note: 'Vor dem Frühstück', stock: 42, perDose: 1 },
  { id: 'm2', name: 'Ramipril', strength: '5 mg', times: ['08:00'], note: 'Zum Frühstück', stock: 26, perDose: 1 },
  { id: 'm3', name: 'Metformin', strength: '500 mg', times: ['08:00', '18:00'], note: 'Zu den Mahlzeiten', stock: 9, perDose: 1 },
  { id: 'm4', name: 'Donepezil', strength: '5 mg', times: ['20:00'], note: 'Am Abend', stock: 31, perDose: 1 },
]

// Wiederkehrender Wochenrhythmus (0 = Sonntag)
const WEEK_PATTERN: Record<number, TaskType[]> = {
  0: ['besuch'],
  1: ['einkaufen', 'besuch'],
  2: ['besuch'],
  3: ['waesche', 'besuch'],
  4: ['einkaufen', 'besuch'],
  5: ['nacht', 'besuch'],
  6: ['einkaufen', 'besuch'],
}

const TITLES: Record<TaskType, string> = {
  einkaufen: 'Einkauf für Mama',
  besuch: 'Nach Mama sehen',
  arzt: 'Zur Hausärztin begleiten',
  waesche: 'Wäsche waschen',
  nacht: 'Nachtbereitschaft (Telefon an)',
  rezept: 'Rezept nachbestellen',
}

// Christina übernimmt deutlich mehr – so wie in vielen echten Familien.
const ROTATION: PersonId[] = ['christina', 'christina', 'markus', 'christina', 'lena', 'christina', 'markus', 'christina']

const dow = (iso: string) => new Date(iso + 'T12:00:00').getDay()

function buildTasks(): CareTask[] {
  const t = today()
  const start = t.slice(0, 8) + '01'
  const tasks: CareTask[] = []
  let i = 0
  for (let d = start; d <= addDays(t, 13); d = addDays(d, 1)) {
    for (const type of WEEK_PATTERN[dow(d)]) {
      const assignee = ROTATION[i % ROTATION.length]
      i++
      const future = d > t
      tasks.push({
        id: uid(),
        type,
        title: TITLES[type],
        date: d,
        time: type === 'nacht' ? '20:00' : type === 'einkaufen' ? '10:00' : undefined,
        assignee,
        swapOffered: false,
        done: d < t,
      })
      // Ein paar offene Aufgaben in der Zukunft
      if (future && i % 7 === 0) tasks[tasks.length - 1].assignee = null
    }
  }
  tasks.push({ id: uid(), type: 'arzt', title: 'Zur Hausärztin begleiten', date: addDays(t, 3), time: '10:00', assignee: 'markus', swapOffered: false, done: false })
  const swap = tasks.find((x) => x.date > addDays(t, 1) && x.assignee === 'markus' && x.type === 'einkaufen')
  if (swap) swap.swapOffered = true
  return tasks
}

// Zuständigkeit für die Medikamentengabe morgens/abends
function roundPerson(date: string, slot: 'morgens' | 'abends'): PersonId {
  const d = dow(date)
  if (slot === 'morgens') return d === 0 || d === 6 ? 'markus' : 'christina'
  if (d === 1 || d === 3 || d === 5) return 'markus'
  if (d === 2 || d === 4) return 'lena'
  return 'christina'
}

function buildRounds(): MedRound[] {
  const t = today()
  const rounds: MedRound[] = []
  for (let d = addDays(t, -14); d <= addDays(t, 13); d = addDays(d, 1))
    for (const slot of ['morgens', 'abends'] as const) rounds.push({ date: d, slot, person: roundPerson(d, slot) })
  // Übermorgen abends ist noch niemand eingeteilt
  const gap = rounds.find((r) => r.date === addDays(t, 2) && r.slot === 'abends')
  if (gap) gap.person = null
  return rounds
}

function buildDoseLogs(): DoseLog[] {
  const t = today()
  const now = nowTime()
  const logs: DoseLog[] = []
  // Letzte 7 Tage: alles gegeben – von der jeweils zuständigen Person
  for (let d = addDays(t, -7); d < t; d = addDays(d, 1))
    for (const m of medications)
      for (const time of m.times) {
        const slot = time < '12:00' ? 'morgens' : 'abends'
        logs.push({ medId: m.id, date: d, time, givenBy: roundPerson(d, slot), givenAt: time.slice(0, 3) + '10' })
      }
  // Heute: was schon länger fällig ist, ist gegeben
  for (const m of medications)
    for (const time of m.times)
      if (time < '09:00' && now > '09:00') logs.push({ medId: m.id, date: t, time, givenBy: roundPerson(t, 'morgens'), givenAt: time.slice(0, 3) + '05' })
  return logs
}

function buildSensorEvents(): SensorEvent[] {
  const t = today()
  const y = addDays(t, -1)
  const ev = (date: string, time: string, device: SensorEvent['device']): SensorEvent => ({ at: new Date(`${date}T${time}:00`).toISOString(), device })
  const list = [
    ev(y, '07:12', 'flur'),
    ev(y, '07:18', 'bad'),
    ev(y, '07:40', 'kueche'),
    ev(y, '11:02', 'tuer'),
    ev(y, '11:55', 'tuer'),
    ev(y, '18:05', 'kueche'),
    ev(y, '21:30', 'bad'),
  ]
  if (nowTime() > '07:45') list.push(ev(t, '07:05', 'flur'), ev(t, '07:14', 'bad'), ev(t, '07:38', 'kueche'))
  return list
}

// Beispiel-Nutzungsprotokoll für den Studienmodus (nur Bereich + Zeit, keine Inhalte)
function buildUsage(start: string): UsageEvent[] {
  const areas = ['heute', 'medikamente', 'dienstplan', 'ich', 'mehr/tagebuch', 'krise', 'mehr/notfallmappe']
  const out: UsageEvent[] = []
  let i = 0
  for (let d = start; d < today(); d = addDays(d, 1), i++) {
    if ((i * 7) % 10 >= 7) continue // an etwa 3 von 10 Tagen keine Nutzung
    const n = 1 + (i % 4)
    for (let k = 0; k < n; k++) {
      const area = areas[(i + k * 3) % areas.length]
      out.push({ at: new Date(`${d}T${String(8 + k * 3).padStart(2, '0')}:1${k}:00`).toISOString(), area })
    }
  }
  return out
}

export function createDemoState(): AppState {
  const t = today()
  // Nutzungsbeginn vor gut 12 Wochen: Start, Woche 4 und Woche 8 sind ausgefüllt, Monat 3 ist fällig
  const start = addDays(t, -86)
  return {
    version: STATE_VERSION,
    onboarded: true,
    activePerson: 'christina',
    people: people.map((p) => ({ ...p, availability: [...p.availability] })),
    medications: medications.map((m) => ({ ...m })),
    doseLogs: buildDoseLogs(),
    medRounds: buildRounds(),
    tasks: buildTasks(),
    appointments: [
      { id: 'a1', title: 'Hausärztin – Kontrolle Blutzucker', date: addDays(t, 3), time: '10:30', place: 'Praxis Dr. Meier, Hauptstr. 12', companion: 'markus' },
      { id: 'a2', title: 'Augenarzt', date: addDays(t, 12), time: '14:00', place: 'Augenzentrum am Dom', companion: null },
      // Gestern mit Christina: zeigt beim Öffnen die Erinnerung, Ergebnisse einzutragen
      { id: 'a0', title: 'Neurologin – Gedächtnissprechstunde', date: addDays(t, -1), time: '15:00', place: 'Praxis Dr. Huber, Domplatz 3', companion: 'christina' },
    ],
    stress: {
      christina: {
        startDate: start,
        checks: [
          { point: 'baseline', date: start, instrument: instrumentKey, answers: answersFor(76) },
          { point: 'w4', date: addDays(start, 29), instrument: instrumentKey, answers: answersFor(66) },
          { point: 'w8', date: addDays(start, 57), instrument: instrumentKey, answers: answersFor(46) },
        ],
        relief: DEFAULT_RELIEF.map((r) => ({ ...r, done: r.id === 'abgeben' || r.id === 'tagespflege' })),
      },
      markus: {
        startDate: start,
        checks: [
          { point: 'baseline', date: start, instrument: instrumentKey, answers: answersFor(21) },
          { point: 'w4', date: addDays(start, 30), instrument: instrumentKey, answers: answersFor(17) },
          { point: 'w8', date: addDays(start, 58), instrument: instrumentKey, answers: answersFor(12) },
        ],
        relief: DEFAULT_RELIEF.map((r) => ({ ...r })),
      },
    },
    diary: [
      { id: uid(), at: `${addDays(t, -1)}T19:30:00`, kind: 'trinken', text: 'Nur ca. 3 Gläser getrunken, Flasche stand unberührt.', by: 'markus' },
      { id: uid(), at: `${addDays(t, -1)}T09:10:00`, kind: 'stimmung', text: 'Gut gelaunt, hat vom Garten erzählt.', by: 'christina' },
      { id: uid(), at: `${addDays(t, -3)}T08:00:00`, kind: 'schlaf', text: 'Nachts zweimal aufgestanden, morgens müde.', by: 'christina' },
      { id: uid(), at: `${addDays(t, -4)}T10:20:00`, kind: 'sonstiges', text: 'Pflegedienst Sonnenhof: Kompressionsstrümpfe angezogen, Haut an den Fersen gut.', by: 'berger' },
      { id: uid(), at: `${addDays(t, -6)}T16:45:00`, kind: 'sturz', text: 'Im Flur auf den Teppich gerutscht, nicht verletzt. Teppich entfernt.', by: 'lena' },
      { id: uid(), at: `${addDays(t, -6)}T12:30:00`, kind: 'essen', text: 'Mittagessen nur zur Hälfte gegessen.', by: 'lena' },
    ],
    emergency: {
      patientName: 'Anna Huber',
      birthDate: '14.03.1944',
      address: 'Lindenweg 7, 93047 Regensburg',
      careLevel: 'Pflegegrad 3',
      diagnoses: ['Bluthochdruck', 'Diabetes Typ 2', 'Beginnende Demenz', 'Arthrose (Knie)'],
      allergies: ['Penicillin', 'Pflaster (Hautreizung)'],
      doctor: { name: 'Dr. Sabine Meier (Hausärztin)', phone: '0941 556677', address: 'Hauptstr. 12, 93047 Regensburg' },
      contacts: [
        { name: 'Christina Huber', relation: 'Tochter', phone: '0170 1234567' },
        { name: 'Markus Huber', relation: 'Sohn', phone: '0151 7654321' },
        { name: 'Pflegedienst Sonnenhof', relation: 'Pflegedienst', phone: '0941 778899' },
      ],
      powerOfAttorney: true,
      powerOfAttorneyHolder: 'Christina Huber',
      livingWill: true,
    },
    notices: [
      { id: uid(), at: new Date().toISOString(), text: 'Willkommen! Dies ist ein Prototyp mit Beispiel-Daten der Familie Huber.', read: false },
      { id: uid(), at: `${addDays(t, -2)}T14:00:00`, text: 'Frau Berger (Pflegedienst Sonnenhof): Bei Frau Huber ist mir aufgefallen, dass sie wenig trinkt. Vielleicht eine Trinkflasche mit Markierung probieren?', read: true },
    ],
    absences: [],
    invites: [{ code: DEMO_CODE, role: 'gelegentlich', createdBy: 'christina', createdAt: start, expires: '', reusable: true }],
    consents: { app: true, involveOthers: true, patientAgreed: true, shareStressWithCareService: true, research: true, updatedAt: new Date(`${start}T09:00:00`).toISOString() },
    settings: { fontScale: 'normal', highContrast: false, devMode: false },
    study: { enabled: false, studyId: 'FP-0042', group: 'intervention', startDate: start },
    usage: buildUsage(start),
    sensors: { enabled: true, deadline: '10:00', events: buildSensorEvents(), lastAlert: '' },
  }
}

// Erster Start bzw. nach „Alle Daten löschen“: Onboarding zeigen, nichts eingewilligt
export function createFreshState(): AppState {
  const s = createDemoState()
  s.onboarded = false
  s.consents = { app: false, involveOthers: false, patientAgreed: false, shareStressWithCareService: false, research: false, updatedAt: '' }
  return s
}
