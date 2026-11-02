import { useState } from 'react'
import { SCENARIOS, type Outcome, type Scenario } from '../crisis'
import type { DiaryKind } from '../types'
import { useStore } from '../store'
import { go } from '../router'
import { uid } from '../utils'
import { PageHeader, ReviewBadge } from '../components/ui'

function EmergencyBar() {
  return (
    <div className="space-y-2">
      <a href="tel:112" className="flex items-center gap-3 rounded-2xl bg-red-700 px-4 py-4 text-white shadow-md">
        <span className="text-3xl" aria-hidden>📞</span>
        <span>
          <span className="block text-xl font-bold">Lebensgefahr? Sofort 112</span>
          <span className="block text-base text-red-50">Notruf – Rettungsdienst und Notarzt</span>
        </span>
      </a>
      <a href="tel:116117" className="flex items-center gap-3 rounded-2xl border-2 border-sage-300 bg-white px-4 py-3">
        <span className="text-2xl" aria-hidden>🩺</span>
        <span>
          <span className="block text-lg font-bold text-sage-800">Sonst: 116 117</span>
          <span className="block text-base text-ink-soft">Ärztlicher Bereitschaftsdienst, wenn die Praxis zu ist</span>
        </span>
      </a>
    </div>
  )
}

function Disclaimer() {
  return <p className="mt-6 text-center text-base text-ink-soft">Ersetzt keine ärztliche Einschätzung. Im Zweifel immer 112 anrufen.</p>
}

export default function Krise({ id }: { id?: string }) {
  const scenario = SCENARIOS.find((s) => s.id === id)
  if (scenario) return <Flow key={scenario.id} scenarioId={scenario.id} />
  return (
    <div>
      <PageHeader title="Krise / Notfall" subtitle="Was ist passiert? Wir gehen es Schritt für Schritt durch." onBack="/heute" />
      <EmergencyBar />
      <div className="mt-3">
        <ReviewBadge source="Alle Krisen-Inhalte: Entwurf des Projektteams" />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => go('/krise/' + s.id)}
            className={`card flex min-h-[120px] flex-col items-start justify-between text-left hover:border-sage-400 ${s.id === 'ueberfordert' ? 'col-span-2 min-h-0 flex-row items-center gap-3 bg-sage-50' : ''}`}
          >
            <span className="text-3xl" aria-hidden>{s.icon}</span>
            <span className="text-lg font-bold leading-snug">{s.label}</span>
          </button>
        ))}
      </div>
      <Disclaimer />
    </div>
  )
}

function Flow({ scenarioId }: { scenarioId: string }) {
  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!
  const [path, setPath] = useState<string[]>([scenario.start])
  const current = path[path.length - 1]
  const question = scenario.questions[current]
  const outcome = scenario.outcomes[current]

  return (
    <div>
      <PageHeader
        title={`${scenario.icon} ${scenario.label}`}
        onBack="/krise"
        subtitle={question ? `Frage ${path.length}` : 'Was Sie jetzt tun können'}
      />
      <EmergencyBar />
      <div className="mt-3">
        <ReviewBadge source={[scenario.review.source, scenario.review.reviewedBy].filter(Boolean).join(' · ')} />
      </div>

      {question && (
        <div className="card mt-5">
          <p className="text-2xl font-bold leading-snug">{question.q}</p>
          {question.hint && <p className="mt-2 text-ink-soft">{question.hint}</p>}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button className="btn-primary py-6 text-xl" onClick={() => setPath([...path, question.yes])}>
              Ja
            </button>
            <button className="btn-secondary py-6 text-xl" onClick={() => setPath([...path, question.no])}>
              Nein
            </button>
          </div>
        </div>
      )}

      {outcome && <OutcomeView outcome={outcome} scenario={scenario} />}

      {path.length > 1 && (
        <button className="btn-ghost mt-3 w-full" onClick={() => setPath(path.slice(0, -1))}>
          ← Vorherige Frage
        </button>
      )}
      <Disclaimer />
    </div>
  )
}

const DIARY_KIND: Record<string, DiaryKind> = { sturz: 'sturz', trinken: 'trinken', verwirrt: 'stimmung' }

function OutcomeView({ outcome, scenario }: { outcome: Outcome; scenario: Scenario }) {
  const { notifyFamily, me, update, toast } = useStore()
  const scenarioLabel = scenario.label
  const [informed, setInformed] = useState(false)
  const [asked, setAsked] = useState(false)
  const [noted, setNoted] = useState(false)
  const [note, setNote] = useState('')
  const saveNote = () => {
    update((d) => {
      d.diary.push({ id: uid(), at: new Date().toISOString(), kind: DIARY_KIND[scenario.id] ?? 'sonstiges', text: `Krise „${scenarioLabel}“: ${note.trim() || outcome.title}`, by: d.activePerson })
    })
    setNoted(true)
    toast('Im Pflegetagebuch gespeichert.')
  }
  const tone =
    outcome.kind === '112'
      ? 'border-red-300 bg-red-50'
      : outcome.kind === '116117' || outcome.kind === 'arzt'
        ? 'border-amber-300 bg-amber-50'
        : 'border-sage-200 bg-sage-50'

  return (
    <div className="mt-5 space-y-3">
      <div className={`rounded-2xl border-2 p-4 ${tone}`}>
        <p className="text-xl font-bold leading-snug">{outcome.title}</p>
        <ol className="mt-3 list-decimal space-y-2 pl-6">
          {outcome.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </div>

      {outcome.kind === '112' && (
        <a href="tel:112" className="btn-danger w-full py-5 text-xl">
          📞 Jetzt 112 anrufen
        </a>
      )}
      {outcome.kind === '116117' && (
        <a href="tel:116117" className="btn-primary w-full py-5 text-xl">
          📞 116 117 anrufen
        </a>
      )}
      {outcome.kind === 'support' && (
        <>
          <a href="tel:08001110111" className="btn-primary w-full flex-col gap-0 py-3">
            <span>📞 Telefonseelsorge</span>
            <span className="text-base font-normal">0800 111 0 111 · kostenlos, rund um die Uhr</span>
          </a>
          <button
            className="btn-secondary w-full"
            disabled={asked}
            onClick={() => {
              notifyFamily(`${me.name} braucht gerade Unterstützung. Wer kann heute bei Mama einspringen?`)
              setAsked(true)
            }}
          >
            {asked ? '✓ Familie wurde gefragt' : '🙋 Familie um Hilfe bitten'}
          </button>
        </>
      )}

      {outcome.kind !== 'support' && (
        <button
          className="btn-secondary w-full"
          disabled={informed}
          onClick={() => {
            notifyFamily(`${me.name} meldet: Mama – „${scenarioLabel}“. ${outcome.title}`)
            setInformed(true)
          }}
        >
          {informed ? '✓ Familie ist informiert' : '👨‍👩‍👧 Familie informieren'}
        </button>
      )}
      <section className="card">
        <h2 className="font-bold">Kurz ins Pflegetagebuch? (freiwillig)</h2>
        {noted ? (
          <p className="mt-1 text-base text-sage-800">✓ Gespeichert. Das hilft beim nächsten Arztgespräch.</p>
        ) : (
          <>
            <label className="label mt-2" htmlFor="krnote">
              Was ist passiert?
            </label>
            <textarea id="krnote" className="input min-h-[80px] py-3" value={note} onChange={(e) => setNote(e.target.value)} placeholder="z. B. Uhrzeit, was Sie beobachtet haben" />
            <button className="btn-secondary mt-2 w-full" onClick={saveNote}>
              📔 Eintrag speichern
            </button>
          </>
        )}
      </section>
    </div>
  )
}
