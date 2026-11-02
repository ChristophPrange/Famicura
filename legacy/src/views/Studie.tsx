import { useStore } from '../store'
import { studyCsv, studyData, studySummary } from '../study'
import { formatDate, today } from '../utils'
import { download, InfoNote, PageHeader } from '../components/ui'
import { Verlauf } from './Ich'

// Studienmodus für eine Nutzen-Studie (z. B. Intervention vs. Vergleichsgruppe).
// Vergleichsgruppe sieht nur den Fragebogen. Export nur mit pseudonymer Studien-ID.

export default function Studie() {
  const { state, update, toast } = useStore()
  const st = state.study
  const canEnable = state.consents.research
  const sum = studySummary(state)
  const checks = state.stress[state.activePerson]?.checks ?? []

  const set = (fn: (s: typeof st) => void) =>
    update((d) => {
      fn(d.study)
    })

  return (
    <div>
      <PageHeader title="Studienmodus" subtitle="Für die Nutzen-Studie (Prototyp)" onBack="/mehr/einstellungen" />
      {!canEnable && (
        <InfoNote tone="warn">
          Für die Teilnahme ist die Einwilligung (c) „Forschung & Weiterentwicklung“ nötig. Sie können sie in den Einstellungen erteilen.
        </InfoNote>
      )}

      <div className="card mt-4 space-y-4">
        <label className="flex min-h-[44px] items-center justify-between gap-3">
          <span className="font-semibold">Studienmodus aktiv</span>
          <input
            type="checkbox"
            className="h-6 w-6 accent-sage-600"
            checked={st.enabled}
            disabled={!canEnable}
            onChange={(e) => set((s) => void (s.enabled = e.target.checked))}
          />
        </label>
        <div>
          <label className="label" htmlFor="sid">
            Studien-ID (pseudonym, kein Name)
          </label>
          <input id="sid" className="input" value={st.studyId} onChange={(e) => set((s) => void (s.studyId = e.target.value.toUpperCase()))} />
        </div>
        <div>
          <span className="label">Gruppe</span>
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Studiengruppe">
            {(
              [
                ['intervention', 'Intervention', 'alle Funktionen'],
                ['vergleich', 'Vergleich', 'nur Fragebogen'],
              ] as const
            ).map(([k, l, t]) => (
              <button
                key={k}
                role="radio"
                aria-checked={st.group === k}
                onClick={() => set((s) => void (s.group = k))}
                className={`rounded-xl border-2 p-3 text-left ${st.group === k ? 'border-sage-600 bg-sage-50' : 'border-cream-300 bg-white'}`}
              >
                <span className="block font-bold">{l}</span>
                <span className="block text-sm text-ink-soft">{t}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label" htmlFor="sstart">
            Studienbeginn
          </label>
          <input id="sstart" type="date" className="input" value={st.startDate} max={today()} onChange={(e) => set((s) => void (s.startDate = e.target.value))} />
        </div>
      </div>

      <h2 className="h-section">Auswertung</h2>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Baseline" value={sum.baseline === null ? '–' : `${sum.baseline} %`} />
        <Stat label={`Zuletzt${sum.latestLabel ? ` (${sum.latestLabel})` : ''}`} value={sum.latest === null ? '–' : `${sum.latest} %`} />
        <Stat
          label="Veränderung"
          value={sum.change === null ? '–' : `${sum.change > 0 ? '+' : ''}${sum.change} Pkt.`}
          tone={sum.change !== null && sum.change < 0 ? 'good' : undefined}
        />
        <Stat label="Nutzungstage" value={`${sum.usageDays} von ${sum.sinceStart}`} />
      </div>
      {checks.length > 0 && <Verlauf checks={checks} title="Verlauf Belastung" />}
      {sum.byArea.length > 0 && (
        <section className="card mt-4">
          <h3 className="font-bold">Genutzte Bereiche ({sum.events} Aufrufe)</h3>
          <ul className="mt-2 space-y-1 text-base">
            {sum.byArea.slice(0, 6).map(([a, n]) => (
              <li key={a} className="flex justify-between">
                <span>{a}</span>
                <span className="text-ink-soft">{n}×</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      <p className="mt-3 text-sm text-ink-soft">
        Protokolliert wird nur, welcher Bereich wann geöffnet wurde – keine Inhalte. Seit {formatDate(st.startDate)}. Werte niedriger = weniger belastet.
      </p>

      <h2 className="h-section">Export</h2>
      <div className="grid grid-cols-2 gap-2">
        <button
          className="btn-secondary"
          onClick={() => {
            download(`studie-${st.studyId}-${today()}.csv`, studyCsv(state), 'text/csv')
            toast('CSV gespeichert.')
          }}
        >
          CSV
        </button>
        <button
          className="btn-secondary"
          onClick={() => {
            download(`studie-${st.studyId}-${today()}.json`, JSON.stringify(studyData(state), null, 2))
            toast('JSON gespeichert.')
          }}
        >
          JSON
        </button>
      </div>
      <p className="mt-2 text-sm text-ink-soft">Enthält nur die Studien-ID {st.studyId}, keine Namen.</p>
    </div>
  )
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'good' }) {
  return (
    <div className={`card ${tone === 'good' ? 'border-emerald-300 bg-emerald-50' : ''}`}>
      <p className="text-sm text-ink-soft">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}
