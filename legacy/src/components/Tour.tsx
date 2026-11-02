import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { go } from '../router'

// Geführte Einführung für den ersten Start. Jeder Schritt öffnet eine Ansicht
// und hebt ein Element mit passendem data-tour-Attribut hervor.
interface Step {
  route: string
  target?: string
  title: string
  text: string
}

const STEPS: Step[] = [
  {
    route: '/heute',
    title: 'Willkommen bei FamilienPflege 👋',
    text: 'Die Entlastungs-App für die intensive Pflegephase. Diese kurze Einführung zeigt Ihnen in einer Minute das Wichtigste. Alle Daten sind Beispiele – Sie können nichts kaputt machen.',
  },
  {
    route: '/heute',
    target: 'krise',
    title: 'Krisen-Assistent',
    text: 'Bei einem Sturz, plötzlicher Verwirrung oder wenn Sie nicht mehr können: Ein Tipp führt Sie mit Ja/Nein-Fragen weiter. Der Notruf 112 steht immer ganz oben.',
  },
  {
    route: '/heute',
    target: 'glocke',
    title: 'Hinweise aus der Familie',
    text: 'Hier sehen Sie, wenn jemand eine Aufgabe übernimmt, ausfällt oder der Pflegedienst eine Notiz schickt. Alles, wofür noch niemand eingeteilt ist, steht rot auf dieser Seite.',
  },
  {
    route: '/medikamente',
    target: 'dosen',
    title: 'Gemeinsamer Medikationsplan',
    text: 'Abhaken, sobald Mama ihre Tabletten hat – alle sehen sofort, wer sie wann gegeben hat. Keine medizinische Bewertung: Die App organisiert nur, was die Ärztin verordnet hat.',
  },
  {
    route: '/dienstplan',
    target: 'aufgaben',
    title: 'Abwesenheit planen',
    text: 'Krank oder im Urlaub? „Ich falle aus“ fragt den Zeitraum ab, zeigt betroffene Aufgaben und Medikamentengaben und schlägt Vertretungen vor – je nachdem, wer an dem Tag kann.',
  },
  {
    route: '/dienstplan',
    target: 'ansicht',
    title: 'Woche oder Monat',
    text: 'Wechseln Sie zwischen der Wochenliste und dem Monatskalender, in dem auch alle Arzttermine stehen.',
  },
  {
    route: '/ich',
    target: 'nav-ich',
    title: 'Belastungs-Check mit Messung',
    text: 'Zu festen Zeitpunkten – Start, Woche 4, Woche 8, dann monatlich – ein kurzer Check. So wird sichtbar, ob die Entlastung wirkt. Ihre Antworten sieht niemand außer Ihnen.',
  },
  {
    route: '/mehr',
    target: 'nav-mehr',
    title: 'Pflegedienst, Export, Studie',
    text: 'Unter „Mehr“: Pflegetagebuch, Notfallmappe, neutrale Einbindung eines Pflegedienstes (sieht nur, was Sie freigeben), Datenexport und Studienmodus. Werbefrei, ohne Tracker.',
  },
  {
    route: '/heute',
    title: 'Fertig! 🌿',
    text: 'Probieren Sie alles in Ruhe aus. Die Einführung finden Sie jederzeit unter „Mehr“.',
  },
]

const SEEN_KEY = 'familienpflege-einfuehrung-gesehen'
const START_EVENT = 'familienpflege-einfuehrung'

export const startTour = () => window.dispatchEvent(new Event(START_EVENT))

// Andere Dialoge (z. B. Arzttermin-Nachbereitung) warten, solange die Einführung offen ist
let tourOpen = false
const STATE_EVENT = 'familienpflege-einfuehrung-status'
export function useTourOpen() {
  const [open, setOpen] = useState(tourOpen)
  useEffect(() => {
    const on = () => setOpen(tourOpen)
    window.addEventListener(STATE_EVENT, on)
    on()
    return () => window.removeEventListener(STATE_EVENT, on)
  }, [])
  return open
}

const seen = () => {
  try {
    return localStorage.getItem(SEEN_KEY) === '1'
  } catch {
    return false
  }
}

const markSeen = () => {
  try {
    localStorage.setItem(SEEN_KEY, '1')
  } catch {
    // ohne Speicher erscheint die Einführung eben beim nächsten Start wieder
  }
}

