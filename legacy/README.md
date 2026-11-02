# FamilienPflege – klickbarer Prototyp

Mobile Web-App für pflegende Angehörige – **die Entlastungs-App für die intensive Pflegephase**: neutral, werbefrei, mit gemessener Entlastung. Prototyp für Nutzerinterviews, Pitch und eine spätere DiPA-Beantragung (digitale Pflegeanwendung nach § 40a SGB XI) im Masterprojekt *Digital Entrepreneurship*.
Kein Backend, kein Login: Alle Daten liegen im Browser (localStorage) und werden beim ersten Start mit Demo-Daten der **Familie Huber** gefüllt.

## Starten

Voraussetzung: Node.js 18 oder neuer.

```bash
npm install
npm run dev          # Entwicklungs-Server, z. B. http://localhost:5173
npm run dev -- --host   # zusätzlich im WLAN erreichbar (Handy testen, QR-Code scannen)
npm run build        # Produktions-Build nach dist/
npm run preview      # Build lokal ansehen (inkl. PWA / Offline)
```

Am besten im Browser die Handy-Ansicht nutzen (DevTools → Gerätesymbol, ca. 390 px Breite) oder direkt am Smartphone öffnen.
**Als App installieren:** Im Handy-Browser „Zum Startbildschirm hinzufügen“ (PWA; funktioniert über `npm run preview` bzw. HTTPS-Hosting).

## Demo-Familie

| Person | Rolle |
|---|---|
| Anna, 82 | wird gepflegt, Pflegegrad 3, lebt allein (intensive Phase) |
| Christina | Tochter, Hauptpflegeperson, ca. 30 Std./Woche (Standard-Ansicht) |
| Markus | Sohn, hilft regelmäßig (Mi, Fr, Sa, So, Mo) |
| Lena | Enkelin, hilft ab und zu (Di, Do, Sa) |
| Frau Berger | Pflegefachkraft, Partner-Pflegedienst Sonnenhof |

Die Demo beginnt vor gut 12 Wochen: Belastungs-Check zum Start (rot, 90 %), Woche 4 (rot) und Woche 8 (gelb, deutlich besser) sind ausgefüllt, **„Monat 3“ ist fällig** und kann live vorgeführt werden.

Beim **ersten Start** erscheint das Onboarding. „Demo ansehen“ überspringt es. Unter **Mehr → Einstellungen** lässt sich die Ansicht wechseln (Christina, Markus, Lena, Frau Berger), die Demo zurücksetzen oder alles löschen (danach erscheint das Onboarding wieder).

## Funktionen

**Onboarding & Einwilligungen** – Rolle wählen, Pflegegrad (1–5), drei **getrennte** Einwilligungen: (a) Nutzung der App (erforderlich), (b) Einbezug weiterer Personen inkl. Pflegedienst – nur mit Zustimmung der gepflegten Person bzw. Vollmacht, optional Belastungs-Ampel für den Pflegedienst, (c) freiwillig: anonymisierte Nutzung für Forschung. Alle Einwilligungen in den Einstellungen einseh- und widerrufbar; **„Alle meine Daten löschen“** entfernt alles vom Gerät. „Über diese App“ ist schon vor der ersten Nutzung lesbar.

**Familie beitreten mit Code** – Unter **Mehr → Familie → „Weitere Person einladen“** Rolle wählen (hilft regelmäßig, hilft ab und zu, Pflegedienst) und einen Einladungscode erzeugen (z. B. `HUBER-7K3M`, 7 Tage gültig, nur einmal nutzbar), kopieren oder teilen. Offene Einladungen lassen sich widerrufen. Im Onboarding führt **„Ich habe einen Einladungscode“** durch Code, Name/Telefon und Einwilligungen (a) und (c); (b) hat die Familie bereits erteilt. Zum Vorführen: Code **`HUBER-2026`** (läuft nie ab) oder „Beitritt vorführen“ direkt nach dem Erzeugen eines Codes. Im Prototyp nur auf einem Gerät simuliert, Logik in `src/invites.ts`.

**Über diese App** (`Mehr → Über diese App`) – Zweckbestimmung, Zielgruppe, „kein Medizinprodukt, keine medizinische Bewertung“, werbefrei, Datenverarbeitung nur in der EU (im Prototyp nur auf dem Gerät), Gebrauchsanweisung für jeden Bereich.

