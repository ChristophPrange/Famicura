import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import type { EmergencyInfo } from '../types'
import { useStore } from '../store'
import { go } from '../router'
import { InfoNote, PageHeader, Sheet, Toggle } from '../components/ui'

// Inhalt der Notfallseite. Wird komplett in den QR-Code gepackt, damit die
// Seite auch ohne Server auf einem fremden Handy angezeigt werden kann.
interface Payload {
  e: EmergencyInfo
  m: { n: string; s: string; t: string[]; h: string }[]
}

const encode = (p: Payload) => {
  const bytes = new TextEncoder().encode(JSON.stringify(p))
  let bin = ''
  bytes.forEach((b) => (bin += String.fromCharCode(b)))
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

const decode = (s: string): Payload | null => {
  try {
    const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0))))
  } catch {
    return null
  }
}

function usePayload(): Payload {
  const { state } = useStore()
  return { e: state.emergency, m: state.medications.map((m) => ({ n: m.name, s: m.strength, t: m.times, h: m.note })) }
}

export default function Notfallmappe() {
  const { state } = useStore()
  const payload = usePayload()
  const [editing, setEditing] = useState(false)
  const e = state.emergency
  const url = `${window.location.origin}${window.location.pathname}#/notfallseite?d=${encode(payload)}`

  return (
    <div>
      <PageHeader title="Notfallmappe" subtitle="Alles Wichtige für Rettungsdienst und Klinik." onBack="/mehr" />

      <div className="card flex flex-col items-center text-center">
        <div className="rounded-xl bg-white p-3">
          <QRCodeSVG value={url} size={200} level="L" marginSize={0} fgColor="#25382b" title="QR-Code zur Notfallseite" />
        </div>
        <p className="mt-3 text-base text-ink-soft">
          Diesen Code ausdrucken und z. B. an den Kühlschrank hängen. Wer ihn scannt, sieht die Notfallseite.
        </p>
        <button className="btn-primary mt-3 w-full" onClick={() => go('/notfallseite')}>
          Notfallseite ansehen / drucken
        </button>
      </div>

      <Section title="Person">
        <Row k="Name" v={e.patientName} />
        <Row k="Geboren" v={e.birthDate} />
        <Row k="Adresse" v={e.address} />
        <Row k="Pflegegrad" v={e.careLevel} />
      </Section>
      <Section title="Diagnosen">
        <p>{e.diagnoses.join(', ') || '–'}</p>
      </Section>
      <Section title="Allergien">
        <p className={e.allergies.length ? 'font-semibold text-red-800' : ''}>{e.allergies.join(', ') || 'Keine bekannt'}</p>
      </Section>
      <Section title="Medikamente" note="Automatisch aus dem Medikamentenplan">
        <ul>
          {state.medications.map((m) => (
            <li key={m.id}>
              {m.name} {m.strength} · {m.times.join(', ')} Uhr
            </li>
          ))}
        </ul>
      </Section>
      <Section title="Hausärztin">
        <p>{e.doctor.name}</p>
        <p className="text-ink-soft">{e.doctor.address}</p>
        <a className="font-semibold text-sage-800 underline" href={`tel:${e.doctor.phone.replace(/\s/g, '')}`}>
          {e.doctor.phone}
        </a>
      </Section>
      <Section title="Kontakte im Notfall">
        {e.contacts.map((c) => (
          <p key={c.name}>
            {c.name} ({c.relation}):{' '}
            <a className="font-semibold text-sage-800 underline" href={`tel:${c.phone.replace(/\s/g, '')}`}>
              {c.phone}
            </a>
          </p>
        ))}
      </Section>
      <Section title="Vollmachten" note="Vorsorgevollmacht: jemand darf für Mama entscheiden, wenn sie es nicht mehr kann.">
        <Row k="Vorsorgevollmacht" v={e.powerOfAttorney ? `Ja – ${e.powerOfAttorneyHolder}` : 'Nein'} />
        <Row k="Patientenverfügung" v={e.livingWill ? 'Ja' : 'Nein'} />
      </Section>

      <button className="btn-secondary mt-4 w-full" onClick={() => setEditing(true)}>
        Angaben bearbeiten
      </button>
      {editing && <EditSheet onClose={() => setEditing(false)} />}
    </div>
  )
}

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="card mt-3">
      <h2 className="text-lg font-bold">{title}</h2>
      {note && <p className="mb-1 text-sm text-ink-soft">{note}</p>}
      <div className="text-base">{children}</div>
    </section>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <p>
      <span className="text-ink-soft">{k}:</span> {v}
    </p>
  )
}

