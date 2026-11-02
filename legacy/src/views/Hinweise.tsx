import { useEffect } from 'react'
import { useStore } from '../store'
import { formatDateTime } from '../utils'
import { EmptyState, PageHeader } from '../components/ui'

export default function Hinweise() {
  const { state, update } = useStore()
  const list = state.notices

  // Beim Öffnen alles als gelesen markieren
  useEffect(() => {
    if (state.notices.some((n) => !n.read))
      update((d) => {
        d.notices.forEach((n) => (n.read = true))
      })
  }, [state.notices, update])

  return (
    <div>
      <PageHeader title="Hinweise" subtitle="Was in der Familie passiert ist (simuliert)." onBack />
      {list.length === 0 ? (
        <EmptyState icon="🔕" title="Keine Hinweise." text="Hier erscheint, wenn jemand etwas übernimmt oder ausfällt." />
      ) : (
        <ul className="space-y-2">
          {list.map((n) => (
            <li key={n.id} className="card">
              <p>{n.text}</p>
              <p className="mt-1 text-sm text-ink-soft">{formatDateTime(n.at)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