**Einführung** – geführte Tour (9 Schritte) nach dem Onboarding, betont die Alleinstellungsmerkmale (Medikationsplan, Abwesenheitsplanung, Belastungs-Check mit Messung, Krisen-Assistent, Pflegedienst-Einbindung, werbefrei). Erneut starten unter **Mehr → Einführung ansehen**. Texte in `src/components/Tour.tsx`.

**Heute** – offene Medikamente, Aufgaben, nächster Arzttermin, roter Button **„Krise / Notfall“**. **Rot markiert** alles, was bis übermorgen unbesetzt ist (Aufgaben und Medikamentengaben) – mit „Ich übernehme“. Erinnerung, wenn ein Belastungs-Check fällig ist; Warnung aus dem Tagesablauf-Modul.

**Medikamente** – gemeinsamer Plan (anlegen/bearbeiten/entfernen), Tagesansicht zum Abhaken („gegeben von Christina um 08:05“), Zuständigkeit morgens/abends, Vorrat „Packung reicht noch X Tage“ → **„Rezept nachbestellen“** legt eine Aufgabe für eine Person an. Übersicht **„Wer hat diese Woche Medikamente gegeben?“** (neutral). Erinnerungen als In-App-Hinweis.
Bewusst **keine** medizinische Bewertung, keine Wechselwirkungsprüfung, keine Dosierungsvorschläge. Fester Hinweis: „Änderungen an der Medikation nur nach ärztlicher Rücksprache.“

**Dienstplan** – Woche | Monat (Monatskalender mit Arztterminen), übernehmen, tauschen, erledigt, neue Aufgabe, Filter „nur offene“, Balken „Wer hat diesen Monat wie viel übernommen?“. **„Ich falle aus“**: Zeitraum wählen (Schnellwahl oder Von/Bis), zeigt betroffene Aufgaben **und** Medikamentengaben, schlägt je Punkt eine Vertretung vor (wer an dem Wochentag verfügbar ist und bisher am wenigsten übernommen hat), Unbesetztes bleibt rot; Familie wird (simuliert) benachrichtigt. Verfügbarkeiten pro Person unter **Mehr → Familie**.

**Ich (Belastungs-Check)** – feste Messzeitpunkte: **Start (Baseline), Woche 4, Woche 8, danach alle 4 Wochen**; Erinnerung bei Fälligkeit. Ergebnis als Ampel, Verlauf mit Messzeitpunkten, Entlastungsplan bei gelb/rot. Privat pro Person. Instrument: **Häusliche-Pflege-Skala (HPS)** – 28 Aussagen, Skala 0–3, Summenwert 0–84 (0–30 grün, 31–56 gelb, 57–84 rot). **Lizenz wird noch geklärt**: Bis dahin sind die Aussagen eigene Arbeitsfassungen in Anlehnung an die HPS, nicht der Originalwortlaut; der Hinweis steht auch in der App. Nach der Lizenzklärung Original-Items, Umpolung und Grenzwerte aus den Lizenzunterlagen in `src/instrument.ts` übernehmen.

**Krisen-Assistent** – fünf Situationen, Ja/Nein-Fragen, 112 und 116 117 immer oben, Telefonseelsorge und „Familie um Hilfe bitten“, „Familie informieren“, danach optional **kurzer Eintrag ins Pflegetagebuch**. Jeder Inhalt hat in `src/crisis.ts` ein Feld `review` (Status, Quelle, geprüft von); im Studien- oder Entwicklermodus wird **„Fachlich zu prüfen“** sichtbar angezeigt. „Ersetzt keine ärztliche Einschätzung.“

**Pflegedienst-Ansicht** (Ansicht als Frau Berger) – Medikationsplan nur lesen, Pflegetagebuch der letzten 14 Tage, Belastungs-Ampel der Hauptpflegeperson **nur mit Einwilligung (b) + Freigabe**, Notiz an die Familie, Video-Beratung vorschlagen (simuliert; steht für die ergänzende Unterstützungsleistung bis 30 €/Monat). Ohne Einwilligung sieht der Pflegedienst nichts. Die Familie sieht unter **Mehr → Familie**, was der Pflegedienst sehen darf.