function EditSheet({ onClose }: { onClose: () => void }) {
  const { state, update, toast } = useStore()
  const [e, setE] = useState<EmergencyInfo>(structuredClone(state.emergency))
  const list = (s: string) =>
    s
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean)

  const save = () => {
    update((d) => {
      d.emergency = e
    })
    toast('Notfallmappe gespeichert.')
    onClose()
  }

  return (
    <Sheet open onClose={onClose} title="Notfallmappe bearbeiten">
      <div className="space-y-4">
        <Field label="Name" value={e.patientName} onChange={(v) => setE({ ...e, patientName: v })} />
        <Field label="Geburtsdatum" value={e.birthDate} onChange={(v) => setE({ ...e, birthDate: v })} />
        <Field label="Adresse" value={e.address} onChange={(v) => setE({ ...e, address: v })} />
        <Field label="Pflegegrad" value={e.careLevel} onChange={(v) => setE({ ...e, careLevel: v })} />
        <Field label="Diagnosen (mit Komma trennen)" value={e.diagnoses.join(', ')} onChange={(v) => setE({ ...e, diagnoses: list(v) })} />
        <Field label="Allergien (mit Komma trennen)" value={e.allergies.join(', ')} onChange={(v) => setE({ ...e, allergies: list(v) })} />
        <Field label="Hausärztin" value={e.doctor.name} onChange={(v) => setE({ ...e, doctor: { ...e.doctor, name: v } })} />
        <Field label="Telefon Hausärztin" value={e.doctor.phone} onChange={(v) => setE({ ...e, doctor: { ...e.doctor, phone: v } })} />
        <div>
          <span className="label">Gibt es eine Vorsorgevollmacht?</span>
          <Toggle label="Vorsorgevollmacht" checked={e.powerOfAttorney} onChange={(v) => setE({ ...e, powerOfAttorney: v })} />
        </div>
        {e.powerOfAttorney && <Field label="Wer hat die Vollmacht?" value={e.powerOfAttorneyHolder} onChange={(v) => setE({ ...e, powerOfAttorneyHolder: v })} />}
        <div>
          <span className="label">Gibt es eine Patientenverfügung?</span>
          <Toggle label="Patientenverfügung" checked={e.livingWill} onChange={(v) => setE({ ...e, livingWill: v })} />
        </div>
        <InfoNote>Die Medikamente kommen automatisch aus dem Medikamentenplan.</InfoNote>
        <button className="btn-primary w-full" onClick={save}>
          Speichern
        </button>
      </div>
    </Sheet>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const id = label.replace(/\W/g, '')
  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <input id={id} className="input" value={value} onChange={(ev) => onChange(ev.target.value)} />
    </div>
  )
}

// Druckbare Notfallseite (auch Ziel des QR-Codes)
export function Notfallseite() {
  const own = usePayload()
  const param = new URLSearchParams(window.location.hash.split('?')[1] ?? '').get('d')
  const fromQr = param ? decode(param) : null
  const { e, m } = fromQr ?? own

  return (
    <div className="pt-2">
      <div className="no-print mb-4 flex gap-2">
        {!fromQr && (
          <button className="btn-ghost flex-1" onClick={() => go('/mehr/notfallmappe')}>
            ← Zurück
          </button>
        )}
        <button className="btn-primary flex-1" onClick={() => window.print()}>
          🖨️ Drucken
        </button>
      </div>
      <article className="rounded-2xl border-4 border-red-700 bg-white p-5">
        <p className="text-sm font-bold uppercase tracking-wide text-red-700">Notfallinformation</p>
        <h1 className="text-3xl font-bold">{e.patientName}</h1>
        <p>
          geb. {e.birthDate} · {e.careLevel}
        </p>
        <p className="text-ink-soft">{e.address}</p>

        <div className="mt-4 rounded-xl bg-red-50 p-3">
          <p className="font-bold text-red-800">Allergien</p>
          <p className="text-lg font-semibold">{e.allergies.join(', ') || 'Keine bekannt'}</p>
        </div>

        <h2 className="mt-4 font-bold">Diagnosen</h2>
        <p>{e.diagnoses.join(', ')}</p>

        <h2 className="mt-4 font-bold">Medikamente</h2>
        <table className="w-full text-left text-base">
          <tbody>
            {m.map((x) => (
              <tr key={x.n} className="border-t border-cream-300">
                <td className="py-1.5 pr-2 font-semibold">
                  {x.n} {x.s}
                </td>
                <td className="py-1.5">{x.t.join(', ')} Uhr</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 className="mt-4 font-bold">Hausärztin</h2>
        <p>
          {e.doctor.name} · <a href={`tel:${e.doctor.phone.replace(/\s/g, '')}`}>{e.doctor.phone}</a>
        </p>

        <h2 className="mt-4 font-bold">Angehörige</h2>
        {e.contacts.map((c) => (
          <p key={c.name}>
            {c.name} ({c.relation}) · <a href={`tel:${c.phone.replace(/\s/g, '')}`}>{c.phone}</a>
          </p>
        ))}

        <h2 className="mt-4 font-bold">Vollmachten</h2>
        <p>Vorsorgevollmacht: {e.powerOfAttorney ? `ja (${e.powerOfAttorneyHolder})` : 'nein'}</p>
        <p>Patientenverfügung: {e.livingWill ? 'ja' : 'nein'}</p>

        <p className="mt-5 text-sm text-ink-soft">Stand: {new Date().toLocaleDateString('de-DE')} · Angaben der Familie, ohne Gewähr.</p>
      </article>
    </div>
  )
}
