import { useState } from 'react'
import type { StressCheck, StressPrivate } from '../types'
import { useStore } from '../store'
import { DEFAULT_RELIEF } from '../content'
import { INSTRUMENT, instrumentKey, nextPoint, pointLabel, pointShort, stressLevel, stressScore, type StressLevel } from '../instrument'
import { formatDate, today } from '../utils'
import { go } from '../router'
import { InfoNote, PageHeader } from '../components/ui'

export const LEVEL: Record<StressLevel, { label: string; text: string; dot: string; bg: string }> = {
  niedrig: { label: 'Grün – gut im Gleichgewicht', text: 'Sie haben im Moment genug Kraft. Schön! Achten Sie weiter auf sich.', dot: 'bg-emerald-500', bg: 'bg-emerald-50 border-emerald-200' },
  mittel: { label: 'Gelb – spürbar belastet', text: 'Die Pflege kostet Sie gerade viel Kraft. Kleine Entlastungen helfen jetzt.', dot: 'bg-amber-400', bg: 'bg-amber-50 border-amber-200' },
  hoch: { label: 'Rot – stark belastet', text: 'Sie tragen gerade sehr viel. Bitte holen Sie sich Unterstützung – das ist kein Versagen.', dot: 'bg-red-600', bg: 'bg-red-50 border-red-200' },
}

export function usePrivateStress(): StressPrivate {
  const { state, me } = useStore()
  return state.stress[me.id] ?? { startDate: today(), checks: [], relief: DEFAULT_RELIEF }
}

