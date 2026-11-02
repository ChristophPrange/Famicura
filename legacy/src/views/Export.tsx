import { useStore } from '../store'
import { fhirBundle } from '../fhir'
import { go } from '../router'
import { today } from '../utils'
import { download, InfoNote, PageHeader } from '../components/ui'

// Datenexport: Drucken/PDF für Menschen, FHIR-R4-JSON für Praxis- und Pflegesoftware
export default function Export() {
  const { state, toast } = useStore()

  const save = (name: string, parts: Parameters<typeof fhirBundle>[1]) => {
    download(`familienpflege-${name}-${today()}.fhir.json`, JSON.stringify(fhirBundle(state, parts), null, 2))
    toast('Export gespeichert.')
  }

  const options = [
    { name: 'medikationsplan', title: 'Medikationsplan', text: 'FHIR „MedicationStatement“', parts: { meds: true } },
    { name: 'tagebuch', title: 'Pflegetagebuch', text: 'FHIR „Observation“', parts: { diary: true } },
    { name: 'fragebogen', title: 'Meine Belastungs-Checks', text: 'FHIR „QuestionnaireResponse“ (nur Ihre eigenen)', parts: { questionnaires: true } },
    { name: 'alles', title: 'Alles zusammen', text: 'Ein FHIR-Bundle mit allen drei Teilen', parts: { meds: true, diary: true, questionnaires: true } },
  ]

  return (
    <div>
      <PageHeader title="Daten exportieren" subtitle="Ihre Daten gehören Ihnen." onBack="/mehr" />
      <InfoNote>
        Zum <strong>Ausdrucken</strong>: Pflegetagebuch → „Zusammenfassung für die Hausärztin“ oder Notfallmappe → „Notfallseite drucken“. Für <strong>Praxis- oder Pflegesoftware</strong>: Export
        im Standardformat HL7 FHIR R4 (JSON).
      </InfoNote>
      <div className="mt-4 space-y-2">
        {options.map((o) => (
          <button key={o.name} className="card flex w-full items-center gap-3 text-left hover:border-sage-400" onClick={() => save(o.name, o.parts)}>
            <span className="text-2xl" aria-hidden>
              ⬇️
            </span>
            <span className="flex-1">
              <span className="block font-bold">{o.title}</span>
              <span className="block text-base text-ink-soft">{o.text}</span>
            </span>
          </button>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button className="btn-ghost text-base" onClick={() => go('/mehr/tagebuch')}>
          🖨️ Tagebuch drucken
        </button>
        <button className="btn-ghost text-base" onClick={() => go('/notfallseite')}>
          🖨️ Notfallseite
        </button>
      </div>
      <p className="mt-4 text-sm text-ink-soft">Prototyp: FHIR-Struktur vereinfacht, ohne offizielle Profile. Die Datei bleibt auf Ihrem Gerät, bis Sie sie selbst weitergeben.</p>
    </div>
  )
}
