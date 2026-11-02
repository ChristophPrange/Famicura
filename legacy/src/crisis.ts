// Inhalte des Krisen-Assistenten als Entscheidungsbaum.
// Hinweis: Orientierungshilfe für Laien, keine ärztliche Einschätzung.
// Vor echtem Einsatz fachlich prüfen lassen (z. B. Hausärztin, Pflegeberatung).

export type OutcomeKind = '112' | '116117' | 'arzt' | 'ok' | 'support'

export interface Outcome {
  kind: OutcomeKind
  title: string
  steps: string[]
}

export interface Question {
  q: string
  hint?: string
  yes: string // id der nächsten Frage oder des Ergebnisses
  no: string
}

// Fachliche Prüfung: Jeder Inhalt muss vor echtem Einsatz von Fachleuten
// (z. B. Hausärztin, Notfallmedizin, Pflegeberatung) geprüft und belegt werden.
export interface Review {
  status: 'fachlich zu prüfen' | 'geprüft'
  source: string // Quelle, auf der der Inhalt beruht
  reviewedBy: string // wer geprüft hat (Name, Funktion, Datum)
}

const UNREVIEWED: Review = { status: 'fachlich zu prüfen', source: '', reviewedBy: '' }

export interface Scenario {
  id: string
  review: Review
  label: string
  icon: string
  start: string
  questions: Record<string, Question>
  outcomes: Record<string, Outcome>
}

