import { useState } from 'react'
import type { PersonId } from '../types'
import { useStore } from '../store'
import { createDemoState } from '../demoData'
import { go } from '../router'
import { AboutContent } from '../views/Ueber'
import { DemoBadge, ConsentCheck, Sheet } from './ui'
import { startTour } from './Tour'
import { DEMO_CODE, familyName, findInvite, INVITE_ROLES, inviteStatus, joinFamily } from '../invites'

// Erster Start: Rolle, Pflegegrad und drei getrennte Einwilligungen.
// Im Prototyp werden danach immer die Beispiel-Daten der Familie Huber geladen.
// Alternativ: mit Einladungscode einer bestehenden Familie beitreten.

// Code aus einem Einladungslink (#/beitreten?code=…)
const codeFromLink = () => new URLSearchParams(window.location.hash.split('?')[1] ?? '').get('code') ?? ''

const ROLES: { id: PersonId; label: string; text: string }[] = [
  { id: 'christina', label: 'Ich pflege hauptsächlich', text: 'Sie kümmern sich um das meiste.' },
  { id: 'markus', label: 'Ich helfe mit', text: 'Sie unterstützen regelmäßig oder ab und zu.' },
  { id: 'berger', label: 'Ich bin vom Pflegedienst', text: 'Pflegefachkraft eines Partner-Pflegedienstes.' },
]

