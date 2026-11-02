import { useEffect, useRef } from 'react'
import type { AppState, DoseLog, Medication } from './types'
import { nowTime, today } from './utils'
import { useStore } from './store'

export interface Dose {
  med: Medication
  time: string
  log?: DoseLog
}

// Alle Einnahmen eines Tages, nach Uhrzeit sortiert
export function dosesFor(state: AppState, date: string): Dose[] {
  const list: Dose[] = []
  for (const med of state.medications)
    for (const time of med.times)
      list.push({ med, time, log: state.doseLogs.find((l) => l.medId === med.id && l.date === date && l.time === time) })
  return list.sort((a, b) => a.time.localeCompare(b.time) || a.med.name.localeCompare(b.med.name))
}

export function useToggleDose() {
  const { update, state } = useStore()
  return (dose: Dose, date = today()) =>
    update((d) => {
      const med = d.medications.find((m) => m.id === dose.med.id)
      const idx = d.doseLogs.findIndex((l) => l.medId === dose.med.id && l.date === date && l.time === dose.time)
      if (idx >= 0) {
        d.doseLogs.splice(idx, 1)
        if (med) med.stock += med.perDose
      } else {
        d.doseLogs.push({ medId: dose.med.id, date, time: dose.time, givenBy: state.activePerson, givenAt: nowTime() })
        if (med) med.stock = Math.max(0, med.stock - med.perDose)
      }
    })
}

// Simulierte Erinnerung: zeigt einmalig einen In-App-Hinweis, sobald eine Einnahme fällig ist
export function useDoseReminders() {
  const { state, toast } = useStore()
  const shown = useRef(new Set<string>())
  useEffect(() => {
    const check = () => {
      const t = today()
      const now = nowTime()
      for (const d of dosesFor(state, t)) {
        const key = `${t}-${d.med.id}-${d.time}`
        if (!d.log && d.time <= now && d.time >= addMinutes(now, -30) && !shown.current.has(key)) {
          shown.current.add(key)
          toast(`⏰ Erinnerung: ${d.med.name} ${d.med.strength} um ${d.time} Uhr ist fällig.`)
        }
      }
    }
    check()
    const i = setInterval(check, 30_000)
    return () => clearInterval(i)
  }, [state, toast])
}

function addMinutes(hhmm: string, mins: number) {
  const [h, m] = hhmm.split(':').map(Number)
  const total = Math.max(0, h * 60 + m + mins)
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}
