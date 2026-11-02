import type { AppState } from './types'
import { INSTRUMENT, instrumentKey, pointLabel, stressScore } from './instrument'

// Studienexport: nur pseudonyme Studien-ID, keine Namen, keine Inhalte.
// Fragebogenwerte der Hauptpflegeperson (bzw. der aktiven Person) + Nutzungsprotokoll.

const participant = (s: AppState) => s.activePerson

export function studyData(s: AppState) {
  const checks = s.stress[participant(s)]?.checks ?? []
  return {
    studyId: s.study.studyId,
    group: s.study.group,
    startDate: s.study.startDate,
    instrument: instrumentKey,
    exportedAt: new Date().toISOString(),
    questionnaires: checks.map((c) => ({
      point: c.point,
      label: pointLabel(c.point),
      date: c.date,
      instrument: c.instrument,
      answers: c.answers,
      score: stressScore(c.answers),
    })),
    usage: s.usage.map((u) => ({ at: u.at, area: u.area })),
  }
}

const csvCell = (v: string | number) => {
  const t = String(v)
  return /[;"\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t
}

// Ein CSV mit zwei Datensatz-Typen (Spalte „typ“), Trennzeichen Semikolon für deutsches Excel
export function studyCsv(s: AppState) {
  const d = studyData(s)
  const items = INSTRUMENT.items.map((_, i) => `item${i + 1}`)
  const header = ['studien_id', 'gruppe', 'typ', 'datum_zeit', 'messzeitpunkt', 'bereich', ...items, 'score']
  const rows: (string | number)[][] = [
    ...d.questionnaires.map((q) => [d.studyId, d.group, 'fragebogen', q.date, q.point, '', ...q.answers, q.score]),
    ...d.usage.map((u) => [d.studyId, d.group, 'nutzung', u.at, '', u.area, ...items.map(() => ''), '']),
  ]
  return [header, ...rows].map((r) => r.map(csvCell).join(';')).join('\n')
}

// Kleine Auswertung: Baseline vs. letzter Wert, Nutzungstage
export function studySummary(s: AppState) {
  const d = studyData(s)
  const first = d.questionnaires[0]
  const last = d.questionnaires[d.questionnaires.length - 1]
  const days = new Set(d.usage.map((u) => u.at.slice(0, 10))).size
  const sinceStart = Math.max(1, Math.round((Date.now() - new Date(d.startDate + 'T00:00:00').getTime()) / 86_400_000))
  const byArea = new Map<string, number>()
  d.usage.forEach((u) => byArea.set(u.area, (byArea.get(u.area) ?? 0) + 1))
  return {
    baseline: first?.score ?? null,
    latest: last?.score ?? null,
    latestLabel: last?.label ?? '',
    change: first && last ? last.score - first.score : null,
    usageDays: days,
    sinceStart,
    events: d.usage.length,
    byArea: [...byArea.entries()].sort((a, b) => b[1] - a[1]),
  }
}
