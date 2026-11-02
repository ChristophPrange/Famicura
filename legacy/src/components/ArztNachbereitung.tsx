import { useEffect, useMemo, useState } from 'react'
import type { Appointment } from '../types'
import { useStore } from '../store'
import { go } from '../router'
import { formatDateLong, uid } from '../utils'
import { InfoNote, Sheet } from './ui'
import { useTourOpen } from './Tour'

// Nach einem Arzttermin erinnert die App die Begleitperson beim nächsten Öffnen daran,
// die Ergebnisse einzutragen. Gespeichert wird beim Termin und im Pflegetagebuch.

const WAIT_MINUTES = 60 // so lange nach Terminbeginn, bis die Erinnerung kommt
const MAX_DAYS = 14 // ältere Termine nicht mehr nachfragen

export function pendingFollowUps(appointments: Appointment[], personId: string, now = new Date()) {
  const oldest = new Date(now.getTime() - MAX_DAYS * 86_400_000)
  return appointments
    .filter((a) => a.companion === personId && !a.result && !a.resultSkipped)
    .filter((a) => {
      const start = new Date(`${a.date}T${a.time}:00`)
      return start.getTime() + WAIT_MINUTES * 60_000 <= now.getTime() && start >= oldest
    })
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
}

const MEDS: { id: 'ja' | 'nein' | 'unklar'; label: string }[] = [
  { id: 'nein', label: 'Nein' },
  { id: 'ja', label: 'Ja' },
  { id: 'unklar', label: 'Weiß nicht' },
]

export default function ArztNachbereitung() {
  const { state, update, me, toast, notifyFamily } = useStore()
  const pending = useMemo(() => pendingFollowUps(state.appointments, me.id), [state.appointments, me.id])
  // Einmal pro Öffnen der App (bzw. pro Ansicht als andere Person) nachfragen
  const [dismissed, setDismissed] = useState(false)
  useEffect(() => setDismissed(false), [me.id])
  const tourOpen = useTourOpen()
  const appt = pending[0]
  const [text, setText] = useState('')
  const [meds, setMeds] = useState<'ja' | 'nein' | 'unklar' | null>(null)
  const [nextDate, setNextDate] = useState('')
  const [nextTime, setNextTime] = useState('')

  if (!appt || dismissed || tourOpen) return null

  const reset = () => {
    setText('')
    setMeds(null)
    setNextDate('')
    setNextTime('')
  }

  const save = () => {
    const at = new Date().toISOString()
    const medsText = meds === 'ja' ? ' Medikation wurde geändert.' : meds === 'unklar' ? ' Unklar, ob die Medikation geändert wurde.' : ''
    update((d) => {
      const a = d.appointments.find((x) => x.id === appt.id)
      if (a) a.result = { text: text.trim(), medsChanged: meds ?? 'unklar', at, by: d.activePerson }
      d.diary.unshift({ id: uid(), at, kind: 'arzt', text: `${appt.title}: ${text.trim() || 'keine Notiz'}.${medsText}`, by: d.activePerson })
      if (nextDate) d.appointments.push({ id: uid(), title: appt.title, date: nextDate, time: nextTime || '09:00', place: appt.place, companion: null })
    })
    notifyFamily(`${me.name} hat die Ergebnisse vom Termin „${appt.title}“ eingetragen.`)
    reset()
    if (meds === 'ja') {
      toast('Bitte jetzt den Medikationsplan anpassen – nur so, wie es ärztlich verordnet ist.')
      setDismissed(true)
      go('/medikamente')
    }
  }

  const skip = () => {
    update((d) => {
      const a = d.appointments.find((x) => x.id === appt.id)
      if (a) a.resultSkipped = true
    })
    reset()
  }

  return (
    <Sheet open onClose={() => setDismissed(true)} title="Wie war der Arzttermin?">
      <div className="card">
        <p className="text-lg font-bold">🩺 {appt.title}</p>
        <p className="text-base text-ink-soft">
          {formatDateLong(appt.date)}, {appt.time} Uhr{appt.place ? ` · ${appt.place}` : ''}
        </p>
        <p className="mt-1 text-base">Sie haben begleitet. Tragen Sie kurz ein, was besprochen wurde – dann weiß die ganze Familie Bescheid.</p>
      </div>

      <label className="label mt-4" htmlFor="arzt-text">
        Was wurde gesagt oder vereinbart?
      </label>
      <textarea
        id="arzt-text"
        className="input min-h-[120px] py-3"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="z. B. Blutzucker gut eingestellt, in 3 Monaten wieder kontrollieren"
      />
      <p className="mt-1 text-sm text-ink-soft">Tipp: Auf dem Handy können Sie mit dem Mikrofon der Tastatur diktieren.</p>

      <span className="label mt-4">Wurde die Medikation geändert?</span>
      <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Wurde die Medikation geändert?">
        {MEDS.map((m) => (
          <button
            key={m.id}
            role="radio"
            aria-checked={meds === m.id}
            onClick={() => setMeds(m.id)}
            className={`btn border-2 px-2 ${meds === m.id ? 'border-sage-600 bg-sage-600 text-white' : 'border-cream-300 bg-white'}`}
          >
            {m.label}
          </button>
        ))}
      </div>
      {meds === 'ja' && (
        <div className="mt-2">
          <InfoNote tone="warn">Nach dem Speichern öffnet sich der Medikationsplan. Bitte genau so anpassen, wie es auf dem neuen Plan oder Rezept steht.</InfoNote>
        </div>
      )}

      <span className="label mt-4">Neuer Termin vereinbart? (freiwillig)</span>
      <div className="grid grid-cols-2 gap-2">
        <input type="date" className="input" aria-label="Datum des neuen Termins" value={nextDate} onChange={(e) => setNextDate(e.target.value)} />
        <input type="time" className="input" aria-label="Uhrzeit des neuen Termins" value={nextTime} onChange={(e) => setNextTime(e.target.value)} />
      </div>

      <button className="btn-primary mt-5 w-full" onClick={save} disabled={!text.trim() && !meds}>
        Speichern und Familie informieren
      </button>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <button className="btn-ghost" onClick={() => setDismissed(true)}>
          Später
        </button>
        <button className="btn-ghost" onClick={skip}>
          Nichts einzutragen
        </button>
      </div>
      {pending.length > 1 && <p className="mt-2 text-center text-sm text-ink-soft">Danach: noch {pending.length - 1} weitere Termine.</p>}
    </Sheet>
  )
}
