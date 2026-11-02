import { useStore, daysLeft, REFILL_WARN_DAYS } from '../store'
import { dosesFor } from '../meds'
import { go } from '../router'
import { formatDateLong, today } from '../utils'
import { EmptyState } from '../components/ui'
import { AppointmentCard, DoseRow, RoundRow, TaskCard } from '../components/rows'
import { unstaffed } from '../planning'
import { nextPoint } from '../instrument'
import { sensorStatus } from './Tagesablauf'

export default function Heute() {
  const { state, me } = useStore()
  const t = today()
  const doses = dosesFor(state, t)
  const open = doses.filter((d) => !d.log)
  const given = doses.filter((d) => d.log)
  const tasks = state.tasks.filter((x) => x.date === t && (x.assignee || x.done))
  const nextAppt = [...state.appointments].filter((a) => a.date >= t).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0]
  const lowMeds = state.medications.filter((m) => daysLeft(m) <= REFILL_WARN_DAYS)
  const unread = state.notices.filter((n) => !n.read).length
  const gaps = unstaffed(state)
  const myStress = state.stress[me.id]
  const check = myStress ? nextPoint(myStress.startDate, myStress.checks) : null
  const sensor = sensorStatus(state)
  const hour = new Date().getHours()
  const greeting = hour < 11 ? 'Guten Morgen' : hour < 18 ? 'Guten Tag' : 'Guten Abend'

  return (
    <div>
      <header className="flex items-start justify-between pt-2">
        <div>
          <p className="text-base text-ink-soft">{formatDateLong(t)}</p>
          <h1 className="text-[1.75rem] font-bold leading-tight">
            {greeting}, {me.name}
          </h1>
          <p className="mt-1 text-ink-soft">So steht es heute um Mama Anna.</p>
        </div>
        <button data-tour="glocke" className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl shadow-sm" onClick={() => go('/hinweise')} aria-label={`Hinweise, ${unread} neu`}>
          🔔
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-sage-600 px-1 text-sm font-bold text-white">{unread}</span>
          )}
        </button>
      </header>

      <button data-tour="krise" className="btn-danger mt-5 w-full gap-3 py-5 text-xl shadow-md" onClick={() => go('/krise')}>
        <span aria-hidden className="text-2xl">🆘</span> Krise / Notfall
      </button>

      {sensor.alert && (
        <button onClick={() => go('/mehr/tagesablauf')} className="mt-3 w-full rounded-xl border-2 border-red-300 bg-red-50 px-4 py-3 text-left text-base text-red-950">
          🏠 <strong>Tagesablauf:</strong> Bis {state.sensors.deadline} Uhr keine Aktivität bei Mama erkannt. Bitte kurz anrufen. →
        </button>
      )}

      {gaps.count > 0 && (
        <section className="mt-4 rounded-2xl border-2 border-red-300 bg-red-50 p-3" aria-labelledby="gaps-title">
          <h2 id="gaps-title" className="mb-2 font-bold text-red-900">
            ⚠️ Noch unbesetzt (bis übermorgen): {gaps.count}
          </h2>
          <div className="space-y-2">
            {gaps.rounds.map((r) => (
              <RoundRow key={r.date + r.slot} round={r} showDate />
            ))}
            {gaps.tasks.map((task) => (
              <TaskCard key={task.id} task={task} showDate />
            ))}
          </div>
        </section>
      )}

      {check?.due && (
        <button onClick={() => go('/ich')} className="mt-3 w-full rounded-xl border-2 border-sage-300 bg-sage-50 px-4 py-3 text-left text-base text-sage-900">
          💚 Ihr Belastungs-Check „{check.point.label}“ ist fällig – etwa 1 Minute. →
        </button>
      )}

      {lowMeds.map((m) => (
        <button key={m.id} onClick={() => go('/medikamente')} className="mt-3 w-full rounded-xl border-2 border-amber-300 bg-amber-50 px-4 py-3 text-left text-base text-amber-950">
          💊 <strong>{m.name}</strong>: Packung reicht noch {daysLeft(m)} {daysLeft(m) === 1 ? 'Tag' : 'Tage'}. Rezept nachbestellen →
        </button>
      ))}

      <h2 className="h-section flex items-baseline justify-between">
        Medikamente heute
        <span className="text-base font-medium text-ink-soft">
          {given.length} von {doses.length} gegeben
        </span>
      </h2>
      {doses.length === 0 ? (
        <EmptyState icon="💊" title="Heute stehen keine Medikamente an." />
      ) : open.length === 0 ? (
        <EmptyState icon="🌿" title="Alles gegeben für heute." text="Danke an alle, die geholfen haben." />
      ) : (
        <div className="space-y-2">
          {open.slice(0, 3).map((d) => (
            <DoseRow key={d.med.id + d.time} dose={d} date={t} />
          ))}
          {open.length > 3 && (
            <button className="btn-ghost w-full" onClick={() => go('/medikamente')}>
              Alle {open.length} offenen ansehen →
            </button>
          )}
        </div>
      )}

      <h2 className="h-section">Aufgaben heute</h2>
      {tasks.length === 0 ? (
        <EmptyState icon="☀️" title="Für heute ist nichts geplant." text="Ein ruhiger Tag." />
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}

      <h2 className="h-section">Nächster Arzttermin</h2>
      {nextAppt ? (
        <AppointmentCard appt={nextAppt} />
      ) : (
        <EmptyState icon="🗓️" title="Kein Termin geplant." />
      )}
    </div>
  )
}