**Tagesablauf (Demo)** – simulierte Sensoren (Haustür, Bewegung Flur/Küche/Bad). Wenn bis zu einer einstellbaren Uhrzeit keine Aktivität: Hinweis an die Familie (einmal pro Tag). Klar markiert „Demo – keine echten Geräte“. **Keine Vitalwerte, keine Sturzerkennung, keine Kamera.** „Ruhigen Morgen vorführen“ löst die Warnung aus.

**Studienmodus** (Einstellungen → Für Forschung & Entwicklung) – nur mit Einwilligung (c). Pseudonyme Studien-ID, Gruppe **Intervention** (alle Funktionen) oder **Vergleich** (sieht nur den Fragebogen), Studienbeginn. Lokales Nutzungsprotokoll (nur Bereich + Zeitpunkt, keine Inhalte). Export **CSV** (Semikolon, Excel) und **JSON**, nur mit Studien-ID. Auswertung: Baseline vs. letzter Wert, Veränderung, Nutzungstage, Verlauf, genutzte Bereiche.

**Datenexport** (`Mehr → Daten exportieren`) – zusätzlich zu Druck/PDF ein **FHIR-R4-Bundle (JSON)**: Medikationsplan als `MedicationStatement`, Pflegetagebuch als `Observation`, Belastungs-Checks als `QuestionnaireResponse` (inkl. Messzeitpunkt und Score). Code in `src/fhir.ts`. Vereinfacht, ohne offizielle Profile.

**Sprachsteuerung** – runder Mikrofon-Knopf rechts unten über der Tab-Leiste (`src/components/Voice.tsx`, Logik in `src/voice.ts`). Ein Tippen startet, eine Sprechpause beendet, kein Aktivierungswort. **Fragen:** „Was steht heute/morgen an?“, „Wann gibt es die nächsten Tabletten?“, „Hatte Mama ihre Tabletten?“, „Nächster Arzttermin?“, „Welche Termine gibt es am Freitag?“, „Wer ist morgen dran?“, „Wer gibt heute Abend die Tabletten?“, „Was ist noch offen?“, „Wie lange reichen die Tabletten?“. **Eingaben** (immer erst nach „Ich habe verstanden: … Stimmt das?“ und Ja): Medikament abhaken („Blutdrucktablette gegeben“, „Morgentabletten gegeben“), Tagebuch („Ins Tagebuch: …“), Termin („Termin beim Zahnarzt am Freitag um 10 Uhr“), Aufgabe übernehmen („Ich übernehme den Einkauf“). „Hilfe“/„Notfall“ öffnet den Krisen-Assistenten, ruft aber nie an. „Was kann ich sagen?“ nennt Beispiele. Antworten werden langsam vorgelesen und groß angezeigt; alles geht auch per Tippen.
Technik und Grenzen: Spracherkennung und Vorlesen über die **Web Speech API** des Browsers, Auswertung regelbasiert auf dem Gerät (kein KI-Dienst). **Chrome/Edge schicken das Audio zur Erkennung an Google bzw. Microsoft** – darauf weist die App vor der ersten Nutzung und unter dem Mikrofon hin; im echten Einsatz Erkennung auf dem Gerät oder EU-Server nötig. Firefox und manche als App installierte iPhone-Versionen unterstützen keine Spracheingabe, dort bleibt das Eintippen. Erkannt werden feste Satzmuster, keine freie Unterhaltung; Alltagsnamen der Medikamente sind für den Demo-Plan hinterlegt.

