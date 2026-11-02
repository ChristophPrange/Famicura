import { useEffect, type ReactNode } from 'react'
import type { Person } from '../types'
import { back } from '../router'
import { useStore } from '../store'

export function Avatar({ person, size = 'md' }: { person?: Person; size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'sm' ? 'h-8 w-8 text-sm' : size === 'lg' ? 'h-14 w-14 text-xl' : 'h-11 w-11 text-lg'
  if (!person)
    return (
      <span className={`${s} inline-flex shrink-0 items-center justify-center rounded-full border-2 border-dashed border-cream-300 text-ink-soft`} aria-hidden>
        ?
      </span>
    )
  return (
    <span className={`${s} ${person.color} inline-flex shrink-0 items-center justify-center rounded-full font-bold`} aria-hidden>
      {person.name[0]}
    </span>
  )
}

export function PageHeader({ title, subtitle, onBack, right }: { title: string; subtitle?: string; onBack?: boolean | string; right?: ReactNode }) {
  return (
    <header className="no-print mb-4 flex items-start gap-2 pt-2">
      {onBack && (
        <button
          className="-ml-2 flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl text-sage-800 hover:bg-sage-50"
          onClick={() => (typeof onBack === 'string' ? (window.location.hash = onBack) : back())}
          aria-label="Zurück"
        >
          ←
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="text-[1.75rem] font-bold leading-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-ink-soft">{subtitle}</p>}
      </div>
      {right}
    </header>
  )
}

export function EmptyState({ icon, title, text, action }: { icon: string; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center py-8 text-center">
      <div className="mb-2 text-4xl" aria-hidden>
        {icon}
      </div>
      <p className="text-lg font-semibold">{title}</p>
      {text && <p className="mt-1 text-ink-soft">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function InfoNote({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'warn' }) {
  const cls = tone === 'warn' ? 'bg-amber-50 border-amber-300 text-amber-950' : 'bg-sage-50 border-sage-200 text-sage-900'
  return <div className={`rounded-xl border-2 px-4 py-3 text-base ${cls}`}>{children}</div>
}

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return
    const on = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/40" onClick={onClose} role="dialog" aria-modal aria-label={title}>
      <div
        className="max-h-[90vh] w-full max-w-[480px] overflow-y-auto rounded-t-3xl bg-cream-50 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">{title}</h2>
          <button className="flex h-12 w-12 items-center justify-center rounded-full text-2xl hover:bg-cream-200" onClick={onClose} aria-label="Schließen">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Toasts() {
  const { toasts } = useStore()
  return (
    <div className="no-print pointer-events-none fixed inset-x-0 top-3 z-[60] flex flex-col items-center gap-2 px-4" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="w-full max-w-[440px] rounded-2xl bg-ink px-4 py-3 text-base text-white shadow-lg">
          {t.text}
        </div>
      ))}
    </div>
  )
}

export function MedDisclaimer() {
  return (
    <InfoNote tone="warn">
      <strong>Änderungen an der Medikation nur nach ärztlicher Rücksprache.</strong> Die App organisiert nur, was ärztlich verordnet ist. Sie prüft keine Wechselwirkungen und
      gibt keine Dosierungs-Empfehlungen.
    </InfoNote>
  )
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="flex gap-2" role="radiogroup" aria-label={label}>
      {[true, false].map((v) => (
        <button
          key={String(v)}
          role="radio"
          aria-checked={checked === v}
          className={`btn flex-1 border-2 ${checked === v ? 'border-sage-600 bg-sage-600 text-white' : 'border-cream-300 bg-white text-ink'}`}
          onClick={() => onChange(v)}
        >
          {v ? 'Ja' : 'Nein'}
        </button>
      ))}
    </div>
  )
}

export function ConsentCheck({
  checked,
  onChange,
  title,
  text,
  small,
  children,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  title: string
  text?: string
  small?: boolean
  children?: ReactNode
}) {
  return (
    <div className={small ? '' : `rounded-2xl border-2 p-4 ${checked ? 'border-sage-500 bg-sage-50' : 'border-cream-300 bg-white'}`}>
      <label className="flex min-h-[44px] cursor-pointer items-start gap-3">
        <input type="checkbox" className="mt-1 h-6 w-6 shrink-0 accent-sage-600" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span>
          <span className={`block ${small ? 'text-base' : 'font-bold'}`}>{title}</span>
          {text && <span className="mt-1 block text-base text-ink-soft">{text}</span>}
        </span>
      </label>
      {children}
    </div>
  )
}

// Kennzeichnung für Inhalte, die vor echtem Einsatz fachlich geprüft werden müssen.
// Sichtbar im Studien- oder Entwicklermodus.
export function ReviewBadge({ source }: { source?: string }) {
  const { state } = useStore()
  if (!state.settings.devMode && !state.study.enabled) return null
  return (
    <p className="rounded-lg border-2 border-dashed border-violet-300 bg-violet-50 px-3 py-1.5 text-sm text-violet-900">
      🔎 Fachlich zu prüfen · Quelle/geprüft von: {source || 'noch offen'}
    </p>
  )
}

export function DemoBadge({ text = 'Demo – keine echten Geräte' }: { text?: string }) {
  return <span className="chip bg-violet-100 text-sm text-violet-900">{text}</span>
}

// Datei im Browser zum Speichern anbieten (Export)
export function download(filename: string, content: string, type = 'application/json') {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