const CALL_112: Outcome = {
  kind: '112',
  title: 'Rufen Sie jetzt den Notruf 112.',
  steps: ['Bleiben Sie bei Ihrer Mutter.', 'Sagen Sie am Telefon: Wo, was ist passiert, wie geht es ihr.', 'Notfallmappe und Medikamentenplan bereitlegen.', 'Haustür öffnen oder jemanden bitten, den Rettungsdienst einzuweisen.'],
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'sturz',
    review: UNREVIEWED,
    label: 'Gestürzt',
    icon: '🤕',
    start: 'q1',
    questions: {
      q1: { q: 'Ist sie bewusstlos, blutet sie stark oder hat sie sehr starke Schmerzen?', yes: 'notruf', no: 'q2' },
      q2: {
        q: 'Kann sie Arme und Beine normal bewegen?',
        hint: 'Zum Beispiel Finger und Zehen bewegen, Knie anwinkeln. Bitte noch nicht aufstehen lassen.',
        yes: 'q3',
        no: 'bruch',
      },
      q3: { q: 'Hat sie sich den Kopf angeschlagen?', yes: 'kopf', no: 'aufhelfen' },
    },
    outcomes: {
      notruf: CALL_112,
      bruch: {
        kind: '112',
        title: 'Möglicherweise ist etwas gebrochen. Rufen Sie 112.',
        steps: ['Nicht hochziehen oder hochheben.', 'Warm zudecken und bequem lagern, z. B. Kissen unter den Kopf.', 'Bei ihr bleiben und beruhigen.'],
      },
      kopf: {
        kind: '116117',
        title: 'Lassen Sie das heute ärztlich anschauen.',
        steps: [
          'Rufen Sie den ärztlichen Bereitschaftsdienst 116 117 oder die Hausärztin an.',
          'Sagen Sie, welche Medikamente sie nimmt (Medikamentenplan in der App).',
          'Wird sie in den nächsten Stunden schläfrig, verwirrt oder muss sie erbrechen: sofort 112.',
        ],
      },
      aufhelfen: {
        kind: 'ok',
        title: 'Helfen Sie ihr langsam auf.',
        steps: [
          'Erst auf die Seite drehen, dann in den Vierfüßlerstand.',
          'Einen stabilen Stuhl davorstellen und daran hochziehen lassen.',
          'Hinsetzen, etwas trinken lassen und eine Weile beobachten.',
          'Den Sturz im Pflegetagebuch notieren und beim nächsten Arzttermin ansprechen.',
        ],
      },
    },
  },
  {
    id: 'verwirrt',
    review: UNREVIEWED,
    label: 'Plötzlich verwirrt',
    icon: '😵‍💫',
    start: 'q1',
    questions: {
      q1: {
        q: 'Hängt ein Mundwinkel, ist ein Arm schwach oder spricht sie verwaschen?',
        hint: 'Bitten Sie sie zu lächeln, beide Arme zu heben und einen einfachen Satz nachzusprechen.',
        yes: 'schlaganfall',
        no: 'q2',
      },
      q2: { q: 'Ist sie sehr schläfrig, kaum ansprechbar oder hat sie hohes Fieber?', yes: 'notruf', no: 'q3' },
      q3: { q: 'Hat sie in den letzten Tagen wenig getrunken?', yes: 'trinken', no: 'abklaeren' },
    },
    outcomes: {
      schlaganfall: { ...CALL_112, title: 'Das kann ein Schlaganfall sein. Rufen Sie sofort 112.', steps: ['Jede Minute zählt.', 'Merken Sie sich die Uhrzeit, seit wann es so ist.', ...CALL_112.steps.slice(2)] },
      notruf: CALL_112,
      trinken: {
        kind: '116117',
        title: 'Wenig Trinken kann plötzlich verwirrt machen.',
        steps: ['Bieten Sie immer wieder kleine Schlucke an.', 'Rufen Sie heute noch die Hausärztin oder den Bereitschaftsdienst 116 117 an.', 'Lassen Sie sie möglichst nicht allein.'],
      },
      abklaeren: {
        kind: '116117',
        title: 'Plötzliche Verwirrtheit sollte heute ärztlich angeschaut werden.',
        steps: ['Rufen Sie die Hausärztin oder den Bereitschaftsdienst 116 117 an.', 'Bleiben Sie ruhig, sprechen Sie langsam und freundlich.', 'Medikamentenplan bereithalten – auch neue Medikamente erwähnen.'],
      },
    },
  },
  {
    id: 'trinken',
    review: UNREVIEWED,
    label: 'Trinkt oder isst nicht',
    icon: '🥤',
    start: 'q1',
    questions: {
      q1: { q: 'Ist sie kaum ansprechbar, sehr schläfrig oder plötzlich verwirrt?', yes: 'notruf', no: 'q2' },
      q2: { q: 'Trinkt sie seit mehr als einem Tag fast nichts?', yes: 'heute', no: 'q3' },
      q3: { q: 'Hat sie Schmerzen beim Kauen oder Schlucken?', yes: 'arzt', no: 'tipps' },
    },
    outcomes: {
      notruf: CALL_112,
      heute: {
        kind: '116117',
        title: 'Bitte heute ärztlich abklären lassen.',
        steps: ['Rufen Sie die Hausärztin oder den Bereitschaftsdienst 116 117 an.', 'Bieten Sie weiter kleine Schlucke an, z. B. mit einem Strohhalm.', 'Notieren Sie, wie viel sie getrunken hat.'],
      },
      arzt: {
        kind: 'arzt',
        title: 'Vereinbaren Sie bald einen Termin.',
        steps: ['Bei der Hausärztin oder beim Zahnarzt (Prothese drückt?).', 'Bis dahin weiche Kost und Lieblingsgetränke anbieten.', 'Im Pflegetagebuch notieren, was sie gegessen und getrunken hat.'],
      },
      tipps: {
        kind: 'ok',
        title: 'Ein paar Ideen, die oft helfen:',
        steps: ['Kleine Portionen, öfter am Tag.', 'Lieblingsgerichte und Lieblingsgetränke anbieten.', 'Gemeinsam essen – in Gesellschaft schmeckt es besser.', 'Ein volles Glas sichtbar hinstellen.', 'Im Pflegetagebuch notieren, damit die Familie Bescheid weiß.'],
      },
    },
  },
  {
    id: 'atem',
    review: UNREVIEWED,
    label: 'Atemnot oder Brustschmerz',
    icon: '🫁',
    start: 'q1',
    questions: {
      q1: { q: 'Hat sie Atemnot, Schmerzen oder Druck in der Brust?', yes: 'notruf', no: 'q2' },
      q2: { q: 'Sind Sie unsicher, was los ist?', yes: 'unsicher', no: 'beobachten' },
    },
    outcomes: {
      notruf: {
        ...CALL_112,
        title: 'Rufen Sie sofort 112.',
        steps: ['Oberkörper hoch lagern, z. B. aufrecht im Sessel.', 'Enge Kleidung öffnen, Fenster öffnen.', 'Nicht allein lassen.', 'Medikamentenplan bereithalten.'],
      },
      unsicher: {
        kind: '116117',
        title: 'Lassen Sie sich telefonisch beraten.',
        steps: ['Ärztlicher Bereitschaftsdienst 116 117 – Tag und Nacht.', 'Wird es schlimmer: sofort 112.'],
      },
      beobachten: {
        kind: 'ok',
        title: 'Beobachten Sie sie weiter.',
        steps: ['Notieren Sie im Pflegetagebuch, was Ihnen aufgefallen ist.', 'Sprechen Sie es beim nächsten Arzttermin an.', 'Bei Atemnot oder Brustschmerz: sofort 112.'],
      },
    },
  },
  {
    id: 'ueberfordert',
    review: UNREVIEWED,
    label: 'Ich schaffe es gerade nicht mehr',
    icon: '🫂',
    start: 'q1',
    questions: {
      q1: { q: 'Sind Sie oder Ihre Mutter gerade in Gefahr?', yes: 'notruf', no: 'q2' },
      q2: { q: 'Ist Ihre Mutter gerade gut versorgt, sodass Sie kurz durchatmen können?', yes: 'atmen', no: 'hilfe' },
    },
    outcomes: {
      notruf: CALL_112,
      atmen: {
        kind: 'support',
        title: 'Es ist in Ordnung, dass es Ihnen gerade zu viel ist.',
        steps: ['Gehen Sie kurz in einen anderen Raum oder an die frische Luft.', 'Atmen Sie langsam: 4 Sekunden ein, 6 Sekunden aus – zehnmal.', 'Sprechen Sie mit jemandem – Familie oder Telefonseelsorge.'],
      },
      hilfe: {
        kind: 'support',
        title: 'Sie müssen das nicht allein schaffen.',
        steps: ['Bitten Sie jetzt die Familie, einzuspringen.', 'Wenn niemand kann: Pflegedienst oder Nachbarn fragen.', 'Die Telefonseelsorge hört Ihnen zu – Tag und Nacht, kostenlos.'],
      },
    },
  },
]
