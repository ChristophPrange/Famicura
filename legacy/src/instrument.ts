import type { StressCheck } from './types'
import { addDays, today } from './utils'

// Belastungs-Check als austauschbares Messinstrument.
//
// Häusliche-Pflege-Skala (HPS, Gräßel): 28 Aussagen, Antwortskala 0–3, Summenwert 0–84.
// LIZENZ NOCH NICHT GEKLÄRT. Die Aussagen unten sind eigene Arbeitsfassungen in Anlehnung
// an die HPS, nicht der Originalwortlaut. Original-Items, Reihenfolge, Umpolung und Schwellen
// erst nach Klärung der Nutzungsrechte aus den Lizenzunterlagen übernehmen und prüfen.
// Name, Version, Aussagen, Skala und Auswertung werden nur hier gepflegt;
// Oberfläche, Verlauf und Export passen sich automatisch an.

export type StressLevel = 'niedrig' | 'mittel' | 'hoch'

export interface Instrument {
  id: string
  name: string
  version: string
  validated: boolean
  // Hinweis, der überall beim Fragebogen angezeigt wird (z. B. Lizenzstand)
  notice?: string
  items: string[]
  scale: { min: number; max: number; labels: string[] }
  // Rohwerte -> Prozent der maximal möglichen Belastung (0–100)
  score: (answers: number[]) => number
  // Schwellen für die Ampel (in Prozent)
  thresholds: { mittel: number; hoch: number }
  // Optional: Ampel direkt aus den Rohwerten (z. B. Summen-Grenzwerte des Instruments)
  level?: (answers: number[]) => StressLevel
}

const sum = (a: number[]) => a.reduce((x, y) => x + y, 0)

export const INSTRUMENT: Instrument = {
  id: 'hps-arbeitsfassung',
  name: 'Häusliche-Pflege-Skala (HPS), Arbeitsfassung',
  version: '0.3',
  validated: false,
  notice: 'Die Lizenz für die Häusliche-Pflege-Skala wird noch geklärt. Bis dahin werden eigene Arbeitsfassungen der Aussagen verwendet.',
  items: [
    'Ich fühle mich durch die Pflege körperlich erschöpft.',
    'Durch die Pflege habe ich zu wenig Zeit für mich selbst.',
    'Die Pflege kostet mich viel Kraft.',
    'Ich habe das Gefühl, aus meiner Situation ausbrechen zu wollen.',
    'Meine Zufriedenheit mit meinem Leben hat durch die Pflege gelitten.',
    'Ich vermisse Anerkennung für das, was ich in der Pflege leiste.',
    'Durch die Pflege komme ich zu selten unter Leute.',
    'Ich schlafe wegen der Pflege schlecht oder zu wenig.',
    'Die Pflege belastet meine eigene Gesundheit.',
    'Ich mache mir große Sorgen um die Zukunft der gepflegten Person.',
    'Ich fühle mich mit der Verantwortung allein gelassen.',
    'Die Pflege lässt sich schlecht mit meinem Beruf oder Alltag vereinbaren.',
    'Ich habe kaum Zeit für Hobbys oder Erholung.',
    'Das Verhalten der gepflegten Person belastet mich.',
    'Ich bin oft gereizt oder ungeduldig.',
    'Ich fühle mich innerlich angespannt.',
    'Meine Beziehung zur gepflegten Person hat unter der Pflege gelitten.',
    'Die Pflege führt zu Spannungen in meiner Familie.',
    'Ich habe das Gefühl, die Situation nicht mehr im Griff zu haben.',
    'Ich traue mir die Pflege auf Dauer nicht mehr zu.',
    'Ich bekomme zu wenig Unterstützung von anderen.',
    'Die Pflege belastet mich finanziell.',
    'Ich habe Schuldgefühle, wenn ich mir Zeit für mich nehme.',
    'Ich fühle mich niedergeschlagen.',
    'Ich kann mich in meiner freien Zeit nicht richtig erholen.',
    'Ich habe das Gefühl, mein eigenes Leben bleibt auf der Strecke.',
    'Ich bin unsicher, ob ich bei der Pflege alles richtig mache.',
    'Ich wünsche mir, dass jemand anderes die Pflege übernimmt.',
  ],
  scale: { min: 0, max: 3, labels: ['Stimmt nicht', 'Stimmt ein wenig', 'Stimmt überwiegend', 'Stimmt genau'] },
  score: (answers) => {
    const max = answers.length * 3 || 1
    return Math.round((sum(answers) / max) * 100)
  },
  // Summenwert 0–30 gering, 31–56 mittel, 57–84 stark (Literaturangabe, mit Lizenzunterlagen abgleichen).
  // Prozent-Schwellen entsprechen diesen Grenzen und dienen nur für die Farbflächen im Verlauf.
  thresholds: { mittel: 37, hoch: 68 },
  level: (answers) => {
    const s = sum(answers)
    if (s >= 57) return 'hoch'
    if (s >= 31) return 'mittel'
    return 'niedrig'
  },
}

export const instrumentKey = `${INSTRUMENT.id}@${INSTRUMENT.version}`

export const stressScore = (answers: number[]) => INSTRUMENT.score(answers)

export const stressLevel = (answers: number[]): StressLevel => {
  if (INSTRUMENT.level) return INSTRUMENT.level(answers)
  const s = stressScore(answers)
  if (s >= INSTRUMENT.thresholds.hoch) return 'hoch'
  if (s >= INSTRUMENT.thresholds.mittel) return 'mittel'
  return 'niedrig'
}

// Feste Messzeitpunkte ab Nutzungsbeginn: Start, Woche 4, Woche 8, danach alle 4 Wochen
export interface MeasurePoint {
  id: string
  label: string
  short: string
  offsetDays: number
}

export function measurePoints(count = 12): MeasurePoint[] {
  const pts: MeasurePoint[] = [
    { id: 'baseline', label: 'Start (Baseline)', short: 'Start', offsetDays: 0 },
    { id: 'w4', label: 'Woche 4', short: 'W4', offsetDays: 28 },
    { id: 'w8', label: 'Woche 8', short: 'W8', offsetDays: 56 },
  ]
  for (let m = 3; pts.length < count; m++) pts.push({ id: `m${m}`, label: `Monat ${m}`, short: `M${m}`, offsetDays: 28 * m })
  return pts
}

export const pointLabel = (id: string) => measurePoints().find((p) => p.id === id)?.label ?? id
export const pointShort = (id: string) => measurePoints().find((p) => p.id === id)?.short ?? id

// Nächster offener Messzeitpunkt; „due“ = jetzt fällig
export function nextPoint(startDate: string, checks: StressCheck[]) {
  const t = today()
  for (const p of measurePoints()) {
    if (checks.some((c) => c.point === p.id)) continue
    const date = addDays(startDate, p.offsetDays)
    return { point: p, date, due: date <= t }
  }
  return null
}
