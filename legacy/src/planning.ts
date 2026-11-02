import type { AppState, CareTask, DoseSlot, MedRound, Person, PersonId } from './types'
import { helpers } from './store'
import { addDays, monthKey, today } from './utils'

export const SLOT_LABEL: Record<DoseSlot, string> = { morgens: 'Medikamente morgens', abends: 'Medikamente abends' }

export const slotOf = (time: string): DoseSlot => (time < '12:00' ? 'morgens' : 'abends')

export const roundsOn = (s: AppState, date: string) => s.medRounds.filter((r) => r.date === date)

export const isAbsent = (s: AppState, person: PersonId, date: string) => s.absences.some((a) => a.person === person && a.from <= date && date <= a.to)

const dow = (iso: string) => new Date(iso + 'T12:00:00').getDay()

// Vertretungsvorschläge: wer kann an dem Wochentag, ist nicht abwesend
// und hat diesen Monat bisher am wenigsten übernommen?
export function suggestSubstitutes(s: AppState, date: string, exclude: PersonId): Person[] {
  const m = monthKey()
  const load = (p: Person) => s.tasks.filter((t) => t.assignee === p.id && t.date.startsWith(m)).length
  return helpers(s)
    .filter((p) => p.id !== exclude && p.availability.includes(dow(date)) && !isAbsent(s, p.id, date))
    .sort((a, b) => load(a) - load(b))
}

// Alles, wofür in einem Zeitraum noch niemand eingeteilt ist
export function unstaffed(s: AppState, from = today(), to = addDays(today(), 2)) {
  const tasks: CareTask[] = s.tasks.filter((t) => !t.done && !t.assignee && t.date >= from && t.date <= to)
  const rounds: MedRound[] = s.medRounds.filter((r) => !r.person && r.date >= from && r.date <= to)
  return { tasks, rounds, count: tasks.length + rounds.length }
}