export default function Ich({ controlGroup = false }: { controlGroup?: boolean }) {
  const { update, me } = useStore()
  const mine = usePrivateStress()
  const next = nextPoint(mine.startDate, mine.checks)
  const last = mine.checks[mine.checks.length - 1]
  const [filling, setFilling] = useState(false)

  const save = (answers: number[]) => {
    if (!next) return
    update((d) => {
      const s = (d.stress[d.activePerson] ??= { startDate: today(), checks: [], relief: DEFAULT_RELIEF.map((r) => ({ ...r })) })
      s.checks = s.checks.filter((c) => c.point !== next.point.id)
      s.checks.push({ point: next.point.id, date: today(), instrument: instrumentKey, answers })
    })
    setFilling(false)
  }

  if (filling && next) return <Questionnaire label={next.point.label} onDone={save} onCancel={() => setFilling(false)} />

  const level = last ? stressLevel(last.answers) : null
  const relief = mine.relief.slice(0, 3)

  return (
    <div>
      <PageHeader title={`Wie geht es Ihnen, ${me.name}?`} subtitle="Ihr Belastungs-Check zu festen Zeitpunkten." />
      <InfoNote>🔒 Ihre Antworten sind privat. Niemand aus der Familie kann sie sehen.</InfoNote>

      {next && (
        <div className={`card mt-4 ${next.due ? 'border-sage-400' : ''}`}>
          {next.due ? (
            <>
              <p className="text-lg font-semibold">⏰ Ihr Check „{next.point.label}“ ist fällig.</p>
              <p className="mt-1 text-ink-soft">{INSTRUMENT.items.length} kurze Aussagen, etwa {Math.max(1, Math.round(INSTRUMENT.items.length / 6))} Minuten.</p>
              <button className="btn-primary mt-4 w-full" onClick={() => setFilling(true)}>
                Check starten
              </button>
            </>
          ) : (
            <p className="text-base">
              Nächster Check: <strong>{next.point.label}</strong> am {formatDate(next.date)}. Wir erinnern Sie.
            </p>
          )}
        </div>
      )}

      {last && level && (
        <div className={`mt-4 rounded-2xl border-2 p-4 ${LEVEL[level].bg}`}>
          <p className="text-base font-semibold text-ink-soft">
            Letztes Ergebnis · {pointLabel(last.point)} ({formatDate(last.date)})
          </p>
          <div className="mt-2 flex items-center gap-3">
            <Ampel level={level} />
            <div>
              <p className="text-lg font-bold">{LEVEL[level].label}</p>
              <p className="text-base">{LEVEL[level].text}</p>
            </div>
          </div>
        </div>
      )}

      {mine.checks.length > 0 && <Verlauf checks={mine.checks} />}

      {!controlGroup && level && level !== 'niedrig' && (
        <section className="mt-6">
          <h2 className="h-section mt-0">Ihr Entlastungsplan</h2>
          <p className="mb-3 text-ink-soft">Drei konkrete Schritte. Haken Sie ab, was Sie geschafft haben.</p>
          <div className="space-y-2">
            {relief.map((r) => (
              <button
                key={r.id}
                onClick={() =>
                  update((d) => {
                    const step = d.stress[d.activePerson]?.relief.find((x) => x.id === r.id)
                    if (step) step.done = !step.done
                  })
                }
                className={`flex w-full gap-3 rounded-2xl border-2 p-4 text-left ${r.done ? 'border-sage-200 bg-sage-50' : 'border-cream-300 bg-white'}`}
                aria-pressed={r.done}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-xl ${r.done ? 'border-sage-600 bg-sage-600 text-white' : 'border-cream-300 text-transparent'}`}
                  aria-hidden
                >
                  ✓
                </span>
                <span>
                  <span className={`block font-semibold ${r.done ? 'line-through' : ''}`}>{r.title}</span>
                  <span className="mt-1 block text-base text-ink-soft">{r.explain}</span>
                </span>
              </button>
            ))}
          </div>
          {relief.every((r) => r.done) && <p className="mt-3 text-center font-semibold text-sage-800">Großartig – alle drei Schritte geschafft! 🌿</p>}
        </section>
      )}

      {level === 'hoch' && (
        <div className="mt-4">
          <InfoNote tone="warn">
            Wenn Ihnen alles zu viel wird: Die <strong>Telefonseelsorge</strong> ist rund um die Uhr kostenlos erreichbar.{' '}
            <a className="font-bold underline" href="tel:08001110111">
              0800 111 0 111
            </a>
          </InfoNote>
        </div>
      )}

      <p className="mt-6 text-sm text-ink-soft">
        Fragebogen: {INSTRUMENT.name}, Version {INSTRUMENT.version}
      </p>
      {INSTRUMENT.notice && <p className="mt-1 text-sm text-ink-soft">{INSTRUMENT.notice}</p>}
      {controlGroup && (
        <button className="btn-ghost mt-4 w-full" onClick={() => go('/mehr/einstellungen')}>
          ⚙️ Einstellungen
        </button>
      )}
    </div>
  )
}

export function Ampel({ level, small }: { level: StressLevel; small?: boolean }) {
  const order: StressLevel[] = ['hoch', 'mittel', 'niedrig']
  const size = small ? 'h-4 w-4' : 'h-6 w-6'
  return (
    <div className="flex shrink-0 flex-col gap-1 rounded-2xl bg-ink p-2" aria-label={`Ampel: ${LEVEL[level].label}`} role="img">
      {order.map((l) => (
        <span key={l} className={`${size} rounded-full ${l === level ? LEVEL[l].dot : 'bg-white/15'}`} />
      ))}
    </div>
  )
}

export function Verlauf({ checks, title = 'Verlauf' }: { checks: StressCheck[]; title?: string }) {
  const W = 340
  const H = 170
  const pad = { l: 24, r: 24, t: 12, b: 40 }
  const shown = checks.slice(-6)
  const pts = shown.map((c, i, arr) => {
    const x = pad.l + (arr.length === 1 ? (W - pad.l - pad.r) / 2 : (i / (arr.length - 1)) * (W - pad.l - pad.r))
    const score = stressScore(c.answers)
    const y = pad.t + (1 - score / 100) * (H - pad.t - pad.b)
    return { x, y, score, c }
  })
  const yAt = (s: number) => pad.t + (1 - s / 100) * (H - pad.t - pad.b)
  const { mittel, hoch } = INSTRUMENT.thresholds
  return (
    <section className="card mt-6">
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="mb-2 text-base text-ink-soft">Je höher, desto stärker die Belastung. Punkte = Messzeitpunkte.</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Verlauf: ${pts.map((p) => `${pointLabel(p.c.point)} ${p.score} Prozent`).join(', ')}`}>
        <rect x={pad.l} y={yAt(100)} width={W - pad.l - pad.r} height={yAt(hoch) - yAt(100)} fill="#fee2e2" />
        <rect x={pad.l} y={yAt(hoch)} width={W - pad.l - pad.r} height={yAt(mittel) - yAt(hoch)} fill="#fef3c7" />
        <rect x={pad.l} y={yAt(mittel)} width={W - pad.l - pad.r} height={yAt(0) - yAt(mittel)} fill="#d1fae5" />
        <polyline points={pts.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#36533e" strokeWidth={3} strokeLinejoin="round" />
        {pts.map((p) => (
          <g key={p.c.point}>
            <circle cx={p.x} cy={p.y} r={6} fill="#fff" stroke="#36533e" strokeWidth={3} />
            <text x={p.x} y={H - 22} textAnchor="middle" fontSize="13" fontWeight="600" fill="#2b2a27">
              {pointShort(p.c.point)}
            </text>
            <text x={p.x} y={H - 6} textAnchor="middle" fontSize="11" fill="#57534b">
              {p.c.date.slice(8, 10)}.{p.c.date.slice(5, 7)}.
            </text>
          </g>
        ))}
      </svg>
    </section>
  )
}

function Questionnaire({ label, onDone, onCancel }: { label: string; onDone: (a: number[]) => void; onCancel: () => void }) {
  const [answers, setAnswers] = useState<number[]>([])
  const items = INSTRUMENT.items
  const i = answers.length
  const choose = (v: number) => {
    const next = [...answers, v]
    if (next.length === items.length) onDone(next)
    else setAnswers(next)
  }
  return (
    <div>
      <PageHeader title={`Belastungs-Check · ${label}`} subtitle={`Aussage ${i + 1} von ${items.length}`} />
      <div className="mb-6 h-2 rounded-full bg-cream-200" aria-hidden>
        <div className="h-2 rounded-full bg-sage-500 transition-all" style={{ width: `${(i / items.length) * 100}%` }} />
      </div>
      <p className="text-ink-soft">Wie sehr trifft das auf die letzten 4 Wochen zu?</p>
      {INSTRUMENT.notice && <p className="mt-1 text-sm text-ink-soft">{INSTRUMENT.notice}</p>}
      <p className="mt-2 text-2xl font-bold leading-snug">„{items[i]}“</p>
      <div className="mt-6 space-y-2">
        {INSTRUMENT.scale.labels.map((l, k) => {
          const v = INSTRUMENT.scale.min + k
          return (
            <button key={l} className="btn w-full justify-start border-2 border-cream-300 bg-white text-left hover:border-sage-400" onClick={() => choose(v)}>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cream-200 text-base" aria-hidden>
                {v}
              </span>
              {l}
            </button>
          )
        })}
      </div>
      <div className="mt-6 flex gap-2">
        {i > 0 && (
          <button className="btn-ghost flex-1" onClick={() => setAnswers(answers.slice(0, -1))}>
            ← Zurück
          </button>
        )}
        <button className="btn-ghost flex-1" onClick={onCancel}>
          Abbrechen
        </button>
      </div>
    </div>
  )
}