export default function Onboarding() {
  const { update } = useStore()
  const [joining, setJoining] = useState(() => codeFromLink() !== '')
  const [step, setStep] = useState(0)
  const [about, setAbout] = useState(false)
  const [role, setRole] = useState<PersonId>('christina')
  const [level, setLevel] = useState(3)
  const [app, setApp] = useState(false)
  const [others, setOthers] = useState(false)
  const [patient, setPatient] = useState(false)
  const [share, setShare] = useState(false)
  const [research, setResearch] = useState(false)

  const finish = (demo: boolean) => {
    const s = createDemoState()
    if (!demo) {
      s.activePerson = role
      s.emergency.careLevel = `Pflegegrad ${level}`
      s.people = s.people.map((p) => (p.role === 'gepflegt' ? { ...p, relation: `Mutter, 82 Jahre, Pflegegrad ${level}` } : p))
      s.consents = { app, involveOthers: others, patientAgreed: others && patient, shareStressWithCareService: others && share, research, updatedAt: new Date().toISOString() }
    }
    update((d) => Object.assign(d, s))
    go('/heute')
    setTimeout(startTour, 200)
  }

  const canFinish = app && (!others || patient)

  if (joining) return <Join onCancel={() => setJoining(false)} />

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-cream-100" role="dialog" aria-modal aria-labelledby="ob-title">
      <div className="mx-auto max-w-[480px] px-4 pb-10 pt-[max(1.5rem,env(safe-area-inset-top))]">
        <p className="text-sm font-semibold text-sage-700">Schritt {step + 1} von 4</p>
        <div className="mt-2 h-2 rounded-full bg-cream-200" aria-hidden>
          <div className="h-2 rounded-full bg-sage-500 transition-all" style={{ width: `${((step + 1) / 4) * 100}%` }} />
        </div>

        {step === 0 && (
          <section className="mt-6">
            <p className="text-5xl" aria-hidden>
              🌿
            </p>
            <h1 id="ob-title" className="mt-3 text-3xl font-bold leading-tight">
              Willkommen bei FamilienPflege
            </h1>
            <p className="mt-3">Die Entlastungs-App für die intensive Pflegephase: Medikamente, Aufgaben und Notfälle gemeinsam im Griff – und Sie selbst im Blick.</p>
            <ul className="mt-4 space-y-2 text-base">
              <li>✓ Werbefrei, keine Tracker</li>
              <li>✓ Daten nur in der EU (im Prototyp: nur auf diesem Gerät)</li>
              <li>✓ Kein Medizinprodukt, keine medizinische Bewertung</li>
            </ul>
            <button className="btn-ghost mt-4 w-full" onClick={() => setAbout(true)}>
              📖 Über diese App & Gebrauchsanweisung
            </button>
            <button className="btn-primary mt-4 w-full" onClick={() => setStep(1)}>
              Einrichten
            </button>
            <button className="btn-secondary mt-2 w-full" onClick={() => setJoining(true)}>
              🔑 Ich habe einen Einladungscode
            </button>
            <button className="btn-secondary mt-2 w-full" onClick={() => finish(true)}>
              Demo ansehen (Familie Huber)
            </button>
          </section>
        )}

        {step === 1 && (
          <section className="mt-6">
            <h1 id="ob-title" className="text-2xl font-bold">
              Wer sind Sie?
            </h1>
            <div className="mt-4 space-y-2" role="radiogroup" aria-label="Rolle">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  role="radio"
                  aria-checked={role === r.id}
                  onClick={() => setRole(r.id)}
                  className={`w-full rounded-2xl border-2 p-4 text-left ${role === r.id ? 'border-sage-600 bg-sage-50' : 'border-cream-300 bg-white'}`}
                >
                  <span className="block font-bold">{r.label}</span>
                  <span className="block text-base text-ink-soft">{r.text}</span>
                </button>
              ))}
            </div>
            <Nav onBack={() => setStep(0)} onNext={() => setStep(2)} />
          </section>
        )}

        {step === 2 && (
          <section className="mt-6">
            <h1 id="ob-title" className="text-2xl font-bold">
              Welchen Pflegegrad hat die gepflegte Person?
            </h1>
            <p className="mt-2 text-base text-ink-soft">Der Pflegegrad steht im Bescheid der Pflegekasse (1 = geringe, 5 = schwerste Beeinträchtigung).</p>
            <div className="mt-4 grid grid-cols-5 gap-2" role="radiogroup" aria-label="Pflegegrad">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  role="radio"
                  aria-checked={level === n}
                  aria-label={`Pflegegrad ${n}`}
                  onClick={() => setLevel(n)}
                  className={`btn border-2 px-0 text-xl ${level === n ? 'border-sage-600 bg-sage-600 text-white' : 'border-cream-300 bg-white'}`}
                >
                  {n}
                </button>
              ))}
            </div>
            <Nav onBack={() => setStep(1)} onNext={() => setStep(3)} />
          </section>
        )}

        {step === 3 && (
          <section className="mt-6">
            <h1 id="ob-title" className="text-2xl font-bold">
              Ihre Einwilligungen
            </h1>
            <p className="mt-2 text-base text-ink-soft">Drei getrennte Fragen. Sie können jede später in den Einstellungen widerrufen.</p>
            <div className="mt-4 space-y-3">
              <ConsentCheck
                checked={app}
                onChange={setApp}
                title="(a) Nutzung der App – erforderlich"
                text="Ich willige ein, dass meine Angaben zur Pflege in der App gespeichert und verarbeitet werden, um die Pflege zu organisieren."
              />
              <ConsentCheck
                checked={others}
                onChange={setOthers}
                title="(b) Weitere Personen einbeziehen – freiwillig"
                text="Familienmitglieder und ein Pflegedienst dürfen gemeinsame Bereiche (Medikamentenplan, Dienstplan, Tagebuch) sehen."
              >
                {others && (
                  <div className="mt-3 space-y-2">
                    <p className="rounded-lg bg-amber-50 p-2 text-base text-amber-950">Die gepflegte Person (oder ihre Bevollmächtigte) muss damit einverstanden sein.</p>
                    <ConsentCheck small checked={patient} onChange={setPatient} title="Die gepflegte Person ist einverstanden bzw. eine Vollmacht liegt vor." />
                    <ConsentCheck small checked={share} onChange={setShare} title="Meine Belastungs-Ampel (nur die Farbe) darf der Pflegedienst sehen." />
                  </div>
                )}
              </ConsentCheck>
              <ConsentCheck
                checked={research}
                onChange={setResearch}
                title="(c) Forschung & Weiterentwicklung – freiwillig"
                text="Anonymisierte Nutzungsdaten und Fragebogenwerte dürfen zur Verbesserung der App und für Studien verwendet werden."
              />
            </div>
            <Nav onBack={() => setStep(2)} onNext={() => finish(false)} nextLabel="Fertig – los geht’s" disabled={!canFinish} />
            {!app && <p className="mt-2 text-center text-base text-ink-soft">Ohne Einwilligung (a) kann die App nicht genutzt werden.</p>}
          </section>
        )}
      </div>

      <Sheet open={about} onClose={() => setAbout(false)} title="Über diese App">
        <AboutContent />
      </Sheet>
    </div>
  )
}