export default function Tour({ disabled }: { disabled: boolean }) {
  const [step, setStep] = useState<number | null>(() => (disabled || seen() ? null : 0))
  const [rect, setRect] = useState<DOMRect | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const [cardH, setCardH] = useState(0)
  const s = step === null ? null : STEPS[step]
  const last = step === STEPS.length - 1

  useEffect(() => {
    tourOpen = step !== null
    window.dispatchEvent(new Event(STATE_EVENT))
  }, [step])

  useEffect(() => {
    const on = () => setStep(0)
    window.addEventListener(START_EVENT, on)
    return () => window.removeEventListener(START_EVENT, on)
  }, [])

  const close = useCallback(() => {
    setStep(null)
    markSeen()
  }, [])

  useEffect(() => {
    if (!s) return
    const on = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [s, close])

  // Ansicht öffnen, Element suchen, in Sichtweite scrollen und vermessen
  useEffect(() => {
    if (!s) return
    if ((window.location.hash.replace(/^#/, '') || '/heute') !== s.route) go(s.route)
    setRect(null)
    if (!s.target) return
    let el: Element | null = null
    const measure = () => el && setRect(el.getBoundingClientRect())
    // kurz warten, bis der Router umgeschaltet und nach oben gescrollt hat
    const timer = setTimeout(() => {
      el = document.querySelector(`[data-tour="${s.target}"]`)
      if (!el) return
      if (!el.closest('nav')) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 96 })
      measure()
    }, 150)
    window.addEventListener('scroll', measure, true)
    window.addEventListener('resize', measure)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', measure, true)
      window.removeEventListener('resize', measure)
    }
  }, [s])

  useLayoutEffect(() => {
    if (cardRef.current) setCardH(cardRef.current.offsetHeight)
  }, [step])

  if (!s || step === null) return null

  // Hervorhebung: etwas Rand ums Element, im Bildschirm und neben der Erklärkarte
  const pad = 8
  const vw = window.innerWidth
  const vh = window.innerHeight
  // Erklärkarte auf die Seite mit mehr Platz legen
  const cardAtTop = rect ? rect.top > vh - rect.bottom : false
  let hole = null
  if (rect) {
    const top = Math.max(cardAtTop ? cardH + 24 : 4, rect.top - pad)
    const bottom = Math.min(cardAtTop ? vh - 4 : vh - cardH - 24, rect.bottom + pad)
    const left = Math.max(4, rect.left - pad)
    const right = Math.min(vw - 4, rect.right + pad)
    hole = { top, left, width: right - left, height: Math.max(0, bottom - top) }
  }
  const position = !s.target
    ? 'top-1/2 -translate-y-1/2'
    : cardAtTop
      ? 'top-[max(1rem,env(safe-area-inset-top))]'
      : 'bottom-[max(1rem,env(safe-area-inset-bottom))]'

  return (
    <div className="no-print fixed inset-0 z-[70]" role="dialog" aria-modal aria-labelledby="tour-title" aria-describedby="tour-text">
      {hole ? (
        <div
          className="pointer-events-none absolute rounded-2xl ring-4 ring-white transition-all duration-300"
          style={{ ...hole, boxShadow: '0 0 0 9999px rgba(20, 20, 15, 0.6)' }}
        />
      ) : (
        <div className="absolute inset-0 bg-black/60" />
      )}

      <div className={`absolute inset-x-0 mx-auto w-full max-w-[480px] px-4 ${position}`}>
        <div ref={cardRef} className="rounded-3xl bg-cream-50 p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-sage-700">
              Schritt {step + 1} von {STEPS.length}
            </p>
            {!last && (
              <button className="-mr-2 min-h-[44px] rounded-lg px-3 text-base font-semibold text-ink-soft hover:bg-cream-200" onClick={close}>
                Überspringen
              </button>
            )}
          </div>
          <h2 id="tour-title" className="mt-1 text-2xl font-bold leading-tight">
            {s.title}
          </h2>
          <p id="tour-text" className="mt-2 text-base">
            {s.text}
          </p>

          <div className="mt-4 flex justify-center gap-1.5" aria-hidden>
            {STEPS.map((_, i) => (
              <span key={i} className={`h-2 rounded-full transition-all ${i === step ? 'w-6 bg-sage-600' : 'w-2 bg-cream-300'}`} />
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            {step > 0 && (
              <button className="btn-ghost flex-1" onClick={() => setStep(step - 1)}>
                Zurück
              </button>
            )}
            <button className="btn-primary flex-[2]" onClick={() => (last ? close() : setStep(step + 1))} autoFocus>
              {step === 0 ? 'Einführung starten' : last ? 'Los geht’s' : 'Weiter'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
