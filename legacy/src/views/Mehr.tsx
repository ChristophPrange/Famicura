import { go } from '../router'
import { useStore } from '../store'
import { PageHeader } from '../components/ui'
import { startTour } from '../components/Tour'

const ITEMS = [
  { path: '/mehr/tagebuch', icon: '📔', title: 'Pflegetagebuch', text: 'Beobachtungen festhalten, Zusammenfassung für die Hausärztin' },
  { path: '/mehr/notfallmappe', icon: '🗂️', title: 'Notfallmappe', text: 'Wichtige Infos für den Rettungsdienst, mit QR-Code' },
  { path: '/mehr/familie', icon: '👨‍👩‍👧', title: 'Familie & Pflegedienst', text: 'Wer gehört dazu, wer kann wann, was darf der Pflegedienst sehen' },
  { path: '/mehr/tagesablauf', icon: '🏠', title: 'Tagesablauf (Demo)', text: 'Frühwarnung, wenn morgens keine Aktivität in der Wohnung ist' },
  { path: '/mehr/export', icon: '⬇️', title: 'Daten exportieren', text: 'Drucken oder als FHIR-Datei für Praxis und Pflegedienst' },
  { path: '/hinweise', icon: '🔔', title: 'Hinweise', text: 'Nachrichten aus der Familie' },
  { path: '/mehr/einstellungen', icon: '⚙️', title: 'Einstellungen', text: 'Schriftgröße, Kontrast, Einwilligungen, Studienmodus' },
  { path: '/mehr/ueber', icon: '📖', title: 'Über diese App', text: 'Zweckbestimmung und Gebrauchsanweisung' },
  { path: '', icon: '🧭', title: 'Einführung ansehen', text: 'Die wichtigsten Funktionen Schritt für Schritt erklärt' },
]

export default function Mehr() {
  const { me } = useStore()
  return (
    <div>
      <PageHeader title="Mehr" subtitle={`Angemeldet als ${me.name}`} />
      <ul className="space-y-3">
        {ITEMS.map((i) => (
          <li key={i.title}>
            <button className="card flex w-full items-center gap-4 text-left hover:border-sage-400" onClick={() => (i.path ? go(i.path) : startTour())}>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sage-50 text-2xl" aria-hidden>
                {i.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-lg font-bold">{i.title}</span>
                <span className="block text-base text-ink-soft">{i.text}</span>
              </span>
              <span className="text-2xl text-ink-soft" aria-hidden>›</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-center text-sm text-ink-soft">FamilienPflege · Prototyp · werbefrei · alle Daten sind erfunden und bleiben auf diesem Gerät.</p>
    </div>
  )
}
