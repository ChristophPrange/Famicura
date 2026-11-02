import { useEffect } from 'react'
import type { AppState, SensorId } from '../types'
import { useStore } from '../store'
import { nowTime, pad, today } from '../utils'
import { DemoBadge, InfoNote, PageHeader } from '../components/ui'

// Demo-Modul „Tagesablauf“: simulierte Ereignisse aus der Wohnung.
// Bewusst KEINE Vitalwerte und KEINE Sturzerkennung – nur „ist der Tag normal angelaufen?“.

export const SENSORS: Record<SensorId, { label: string; icon: string }> = {
  tuer: { label: 'Haustür', icon: '🚪' },
  flur: { label: 'Bewegung Flur', icon: '🚶' },
  kueche: { label: 'Bewegung Küche', icon: '🍳' },
  bad: { label: 'Bewegung Bad', icon: '🛁' },
}

const isToday = (iso: string) => {
  const d = new Date(iso)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` === today()
}
const timeOf = (iso: string) => {
  const d = new Date(iso)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// Warnung nötig, wenn die Uhrzeit vorbei ist und heute bis dahin nichts passiert ist
export function sensorStatus(s: AppState) {
  const todays = s.sensors.events.filter((e) => isToday(e.at))
  const before = todays.filter((e) => timeOf(e.at) <= s.sensors.deadline)
  const alert = s.sensors.enabled && nowTime() > s.sensors.deadline && before.length === 0
  return { todays, alert }
}

// Läuft im Hintergrund der App: benachrichtigt die Familie einmal pro Tag
export function useSensorWatch() {
  const { state, notifyFamily, update } = useStore()
  const { alert } = sensorStatus(state)
  const already = state.sensors.lastAlert === today()
  useEffect(() => {
    if (!alert || already || !state.onboarded) return
    update((d) => {
      d.sensors.lastAlert = today()
    })
    notifyFamily(`Tagesablauf: Bis ${state.sensors.deadline} Uhr keine Aktivität bei Mama erkannt. Bitte kurz anrufen.`)
  }, [alert, already, state.onboarded, state.sensors.deadline, update, notifyFamily])
}

export default function Tagesablauf() {
  const { state, update, toast } = useStore()
  const { todays, alert } = sensorStatus(state)
  const list = [...state.sensors.events].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 12)

  const simulate = (device: SensorId) => {
    update((d) => {
      d.sensors.events.push({ at: new Date().toISOString(), device })
    })
    toast(`${SENSORS[device].icon} ${SENSORS[device].label}: Aktivität (simuliert)`)
  }

  // Ruhigen Morgen vorführen: heutige Ereignisse entfernen und Uhrzeit vor „jetzt“ legen
  const quietMorning = () =>
    update((d) => {
      d.sensors.events = d.sensors.events.filter((e) => !isToday(e.at))
      d.sensors.lastAlert = ''
      const n = new Date(Date.now() - 5 * 60_000)
      d.sensors.deadline = `${pad(n.getHours())}:${pad(n.getMinutes())}`
    })

  return (
    <div>
      <PageHeader title="Tagesablauf" subtitle="Ist der Tag bei Mama normal angelaufen?" onBack="/mehr" />
      <p className="mb-3">
        <DemoBadge />
      </p>

      <InfoNote>
        Kleine Sensoren in der Wohnung melden nur „hier hat sich etwas bewegt“. <strong>Keine Kamera, keine Vitalwerte, keine Sturzerkennung.</strong> In diesem Prototyp sind alle Ereignisse
        simuliert.
      </InfoNote>

      <section className={`mt-4 rounded-2xl border-2 p-4 ${alert ? 'border-red-300 bg-red-50' : 'border-sage-200 bg-sage-50'}`}>
        <p className="text-lg font-bold">{alert ? `⚠️ Bis ${state.sensors.deadline} Uhr keine Aktivität` : todays.length ? '✓ Heute schon Aktivität erkannt' : '… heute noch keine Aktivität'}</p>
        <p className="text-base">
          {alert ? 'Die Familie wurde benachrichtigt. Bitte bei Mama anrufen oder vorbeischauen.' : todays.length ? `Zuletzt: ${SENSORS[todays[todays.length - 1].device].label} um ${timeOf(todays[todays.length - 1].at)} Uhr.` : `Wir warnen, wenn bis ${state.sensors.deadline} Uhr nichts passiert.`}
        </p>
      </section>

      <div className="card mt-4 space-y-3">
        <label className="flex min-h-[44px] items-center justify-between gap-3">
          <span className="font-semibold">Frühwarnung eingeschaltet</span>
          <input
            type="checkbox"
            className="h-6 w-6 accent-sage-600"
            checked={state.sensors.enabled}
            onChange={(e) =>
              update((d) => {
                d.sensors.enabled = e.target.checked
              })
            }
          />
        </label>
        <div>
          <label className="label" htmlFor="deadline">
            Warnen, wenn bis zu dieser Uhrzeit keine Aktivität war
          </label>
          <input
            id="deadline"
            type="time"
            className="input"
            value={state.sensors.deadline}
            onChange={(e) =>
              update((d) => {
                d.sensors.deadline = e.target.value
                d.sensors.lastAlert = ''
              })
            }
          />
        </div>
      </div>

      <h2 className="h-section">Ereignis simulieren</h2>
      <div className="grid grid-cols-2 gap-2">
        {(Object.keys(SENSORS) as SensorId[]).map((id) => (
          <button key={id} className="btn-secondary text-base" onClick={() => simulate(id)}>
            <span aria-hidden>{SENSORS[id].icon}</span> {SENSORS[id].label}
          </button>
        ))}
      </div>
      <button className="btn-ghost mt-2 w-full" onClick={quietMorning}>
        Ruhigen Morgen vorführen (löst Warnung aus)
      </button>

      <h2 className="h-section">Letzte Ereignisse</h2>
      {list.length === 0 ? (
        <p className="text-ink-soft">Noch keine Ereignisse.</p>
      ) : (
        <ul className="card divide-y divide-cream-300 py-1">
          {list.map((e) => (
            <li key={e.at + e.device} className="flex items-center gap-3 py-2 text-base">
              <span aria-hidden>{SENSORS[e.device].icon}</span>
              <span className="flex-1">{SENSORS[e.device].label}</span>
              <span className="text-ink-soft">
                {isToday(e.at) ? 'heute' : new Date(e.at).toLocaleDateString('de-DE', { weekday: 'short' })} {timeOf(e.at)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
