import { useState } from 'react'
import type { DoseSlot, TaskType } from '../types'
import { useStore, helpers as helperList } from '../store'
import { SLOT_LABEL, suggestSubstitutes } from '../planning'
import { TASK_TYPES } from '../content'
import { addDays, formatDate, monthKey, monthLabel, startOfWeek, today, uid, weekday } from '../utils'
import { Avatar, EmptyState, PageHeader, Sheet } from '../components/ui'
import { TaskCard } from '../components/rows'
import MonthCalendar from '../components/MonthCalendar'

export default function Dienstplan({ initialView = 'woche' }: { initialView?: 'woche' | 'monat' }) {
  const { state } = useStore()
  const [week, setWeek] = useState(startOfWeek(today()))
  const [onlyOpen, setOnlyOpen] = useState(false)
  const [view, setView] = useState(initialView)
  // Datum, für das gerade eine neue Aufgabe angelegt wird (null = Formular zu)
  const [addDate, setAddDate] = useState<string | null>(null)
  const [absent, setAbsent] = useState(false)
  const days = Array.from({ length: 7 }, (_, i) => addDays(week, i))
  const t = today()
  const openCount = state.tasks.filter((x) => !x.done && x.date >= t && (!x.assignee || x.swapOffered)).length

  return (
    <div>
      <PageHeader title="Dienstplan" subtitle={view === 'woche' ? 'Wer übernimmt was in dieser Woche?' : 'Aufgaben und Arzttermine im Überblick.'} />

      <div className="mb-4 grid grid-cols-2 gap-1 rounded-2xl bg-cream-200 p-1" role="tablist" data-tour="ansicht">
        {(
          [
            ['woche', 'Woche'],
            ['monat', 'Monat'],
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

      <div className="grid grid-cols-2 gap-2" data-tour="aufgaben">
        <button className="btn-secondary" onClick={() => setAddDate(week > t ? week : t)}>
          + Aufgabe
        </button>
        <button className="btn-secondary border-amber-300 bg-amber-50 text-amber-950" onClick={() => setAbsent(true)}>
          Ich falle aus
        </button>
      </div>

      {openCount > 0 && (
        <button
          className={`mt-3 w-full rounded-xl border-2 px-4 py-3 text-left text-base ${onlyOpen ? 'border-sage-600 bg-sage-600 text-white' : 'border-sky-200 bg-sky-50 text-sky-950'}`}
          onClick={() => setOnlyOpen(!onlyOpen)}
        >
          {onlyOpen ? '✓ Zeige nur offene Aufgaben – alle zeigen' : `🙋 ${openCount} Aufgaben suchen noch jemanden – nur diese zeigen`}
        </button>
      )}

      {view === 'monat' ? (
        <MonthCalendar onlyOpen={onlyOpen} onAdd={setAddDate} />
      ) : (
        <>
          <div className="mt-4 flex items-center justify-between">
            <button className="btn-ghost px-3" onClick={() => setWeek(addDays(week, -7))} aria-label="Vorherige Woche">
              ‹
            </button>
            <p className="text-lg font-bold">
              {formatDate(week)} – {formatDate(addDays(week, 6))}
            </p>
            <button className="btn-ghost px-3" onClick={() => setWeek(addDays(week, 7))} aria-label="Nächste Woche">
              ›
            </button>
          </div>

          <div className="mt-2 space-y-5">
            {days.map((d) => {
              const list = state.tasks
                .filter((x) => x.date === d && (!onlyOpen || (!x.done && (!x.assignee || x.swapOffered))))
                .sort((a, b) => (a.time ?? '99').localeCompare(b.time ?? '99'))
              if (onlyOpen && list.length === 0) return null
              return (
                <section key={d}>
                  <h2 className={`mb-2 text-lg font-bold ${d === t ? 'text-sage-700' : ''}`}>
                    {weekday(d)}, {formatDate(d)} {d === t && <span className="chip ml-1 bg-sage-100 text-sage-800">Heute</span>}
                  </h2>
                  {list.length === 0 ? (
                    <p className="rounded-xl border-2 border-dashed border-cream-300 px-4 py-3 text-base text-ink-soft">Nichts geplant.</p>
                  ) : (
                    <div className="space-y-2">
                      {list.map((task) => (
                        <TaskCard key={task.id} task={task} />
                      ))}
                    </div>
                  )}
                </section>
              )
            })}
          </div>
        </>
      )}

      <Balance />

      {addDate && <AddTask key={addDate} open onClose={() => setAddDate(null)} defaultDate={addDate} />}
      <Absent open={absent} onClose={() => setAbsent(false)} />
    </div>
  )
}

function Balance() {
  const { state } = useStore()
  const m = monthKey()
  const helpers = helperList(state)
  const counts = helpers.map((p) => ({
    p,
    n: state.tasks.filter((x) => x.date.startsWith(m) && x.assignee === p.id && (x.done || x.date <= today())).length,
  }))
  const max = Math.max(1, ...counts.map((c) => c.n))
  const total = counts.reduce((a, c) => a + c.n, 0)

  return (
    <section className="card mt-8">
      <h2 className="text-xl font-bold">Wer hat diesen Monat wie viel übernommen?</h2>
      <p className="mb-4 text-base text-ink-soft">
        {monthLabel(m)} bis heute · {total} Aufgaben. Jede Hilfe zählt – auch die kleine.
      </p>
      {total === 0 ? (
        <p className="text-base text-ink-soft">Noch keine Aufgaben in diesem Monat.</p>
      ) : (
        <ul className="space-y-3">
          {counts.map(({ p, n }) => (
            <li key={p.id} className="flex items-center gap-3">
              <Avatar person={p} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex justify-between text-base">
                  <span className="font-semibold">{p.name}</span>
                  <span className="text-ink-soft">{n} Aufgaben</span>
                </div>
                <div className="mt-1 h-3 rounded-full bg-cream-200">
                  <div className="h-3 rounded-full bg-sage-500" style={{ width: `${(n / max) * 100}%` }} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function AddTask({ open, onClose, defaultDate }: { open: boolean; onClose: () => void; defaultDate: string }) {
  const { state, update, toast } = useStore()
  const [type, setType] = useState<TaskType>('einkaufen')
  const [date, setDate] = useState(defaultDate)
  const [time, setTime] = useState('')
  const [assignee, setAssignee] = useState<string>('')
  const [title, setTitle] = useState('')

  const save = () => {
    update((d) => {
      d.tasks.push({
        id: uid(),
        type,
        title: title.trim() || TASK_TYPES[type].label,
        date,
        time: time || undefined,
        assignee: assignee || null,
        swapOffered: false,
        done: false,
      })
    })
    toast('Aufgabe eingetragen.')
    setTitle('')
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title="Neue Aufgabe">
      <div className="space-y-4">
        <div>
          <span className="label">Was ist zu tun?</span>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(TASK_TYPES) as TaskType[]).map((k) => (
              <button
                key={k}
                onClick={() => setType(k)}
                className={`btn border-2 text-base ${type === k ? 'border-sage-600 bg-sage-50 text-sage-900' : 'border-cream-300 bg-white'}`}
              >
                {TASK_TYPES[k].icon} {TASK_TYPES[k].label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label" htmlFor="ttitle">Beschreibung (freiwillig)</label>
          <input id="ttitle" className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={TASK_TYPES[type].label} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="tdate">Tag</label>
            <input id="tdate" type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="ttime">Uhrzeit</label>
            <input id="ttime" type="time" className="input" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="twho">Wer übernimmt?</label>
          <select id="twho" className="input" value={assignee} onChange={(e) => setAssignee(e.target.value)}>
            <option value="">Noch offen – wer kann?</option>
            {helperList(state).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
          </select>
        </div>
        <button className="btn-primary w-full" onClick={save} disabled={!date}>
          Eintragen
        </button>
      </div>
    </Sheet>
  )
}

type Affected = { kind: 'task'; id: string; date: string; label: string } | { kind: 'round'; date: string; slot: DoseSlot; label: string }

function Absent({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, update, notifyFamily, me, person } = useStore()
  const t = today()
  const [from, setFrom] = useState(t)
  const [to, setTo] = useState(addDays(t, 2))
  // gewählte Vertretung je betroffenem Punkt ('' = offen lassen)
  const [choice, setChoice] = useState<Record<string, string>>({})

  const affected: Affected[] = [
    ...state.tasks
      .filter((x) => x.assignee === state.activePerson && !x.done && x.date >= from && x.date <= to)
      .map((x): Affected => ({ kind: 'task', id: x.id, date: x.date, label: `${TASK_TYPES[x.type].icon} ${x.title}` })),
    ...state.medRounds
      .filter((r) => r.person === state.activePerson && r.date >= from && r.date <= to)
      .map((r): Affected => ({ kind: 'round', date: r.date, slot: r.slot, label: `💊 ${SLOT_LABEL[r.slot]}` })),
  ].sort((a, b) => a.date.localeCompare(b.date))

  const key = (a: Affected) => (a.kind === 'task' ? a.id : `${a.date}-${a.slot}`)
  const pick = (a: Affected) => {
    const k = key(a)
    if (k in choice) return choice[k]
    return suggestSubstitutes(state, a.date, state.activePerson)[0]?.id ?? ''
  }

  const quick = (days: number) => {
    setFrom(t)
    setTo(addDays(t, days - 1))
    setChoice({})
  }

  const confirm = () => {
    const picks = affected.map((a) => ({ a, sub: pick(a) || null }))
    update((d) => {
      d.absences.push({ person: d.activePerson, from, to })
      for (const { a, sub } of picks) {
        if (a.kind === 'task') {
          const x = d.tasks.find((y) => y.id === a.id)
          if (x) {
            x.assignee = sub
            x.swapOffered = false
          }
        } else {
          const r = d.medRounds.find((y) => y.date === a.date && y.slot === a.slot)
          if (r) r.person = sub
        }
      }
    })
    const covered = picks.filter((p) => p.sub)
    const open = picks.length - covered.length
    const names = [...new Set(covered.map((p) => person(p.sub)?.name))].join(', ')
    notifyFamily(
      `${me.name} fällt vom ${formatDate(from)} bis ${formatDate(to)} aus.` +
        (covered.length ? ` Vertretung angefragt: ${names}.` : '') +
        (open ? ` ${open} ${open === 1 ? 'Punkt ist' : 'Punkte sind'} noch offen – wer kann einspringen?` : ''),
    )
    setChoice({})
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title="Ich falle aus">
      <p className="text-ink-soft">Kein Problem – das passiert. Wählen Sie den Zeitraum. Wir schlagen Vertretungen vor, je nachdem wer an dem Tag kann.</p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          [1, 'Heute'],
          [3, '3 Tage'],
          [7, '1 Woche'],
        ].map(([n, l]) => (
          <button key={n} onClick={() => quick(n as number)} className={`btn border-2 ${to === addDays(t, (n as number) - 1) && from === t ? 'border-sage-600 bg-sage-600 text-white' : 'border-cream-300 bg-white'}`}>
            {l}
          </button>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="abfrom">Von</label>
          <input id="abfrom" type="date" className="input" value={from} min={t} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="abto">Bis</label>
          <input id="abto" type="date" className="input" value={to} min={from} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>

      <div className="mt-4">
        {affected.length === 0 ? (
          <EmptyState icon="🌿" title="Sie haben in dieser Zeit nichts übernommen." text="Die Familie wird trotzdem informiert." />
        ) : (
          <>
            <p className="mb-2 font-semibold">Betroffen sind {affected.length} Punkte:</p>
            <ul className="space-y-2">
              {affected.map((a) => {
                const subs = suggestSubstitutes(state, a.date, state.activePerson)
                const value = pick(a)
                return (
                  <li key={key(a)} className={`rounded-xl border-2 p-3 ${value ? 'border-cream-300 bg-white' : 'border-red-300 bg-red-50'}`}>
                    <p className="text-base font-semibold">
                      {weekday(a.date)}, {formatDate(a.date)}: {a.label}
                    </p>
                    <label className="sr-only" htmlFor={`sub-${key(a)}`}>
                      Vertretung für {a.label}
                    </label>
                    <select
                      id={`sub-${key(a)}`}
                      className="input mt-2"
                      value={value}
                      onChange={(e) => setChoice({ ...choice, [key(a)]: e.target.value })}
                    >
                      {subs.map((p, i) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                          {i === 0 ? ' (Vorschlag – kann an diesem Tag)' : ' (kann an diesem Tag)'}
                        </option>
                      ))}
                      <option value="">Offen lassen – wer kann?</option>
                    </select>
                    {subs.length === 0 && <p className="mt-1 text-base font-semibold text-red-800">An diesem Tag hat niemand Zeit eingetragen.</p>}
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </div>
      <button className="btn-primary mt-5 w-full" onClick={confirm} disabled={to < from}>
        Familie benachrichtigen
      </button>
      <p className="mt-2 text-center text-sm text-ink-soft">Verfügbarkeiten pflegen Sie unter Mehr → Familie.</p>
    </Sheet>
  )
}
