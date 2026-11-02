import type { AppState } from './types'
import { INSTRUMENT, pointLabel, stressScore } from './instrument'
import { DIARY_KINDS } from './content'

// Export im FHIR-R4-Stil (HL7 FHIR Release 4) als JSON-Bundle.
// Prototyp: Struktur orientiert sich an den Ressourcen MedicationStatement,
// Observation und QuestionnaireResponse. Für eine echte DiPA-Schnittstelle
// müssten Profile (z. B. der gematik / MIO) und Codesysteme ergänzt werden.

type Resource = Record<string, unknown> & { resourceType: string; id: string }

const PATIENT_ID = 'patient-1'
const base = 'urn:familienpflege'

function patient(s: AppState): Resource {
  const [given, ...family] = s.emergency.patientName.split(' ')
  const [d, m, y] = s.emergency.birthDate.split('.')
  return {
    resourceType: 'Patient',
    id: PATIENT_ID,
    name: [{ given: [given], family: family.join(' ') }],
    birthDate: y && m && d ? `${y}-${m}-${d}` : undefined,
  }
}

export function medicationStatements(s: AppState): Resource[] {
  return s.medications.map((m) => ({
    resourceType: 'MedicationStatement',
    id: `med-${m.id}`,
    status: 'active',
    medicationCodeableConcept: { text: `${m.name} ${m.strength}` },
    subject: { reference: `Patient/${PATIENT_ID}` },
    informationSource: { display: 'Angehörige (FamilienPflege)' },
    dosage: [
      {
        text: `${m.perDose} Stück um ${m.times.join(', ')} Uhr${m.note ? ` – ${m.note}` : ''}`,
        timing: { repeat: { frequency: 1, period: 1, periodUnit: 'd', timeOfDay: m.times.map((t) => `${t}:00`) } },
        doseAndRate: [{ doseQuantity: { value: m.perDose, unit: 'Stück' } }],
      },
    ],
    note: [{ text: 'Übernommen aus dem ärztlichen Medikationsplan. Keine Bewertung durch die App.' }],
  }))
}

export function diaryObservations(s: AppState): Resource[] {
  return s.diary.map((e) => ({
    resourceType: 'Observation',
    id: `diary-${e.id}`,
    status: 'final',
    category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'survey' }], text: 'Pflegetagebuch' }],
    code: { text: DIARY_KINDS[e.kind].label },
    subject: { reference: `Patient/${PATIENT_ID}` },
    effectiveDateTime: new Date(e.at).toISOString(),
    performer: [{ display: s.people.find((p) => p.id === e.by)?.relation ?? 'Angehörige' }],
    valueString: e.text || DIARY_KINDS[e.kind].label,
  }))
}

// Fragebögen der aktiven Person (der Belastungs-Check ist privat)
export function questionnaireResponses(s: AppState, person = s.activePerson, author = 'Hauptpflegeperson'): Resource[] {
  const checks = s.stress[person]?.checks ?? []
  return checks.map((c) => ({
    resourceType: 'QuestionnaireResponse',
    id: `qr-${person}-${c.point}`,
    questionnaire: `${base}:questionnaire:${c.instrument.replace('@', '|')}`,
    status: 'completed',
    authored: `${c.date}T12:00:00Z`,
    author: { display: author },
    extension: [{ url: `${base}:measure-point`, valueString: pointLabel(c.point) }],
    item: [
      ...INSTRUMENT.items.map((text, i) => ({ linkId: `item${i + 1}`, text, answer: [{ valueInteger: c.answers[i] }] })),
      { linkId: 'score', text: 'Belastung in Prozent (0–100)', answer: [{ valueInteger: stressScore(c.answers) }] },
    ],
  }))
}

export function fhirBundle(s: AppState, parts: { meds?: boolean; diary?: boolean; questionnaires?: boolean } = { meds: true, diary: true, questionnaires: true }) {
  const resources: Resource[] = [patient(s)]
  if (parts.meds) resources.push(...medicationStatements(s))
  if (parts.diary) resources.push(...diaryObservations(s))
  if (parts.questionnaires) resources.push(...questionnaireResponses(s))
  return {
    resourceType: 'Bundle',
    type: 'collection',
    timestamp: new Date().toISOString(),
    meta: { tag: [{ system: base, code: 'prototyp', display: 'FamilienPflege Prototyp – Testdaten' }] },
    entry: resources.map((r) => ({ fullUrl: `${base}:${r.resourceType}/${r.id}`, resource: r })),
  }
}
