import { useState } from 'react'
import type { CareTask } from '../types'
import { useStore } from '../store'
import { addDays, addMonths, formatDate, formatDateLong, monthLabel, startOfWeek, today } from '../utils'
import { AppointmentCard, TaskCard } from './rows'

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

const isOpen = (x: CareTask) => !x.done && (!x.assignee || x.swapOffered)

// Punktfarbe je Eintrag: Termin, offene Aufgabe, vergebene Aufgabe, erledigt
const dotClass = (x: CareTask) => (x.done ? 'bg-cream-300' : isOpen(x) ? 'bg-amber-500' : 'bg-sage-500')

export default function MonthCalendar({ onlyOpen, onAdd }: { onlyOpen: boolean; onAdd: (date: string) => void }) {
  const { state } = useStore()
  const t = today()
  const [month, setMonth] = useState(t.slice(0, 7))
  const [selected, setSelected] = useState(t)

  // Raster ab dem Montag vor dem Monatsersten, nur Wochen mit Tagen dieses Monats
  const start = startOfWeek(month + '-01')
  const weeks = Array.from({ length: 6 }, (_, w) => Array.from({ length: 7 }, (_, i) => addDays(start, w * 7 + i))).filter((wk) =>
    wk.some((d) => d.startsWith(month)),
  )

  const tasksOn = (d: string) =>
    state.tasks.filter((x) => x.date === d && (!onlyOpen || isOpen(x))).sort((a, b) => (a.time ?? '99').localeCompare(b.time ?? '99'))
  const apptsOn = (d: string) => state.appointments.filter((a) => a.date === d).sort((a, b) => a.time.localeCompare(b.time))

  const pick = (d: string) => {
    setSelected(d)
    if (!d.startsWith(month)) setMonth(d.slice(0, 7))
  }
  const shift = (n: number) => {
    const m = addMonths(month, n)
    setMonth(m)
    setSelected(t.startsWith(m) ? t : m + '-01')
  }

  const dayTasks = tasksOn(selected)
  const dayAppts = apptsOn(selected)

  return (
    <div>
      <div className="mt-4 flex items-center justify-between">
        <button className="btn-ghost px-3" onClick={() => shift(-1)} aria-label="Vorheriger Monat">
          ‹
        </button>
        <p className="text-lg font-bold">
          {monthLabel(month)} {month.slice(0, 4)}
        </p>
        <button className="btn-ghost px-3" onClick={() => shift(1)} aria-label="Nächster Monat">
          ›
        </button>
      </div>

      <div className="card mt-2 p-2" role="grid" aria-label={`Kalender ${monthLabel(month)}`}>
        <div className="grid grid-cols-7 pb-1 text-center text-sm font-semibold text-ink-soft" role="row">
          {WEEKDAYS.map((w) => (
            <span key={w} role="columnheader">
              {w}
            </span>
          ))}
        </div>
        {weeks.map((wk) => (
          <div key={wk[0]} className="grid grid-cols-7 gap-0.5" role="row">
            {wk.map((d) => {
              const inMonth = d.startsWith(month)
              const tasks = tasksOn(d)
              const appts = apptsOn(d)
              const isSel = d === selected
              const count = tasks.length + appts.length
              return (
                <button
                  key={d}
                  role="gridcell"
                  aria-selected={isSel}
                  aria-label={`${formatDateLong(d)}${count ? `, ${count} Einträge` : ''}`}
                  onClick={() => pick(d)}
                  className={`flex min-h-[52px] flex-col items-center justify-start gap-1 rounded-xl pt-1.5 ${
                    isSel ? 'bg-sage-600 text-white' : d === t ? 'bg-sage-100 text-sage-900' : 'hover:bg-cream-200'
                  } ${inMonth ? '' : 'opacity-40'}`}
                >
                  <span className={`text-base leading-none ${d === t || isSel ? 'font-bold' : ''}`}>{Number(d.slice(8))}</span>
                  <span className="flex h-2 items-center gap-0.5" aria-hidden>
                    {appts.slice(0, 1).map((a) => (
                      <span key={a.id} className={`h-2 w-2 rounded-full ${isSel ? 'bg-white' : 'bg-sky-500'}`} />
                    ))}
                    {tasks.slice(0, appts.length ? 2 : 3).map((x) => (
                      <span key={x.id} className={`h-2 w-2 rounded-full ${isSel && !isOpen(x) ? 'bg-white/70' : dotClass(x)}`} />
                    ))}
                  </span>
                </button>
              )
            })}
          </div>
        ))}
      </div>

      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 px-1 text-sm text-ink-soft">
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-sky-500" /> Arzttermin
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> sucht jemanden
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-sage-500" /> vergeben
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-cream-300" /> erledigt
        </li>
      </ul>

      <section className="mt-5">
        <h2 className={`mb-2 text-lg font-bold ${selected === t ? 'text-sage-700' : ''}`}>
          {formatDateLong(selected)} {selected === t && <span className="chip ml-1 bg-sage-100 text-sage-800">Heute</span>}
        </h2>
        {dayAppts.length + dayTasks.length === 0 ? (
          <p className="rounded-xl border-2 border-dashed border-cream-300 px-4 py-3 text-base text-ink-soft">
            {onlyOpen ? 'Keine offenen Aufgaben.' : 'Nichts geplant.'}
          </p>
        ) : (
          <div className="space-y-2">
            {dayAppts.map((a) => (
              <AppointmentCard key={a.id} appt={a} showDate={false} />
            ))}
            {dayTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
        {selected >= t && (
          <button className="btn-secondary mt-3 w-full" onClick={() => onAdd(selected)}>
            + Aufgabe am {formatDate(selected)}
          </button>
        )}
      </section>
    </div>
  )
}
