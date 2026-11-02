// Datenmodell des Prototyps. Alles liegt lokal im Browser (localStorage).

export type PersonId = string

export type Role = 'gepflegt' | 'hauptpflege' | 'unterstuetzung' | 'gelegentlich' | 'pflegedienst'

export interface Person {
  id: PersonId
  name: string
  role: Role
  roleLabel: string // in einfacher Sprache, z. B. „Kümmert sich hauptsächlich“
  relation: string // z. B. „Tochter“
  phone: string
  color: string // Tailwind-Klassen für Avatar
  availability: number[] // Wochentage, an denen die Person helfen kann (0 = Sonntag)
  hoursPerWeek?: number // ungefährer Pflegeaufwand pro Woche
}

export interface Medication {
  id: string
  name: string
  strength: string // z. B. „5 mg“
  times: string[] // „08:00“, „20:00“
  note: string // z. B. „zum Frühstück“
  stock: number // Tabletten in der Packung
  perDose: number // Tabletten pro Einnahme (wie verordnet)
}

// Ein Haken im Medikationsplan: an Datum X zur Uhrzeit Y gegeben
export interface DoseLog {
  medId: string
  date: string // YYYY-MM-DD
  time: string // geplante Uhrzeit
  givenBy: PersonId
  givenAt: string // tatsächliche Uhrzeit HH:MM
}

// Wer ist an einem Tag für die Medikamentengabe zuständig (morgens / abends)
export type DoseSlot = 'morgens' | 'abends'
export interface MedRound {
  date: string
  slot: DoseSlot
  person: PersonId | null // null = unbesetzt
}

export type TaskType = 'einkaufen' | 'besuch' | 'arzt' | 'waesche' | 'nacht' | 'rezept'

export interface CareTask {
  id: string
  type: TaskType
  title: string
  date: string // YYYY-MM-DD
  time?: string
  assignee: PersonId | null // null = offen
  swapOffered: boolean
  done: boolean
}

export interface Appointment {
  id: string
  title: string
  date: string
  time: string
  place: string
  companion: PersonId | null
  // Nachbereitung: Ergebnisse des Arztbesuchs (Erinnerung an die Begleitperson)
  result?: { text: string; medsChanged: 'ja' | 'nein' | 'unklar'; at: string; by: PersonId }
  resultSkipped?: boolean
}

// Ein ausgefüllter Fragebogen an einem festen Messzeitpunkt
export interface StressCheck {
  point: string // Messzeitpunkt-ID, z. B. „baseline“, „w4“, „m3“
  date: string // YYYY-MM-DD, an dem ausgefüllt wurde
  instrument: string // „id@version“ des Fragebogens
  answers: number[]
}

export interface ReliefStep {
  id: string
  title: string
  explain: string
  done: boolean
}

export type DiaryKind = 'sturz' | 'schlaf' | 'essen' | 'trinken' | 'stimmung' | 'arzt' | 'sonstiges'

export interface DiaryEntry {
  id: string
  at: string // ISO-Zeitpunkt
  kind: DiaryKind
  text: string
  by: PersonId
}

export interface EmergencyInfo {
  patientName: string
  birthDate: string
  address: string
  careLevel: string
  diagnoses: string[]
  allergies: string[]
  doctor: { name: string; phone: string; address: string }
  contacts: { name: string; relation: string; phone: string }[]
  powerOfAttorney: boolean
  powerOfAttorneyHolder: string
  livingWill: boolean
}

export interface Notice {
  id: string
  at: string
  text: string
  read: boolean
}

export interface StressPrivate {
  startDate: string // Beginn der Nutzung = Baseline
  checks: StressCheck[]
  relief: ReliefStep[]
}

// Drei getrennte Einwilligungen (DiPA: informierte, freiwillige, widerrufbare Zustimmung)
export interface Consents {
  app: boolean // (a) Nutzung der App
  involveOthers: boolean // (b) Einbezug weiterer Personen inkl. Pflegedienst
  patientAgreed: boolean // Pflegebedürftige Person (oder Bevollmächtigte) ist einverstanden
  shareStressWithCareService: boolean // Teil von (b): Belastungs-Ampel für Pflegedienst sichtbar
  research: boolean // (c) freiwillig: anonymisierte Nutzung für Forschung
  updatedAt: string
}

export interface Settings {
  fontScale: 'normal' | 'gross' | 'sehrgross'
  highContrast: boolean
  devMode: boolean // zeigt u. a. „Fachlich zu prüfen“-Kennzeichnungen
  voiceConsent?: boolean // Hinweis zur Spracherkennung gelesen, Mikrofon darf genutzt werden
  speakAnswers?: boolean // Antworten der Sprachsteuerung vorlesen (Standard: ja)
  aiAssistant?: boolean // KI-Assistent (online, Claude) für die Sprachsteuerung, Standard: aus
}

export interface Study {
  enabled: boolean
  studyId: string // pseudonym, keine Namen
  group: 'intervention' | 'vergleich'
  startDate: string
}

export interface UsageEvent {
  at: string // ISO-Zeitpunkt
  area: string // z. B. „medikamente“, „mehr/tagebuch“ – ohne Inhalte
}

export type SensorId = 'tuer' | 'flur' | 'kueche' | 'bad'

export interface SensorEvent {
  at: string // ISO-Zeitpunkt
  device: SensorId
}

export interface Sensors {
  enabled: boolean
  deadline: string // HH:MM – bis dahin sollte es Aktivität geben
  events: SensorEvent[]
  lastAlert: string // Datum der letzten Warnung, damit nur einmal pro Tag gewarnt wird
}

export interface Absence {
  person: PersonId
  from: string
  to: string
}

// Einladung per Code (im Prototyp simuliert, siehe src/invites.ts)
export interface Invite {
  code: string // z. B. „HUBER-7K3M“
  role: Role // Rolle, mit der die Person beitritt
  createdBy: PersonId
  createdAt: string // YYYY-MM-DD
  expires: string // YYYY-MM-DD, leer = läuft nicht ab
  usedBy?: PersonId
  reusable?: boolean // nur für den Demo-Code
}

export interface AppState {
  version: number
  onboarded: boolean
  activePerson: PersonId
  people: Person[]
  medications: Medication[]
  doseLogs: DoseLog[]
  medRounds: MedRound[]
  tasks: CareTask[]
  appointments: Appointment[]
  // Belastungs-Check ist privat: pro Person getrennt gespeichert
  stress: Record<PersonId, StressPrivate>
  diary: DiaryEntry[]
  emergency: EmergencyInfo
  notices: Notice[]
  absences: Absence[]
  invites: Invite[]
  consents: Consents
  settings: Settings
  study: Study
  usage: UsageEvent[]
  sensors: Sensors
}
