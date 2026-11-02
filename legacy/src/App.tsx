import { useRoute, go } from './router'
import { Toasts } from './components/ui'
import Tour from './components/Tour'
import { useDoseReminders } from './meds'
import Heute from './views/Heute'
import Medikamente from './views/Medikamente'
import Dienstplan from './views/Dienstplan'
import Ich from './views/Ich'
import Mehr from './views/Mehr'
import Krise from './views/Krise'
import Tagebuch from './views/Tagebuch'
import Notfallmappe, { Notfallseite } from './views/Notfallmappe'
import Familie from './views/Familie'
import Einstellungen from './views/Einstellungen'
import Hinweise from './views/Hinweise'
import Ueber from './views/Ueber'
import Tagesablauf, { useSensorWatch } from './views/Tagesablauf'
import Export from './views/Export'
import Studie from './views/Studie'
import Pflegedienst from './views/Pflegedienst'
import Onboarding from './components/Onboarding'
import Voice from './components/Voice'
import ArztNachbereitung from './components/ArztNachbereitung'
import { useEffect } from 'react'
import { useStore } from './store'

const TABS = [
  { path: '/heute', label: 'Heute', icon: '🏠' },
  { path: '/medikamente', label: 'Medikamente', icon: '💊' },
  { path: '/dienstplan', label: 'Dienstplan', icon: '📅' },
  { path: '/ich', label: 'Ich', icon: '💚' },
  { path: '/mehr', label: 'Mehr', icon: '☰' },
]

function Screen({ path }: { path: string }) {
  const [, a, b] = path.split('?')[0].split('/')
  switch (a) {
    case 'medikamente':
      return <Medikamente />
    case 'dienstplan':
      return <Dienstplan key={b} initialView={b === 'monat' ? 'monat' : 'woche'} />
    case 'ich':
      return <Ich />
    case 'krise':
      return <Krise id={b} />
    case 'hinweise':
      return <Hinweise />
    case 'mehr':
      if (b === 'tagebuch') return <Tagebuch />
      if (b === 'notfallmappe') return <Notfallmappe />
      if (b === 'familie') return <Familie />
      if (b === 'einstellungen') return <Einstellungen />
      if (b === 'ueber') return <Ueber />
      if (b === 'tagesablauf') return <Tagesablauf />
      if (b === 'export') return <Export />
      if (b === 'studie') return <Studie />
      return <Mehr />
    case 'notfallseite':
      return <Notfallseite />
    default:
      return <Heute />
  }
}

export default function App() {
  const path = useRoute()
  const { state, me, logUsage } = useStore()
  useDoseReminders()
  useSensorWatch()
  const top = '/' + (path.split('/')[1] || 'heute')
  // Die druckbare Notfallseite wird ohne Tab-Leiste gezeigt (auch für QR-Aufruf)
  const bare = top.startsWith('/notfallseite')
  const careService = me.role === 'pflegedienst'
  // Vergleichsgruppe der Studie sieht nur den Fragebogen (und die Einstellungen)
  const controlGroup = state.study.enabled && state.study.group === 'vergleich'
  const area = path.split('?')[0].replace(/^\//, '') || 'heute'

  // Nutzungsprotokoll (nur im Studienmodus, nur Bereich + Zeit)
  useEffect(() => {
    if (state.onboarded) logUsage(area)
  }, [area, state.onboarded, logUsage])

  // Schriftgröße und Kontrast auf die ganze Seite anwenden
  useEffect(() => {
    const root = document.documentElement
    root.style.fontSize = { normal: '100%', gross: '112.5%', sehrgross: '125%' }[state.settings.fontScale]
    root.classList.toggle('hc', state.settings.highContrast)
  }, [state.settings.fontScale, state.settings.highContrast])

  if (!state.onboarded && !bare) return <Onboarding />

  if ((careService || controlGroup) && !bare) {
    const settingsOpen = controlGroup && area === 'mehr/einstellungen'
    const studyOpen = controlGroup && area === 'mehr/studie'
    return (
      <div className="mx-auto min-h-screen max-w-[480px] bg-cream-100">
        <Toasts />
        <main className="px-4 pb-16 pt-[max(0.75rem,env(safe-area-inset-top))]">
          {careService ? <Pflegedienst /> : settingsOpen ? <Einstellungen /> : studyOpen ? <Studie /> : <Ich controlGroup />}
        </main>
      </div>
    )
  }

  return (
    <div className="mx-auto min-h-screen max-w-[480px] bg-cream-100">
      <Toasts />
      <Tour disabled={bare || !state.onboarded} />
      <main className={`px-4 pt-[max(0.75rem,env(safe-area-inset-top))] ${bare ? 'pb-8' : 'pb-32'}`}>
        <Screen path={path} />
      </main>
      {!bare && <Voice />}
      {!bare && <ArztNachbereitung />}
      {!bare && (
        <nav
          className="no-print fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[480px] border-t border-cream-300 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
          aria-label="Hauptnavigation"
        >
          <ul className="grid grid-cols-5">
            {TABS.map((t) => {
              const active = top === t.path || (t.path === '/heute' && (top === '/krise' || top === '/hinweise'))
              return (
                <li key={t.path}>
                  <button
                    data-tour={`nav-${t.path.slice(1)}`}
                    onClick={() => go(t.path)}
                    aria-current={active ? 'page' : undefined}
                    className={`flex h-[72px] w-full flex-col items-center justify-center gap-0.5 px-0.5 text-[11.5px] font-semibold tracking-tight ${
                      active ? 'text-sage-700' : 'text-ink-soft'
                    }`}
                  >
                    <span className={`flex h-8 w-14 items-center justify-center rounded-full text-xl ${active ? 'bg-sage-100' : ''}`} aria-hidden>
                      {t.icon}
                    </span>
                    {t.label}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      )}
    </div>
  )
}
