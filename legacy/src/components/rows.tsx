import type { Appointment, CareTask, MedRound } from '../types'
import { SLOT_LABEL } from '../planning'
import type { Dose } from '../meds'
import { useToggleDose } from '../meds'
import { useStore } from '../store'
import { TASK_TYPES } from '../content'
import { formatDate, nowTime, relativeDay, today, weekday } from '../utils'
import { Avatar } from './ui'

export function AppointmentCard({ appt, showDate = true }: { appt: Appointment; showDate?: boolean }) {
  const { person } = useStore()
  const companion = person(appt.companion)
  return (
    <div className="card">
      <p className="text-base font-semibold text-sage-700">
        🩺 {showDate && `${relativeDay(appt.date)} · `}
        {appt.time} Uhr
      </p>
      <p className="mt-1 text-lg font-semibold">{appt.title}</p>
      <p className="text-base text-ink-soft">{appt.place}</p>
      <div className="mt-3 flex items-center gap-2 text-base">
        <Avatar person={companion} size="sm" />
        {companion ? (
          <span>
            <strong>{companion.name}</strong> begleitet Mama
          </span>
        ) : (
          <span className="font-semibold text-amber-800">Begleitung noch offen</span>
        )}
      </div>
    </div>
  )
}

export function DoseRow({ dose, date }: { dose: Dose; date: string }) {
  const { person } = useStore()
  const toggle = useToggleDose()
  const given = !!dose.log
  const overdue = !given && date === today() && dose.time < nowTime()
  const by = person(dose.log?.givenBy)
  return (
    <button
      onClick={() => toggle(dose, date)}
      className={`flex w-full items-center gap-3 rounded-2xl border-2 p-3 text-left transition ${
        given ? 'border-sage-200 bg-sage-50' : overdue ? 'border-amber-300 bg-amber-50' : 'border-cream-300 bg-white'
      }`}
      aria-pressed={given}
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 text-2xl ${
          given ? 'border-sage-600 bg-sage-600 text-white' : 'border-cream-300 bg-white text-transparent'
        }`}
        aria-hidden
      >
        ✓
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-lg font-semibold leading-snug">
          {dose.time} · {dose.med.name} {dose.med.strength}
        </span>
        <span className="block text-base text-ink-soft">
          {given ? (
            <>
              Gegeben von <strong className="text-sage-800">{by?.name}</strong> um {dose.log!.givenAt} Uhr
            </>
          ) : overdue ? (
            <span className="font-semibold text-amber-900">Noch offen – war um {dose.time} Uhr fällig</span>
          ) : (
            <>Offen{dose.med.note ? ` · ${dose.med.note}` : ''}</>
          )}
        </span>
      </span>
    </button>
  )
}

export function TaskCard({ task, showDate = false }: { task: CareTask; showDate?: boolean }) {
  const { state, person, update, notifyFamily, me } = useStore()
  const who = person(task.assignee)
  const mine = task.assignee === state.activePerson
  const type = TASK_TYPES[task.type]

  const take = () => {
    update((d) => {
      const t = d.tasks.find((x) => x.id === task.id)!
      t.assignee = d.activePerson
      t.swapOffered = false
    })
    notifyFamily(`${me.name} übernimmt: ${type.label} am ${new Date(task.date + 'T12:00').toLocaleDateString('de-DE', { weekday: 'long' })}.`)
  }
  const offer = () => {
    update((d) => {
      const t = d.tasks.find((x) => x.id === task.id)!
      t.swapOffered = !t.swapOffered
    })
    if (!task.swapOffered) notifyFamily(`${me.name} bietet zum Tausch an: ${type.label} (${task.date.split('-').reverse().slice(0, 2).join('.')}.)`)
  }
  const done = () =>
    update((d) => {
      const t = d.tasks.find((x) => x.id === task.id)!
      t.done = !t.done
    })

  return (
    <div className={`card ${task.done ? 'opacity-70' : !task.assignee ? 'border-2 border-red-300 bg-red-50' : ''}`}>
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cream-200 text-2xl" aria-hidden>
          {type.icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className={`font-semibold leading-snug ${task.done ? 'line-through' : ''}`}>{task.title}</p>
          <p className="text-base text-ink-soft">
            {showDate && `${new Date(task.date + 'T12:00').toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'numeric' })} · `}
            {task.time ? `${task.time} Uhr · ` : ''}
            {who ? (mine ? 'Sie' : who.name) : <span className="font-semibold text-red-800">Noch niemand eingeteilt</span>}
          </p>
        </div>
        <Avatar person={who} size="sm" />
      </div>
      {task.swapOffered && !task.done && (
        <p className="mt-2 rounded-lg bg-sky-50 px-3 py-1.5 text-base text-sky-900">🔁 Zum Tausch angeboten{mine ? ' – wartet auf jemanden' : ''}</p>
      )}
      {!task.done && (
        <div className="mt-3 flex flex-wrap gap-2">
          {(!task.assignee || (task.swapOffered && !mine)) && (
            <button className="btn-primary flex-1" onClick={take}>
              Ich übernehme
            </button>
          )}
          {mine && (
            <>
              <button className="btn-secondary flex-1" onClick={done}>
                ✓ Erledigt
              </button>
              <button className="btn-ghost flex-1" onClick={offer}>
                {task.swapOffered ? 'Tausch zurückziehen' : 'Zum Tausch anbieten'}
              </button>
            </>
          )}
        </div>
      )}
      {task.done && mine && (
        <button className="btn-ghost mt-2 w-full" onClick={done}>
          Doch nicht erledigt
        </button>
      )}
    </div>
  )
}

// Zuständigkeit für die Medikamentengabe (morgens/abends) – rot, wenn unbesetzt
export function RoundRow({ round, showDate = false }: { round: MedRound; showDate?: boolean }) {
  const { state, person, update, notifyFamily, me } = useStore()
  const who = person(round.person)
  const canTake = !round.person && me.role !== 'pflegedienst'
  const take = () => {
    update((d) => {
      const r = d.medRounds.find((x) => x.date === round.date && x.slot === round.slot)
      if (r) r.person = d.activePerson
    })
    notifyFamily(`${me.name} übernimmt: ${SLOT_LABEL[round.slot]} am ${weekday(round.date)}.`)
  }
  return (
    <div className={`rounded-2xl border-2 p-3 ${who ? 'border-cream-300 bg-white' : 'border-red-300 bg-red-50'}`}>
      <div className="flex items-center gap-3">
        <Avatar person={who} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold leading-snug">
            {showDate && `${weekday(round.date)}, ${formatDate(round.date)} · `}
            {SLOT_LABEL[round.slot]}
          </p>
          <p className="text-base">
            {who ? (who.id === state.activePerson ? 'Sie' : who.name) : <span className="font-semibold text-red-800">Noch niemand eingeteilt</span>}
          </p>
        </div>
      </div>
      {canTake && (
        <button className="btn-primary mt-3 w-full" onClick={take}>
          Ich übernehme
        </button>
      )}
    </div>
  )
}
