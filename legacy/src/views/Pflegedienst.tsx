import { useState } from 'react'
import { useStore, mainCarer } from '../store'
import { DIARY_KINDS } from '../content'
import { stressLevel } from '../instrument'
import { addDays, formatDate, formatDateTime, today, uid } from '../utils'
import { Avatar, InfoNote, MedDisclaimer, Sheet } from '../components/ui'
import { Ampel, LEVEL } from './Ich'

// Ansicht für die Pflegefachkraft des Partner-Pflegedienstes.
// Steht für die „ergänzende Unterstützungsleistung“ (bis 30 €/Monat) neben der DiPA.
// Sieht nur, wofür die Familie eingewilligt hat.

export default function Pflegedienst() {
  const { state, me, person, update, notifyFamily, toast } = useStore()
  const [note, setNote] = useState('')
  const [video, setVideo] = useState(false)
  const allowed = state.consents.involveOthers && state.consents.patientAgreed
  const carer = mainCarer(state)
  const carerChecks = carer ? state.stress[carer.id]?.checks ?? [] : []
  const lastCheck = carerChecks[carerChecks.length - 1]
  const showAmpel = allowed && state.consents.shareStressWithCareService && lastCheck
  const from = addDays(today(), -13)
  const diary = state.diary.filter((e) => e.at.slice(0, 10) >= from).sort((a, b) => b.at.localeCompare(a.at))

  const switchBack = () =>
    update((d) => {
      d.activePerson = 'christina'
    })

  const sendNote = () => {
    notifyFamily(`${me.name} (${me.relation}): ${note.trim()}`)
    setNote('')
  }

  const slots = [addDays(today(), 1) + ' 10:00', addDays(today(), 2) + ' 14:30', addDays(today(), 4) + ' 09:00']
  const requestVideo = (slot: string) => {
    const [date, time] = slot.split(' ')
    update((d) => {
      d.appointments.push({ id: uid(), title: 'Video-Beratung mit Pflegedienst Sonnenhof', date, time, place: 'Videoanruf (Link folgt per Nachricht)', companion: 'christina' })
    })
    notifyFamily(`${me.name} schlägt eine Video-Beratung am ${formatDate(date)} um ${time} Uhr vor.`)
    setVideo(false)
    toast('Termin angefragt (simuliert).')
  }

  return (
    <div>
      <header className="pt-2">
        <p className="chip bg-violet-100 text-sm text-violet-900">Partner-Pflegedienst</p>
        <h1 className="mt-2 text-[1.75rem] font-bold leading-tight">Guten Tag, {me.name}</h1>
        <p className="mt-1 text-ink-soft">{me.relation} · Familie Huber</p>
      </header>

      {!allowed ? (
        <div className="mt-5">
          <InfoNote tone="warn">
            Die Familie hat (noch) nicht eingewilligt, dass ein Pflegedienst Daten sehen darf. Sie sehen deshalb keine Inhalte.
          </InfoNote>
        </div>
      ) : (
        <>
          <section className="card mt-5">
            <h2 className="text-xl font-bold">Belastung der Hauptpflegeperson</h2>
            {showAmpel && carer ? (
              <div className="mt-2 flex items-center gap-3">
                <Ampel level={stressLevel(lastCheck.answers)} small />
                <p className="text-base">
                  <strong>{carer.name}</strong>: {LEVEL[stressLevel(lastCheck.answers)].label.split(' – ')[0]} (Stand {formatDate(lastCheck.date)}). Nur die Farbe ist freigegeben, keine Einzelantworten.
                </p>
              </div>
            ) : (
              <p className="mt-1 text-base text-ink-soft">Nicht freigegeben. Die Hauptpflegeperson entscheidet selbst, ob Sie ihre Ampel sehen.</p>
            )}
          </section>

          <section className="mt-5">
            <h2 className="h-section mt-0">Medikationsplan (nur lesen)</h2>
            <div className="card">
              <ul className="divide-y divide-cream-300">
                {state.medications.map((m) => (
                  <li key={m.id} className="py-2">
                    <p className="font-semibold">
                      {m.name} {m.strength}
                    </p>
                    <p className="text-base text-ink-soft">
                      {m.times.join(', ')} Uhr{m.note ? ` · ${m.note}` : ''}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-3">
              <MedDisclaimer />
            </div>
          </section>

          <section>
            <h2 className="h-section">Pflegetagebuch – letzte 14 Tage</h2>
            {diary.length === 0 ? (
              <p className="text-ink-soft">Keine Einträge.</p>
            ) : (
              <ul className="space-y-2">
                {diary.map((e) => (
                  <li key={e.id} className="card flex gap-3">
                    <span className="text-2xl" aria-hidden>
                      {DIARY_KINDS[e.kind].icon}
                    </span>
                    <div>
                      <p className="font-semibold">{DIARY_KINDS[e.kind].label}</p>
                      {e.text && <p className="text-base">{e.text}</p>}
                      <p className="text-sm text-ink-soft">
                        {formatDateTime(e.at)} · {person(e.by)?.name}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="h-section">Notiz an die Familie</h2>
            <label className="label" htmlFor="pdnote">
              Ihre Nachricht
            </label>
            <textarea id="pdnote" className="input min-h-[96px] py-3" value={note} onChange={(e) => setNote(e.target.value)} placeholder="z. B. Bitte neue Inkontinenzmaterialien bestellen." />
            <button className="btn-primary mt-2 w-full" onClick={sendNote} disabled={!note.trim()}>
              Senden (simuliert)
            </button>
          </section>

          <section className="card mt-6">
            <h2 className="text-xl font-bold">📹 Video-Beratung</h2>
            <p className="mt-1 text-base text-ink-soft">Beratung und Anleitung der Angehörigen per Video – ergänzende Unterstützung, abrechenbar bis 30 € im Monat.</p>
            <button className="btn-secondary mt-3 w-full" onClick={() => setVideo(true)}>
              Termin vorschlagen
            </button>
          </section>
        </>
      )}

      <button className="btn-ghost mt-8 w-full" onClick={switchBack}>
        <Avatar person={person('christina')} size="sm" /> Zur Familien-Ansicht wechseln (Demo)
      </button>

      <Sheet open={video} onClose={() => setVideo(false)} title="Video-Beratung">
        <p className="mb-3 text-base">Welcher Termin passt? Die Familie bekommt den Vorschlag als Hinweis.</p>
        <div className="space-y-2">
          {slots.map((s) => (
            <button key={s} className="btn-secondary w-full" onClick={() => requestVideo(s)}>
              {formatDate(s.split(' ')[0])}, {s.split(' ')[1]} Uhr
            </button>
          ))}
        </div>
      </Sheet>
    </div>
  )
}