function Join({ onCancel }: { onCancel: () => void }) {
  const { state, update, notifyFamily } = useStore()
  const [step, setStep] = useState(0)
  const [code, setCode] = useState(codeFromLink)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [relation, setRelation] = useState('')
  const [phone, setPhone] = useState('')
  const [app, setApp] = useState(false)
  const [research, setResearch] = useState(false)

  // Bereits eingerichtete Familie auf diesem Gerät (Vorführung aus „Familie“) oder die Demo-Familie
  const [family] = useState(() => (state.consents.involveOthers ? state : createDemoState()))
  const invite = findInvite(family, code)
  const roleLabel = INVITE_ROLES.find((r) => r.role === invite?.role)?.label
  const inviter = family.people.find((p) => p.id === invite?.createdBy)
  const careService = invite?.role === 'pflegedienst'

  const check = () => {
    const i = findInvite(family, code)
    const status = i && inviteStatus(i)
    if (!i) return setError('Diesen Code kennen wir nicht. Bitte prüfen Sie die Schreibweise.')
    if (status === 'angenommen') return setError('Dieser Code wurde schon benutzt. Bitten Sie um einen neuen.')
    if (status === 'abgelaufen') return setError('Dieser Code ist abgelaufen. Bitten Sie um einen neuen.')
    setError('')
    setStep(1)
  }

  const finish = () => {
    let joined = ''
    update((d) => {
      Object.assign(d, structuredClone(family))
      const p = joinFamily(d, code, { name, relation, phone })
      if (!p) return
      joined = p.name
      d.onboarded = true
      d.consents = { ...d.consents, app: true, research, updatedAt: new Date().toISOString() }
    })
    go('/heute')
    setTimeout(() => {
      if (joined) notifyFamily(`${joined} ist der Familie beigetreten.`)
      startTour()
    }, 200)
  }

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-cream-100" role="dialog" aria-modal aria-labelledby="join-title">
      <div className="mx-auto max-w-[480px] px-4 pb-10 pt-[max(1.5rem,env(safe-area-inset-top))]">
        <p className="text-sm font-semibold text-sage-700">Beitreten · Schritt {step + 1} von 3</p>
        <div className="mt-2 h-2 rounded-full bg-cream-200" aria-hidden>
          <div className="h-2 rounded-full bg-sage-500 transition-all" style={{ width: `${((step + 1) / 3) * 100}%` }} />
        </div>

        {step === 0 && (
          <section className="mt-6">
            <h1 id="join-title" className="text-2xl font-bold">
              Einladungscode eingeben
            </h1>
            <p className="mt-2 text-base text-ink-soft">Den Code hat Ihnen jemand aus der Familie geschickt, z. B. per WhatsApp oder SMS.</p>
            <label className="mt-4 block">
              <span className="sr-only">Einladungscode</span>
              <input
                className="input py-4 text-center font-mono text-2xl font-bold uppercase tracking-widest"
                value={code}
                onChange={(e) => (setCode(e.target.value), setError(''))}
                onKeyDown={(e) => e.key === 'Enter' && code.trim() && check()}
                placeholder="HUBER-XXXX"
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
                aria-invalid={!!error}
                aria-describedby={error ? 'join-error' : undefined}
              />
            </label>
            {error && (
              <p id="join-error" className="mt-2 rounded-lg bg-red-50 p-2 text-base text-red-800" role="alert">
                {error}
              </p>
            )}
            <div className="mt-3">
              <DemoBadge text={`Demo: Code ${DEMO_CODE} ausprobieren`} />
            </div>
            <Nav onBack={onCancel} onNext={check} nextLabel="Code prüfen" disabled={!code.trim()} />
          </section>
        )}

        {step === 1 && invite && (
          <section className="mt-6">
            <div className="rounded-2xl border-2 border-sage-500 bg-sage-50 p-4">
              <p className="font-bold">✓ Familie {familyName(family)} gefunden</p>
              <p className="mt-1 text-base">
                Eingeladen von {inviter?.name ?? 'der Familie'} als <strong>{roleLabel}</strong>.
              </p>
            </div>
            <h1 id="join-title" className="mt-6 text-2xl font-bold">
              Wer sind Sie?
            </h1>
            <div className="mt-4 space-y-3">
              <Field label="Ihr Vorname" value={name} onChange={setName} placeholder={careService ? 'z. B. Herr Yilmaz' : 'z. B. Jonas'} autoComplete="given-name" />
              <Field
                label={careService ? 'Pflegedienst' : `Beziehung zu ${family.people.find((p) => p.role === 'gepflegt')?.name ?? 'der gepflegten Person'}`}
                value={relation}
                onChange={setRelation}
                placeholder={careService ? 'z. B. Pflegedienst Sonnenhof' : 'z. B. Enkel, Nachbarin'}
              />
              <Field label="Telefon (für die Familie)" value={phone} onChange={setPhone} placeholder="z. B. 0170 1234567" type="tel" autoComplete="tel" />
            </div>
            <Nav onBack={() => setStep(0)} onNext={() => setStep(2)} disabled={!name.trim()} />
          </section>
        )}

        {step === 2 && (
          <section className="mt-6">
            <h1 id="join-title" className="text-2xl font-bold">
              Ihre Einwilligungen
            </h1>
            <div className="mt-4 space-y-3">
              <ConsentCheck
                checked={app}
                onChange={setApp}
                title="(a) Nutzung der App – erforderlich"
                text="Ich willige ein, dass meine Angaben zur Pflege in der App gespeichert und verarbeitet werden, um die Pflege zu organisieren."
              />
              <div className="rounded-2xl border-2 border-cream-300 bg-cream-50 p-4 text-base">
                <p className="font-bold">(b) Weitere Personen einbeziehen – von der Familie erteilt</p>
                <p className="mt-1 text-ink-soft">
                  Die gepflegte Person bzw. ihre Bevollmächtigte hat zugestimmt. {careService ? 'Sie sehen nur, was die Familie für den Pflegedienst freigegeben hat.' : 'Sie sehen die gemeinsamen Bereiche der Familie.'}
                </p>
              </div>
              <ConsentCheck
                checked={research}
                onChange={setResearch}
                title="(c) Forschung & Weiterentwicklung – freiwillig"
                text="Anonymisierte Nutzungsdaten und Fragebogenwerte dürfen zur Verbesserung der App und für Studien verwendet werden."
              />
            </div>
            <Nav onBack={() => setStep(1)} onNext={finish} nextLabel="Familie beitreten" disabled={!app} />
            {!app && <p className="mt-2 text-center text-base text-ink-soft">Ohne Einwilligung (a) kann die App nicht genutzt werden.</p>}
          </section>
        )}
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  autoComplete,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  autoComplete?: string
}) {
  return (
    <label className="block">
      <span className="mb-1 block font-semibold">{label}</span>
      <input
        className="input"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
      />
    </label>
  )
}

function Nav({ onBack, onNext, nextLabel = 'Weiter', disabled }: { onBack: () => void; onNext: () => void; nextLabel?: string; disabled?: boolean }) {
  return (
    <div className="mt-6 flex gap-2">
      <button className="btn-ghost flex-1" onClick={onBack}>
        Zurück
      </button>
      <button className="btn-primary flex-[2]" onClick={onNext} disabled={disabled}>
        {nextLabel}
      </button>
    </div>
  )
}