**KI-Assistent (vorbereitet, derzeit ausgeschaltet)** – damit der Prototyp kostenlos bleibt, ist er abgeschaltet (`AI_FEATURE = false` in `src/assistant.ts`). Eingeschaltet erscheint er als Schalter in der Sprachsteuerung und unter Einstellungen (Standard: aus). Dann versteht die App freie Sätze und kann mehr, z. B. Aufgaben an andere weitergeben („Gib den Einkauf am Donnerstag an Markus weiter“), Tablettendienst neu verteilen, Aufgaben anlegen oder erledigt melden. Ablauf: `src/assistant.ts` schickt die Frage plus einen knappen Datenauszug an die Vercel Function `api/assistant.ts`; dort fragt Claude (`claude-opus-5-5`, Aufwand „low“, Structured Outputs, Server-Fallback bei Ablehnung) und gibt Antwort plus vorgeschlagene Aktionen zurück. Die App prüft jede Aktion gegen die echten Daten und speichert erst nach „Ja“. Notfälle werden immer lokal erkannt; ohne Internet, ohne Schlüssel oder bei Fehlern greift die einfache Erkennung. Nicht übertragen werden Telefonnummern, Adressen, Diagnosen, Notfallmappe und Belastungs-Check.
Einrichtung: in Vercel unter *Settings → Environment Variables* `ANTHROPIC_API_KEY` setzen (Schlüssel aus console.anthropic.com, dort ein Ausgabenlimit festlegen) und neu deployen. Datenschutz: Verarbeitung bei Anthropic (USA) – nur mit Demo-Daten nutzen; für echten Einsatz EU-Verarbeitung und Auftragsverarbeitungsvertrag nötig. Die Function ist öffentlich erreichbar; Eingaben sind in der Länge begrenzt, ein Ausgabenlimit im Anthropic-Konto schützt vor Missbrauch.

Kostenlose Erkennung auf dem Gerät versteht außerdem: Aufgaben weitergeben („Gib den Einkauf am Donnerstag an Markus weiter“, mit Hinweis bei fehlender Verfügbarkeit), Tablettendienst verteilen („Lena soll diese Woche abends die Tabletten geben“) und Aufgaben zum Tausch anbieten („Ich kann den Besuch am Samstag nicht“).

**Arzttermin-Nachbereitung** – wer einen Termin begleitet hat, wird beim nächsten Öffnen der App (frühestens 1 Stunde nach Terminbeginn, bis zu 14 Tage danach) gebeten, die Ergebnisse einzutragen: Notiz, „Medikation geändert?“ (bei Ja öffnet sich danach der Medikationsplan) und optional ein Folgetermin. Gespeichert wird beim Termin und als Tagebuch-Eintrag „Arztbesuch“; die Familie wird (simuliert) informiert. „Später“ fragt beim nächsten Öffnen wieder, „Nichts einzutragen“ beendet die Nachfrage. Demo: Termin „Neurologin“ gestern mit Christina (`src/components/ArztNachbereitung.tsx`).

**Barrierefreiheit** – Schriftgröße normal/groß/sehr groß, hoher Kontrast, sichtbarer Fokus, Tastaturbedienung (Esc schließt Dialoge), beschriftete Schaltflächen (aria-labels), Tippflächen mind. 44 px. Keine externen Fonts, CDNs, Tracker oder Werbung.

**Weiterhin** – Pflegetagebuch mit druckbarer Zusammenfassung, Notfallmappe mit QR-Code und Druckseite, Hinweise.

## DiPA-Abgleich

Grundlage: § 40a/§ 40b SGB XI und Digitale-Pflegeanwendungen-Verordnung (DiPAV), Verzeichnis beim BfArM. Stand der Anforderungen vor einem Antrag aktuell prüfen.

| Anforderung | Im Prototyp umgesetzt durch | Für eine echte Zulassung noch offen |
|---|---|---|
| Zweckbestimmung | „Über diese App“, Onboarding | Formale Zweckbestimmung, Abgrenzung zum Medizinprodukt (ggf. regulatorische Beratung) |
| Pflegerischer Nutzen / Entlastung | Belastungs-Check mit festen Messzeitpunkten, Entlastungsplan, Studienmodus mit Auswertung | HPS-Lizenz klären und Originalwortlaut einsetzen, Studie mit Vergleichsgruppe, Auswertung nach Studienprotokoll |
| Einwilligungen | Drei getrennte, widerrufbare Einwilligungen; Zustimmung der gepflegten Person für Dritte | Rechtlich geprüfte Texte, Nachweis/Protokoll der Einwilligung, Umgang mit Vollmachten |
| Datenschutz, Verarbeitung in der EU | Nur lokal im Browser, „Alle Daten löschen“, Studienexport nur pseudonym | Backend in der EU, Datenschutz-Folgenabschätzung, Nachweis der Datensicherheit (BSI-Vorgaben/Zertifikat), Penetrationstest |
| Werbefreiheit | Keine Werbung, keine Tracker, keine externen Ressourcen | Erklärung im Antrag, Geschäftsmodell ohne Datenverkauf |
| Barrierefreiheit | Schriftgrößen, Kontrastmodus, aria-labels, Fokus, Tastatur, 44-px-Tippflächen | Prüfung nach BITV 2.0 / WCAG 2.1 AA, Test mit Screenreadern |
| Interoperabilität / Export | FHIR-R4-JSON (MedicationStatement, Observation, QuestionnaireResponse), Druck/PDF | Offizielle Profile und Codesysteme, Anbindung an Pflege-/Praxissoftware, ePA |
| Einbindung Dritter (ergänzende Unterstützung) | Pflegedienst-Rolle mit Lese-Rechten, Notiz, Video-Beratung (simuliert) | Kooperationsverträge mit Pflegediensten, echte Video-Lösung, Abrechnung bis 30 €/Monat |
| Gebrauchsanweisung | „Über diese App“ mit Anleitung je Bereich, Einführungs-Tour | Vollständige Gebrauchsanweisung mit Hersteller- und Versionsangaben |
| Robustheit / Sicherheit der Inhalte | Keine medizinische Bewertung, Krisen-Inhalte mit Feld „Quelle/geprüft von“, „Fachlich zu prüfen“-Kennzeichnung | Fachliche Prüfung aller Inhalte, Qualitätsmanagement, Tests, Support- und Update-Prozess |

