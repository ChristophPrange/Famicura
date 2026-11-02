import { useState } from 'react'
import type { DiaryKind } from '../types'
import { useStore } from '../store'
import { DIARY_KINDS } from '../content'
import { addDays, formatDateTime, today, uid } from '../utils'
import { EmptyState, PageHeader } from '../components/ui'

export default function Tagebuch() {
  const { state, update, toast, person, me } = useStore()
  const [kind, setKind] = useState<DiaryKind | null>(null)
  const [text, setText] = useState('')
  const [summary, setSummary] = useState(false)
  const entries = [...state.diary].sort((a, b) => b.at.localeCompare(a.at))

  const save = () => {
    if (!kind) return
    update((d) => {
      d.diary.push({ id: uid(), at: new Date().toISOString(), kind, text: text.trim(), by: d.activePerson })
    })
    toast('Eintrag gespeichert.')
    setKind(null)
    setText('')
  }

  if (summary) return <Summary onClose={() => setSummary(false)} />

  return (
    <div>
      <PageHeader title="Pflegetagebuch" subtitle="Was ist Ihnen heute aufgefallen?" onBack="/mehr" />

      <div className="card">
        <p className="mb-3 font-semibold">Schnell eintragen</p>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(DIARY_KINDS) as DiaryKind[]).map((k) => (
            <button
              key={k}
              onClick={() => setKind(kind === k ? null : k)}
              aria-pressed={kind === k}
              className={`flex min-h-[80px] flex-col items-center justify-center rounded-xl border-2 text-base font-semibold ${
                kind === k ? 'border-sage-600 bg-sage-50 text-sage-900' : 'border-cream-300 bg-white'
              }`}
            >
              <span className="text-2xl" aria-hidden>
                {DIARY_KINDS[k].icon}
              </span>
              {DIARY_KINDS[k].label}
            </button>
          ))}
        </div>
        {kind && (
          <div className="mt-4 space-y-3">
            <label className="label" htmlFor="dtext">
              Notiz (freiwillig)
            </label>
            <textarea
              id="dtext"
              className="input min-h-[96px] py-3"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={kind === 'trinken' ? 'z. B. ca. 4 Gläser Wasser' : 'Was ist passiert?'}
            />
            <button className="btn-primary w-full" onClick={save}>
              Speichern als {me.name}
            </button>
          </div>
        )}
      </div>

      <button className="btn-secondary mt-4 w-full" onClick={() => setSummary(true)}>
        🖨️ Zusammenfassung für die Hausärztin
      </button>

      <h2 className="h-section">Letzte Einträge</h2>
      {entries.length === 0 ? (
        <EmptyState icon="📔" title="Noch keine Einträge." text="Tippen Sie oben auf ein Symbol – das geht in Sekunden." />
      ) : (
        <ul className="space-y-2">
          {entries.map((e) => (
            <li key={e.id} className="card flex gap-3">
              <span className="text-2xl" aria-hidden>
                {DIARY_KINDS[e.kind].icon}
              </span>
              <div className="min-w-0">
                <p className="font-semibold">{DIARY_KINDS[e.kind].label}</p>
                {e.text && <p className="text-base">{e.text}</p>}
                <p className="mt-1 text-sm text-ink-soft">
                  {formatDateTime(e.at)} · {person(e.by)?.name}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Summary({ onClose }: { onClose: () => void }) {
  const { state, person } = useStore()
  const from = addDays(today(), -13)
  const list = state.diary.filter((e) => e.at.slice(0, 10) >= from).sort((a, b) => a.at.localeCompare(b.at))
  const counts = (Object.keys(DIARY_KINDS) as DiaryKind[]).map((k) => [k, list.filter((e) => e.kind === k).length] as const).filter(([, n]) => n > 0)

  return (
    <div>
      <div className="no-print">
        <PageHeader title="Zusammenfassung" subtitle="Die letzten 14 Tage – zum Ausdrucken oder Zeigen." onBack />
        <button className="btn-primary mb-4 w-full" onClick={() => window.print()}>
          🖨️ Drucken / als PDF speichern
        </button>
        <button className="btn-ghost mb-4 w-full" onClick={onClose}>
          Zurück zum Tagebuch
        </button>
      </div>
      <article className="card">
        <h1 className="text-2xl font-bold">Pflegetagebuch – {state.emergency.patientName}</h1>
        <p className="text-base text-ink-soft">
          Zeitraum: {from.split('-').reverse().join('.')} bis {today().split('-').reverse().join('.')} · {state.emergency.careLevel}
        </p>
        <h2 className="mt-4 font-bold">Auf einen Blick</h2>
        {counts.length === 0 ? (
          <p className="text-base">Keine Einträge im Zeitraum.</p>
        ) : (
          <p className="text-base">{counts.map(([k, n]) => `${DIARY_KINDS[k].label}: ${n}×`).join(' · ')}</p>
        )}
        <h2 className="mt-4 font-bold">Einträge</h2>
        <table className="mt-1 w-full text-left text-base">
          <tbody>
            {list.map((e) => (
              <tr key={e.id} className="border-t border-cream-300 align-top">
                <td className="py-2 pr-2 whitespace-nowrap">{new Date(e.at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}</td>
                <td className="py-2 pr-2 font-semibold">{DIARY_KINDS[e.kind].label}</td>
                <td className="py-2">
                  {e.text || '–'} <span className="text-ink-soft">({person(e.by)?.name})</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <h2 className="mt-4 font-bold">Aktueller Medikamentenplan</h2>
        <ul className="text-base">
          {state.medications.map((m) => (
            <li key={m.id}>
              {m.name} {m.strength} – {m.times.join(', ')} Uhr {m.note && `(${m.note})`}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-ink-soft">Erstellt mit FamilienPflege (Prototyp). Beobachtungen von Angehörigen, keine medizinische Bewertung.</p>
      </article>
    </div>
  )
}
