import { useCallback, useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import { go } from '../router'
import { EXAMPLES, interpret, normalize, type VoicePlan } from '../voice'
import { AI_FEATURE, aiAvailable, askAssistant, planFromAi, type AiTurn } from '../assistant'
import { InfoNote, Sheet } from './ui'

// Sprachsteuerung: Mikrofon-Knopf über der Tab-Leiste.
// Spracherkennung und Vorlesen übernimmt der Browser (Web Speech API).
// Die App selbst speichert keine Aufnahmen; ausgewertet wird nur der erkannte Text, auf dem Gerät.

// Minimale Typen, weil die Web Speech API nicht in allen TypeScript-DOM-Typen enthalten ist
interface RecognitionResultEvent {
  resultIndex: number
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>
}
interface Recognition {
  lang: string
  interimResults: boolean
  continuous: boolean
  maxAlternatives: number
  onresult: ((e: RecognitionResultEvent) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}
type RecognitionCtor = new () => Recognition

const getRecognition = (): RecognitionCtor | undefined => {
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition
}
export const speechInputSupported = () => typeof window !== 'undefined' && !!getRecognition()
const speechOutputSupported = () => typeof window !== 'undefined' && 'speechSynthesis' in window

function speak(text: string) {
  if (!speechOutputSupported()) return
  const synth = window.speechSynthesis
  synth.cancel()
  const u = new SpeechSynthesisUtterance(text.replace(/[„“]/g, ''))
  u.lang = 'de-DE'
  u.rate = 0.85 // langsamer, besser verständlich
  const voice = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith('de'))
  if (voice) u.voice = voice
  synth.speak(u)
}

const YES = /^(ja|jawohl|genau|richtig|stimmt|okay|ok|ja bitte|ja gerne|passt|eintragen|speichern)$/
const NO = /^(nein|nee|abbrechen|stopp|stop|falsch|nicht eintragen|lieber nicht)$/

const ERRORS: Record<string, string> = {
  'not-allowed': 'Das Mikrofon ist gesperrt. Bitte erlauben Sie den Zugriff in den Browser-Einstellungen. Sie können die Frage auch eintippen.',
  'service-not-allowed': 'Die Spracherkennung ist in diesem Browser nicht erlaubt. Bitte tippen Sie die Frage ein.',
  'no-speech': 'Ich habe nichts gehört. Tippen Sie noch einmal auf das Mikrofon und sprechen Sie dann.',
  network: 'Die Spracherkennung braucht eine Internetverbindung. Bitte tippen Sie die Frage ein.',
  'audio-capture': 'Es wurde kein Mikrofon gefunden.',
}

interface Line {
  who: 'ich' | 'app'
  text: string
  ai?: boolean // Antwort kam vom KI-Assistenten
}

export default function Voice() {
  const { state, update, toast, logUsage } = useStore()
  const [open, setOpen] = useState(false)
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const [typed, setTyped] = useState('')
  const [lines, setLines] = useState<Line[]>([])
  const [pending, setPending] = useState<VoicePlan['confirm'] | null>(null)
  const [thinking, setThinking] = useState(false)
  const [aiHistory, setAiHistory] = useState<AiTurn[]>([])
  const rec = useRef<Recognition | null>(null)
  const inputOk = speechInputSupported()
  const speakOn = state.settings.speakAnswers !== false
  const consent = state.settings.voiceConsent === true
  const asked = state.settings.voiceConsent !== undefined
  const aiOn = AI_FEATURE && state.settings.aiAssistant === true

  const say = useCallback(
    (text: string, ai = false) => {
      setLines((l) => [...l.slice(-8), { who: 'app', text, ai }])
      if (speakOn) speak(text)
    },
    [speakOn],
  )

  const present = useCallback(
    (plan: VoicePlan, ai = false) => {
      if (plan.confirm) {
        setPending(plan.confirm)
        say(plan.reply.trim().endsWith('?') ? plan.reply : `${plan.reply} ${plan.confirm.question}`, ai)
      } else say(plan.reply, ai)
      if (plan.nav) {
        const target = plan.nav
        setTimeout(() => {
          setOpen(false)
          go(target)
        }, 1600)
      }
    },
    [say],
  )

  const handle = useCallback(
    (raw: string) => {
      const text = raw.trim()
      if (!text || thinking) return
      setLines((l) => [...l.slice(-8), { who: 'ich', text }])
      logUsage('sprache')
      const n = normalize(text)
      if (pending) {
        if (YES.test(n)) {
          update((d) => pending.run(d))
          setPending(null)
          toast('✅ ' + pending.done)
          say(pending.done)
          return
        }
        if (NO.test(n)) {
          setPending(null)
          say('In Ordnung, ich habe nichts eingetragen.')
          return
        }
        setPending(null) // neue Anfrage statt Antwort: Rückfrage verwerfen
      }
      const local = interpret(text, state)
      // Notfall immer sofort und ohne Umweg über das Internet
      if (!aiOn || !aiAvailable() || local.nav === '/krise') return present(local)

      setThinking(true)
      askAssistant(text, state, aiHistory)
        .then((res) => {
          setAiHistory((h) => [...h, { role: 'user' as const, content: text }, { role: 'assistant' as const, content: res.reply }].slice(-8))
          present(planFromAi(res.reply, res.actions, state), true)
        })
        .catch(() => present({ ...local, reply: `(KI gerade nicht erreichbar, einfache Erkennung.) ${local.reply}` }))
        .finally(() => setThinking(false))
    },
    [pending, state, update, toast, say, present, logUsage, aiOn, aiHistory, thinking],
  )

  const stop = () => {
    rec.current?.stop()
    setListening(false)
  }

  const listen = () => {
    const Ctor = getRecognition()
    if (!Ctor) return
    if (speechOutputSupported()) window.speechSynthesis.cancel() // nicht sich selbst zuhören
    const r = new Ctor()
    r.lang = 'de-DE'
    r.interimResults = true
    r.continuous = false
    r.maxAlternatives = 1
    let finalText = ''
    r.onresult = (e) => {
      let live = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i]
        if (res.isFinal) finalText += res[0].transcript
        else live += res[0].transcript
      }
      setInterim(finalText + live)
    }
    r.onerror = (e) => {
      if (e.error !== 'aborted') say(ERRORS[e.error] ?? 'Die Spracherkennung hat nicht geklappt. Bitte noch einmal oder eintippen.')
    }
    r.onend = () => {
      setListening(false)
      setInterim('')
      if (finalText) handle(finalText)
    }
    rec.current = r
    setListening(true)
    try {
      r.start()
    } catch {
      setListening(false)
    }
  }

  // Beim Schließen Mikrofon und Vorlesen beenden
  useEffect(() => {
    if (open) return
    rec.current?.abort()
    setListening(false)
    if (speechOutputSupported()) window.speechSynthesis.cancel()
  }, [open])

  const submitTyped = () => {
    handle(typed)
    setTyped('')
  }

  const confirmBox = pending && (
    <div className="card mt-3 border-2 border-sage-400">
      {pending.items && (
        <ul className="mb-2 list-disc space-y-1 pl-6 text-lg">
          {pending.items.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      )}
      <p className="font-semibold">{pending.question}</p>
      <p className="text-base text-ink-soft">Sie können auch „Ja“ oder „Nein“ sagen.</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button className="btn-primary" onClick={() => handle('ja')}>
          Ja, eintragen
        </button>
        <button className="btn-secondary" onClick={() => handle('nein')}>
          Nein
        </button>
      </div>
    </div>
  )

  return (
    <>
      <button
        data-tour="sprache"
        className="no-print fixed bottom-[calc(84px+env(safe-area-inset-bottom))] right-[max(1rem,calc(50%-240px+1rem))] z-40 flex h-16 w-16 items-center justify-center rounded-full bg-sage-600 text-3xl text-white shadow-lg hover:bg-sage-700"
        onClick={() => setOpen(true)}
        aria-label="Sprachsteuerung öffnen"
      >
        <span aria-hidden>🎤</span>
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} title="Sprachsteuerung">
        {!asked && inputOk ? (
          <div className="space-y-3">
            <InfoNote>
              <strong>Bevor Sie sprechen:</strong> Die Umwandlung von Sprache in Text übernimmt Ihr Browser. Bei Chrome und Edge wird die Aufnahme dafür an Server von Google bzw. Microsoft geschickt, bei
              Safari an Apple oder direkt auf dem Gerät verarbeitet. Die App selbst speichert keine Aufnahmen und schickt nichts weiter. Den erkannten Text wertet sie nur auf diesem Gerät aus.
            </InfoNote>
            <p className="text-base text-ink-soft">Prototyp: Für den echten Einsatz soll die Erkennung auf dem Gerät oder auf Servern in der EU laufen.</p>
            <button className="btn-primary w-full" onClick={() => update((d) => void (d.settings.voiceConsent = true))}>
              Verstanden, Mikrofon nutzen
            </button>
            <button className="btn-ghost w-full" onClick={() => update((d) => void (d.settings.voiceConsent = false))}>
              Nur eintippen
            </button>
            <TypeBox typed={typed} setTyped={setTyped} submit={submitTyped} />
            <Conversation lines={lines} />
            {confirmBox}
          </div>
        ) : (
          <div>
            {inputOk && consent ? (
              <div className="flex flex-col items-center">
                <button
                  className={`flex h-28 w-28 items-center justify-center rounded-full text-5xl text-white shadow-lg ${listening ? 'animate-pulse bg-red-600' : 'bg-sage-600 hover:bg-sage-700'}`}
                  onClick={listening ? stop : listen}
                  aria-label={listening ? 'Zuhören beenden' : 'Sprechen'}
                >
                  <span aria-hidden>{listening ? '■' : '🎤'}</span>
                </button>
                <p className="mt-3 text-center text-lg font-semibold" aria-live="polite">
                  {listening ? 'Ich höre zu …' : 'Tippen und sprechen'}
                </p>
                {interim && <p className="mt-1 text-center text-ink-soft">„{interim}“</p>}
                <p className="mt-2 text-center text-sm text-ink-soft">Ein Tippen startet, eine Sprechpause beendet. Hinweis: Chrome und Edge schicken die Aufnahme zur Erkennung an Google bzw. Microsoft.</p>
              </div>
            ) : inputOk ? (
              <button className="btn-secondary w-full" onClick={() => update((d) => void delete d.settings.voiceConsent)}>
                🎤 Mikrofon doch nutzen
              </button>
            ) : (
              (
                <InfoNote tone="warn">
                  Dieser Browser kann keine Sprache erkennen (z. B. Firefox oder manche installierte Apps auf dem iPhone). Nutzen Sie Chrome, Edge oder Safari, oder tippen Sie Ihre Frage einfach ein. Antworten
                  werden trotzdem vorgelesen{speechOutputSupported() ? '' : ', sofern der Browser das kann'}.
                </InfoNote>
              )
            )}

            <Conversation lines={lines} />
            {thinking && (
              <p className="mt-3 animate-pulse text-lg font-semibold text-sage-800" aria-live="polite">
                ✨ Einen Moment, ich denke nach …
              </p>
            )}
            {confirmBox}
            <TypeBox typed={typed} setTyped={setTyped} submit={submitTyped} />

            {AI_FEATURE && <AiCard on={aiOn} setOn={(v) => update((d) => void (d.settings.aiAssistant = v))} />}

            <details className="mt-4">
              <summary className="cursor-pointer py-2 text-lg font-semibold text-sage-800">Was kann ich sagen?</summary>
              <p className="label mt-2">Fragen</p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLES.fragen.map((e) => (
                  <button key={e} className="chip border-2 border-cream-300 bg-white text-left" onClick={() => handle(e)}>
                    {e}
                  </button>
                ))}
              </div>
              <p className="label mt-3">Eintragen</p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLES.eingaben.map((e) => (
                  <button key={e} className="chip border-2 border-cream-300 bg-white text-left" onClick={() => handle(e)}>
                    {e}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-base text-ink-soft">Eingetragen wird erst, wenn Sie mit „Ja“ bestätigen.</p>
            </details>

            <label className="mt-4 flex min-h-[44px] items-center justify-between gap-3">
              <span className="font-semibold">Antworten vorlesen</span>
              <input
                type="checkbox"
                className="h-6 w-6 accent-sage-600"
                checked={speakOn}
                onChange={(e) => update((d) => void (d.settings.speakAnswers = e.target.checked))}
              />
            </label>
          </div>
        )}
      </Sheet>
    </>
  )
}

