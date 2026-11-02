import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { AppState, Medication, Person, PersonId } from './types'
import { createDemoState, createFreshState, STATE_VERSION } from './demoData'
import { uid } from './utils'

const KEY = 'familienpflege-state'
// Alle Schlüssel, die die App im Browser ablegt – für „Alle Daten löschen“
const ALL_KEYS = [KEY, 'familienpflege-einfuehrung-gesehen']

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AppState
      if (parsed.version === STATE_VERSION) {
        // Ältere Stände ohne Einladungen weiter nutzen
        parsed.invites ??= createDemoState().invites
        return parsed
      }
    }
  } catch {
    // ignorieren, dann Demo-Daten
  }
  return createFreshState()
}

interface Toast {
  id: string
  text: string
}

interface Store {
  state: AppState
  // Änderungen auf einer Kopie des Zustands ausführen
  update: (fn: (draft: AppState) => void) => void
  reset: () => void
  // Alles Gespeicherte entfernen und mit dem Onboarding neu beginnen
  wipe: () => void
  // Nutzungsprotokoll für den Studienmodus: nur Bereich und Zeitpunkt, keine Inhalte
  logUsage: (area: string) => void
  me: Person
  person: (id: PersonId | null | undefined) => Person | undefined
  toast: (text: string) => void
  // Simulierte Benachrichtigung an die Familie: Toast + Eintrag in „Hinweise“
  notifyFamily: (text: string) => void
  toasts: Toast[]
}

const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(load)
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      // Speicher voll oder gesperrt – Prototyp läuft trotzdem weiter
    }
  }, [state])

  const update = useCallback((fn: (draft: AppState) => void) => {
    setState((prev) => {
      const draft = structuredClone(prev)
      fn(draft)
      return draft
    })
  }, [])

  const toast = useCallback((text: string) => {
    const id = uid()
    setToasts((t) => [...t, { id, text }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000)
  }, [])

  const notifyFamily = useCallback(
    (text: string) => {
      update((d) => {
        d.notices.unshift({ id: uid(), at: new Date().toISOString(), text, read: false })
      })
      toast('📨 ' + text)
    },
    [update, toast],
  )

  const reset = useCallback(() => {
    setState(createDemoState())
  }, [])

  const wipe = useCallback(() => {
    try {
      ALL_KEYS.forEach((k) => localStorage.removeItem(k))
    } catch {
      // nichts zu löschen
    }
    setState(createFreshState())
  }, [])

  const logUsage = useCallback((area: string) => {
    setState((prev) => {
      if (!prev.study.enabled) return prev
      const last = prev.usage[prev.usage.length - 1]
      // dieselbe Ansicht innerhalb einer Minute nur einmal zählen
      if (last && last.area === area && Date.now() - new Date(last.at).getTime() < 60_000) return prev
      return { ...prev, usage: [...prev.usage, { at: new Date().toISOString(), area }] }
    })
  }, [])

  const person = (id: PersonId | null | undefined) => state.people.find((p) => p.id === id)
  const me = person(state.activePerson) ?? state.people[1]

  return (
    <Ctx.Provider value={{ state, update, reset, wipe, logUsage, me, person, toast, notifyFamily, toasts }}>{children}</Ctx.Provider>
  )
}

export function useStore() {
  const s = useContext(Ctx)
  if (!s) throw new Error('StoreProvider fehlt')
  return s
}

export const daysLeft = (m: Medication) => {
  const perDay = m.perDose * m.times.length
  return perDay > 0 ? Math.floor(m.stock / perDay) : Infinity
}

export const REFILL_WARN_DAYS = 7

export const mainCarer = (s: AppState) => s.people.find((p) => p.role === 'hauptpflege')
export const helpers = (s: AppState) => s.people.filter((p) => p.role !== 'gepflegt' && p.role !== 'pflegedienst')
