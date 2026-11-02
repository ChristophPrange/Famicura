import type { AppState, Invite, Person, Role } from './types'
import { addDays, formatDate, today, uid } from './utils'

// Einladungscodes: Im Prototyp nur simuliert – Codes liegen lokal im Zustand.
// Später prüft ein Server (EU) den Code und verbindet das neue Gerät mit der Familie.

export const INVITE_DAYS = 7
// Fester Code für Vorführungen, läuft nie ab und kann mehrfach genutzt werden
export const DEMO_CODE = 'HUBER-2026'

export const INVITE_ROLES: { role: Role; label: string; text: string }[] = [
  { role: 'unterstuetzung', label: 'Hilft regelmäßig', text: 'z. B. Geschwister, Partner' },
  { role: 'gelegentlich', label: 'Hilft ab und zu', text: 'z. B. Enkel, Nachbarn' },
  { role: 'pflegedienst', label: 'Pflegedienst', text: 'Pflegefachkraft – sieht nur, was freigegeben ist' },
]

const ROLE_LABEL: Record<Role, string> = {
  gepflegt: 'Wird gepflegt',
  hauptpflege: 'Kümmert sich hauptsächlich',
  unterstuetzung: 'Hilft regelmäßig',
  gelegentlich: 'Hilft ab und zu',
  pflegedienst: 'Pflegefachkraft (Partner-Pflegedienst)',
}

const COLORS = ['bg-teal-200 text-teal-900', 'bg-orange-200 text-orange-900', 'bg-indigo-200 text-indigo-900', 'bg-lime-200 text-lime-900', 'bg-fuchsia-200 text-fuchsia-900']

// Ohne leicht verwechselbare Zeichen (0/O, 1/I/L)
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

export const familyName = (s: AppState) => s.emergency.patientName.trim().split(/\s+/).pop() ?? 'Familie'

const prefix = (s: AppState) =>
  familyName(s)
    .toUpperCase()
    .replace(/Ä/g, 'AE')
    .replace(/Ö/g, 'OE')
    .replace(/Ü/g, 'UE')
    .replace(/[^A-Z]/g, '')
    .slice(0, 8) || 'FAMILIE'

// Groß-/Kleinschreibung, Leerzeichen und Bindestriche bei der Eingabe egal
export const normalizeCode = (code: string) => code.toUpperCase().replace(/[^A-Z0-9]/g, '')

export function generateCode(s: AppState) {
  const taken = new Set(s.invites.map((i) => normalizeCode(i.code)))
  for (;;) {
    let rand = ''
    for (let i = 0; i < 4; i++) rand += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
    const code = `${prefix(s)}-${rand}`
    if (!taken.has(normalizeCode(code))) return code
  }
}

export function createInvite(s: AppState, role: Role): Invite {
  return { code: generateCode(s), role, createdBy: s.activePerson, createdAt: today(), expires: addDays(today(), INVITE_DAYS) }
}

export type InviteStatus = 'offen' | 'angenommen' | 'abgelaufen'

export const inviteStatus = (i: Invite): InviteStatus => {
  if (i.usedBy && !i.reusable) return 'angenommen'
  if (i.expires && i.expires < today()) return 'abgelaufen'
  return 'offen'
}

export const findInvite = (s: AppState, code: string) => s.invites.find((i) => normalizeCode(i.code) === normalizeCode(code))

export const inviteMessage = (s: AppState, i: Invite) =>
  `Hallo! Ich lade dich in die Familie ${familyName(s)} bei FamilienPflege ein. ` +
  `Öffne die App, tippe auf „Ich habe einen Einladungscode“ und gib diesen Code ein: ${i.code}` +
  (i.expires ? ` (gültig bis ${formatDate(i.expires)}).` : '.')

// Neue Person anlegen und den Code als genutzt markieren
export function joinFamily(d: AppState, code: string, data: { name: string; relation: string; phone: string }): Person | undefined {
  const invite = findInvite(d, code)
  if (!invite || inviteStatus(invite) !== 'offen') return undefined
  const person: Person = {
    id: uid(),
    name: data.name.trim(),
    role: invite.role,
    roleLabel: ROLE_LABEL[invite.role],
    relation: data.relation.trim() || (invite.role === 'pflegedienst' ? 'Pflegedienst' : 'Familie'),
    phone: data.phone.trim(),
    color: COLORS[d.people.length % COLORS.length],
    availability: [],
  }
  d.people.push(person)
  invite.usedBy = person.id
  d.activePerson = person.id
  return person
}