// Opt-in für den KI-Assistenten mit Datenschutzhinweis
export function AiCard({ on, setOn }: { on: boolean; setOn: (v: boolean) => void }) {
  return (
    <div className={`mt-4 rounded-2xl border-2 p-4 ${on ? 'border-violet-300 bg-violet-50' : 'border-cream-300 bg-white'}`}>
      <label className="flex min-h-[44px] cursor-pointer items-start gap-3">
        <input type="checkbox" className="mt-1 h-6 w-6 shrink-0 accent-violet-700" checked={on} onChange={(e) => setOn(e.target.checked)} />
        <span>
          <span className="block font-bold">✨ KI-Assistent (mit Internet)</span>
          <span className="mt-1 block text-base">
            Versteht freie Sätze und kann mehr: z. B. „Gib den Einkauf am Donnerstag an Markus weiter“ oder „Markus soll diese Woche abends die Tabletten übernehmen“.
          </span>
        </span>
      </label>
      <p className="mt-2 text-sm text-ink-soft">
        Dafür schickt die App Ihre Frage und einen Auszug der Pflegedaten (Vornamen, Medikamentenplan, Aufgaben, Termine, Tagebuch der letzten 7 Tage) an den KI-Dienst Claude von
        Anthropic (USA). Nicht geschickt werden Telefonnummern, Adressen, Diagnosen und Ihr Belastungs-Check. Prototyp, nur mit Demo-Daten nutzen: Für den echten Einsatz braucht es
        Verarbeitung in der EU und einen Vertrag zur Auftragsverarbeitung. Ohne Internet oder ausgeschaltet gilt die einfache Erkennung auf dem Gerät. Notfälle werden immer direkt auf
        dem Gerät erkannt.
      </p>
    </div>
  )
}

