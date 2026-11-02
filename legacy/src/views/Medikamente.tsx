import { useState } from 'react'
import type { Medication } from '../types'
import { useStore, daysLeft, helpers, REFILL_WARN_DAYS } from '../store'
import { dosesFor } from '../meds'
import { roundsOn } from '../planning'
import { addDays, formatDate, relativeDay, startOfWeek, today, uid } from '../utils'
import { Avatar, EmptyState, MedDisclaimer, PageHeader, Sheet } from '../components/ui'
import { DoseRow, RoundRow } from '../components/rows'

export default function Medikamente() {
  const { state, toast } = useStore()
  const [view, setView] = useState<'tag' | 'plan'>('tag')
  const [date, setDate] = useState(today())
  const [editing, setEditing] = useState<Medication | 'new' | null>(null)
  const [rx, setRx] = useState<Medication | null>(null)
  const doses = dosesFor(state, date)
  const rounds = roundsOn(state, date)

  return (
    <div>
      <PageHeader title="Medikamente" subtitle="Der gemeinsame Plan für Mama – für alle sichtbar." />

      <div className="mb-4 grid grid-cols-2 gap-1 rounded-2xl bg-cream-200 p-1" role="tablist">
        {(
          [
            ['tag', 'Abhaken'],
            ['plan', 'Plan bearbeiten'],
          ] as const
        ).map(([k, l]) => (
          <button
            key={k}
            role="tab"
            aria-selected={view === k}
            onClick={() => setView(k)}
            className={`min-h-[48px] rounded-xl font-semibold ${view === k ? 'bg-white text-sage-800 shadow-sm' : 'text-ink-soft'}`}
          >
            {l}
          </button>
        ))}
      </div>

      {view === 'tag' ? (
        <>
          <div className="mb-3 flex items-center justify-between">
            <button className="btn-ghost px-3" onClick={() => setDate(addDays(date, -1))} aria-label="Vorheriger Tag">
              ‹
            </button>
            <p className="text-lg font-bold">{relativeDay(date)}</p>
            <button className="btn-ghost px-3" onClick={() => setDate(addDays(date, 1))} aria-label="Nächster Tag" disabled={date >= addDays(today(), 1)}>
              ›
            </button>
          </div>
          {rounds.length > 0 && (
            <div className="mb-3 space-y-2" aria-label="Zuständig an diesem Tag">
              {rounds.map((r) => (
                <RoundRow key={r.slot} round={r} />
              ))}
            </div>
          )}
          {doses.length === 0 ? (
            <EmptyState icon="💊" title="Noch keine Medikamente eingetragen." action={<button className="btn-primary" onClick={() => setView('plan')}>Medikament anlegen</button>} />
          ) : (
            <div className="space-y-2" data-tour="dosen">
              {doses.map((d) => (
                <DoseRow key={d.med.id + d.time} dose={d} date={date} />
              ))}
            </div>
          )}
          <p className="mt-3 text-base text-ink-soft">Tippen Sie auf eine Einnahme, um sie abzuhaken. Nochmal tippen macht es rückgängig.</p>
          <button
            className="btn-ghost mt-2 w-full text-base"
            onClick={() => {
              const next = doses.find((d) => !d.log)
              toast(next ? `⏰ Erinnerung: ${next.med.name} ${next.med.strength} um ${next.time} Uhr.` : '⏰ Für diesen Tag ist alles gegeben.')
            }}
          >
            Erinnerung vorführen
          </button>
          <GivenThisWeek />
        </>
      ) : (
        <>
          {state.medications.length === 0 ? (
            <EmptyState icon="📋" title="Der Plan ist noch leer." text="Tragen Sie ein, was die Ärztin verordnet hat." />
          ) : (
            <div className="space-y-3">
              {state.medications.map((m) => {
                const left = daysLeft(m)
                return (
                  <div key={m.id} className="card">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-lg font-bold">
                          {m.name} <span className="font-medium text-ink-soft">{m.strength}</span>
                        </p>
                        <p className="text-base">
                          {m.times.join(' · ')} Uhr{m.perDose !== 1 ? ` · je ${m.perDose} Stück` : ''}
                        </p>
                        {m.note && <p className="text-base text-ink-soft">{m.note}</p>}
                      </div>
                      <button className="btn-ghost min-h-[44px] px-3 text-base" onClick={() => setEditing(m)}>
                        Ändern
                      </button>
                    </div>
                    <div className={`mt-3 rounded-lg px-3 py-2 text-base ${left <= REFILL_WARN_DAYS ? 'bg-amber-50 text-amber-950' : 'bg-cream-100 text-ink-soft'}`}>
                      Packung reicht noch <strong>{left === Infinity ? '–' : left} Tage</strong> ({m.stock} Stück)
                      {left <= REFILL_WARN_DAYS && (
                        <button className="btn-secondary mt-2 w-full border-amber-300 bg-white text-amber-950" onClick={() => setRx(m)}>
                          📄 Rezept nachbestellen
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          <button className="btn-primary mt-4 w-full" onClick={() => setEditing('new')}>
            + Medikament hinzufügen
          </button>
        </>
      )}

      <div className="mt-6">
        <MedDisclaimer />
      </div>

      {editing && <MedForm med={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
      {rx && <RxTask med={rx} onClose={() => setRx(null)} />}
    </div>
  )
}

function MedForm({ med, onClose }: { med: Medication | null; onClose: () => void }) {
  const { update, toast } = useStore()
  const [name, setName] = useState(med?.name ?? '')
  const [strength, setStrength] = useState(med?.strength ?? '')
  const [times, setTimes] = useState<string[]>(med?.times ?? ['08:00'])
  const [note, setNote] = useState(med?.note ?? '')
  const [stock, setStock] = useState(String(med?.stock ?? 30))
  const [perDose, setPerDose] = useState(String(med?.perDose ?? 1))

  const save = () => {
    const data: Medication = {
      id: med?.id ?? uid(),
      name: name.trim(),
      strength: strength.trim(),
      times: [...new Set(times.filter(Boolean))].sort(),
      note: note.trim(),
      stock: Math.max(0, Number(stock) || 0),
      perDose: Math.max(0, Number(perDose) || 0),
    }
    update((d) => {
      const i = d.medications.findIndex((m) => m.id === data.id)
      if (i >= 0) d.medications[i] = data
      else d.medications.push(data)
    })
    toast(med ? 'Änderung gespeichert.' : `${data.name} wurde zum Plan hinzugefügt.`)
    onClose()
  }

  const remove = () => {
    if (!med || !confirm(`${med.name} wirklich aus dem Plan entfernen?`)) return
    update((d) => {
      d.medications = d.medications.filter((m) => m.id !== med.id)
    })
    onClose()
  }

  return (
    <Sheet open onClose={onClose} title={med ? 'Medikament ändern' : 'Neues Medikament'}>
      <div className="space-y-4">
        <p className="text-base text-ink-soft">Bitte genau so eintragen, wie es auf dem Medikationsplan der Ärztin steht.</p>
        <div>
          <label className="label" htmlFor="mname">Name</label>
          <input id="mname" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="z. B. Ramipril" />
        </div>
        <div>
          <label className="label" htmlFor="mstr">Stärke</label>
          <input id="mstr" className="input" value={strength} onChange={(e) => setStrength(e.target.value)} placeholder="z. B. 5 mg" />
        </div>
        <div>
          <span className="label">Uhrzeiten</span>
          <div className="space-y-2">
            {times.map((t, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="time"
                  className="input"
                  value={t}
                  aria-label={`Uhrzeit ${i + 1}`}
                  onChange={(e) => setTimes(times.map((x, j) => (j === i ? e.target.value : x)))}
                />
                {times.length > 1 && (
                  <button className="btn-ghost px-4" onClick={() => setTimes(times.filter((_, j) => j !== i))} aria-label="Uhrzeit entfernen">
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button className="btn-ghost w-full" onClick={() => setTimes([...times, '12:00'])}>
              + weitere Uhrzeit
            </button>
          </div>
        </div>
        <div>
          <label className="label" htmlFor="mnote">Hinweis</label>
          <input id="mnote" className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="z. B. zum Frühstück" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="mper">Stück pro Einnahme</label>
            <input id="mper" className="input" inputMode="decimal" value={perDose} onChange={(e) => setPerDose(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="mstock">Stück in der Packung</label>
            <input id="mstock" className="input" inputMode="numeric" value={stock} onChange={(e) => setStock(e.target.value)} />
          </div>
        </div>
        <MedDisclaimer />
        <button className="btn-primary w-full" onClick={save} disabled={!name.trim() || times.length === 0}>
          Speichern
        </button>
        {med && (
          <button className="btn-ghost w-full text-red-800" onClick={remove}>
            Aus dem Plan entfernen
          </button>
        )}
      </div>
    </Sheet>
  )
}

// Neutrale Übersicht: wer hat diese Woche Medikamente gegeben (keine Bewertung)
function GivenThisWeek() {
  const { state, person } = useStore()
  const from = startOfWeek(today())
  const logs = state.doseLogs.filter((l) => l.date >= from && l.date <= today())
  const counts = new Map<string, number>()
  logs.forEach((l) => counts.set(l.givenBy, (counts.get(l.givenBy) ?? 0) + 1))
  const rows = [...counts.entries()].sort((a, b) => b[1] - a[1])
  return (
    <section className="card mt-6">
      <h2 className="text-xl font-bold">Wer hat diese Woche Medikamente gegeben?</h2>
      <p className="mb-3 text-base text-ink-soft">Seit Montag, {formatDate(from)} · {logs.length} Einnahmen</p>
      {rows.length === 0 ? (
        <p className="text-base text-ink-soft">Diese Woche noch nichts abgehakt.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map(([id, n]) => (
            <li key={id} className="flex items-center gap-3">
              <Avatar person={person(id)} size="sm" />
              <span className="flex-1 font-semibold">{person(id)?.name ?? 'Unbekannt'}</span>
              <span className="text-ink-soft">{n}×</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

// „Rezept nachbestellen“ als Aufgabe für eine Person im Dienstplan
function RxTask({ med, onClose }: { med: Medication; onClose: () => void }) {
  const { state, update, notifyFamily, person } = useStore()
  const [who, setWho] = useState(state.activePerson)
  const [date, setDate] = useState(addDays(today(), 1))
  const doctor = state.emergency.doctor.name.split(' (')[0]
  const save = () => {
    update((d) => {
      d.tasks.push({ id: uid(), type: 'rezept', title: `Rezept ${med.name} ${med.strength} bei ${doctor} bestellen`, date, assignee: who || null, swapOffered: false, done: false })
    })
    notifyFamily(`Aufgabe für ${person(who)?.name ?? 'noch offen'}: Rezept für ${med.name} bis ${formatDate(date)} nachbestellen.`)
    onClose()
  }
  return (
    <Sheet open onClose={onClose} title="Rezept nachbestellen">
      <p className="text-base">
        Die Packung <strong>{med.name} {med.strength}</strong> reicht noch {daysLeft(med)} Tage. Wer kümmert sich um ein neues Rezept bei {doctor}?
      </p>
      <div className="mt-4 space-y-4">
        <div>
          <label className="label" htmlFor="rxwho">Wer?</label>
          <select id="rxwho" className="input" value={who} onChange={(e) => setWho(e.target.value)}>
            {helpers(state).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
            <option value="">Noch offen – wer kann?</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="rxdate">Bis wann?</label>
          <input id="rxdate" type="date" className="input" value={date} min={today()} onChange={(e) => setDate(e.target.value)} />
        </div>
        <button className="btn-primary w-full" onClick={save}>
          Aufgabe anlegen
        </button>
      </div>
    </Sheet>
  )
}
