import type { DiaryKind, ReliefStep, TaskType } from './types'

// Fragebogen des Belastungs-Checks: siehe instrument.ts

export const DEFAULT_RELIEF: ReliefStep[] = [
  {
    id: 'abgeben',
    title: 'Eine feste Aufgabe abgeben',
    explain: 'Zum Beispiel den Wocheneinkauf an Markus oder Lena. Im Dienstplan auf „Zum Tausch anbieten“ tippen.',
    done: false,
  },
  {
    id: 'tagespflege',
    title: 'Tagespflege ausprobieren',
    explain:
      'In einer Tagespflege wird Mama tagsüber betreut und Sie haben frei. Die Pflegekasse zahlt dafür einen eigenen Betrag. Ein Probetag ist oft kostenlos.',
    done: false,
  },
  {
    id: 'beratung',
    title: 'Kostenlose Pflegeberatung anrufen',
    explain:
      'Jede Pflegekasse muss Sie kostenlos beraten, auch zu Hause. Fragen Sie z. B. beim Pflegestützpunkt in Ihrer Nähe nach.',
    done: false,
  },
  {
    id: 'verhinderung',
    title: 'Verhinderungspflege planen',
    explain:
      'Wenn Sie Urlaub brauchen oder krank sind, übernimmt jemand anderes die Pflege. Die Pflegekasse zahlt dafür einige Wochen im Jahr. Stichwort für den Anruf: „Verhinderungspflege“.',
    done: false,
  },
]

export const TASK_TYPES: Record<TaskType, { label: string; icon: string }> = {
  einkaufen: { label: 'Einkaufen', icon: '🛒' },
  besuch: { label: 'Besuch', icon: '☕' },
  arzt: { label: 'Arzt begleiten', icon: '🩺' },
  waesche: { label: 'Wäsche', icon: '🧺' },
  nacht: { label: 'Nachtbereitschaft', icon: '🌙' },
  rezept: { label: 'Rezept nachbestellen', icon: '📄' },
}

export const DIARY_KINDS: Record<DiaryKind, { label: string; icon: string }> = {
  sturz: { label: 'Sturz', icon: '⚠️' },
  schlaf: { label: 'Schlaf', icon: '😴' },
  essen: { label: 'Essen', icon: '🍽️' },
  trinken: { label: 'Trinken', icon: '💧' },
  stimmung: { label: 'Stimmung', icon: '🙂' },
  arzt: { label: 'Arztbesuch', icon: '🩺' },
  sonstiges: { label: 'Sonstiges', icon: '📝' },
}
