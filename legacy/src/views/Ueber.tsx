import { PageHeader } from '../components/ui'

// Zweckbestimmung und Gebrauchsanweisung. Bewusst schlicht gehalten,
// damit der Text auch vor der ersten Nutzung (im Onboarding) gelesen werden kann.

const FACTS = [
  { icon: '🎯', title: 'Wofür ist die App?', text: 'FamilienPflege unterstützt pflegende Angehörige dabei, die Pflege zu Hause gemeinsam zu organisieren und sich zu entlasten. Ziel ist, die häusliche Pflege zu stabilisieren und die Belastung der Hauptpflegeperson messbar zu senken.' },
  { icon: '👨‍👩‍👧', title: 'Für wen?', text: 'Für Menschen mit einem Pflegegrad, die zu Hause gepflegt werden, und für ihre Angehörigen. Ein Pflegedienst kann eingebunden werden – nur wenn die gepflegte Person zustimmt.' },
  { icon: '🩺', title: 'Kein Medizinprodukt', text: 'Die App trifft keine medizinischen Bewertungen, prüft keine Wechselwirkungen und gibt keine Dosierungsempfehlungen. Sie organisiert nur, was Ärztinnen und Ärzte verordnet haben. Sie misst keine Vitalwerte und erkennt keine Stürze.' },
  { icon: '🚫', title: 'Werbefrei', text: 'Keine Werbung, keine Tracker, keine Weitergabe Ihrer Daten an Dritte – auch nicht an Pflegedienste ohne Ihre Einwilligung.' },
  { icon: '🇪🇺', title: 'Datenschutz', text: 'Daten werden ausschließlich in der EU verarbeitet. Im Prototyp bleiben alle Daten nur auf diesem Gerät. Ihre Einwilligungen können Sie jederzeit in den Einstellungen widerrufen und alle Daten löschen.' },
]

const MANUAL = [
  { icon: '🏠', title: 'Heute', text: 'Zeigt, was heute ansteht: offene Medikamente, Aufgaben, den nächsten Arzttermin. Rot markiert ist alles, wofür noch niemand eingeteilt ist.' },
  { icon: '💊', title: 'Medikamente', text: 'Der gemeinsame Plan. Tippen Sie auf eine Einnahme, wenn sie gegeben wurde – alle sehen, wer sie wann gegeben hat. Wird die Packung knapp, legen Sie mit „Rezept nachbestellen“ eine Aufgabe für eine Person an.' },
  { icon: '📅', title: 'Dienstplan', text: 'Aufgaben in Woche oder Monat. „Ich übernehme“ und „Zum Tausch anbieten“ verteilen die Arbeit. „Ich falle aus“ gibt Ihre Aufgaben für einen Zeitraum frei und schlägt Vertretungen vor.' },
  { icon: '💚', title: 'Ich (Belastungs-Check)', text: 'Zu festen Zeitpunkten (Start, Woche 4, Woche 8, dann monatlich) 28 kurze Aussagen nach der Häusliche-Pflege-Skala (Lizenz wird noch geklärt). Ergebnis als Ampel und Verlauf, bei Bedarf ein Entlastungsplan. Ihre Antworten sind privat.' },
  { icon: '🆘', title: 'Krise / Notfall', text: 'Führt mit Ja/Nein-Fragen durch schwierige Situationen. Bei Lebensgefahr immer sofort 112. Ersetzt keine ärztliche Einschätzung.' },
  { icon: '🎤', title: 'Sprachsteuerung', text: 'Der runde Mikrofon-Knopf unten rechts. Fragen Sie z. B. „Was steht heute an?“ oder „Wann gibt es die nächsten Tabletten?“. Sie können auch eintragen: Medikamente abhaken, Tagebuch, Termine, Aufgaben übernehmen. Gespeichert wird erst nach Ihrem „Ja“. Die Spracherkennung übernimmt der Browser (bei Chrome/Edge über Server von Google/Microsoft); die App speichert keine Aufnahmen. Statt zu sprechen können Sie auch tippen.' },
  { icon: '📔', title: 'Mehr', text: 'Pflegetagebuch, Notfallmappe mit QR-Code, Familie und Pflegedienst, Tagesablauf (Demo), Datenexport und Einstellungen (Schriftgröße, Kontrast, Einwilligungen).' },
]

export function AboutContent() {
  return (
    <div className="space-y-3">
      {FACTS.map((f) => (
        <section key={f.title} className="card flex gap-3">
          <span className="text-2xl" aria-hidden>
            {f.icon}
          </span>
          <div>
            <h3 className="font-bold">{f.title}</h3>
            <p className="text-base">{f.text}</p>
          </div>
        </section>
      ))}
      <h2 className="h-section">Gebrauchsanweisung</h2>
      <ol className="space-y-3">
        {MANUAL.map((m) => (
          <li key={m.title} className="card flex gap-3">
            <span className="text-2xl" aria-hidden>
              {m.icon}
            </span>
            <div>
              <h3 className="font-bold">{m.title}</h3>
              <p className="text-base">{m.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="pt-2 text-sm text-ink-soft">
        FamilienPflege · Prototyp, Version 0.2 · Studienprojekt Digital Entrepreneurship. Hersteller-Angaben, CE-/DiPA-Kennzeichnung und Support-Kontakt folgen in der echten Version.
      </p>
    </div>
  )
}

export default function Ueber() {
  return (
    <div>
      <PageHeader title="Über diese App" subtitle="Zweckbestimmung und Gebrauchsanweisung" onBack="/mehr" />
      <AboutContent />
    </div>
  )
}