function Conversation({ lines }: { lines: Line[] }) {
  const end = useRef<HTMLLIElement>(null)
  // Neueste Antwort ins Bild holen
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [lines.length])
  if (!lines.length) return null
  return (
    <ul className="mt-4 space-y-2" aria-live="polite">
      {lines.map((l, i) => (
        <li
          key={i}
          ref={i === lines.length - 1 ? end : undefined}
          className={`rounded-2xl px-4 py-3 ${l.who === 'ich' ? 'ml-8 bg-sage-100 text-base text-sage-900' : `mr-4 border border-cream-300 bg-white ${i === lines.length - 1 ? 'text-xl font-semibold leading-snug' : 'text-base'}`}`}
        >
          <span className="sr-only">{l.who === 'ich' ? 'Sie: ' : 'App: '}</span>
          {l.ai && (
            <span className="mb-1 block text-sm font-semibold text-violet-800" aria-label="Antwort vom KI-Assistenten">
              ✨ KI
            </span>
          )}
          {l.text}
        </li>
      ))}
    </ul>
  )
}

function TypeBox({ typed, setTyped, submit }: { typed: string; setTyped: (v: string) => void; submit: () => void }) {
  return (
    <form
      className="mt-4 flex gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
    >
      <label className="sr-only" htmlFor="voice-text">
        Frage oder Eintrag eintippen
      </label>
      <input id="voice-text" className="input" placeholder="Oder hier eintippen …" value={typed} onChange={(e) => setTyped(e.target.value)} />
      <button className="btn-primary px-4" type="submit" disabled={!typed.trim()}>
        Senden
      </button>
    </form>
  )
}
