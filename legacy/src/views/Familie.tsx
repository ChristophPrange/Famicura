import { useState } from 'react'
import type { Invite, Role } from '../types'
import { useStore, mainCarer } from '../store'
import { go } from '../router'
import { Avatar, DemoBadge, PageHeader, Sheet } from '../components/ui'
import { createInvite, familyName, INVITE_ROLES, inviteMessage, inviteStatus } from '../invites'
import { formatDate } from '../utils'

// Wochentage in deutscher Reihenfolge (Mo zuerst), Werte wie Date.getDay()
const DAYS: [number, string][] = [
  [1, 'Mo'],
  [2, 'Di'],
  [3, 'Mi'],
  [4, 'Do'],
  [5, 'Fr'],
  [6, 'Sa'],
  [0, 'So'],
]

export default function Familie() {
  const { state, update, me } = useStore()
  const [inviting, setInviting] = useState(false)
  const c = state.consents
  const careService = state.people.filter((p) => p.role === 'pflegedienst')
  const family = state.people.filter((p) => p.role !== 'pflegedienst')
  const carer = mainCarer(state)
  const allowed = c.involveOthers && c.patientAgreed

  const toggleDay = (id: string, day: number) =>
    update((d) => {
      const p = d.people.find((x) => x.id === id)
      if (!p) return
      p.availability = p.availability.includes(day) ? p.availability.filter((x) => x !== day) : [...p.availability, day]
    })

  return (
    <div>
      <PageHeader title={`Familie ${familyName(state)}`} subtitle="Wer gehört dazu, wer kann wann?" onBack="/mehr" />
      <ul className="space-y-3">
        {family.map((p) => (
          <li key={p.id} className="card">
            <div className="flex items-center gap-4">
              <Avatar person={p} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="text-lg font-bold">
                  {p.name} {p.id === me.id && <span className="chip ml-1 bg-sage-100 text-base text-sage-800">Sie</span>}
                </p>
                <p className="text-base text-ink-soft">{p.relation}</p>
                <p className="text-base font-semibold text-sage-800">
                  {p.roleLabel}
                  {p.hoursPerWeek ? ` · ca. ${p.hoursPerWeek} Std./Woche` : ''}
                </p>
              </div>
              <a href={`tel:${p.phone.replace(/\s/g, '')}`} className="flex h-12 w-12 items-center justify-center rounded-full bg-sage-50 text-xl" aria-label={`${p.name} anrufen`}>
                📞
              </a>
            </div>
            {p.role !== 'gepflegt' && (
              <div className="mt-3">
                <p className="mb-1 text-sm font-semibold text-ink-soft">Kann helfen an:</p>
                <div className="grid grid-cols-7 gap-1" role="group" aria-label={`Verfügbarkeit von ${p.name}`}>
                  {DAYS.map(([d, l]) => {
                    const on = p.availability.includes(d)
                    return (
                      <button
                        key={d}
                        aria-pressed={on}
                        aria-label={`${l}: ${on ? 'verfügbar' : 'nicht verfügbar'}`}
                        onClick={() => toggleDay(p.id, d)}
                        className={`min-h-[44px] rounded-lg border-2 text-base font-semibold ${on ? 'border-sage-600 bg-sage-600 text-white' : 'border-cream-300 bg-white text-ink-soft'}`}
                      >
                        {l}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      <h2 className="h-section">Pflegedienst</h2>
      {careService.map((p) => (
        <section key={p.id} className="card">
          <div className="flex items-center gap-4">
            <Avatar person={p} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold">{p.name}</p>
              <p className="text-base text-ink-soft">{p.relation}</p>
              <p className="text-base font-semibold text-violet-800">{p.roleLabel}</p>
            </div>
            <a href={`tel:${p.phone.replace(/\s/g, '')}`} className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-50 text-xl" aria-label={`${p.name} anrufen`}>
              📞
            </a>
          </div>
          <div className="mt-3 rounded-xl bg-cream-100 p-3 text-base">
            <p className="font-semibold">Was der Pflegedienst sehen darf:</p>
            {allowed ? (
              <ul className="mt-1 space-y-0.5">
                <li>✓ Medikationsplan (nur lesen)</li>
                <li>✓ Pflegetagebuch der letzten 14 Tage</li>
                <li>{c.shareStressWithCareService ? '✓' : '✗'} Belastungs-Ampel von {carer?.name} (nur Farbe)</li>
                <li>✗ Dienstplan, Notfallmappe, Ihre Einzelantworten</li>
              </ul>
            ) : (
              <p className="mt-1 text-red-800">Nichts – die Einwilligung (b) bzw. die Zustimmung der gepflegten Person fehlt.</p>
            )}
            <button className="mt-2 min-h-[44px] font-semibold text-sage-800 underline" onClick={() => go('/mehr/einstellungen')}>
              Freigaben ändern
            </button>
          </div>
        </section>
      ))}

      <button className="btn-secondary mt-4 w-full" onClick={() => setInviting(true)}>
        + Weitere Person einladen
      </button>
      <InviteList />
      <InviteSheet open={inviting} onClose={() => setInviting(false)} />
    </div>
  )
}

const STATUS_STYLE = { offen: 'bg-sage-100 text-sage-800', angenommen: 'bg-cream-200 text-ink-soft', abgelaufen: 'bg-red-50 text-red-800' }

function InviteList() {
  const { state, update, person, toast } = useStore()
  if (!state.invites.length) return null
  const withdraw = (code: string) => {
    update((d) => void (d.invites = d.invites.filter((i) => i.code !== code)))
    toast(`Einladung ${code} widerrufen. Der Code funktioniert nicht mehr.`)
  }
  return (
    <>
      <h2 className="h-section">Einladungen</h2>
      <ul className="space-y-2">
        {state.invites.map((i) => {
          const status = inviteStatus(i)
          const used = person(i.usedBy)
          return (
            <li key={i.code} className="card">
              <div className="flex items-center justify-between gap-2">
                <p className="font-mono text-lg font-bold tracking-wider">{i.code}</p>
                <span className={`chip text-sm ${STATUS_STYLE[status]}`}>{status}</span>
              </div>
              <p className="mt-1 text-base text-ink-soft">
                {roleLabel(i.role)} · {i.reusable ? 'Demo-Code, mehrfach nutzbar' : status === 'angenommen' ? `beigetreten: ${used?.name ?? 'unbekannt'}` : `gültig bis ${formatDate(i.expires)}`}
              </p>
              {status !== 'angenommen' && !i.reusable && (
                <button className="mt-1 min-h-[44px] font-semibold text-red-800 underline" onClick={() => withdraw(i.code)}>
                  Widerrufen
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </>
  )
}

const roleLabel = (r: Role) => INVITE_ROLES.find((x) => x.role === r)?.label ?? r

function InviteSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, update, toast } = useStore()
  const [role, setRole] = useState<Role>('unterstuetzung')
  const [invite, setInvite] = useState<Invite | null>(null)
  const allowed = state.consents.involveOthers && state.consents.patientAgreed

  const close = () => {
    setInvite(null)
    onClose()
  }
  const create = () => {
    const i = createInvite(state, role)
    update((d) => void d.invites.unshift(i))
    setInvite(i)
  }
  // Zeigt den Beitritt so, wie ihn die eingeladene Person auf ihrem Handy erlebt
  const demoJoin = () => {
    go(`/beitreten?code=${invite!.code}`)
    update((d) => void (d.onboarded = false))
  }
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(invite!.code)
      toast('Code kopiert.')
    } catch {
      toast('Kopieren nicht möglich – bitte den Code abschreiben.')
    }
  }
  const share = async () => {
    const text = inviteMessage(state, invite!)
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Einladung zu FamilienPflege', text })
      } catch {
        // abgebrochen
      }
    } else {
      try {
        await navigator.clipboard.writeText(text)
        toast('Nachricht kopiert – jetzt z. B. in WhatsApp einfügen.')
      } catch {
        toast('Teilen nicht möglich – bitte den Code abschreiben.')
      }
    }
  }

  return (
    <Sheet open={open} onClose={close} title="Person einladen">
      {!allowed ? (
        <div className="space-y-3">
          <p className="rounded-xl bg-amber-50 p-3 text-base text-amber-950">
            Um weitere Personen einzuladen, braucht es die Einwilligung (b) und die Zustimmung der gepflegten Person bzw. eine Vollmacht.
          </p>
          <button className="btn-primary w-full" onClick={() => (close(), go('/mehr/einstellungen'))}>
            Zu den Einwilligungen
          </button>
        </div>
      ) : !invite ? (
        <div>
          <p className="text-base text-ink-soft">Wie hilft die Person mit? Danach bekommen Sie einen Code, den Sie ihr schicken.</p>
          <div className="mt-3 space-y-2" role="radiogroup" aria-label="Rolle der eingeladenen Person">
            {INVITE_ROLES.map((r) => (
              <button
                key={r.role}
                role="radio"
                aria-checked={role === r.role}
                onClick={() => setRole(r.role)}
                className={`w-full rounded-2xl border-2 p-4 text-left ${role === r.role ? 'border-sage-600 bg-sage-50' : 'border-cream-300 bg-white'}`}
              >
                <span className="block font-bold">{r.label}</span>
                <span className="block text-base text-ink-soft">{r.text}</span>
              </button>
            ))}
          </div>
          <button className="btn-primary mt-4 w-full" onClick={create}>
            Code erstellen
          </button>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-base text-ink-soft">Einladungscode für „{roleLabel(invite.role)}“</p>
          <p className="my-3 rounded-2xl border-2 border-dashed border-sage-400 bg-white py-5 font-mono text-3xl font-bold tracking-widest" aria-live="polite">
            {invite.code}
          </p>
          <p className="text-base text-ink-soft">Gültig bis {formatDate(invite.expires)} · nur einmal nutzbar</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button className="btn-secondary" onClick={copy}>
              📋 Kopieren
            </button>
            <button className="btn-primary" onClick={share}>
              ✉️ Teilen
            </button>
          </div>
          <p className="mt-4 text-left text-base text-ink-soft">
            Die Person öffnet die App und tippt auf <strong>„Ich habe einen Einladungscode“</strong>. Die Einwilligungen der Familie gelten dann auch für sie.
          </p>
          <div className="mt-3">
            <DemoBadge text="Demo – Beitritt nur auf diesem Gerät simuliert" />
          </div>
          <button className="btn-secondary mt-3 w-full" onClick={demoJoin}>
            🔑 Beitritt vorführen
          </button>
          <button className="btn-ghost mt-3 w-full" onClick={close}>
            Fertig
          </button>
        </div>
      )}
    </Sheet>
  )
}
