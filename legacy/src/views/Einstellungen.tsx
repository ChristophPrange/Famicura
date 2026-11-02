import type { Consents, Settings } from '../types'
import { useStore } from '../store'
import { go } from '../router'
import { formatDateTime } from '../utils'
import { Avatar, ConsentCheck, InfoNote, PageHeader } from '../components/ui'
import { AiCard } from '../components/Voice'
import { AI_FEATURE } from '../assistant'

const FONT: { id: Settings['fontScale']; label: string; size: string }[] = [
  { id: 'normal', label: 'Normal', size: 'text-base' },
  { id: 'gross', label: 'Groß', size: 'text-lg' },
  { id: 'sehrgross', label: 'Sehr groß', size: 'text-xl' },
]

export default function Einstellungen() {
  const { state, update, reset, wipe, toast } = useStore()
  const c = state.consents
  const viewable = state.people.filter((p) => p.role !== 'gepflegt')

  const setConsent = (patch: Partial<Consents>) =>
    update((d) => {
      Object.assign(d.consents, patch, { updatedAt: new Date().toISOString() })
      if (!d.consents.involveOthers) {
        d.consents.patientAgreed = false
        d.consents.shareStressWithCareService = false
      }
      if (!d.consents.research) d.study.enabled = false
    })

  const withdrawApp = () => {
    if (confirm('Ohne Einwilligung (a) kann die App nicht genutzt werden. Einwilligung widerrufen und ALLE Daten löschen?')) {
      wipe()
      go('/heute')
    }
  }

  return (
    <div>
      <PageHeader title="Einstellungen" onBack="/mehr" />

      <h2 className="h-section mt-0">Darstellung</h2>
      <div className="card space-y-4">
        <div>
          <span className="label">Schriftgröße</span>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Schriftgröße">
            {FONT.map((f) => (
              <button
                key={f.id}
                role="radio"
                aria-checked={state.settings.fontScale === f.id}
                onClick={() => update((d) => void (d.settings.fontScale = f.id))}
                className={`btn border-2 px-2 ${f.size} ${state.settings.fontScale === f.id ? 'border-sage-600 bg-sage-600 text-white' : 'border-cream-300 bg-white'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <label className="flex min-h-[44px] items-center justify-between gap-3">
          <span>
            <span className="block font-semibold">Hoher Kontrast</span>
            <span className="block text-base text-ink-soft">Dunklere Schrift und kräftigere Rahmen</span>
          </span>
          <input
            type="checkbox"
            className="h-6 w-6 shrink-0 accent-sage-600"
            checked={state.settings.highContrast}
            onChange={(e) => update((d) => void (d.settings.highContrast = e.target.checked))}
          />
        </label>
      </div>

      <h2 className="h-section">Sprachsteuerung</h2>
      <div className="card space-y-3">
        <label className="flex min-h-[44px] items-center justify-between gap-3">
          <span>
            <span className="block font-semibold">Antworten vorlesen</span>
            <span className="block text-base text-ink-soft">Die App spricht ihre Antworten laut aus</span>
          </span>
          <input
            type="checkbox"
            className="h-6 w-6 shrink-0 accent-sage-600"
            checked={state.settings.speakAnswers !== false}
            onChange={(e) => update((d) => void (d.settings.speakAnswers = e.target.checked))}
          />
        </label>
        <p className="text-base text-ink-soft">
          Mikrofon: {state.settings.voiceConsent === true ? 'erlaubt' : state.settings.voiceConsent === false ? 'aus, nur Eintippen' : 'noch nicht gefragt'}. Die Spracherkennung übernimmt der Browser
          (bei Chrome/Edge über Server von Google/Microsoft). Die App speichert keine Aufnahmen.
        </p>
        {state.settings.voiceConsent === true && (
          <button className="btn-secondary w-full" onClick={() => update((d) => void (d.settings.voiceConsent = false))}>
            Mikrofon nicht mehr nutzen
          </button>
        )}
        {AI_FEATURE && <AiCard on={state.settings.aiAssistant === true} setOn={(v) => update((d) => void (d.settings.aiAssistant = v))} />}
      </div>

      <h2 className="h-section">Ihre Einwilligungen</h2>
      <p className="mb-3 text-base text-ink-soft">Zuletzt geändert: {c.updatedAt ? formatDateTime(c.updatedAt) : '–'}. Jede Einwilligung ist einzeln widerrufbar.</p>
      <div className="space-y-3">
        <ConsentCheck checked={c.app} onChange={(v) => (v ? setConsent({ app: true }) : withdrawApp())} title="(a) Nutzung der App" text="Erforderlich. Widerruf löscht alle Daten." />
        <ConsentCheck
          checked={c.involveOthers}
          onChange={(v) => setConsent({ involveOthers: v })}
          title="(b) Weitere Personen und Pflegedienst einbeziehen"
          text="Ohne diese Einwilligung sieht der Pflegedienst nichts."
        >
          {c.involveOthers && (
            <div className="mt-3 space-y-2">
              <ConsentCheck small checked={c.patientAgreed} onChange={(v) => setConsent({ patientAgreed: v })} title="Die gepflegte Person ist einverstanden bzw. Vollmacht liegt vor." />
              <ConsentCheck small checked={c.shareStressWithCareService} onChange={(v) => setConsent({ shareStressWithCareService: v })} title="Belastungs-Ampel (nur Farbe) für den Pflegedienst sichtbar" />
              {!c.patientAgreed && <p className="rounded-lg bg-amber-50 p-2 text-base text-amber-950">Solange die gepflegte Person nicht zugestimmt hat, bleibt der Pflegedienst ausgeschlossen.</p>}
            </div>
          )}
        </ConsentCheck>
        <ConsentCheck
          checked={c.research}
          onChange={(v) => setConsent({ research: v })}
          title="(c) Forschung & Weiterentwicklung (freiwillig)"
          text="Anonymisierte Nutzungsdaten und Fragebogenwerte. Widerruf beendet auch den Studienmodus."
        />
      </div>

      <h2 className="h-section">Ansicht als … (Demo)</h2>
      <p className="mb-3 text-base text-ink-soft">So sieht die App für andere Familienmitglieder und den Pflegedienst aus.</p>
      <div className="space-y-2">
        {viewable.map((p) => {
          const active = state.activePerson === p.id
          return (
            <button
              key={p.id}
              onClick={() => {
                update((d) => void (d.activePerson = p.id))
                toast(`Sie sehen die App jetzt als ${p.name}.`)
                go('/heute')
              }}
              aria-pressed={active}
              className={`flex w-full items-center gap-3 rounded-2xl border-2 p-3 text-left ${active ? 'border-sage-600 bg-sage-50' : 'border-cream-300 bg-white'}`}
            >
              <Avatar person={p} />
              <span className="flex-1">
                <span className="block font-bold">{p.name}</span>
                <span className="block text-base text-ink-soft">{p.roleLabel}</span>
              </span>
              {active && (
                <span className="text-2xl text-sage-700" aria-hidden>
                  ✓
                </span>
              )}
            </button>
          )
        })}
      </div>

      <h2 className="h-section">Für Forschung & Entwicklung</h2>
      <div className="card space-y-3">
        <button className="btn-secondary w-full justify-between" onClick={() => go('/mehr/studie')}>
          <span>🔬 Studienmodus</span>
          <span className="text-base font-normal">{state.study.enabled ? `aktiv · ${state.study.group === 'vergleich' ? 'Vergleich' : 'Intervention'}` : 'aus'}</span>
        </button>
        <label className="flex min-h-[44px] items-center justify-between gap-3">
          <span>
            <span className="block font-semibold">Entwicklermodus</span>
            <span className="block text-base text-ink-soft">Zeigt „Fachlich zu prüfen“ an Krisen-Inhalten</span>
          </span>
          <input type="checkbox" className="h-6 w-6 shrink-0 accent-sage-600" checked={state.settings.devMode} onChange={(e) => update((d) => void (d.settings.devMode = e.target.checked))} />
        </label>
      </div>

      <h2 className="h-section">Daten</h2>
      <InfoNote>Alle Daten liegen nur auf diesem Gerät. Keine Werbung, keine Tracker.</InfoNote>
      <div className="mt-3 space-y-2">
        <button className="btn-ghost w-full" onClick={() => go('/mehr/ueber')}>
          📖 Über diese App & Gebrauchsanweisung
        </button>
        <button
          className="btn-secondary w-full"
          onClick={() => {
            if (confirm('Alle Änderungen verwerfen und die Demo neu starten?')) {
              reset()
              go('/heute')
              toast('Demo wurde zurückgesetzt.')
            }
          }}
        >
          ↺ Demo zurücksetzen
        </button>
        <button
          className="btn w-full border-2 border-red-300 bg-white text-red-800 hover:bg-red-50"
          onClick={() => {
            if (confirm('Wirklich ALLE Ihre Daten von diesem Gerät löschen? Das kann nicht rückgängig gemacht werden.')) {
              wipe()
              go('/heute')
            }
          }}
        >
          🗑️ Alle meine Daten löschen
        </button>
      </div>
    </div>
  )
}