## Abgrenzung zu Wettbewerbern

Verglichen wird mit Angeboten wie fabel, Johanniter *mitpflegeleben*, Nui Care, *einfach pflegen*, MyTherapy und der DAK-Pflege-App. Die Einzelvergleiche stehen in der Wettbewerbsanalyse des Projekts; Angaben über Wettbewerber vor jeder Veröffentlichung neu prüfen.

FamilienPflege setzt auf diese Kombination:

- **Gemeinsamer Medikationsplan für die Familie** – wer hat wann gegeben, wer ist morgens/abends zuständig, Rezept als Aufgabe. Ohne medizinische Bewertung.
- **Belastungs-Check mit Messung** – feste Messzeitpunkte, Verlauf, Entlastungsplan; Grundlage für den Nutzennachweis.
- **Abwesenheitsplanung** – „Ich falle aus“ mit Zeitraum, betroffenen Aufgaben und Medikamentengaben, Vertretungsvorschlägen nach Verfügbarkeit.
- **Krisen-Assistent** – Schritt für Schritt, 112/116 117 immer sichtbar, auch für die Überforderung der Angehörigen.
- **Neutrale Pflegedienst-Einbindung** – nicht an einen Träger gebunden; der Pflegedienst sieht nur, was die Familie freigibt.
- **Werbefrei und ohne Tracker** – kein Datenverkauf.
- **Studienmodus** – Nutzennachweis ist von Anfang an eingebaut.

## Technik

React 18 + TypeScript + Vite 5, Tailwind CSS 3, `vite-plugin-pwa`, `qrcode.react`. Eigener Mini-Hash-Router (`src/router.ts`), Zustand in `src/store.tsx` (localStorage, Version 3 – ältere gespeicherte Stände werden verworfen).

```
src/
  types.ts        Datenmodell
  demoData.ts     Demo-Daten Familie Huber (relativ zum heutigen Datum)
  instrument.ts   Belastungs-Fragebogen (austauschbar) + Messzeitpunkte
  content.ts      Entlastungsschritte, Aufgaben-/Tagebuch-Typen
  crisis.ts       Krisen-Entscheidungsbäume mit Prüf-Feldern
  planning.ts     Abwesenheit, Verfügbarkeit, Vertretungsvorschläge
  fhir.ts         FHIR-R4-Export
  study.ts        Studienexport (CSV/JSON) und Auswertung
  store.tsx       Zustand, localStorage, Benachrichtigungen, Löschen
  meds.ts         Medikamenten-Logik, Erinnerungen
  views/          Bildschirme (u. a. Pflegedienst, Tagesablauf, Studie, Export, Über)
  components/     UI-Bausteine, Onboarding, Tour, Monatskalender
```

## Hinweise

Prototyp, alle Daten erfunden. Kein Medizinprodukt, keine echte Datenübertragung, keine echten Sensoren. Krisen-Inhalte müssen fachlich geprüft werden; die Fragebogen-Aussagen sind Arbeitsfassungen, bis die HPS-Lizenz geklärt ist.
