# Statische Prüfung der ursprünglichen ZIP

Stand: 29. Oktober 2026. Gegenstand ist ausschließlich die bereitgestellte Ausgangsversion `pflege-app-prototyp-main(1).zip`, nicht die aktuell entstehende NOVALIS-Implementierung. Keine Laufzeit-, Penetrations-, Zertifizierungs- oder klinische Prüfung. Die Fundstellen beziehen sich auf die Dateien innerhalb des ursprünglichen Projektordners.

## Wesentliche Befunde

| Priorität | Befund im Ausgangscode | Fundstelle | Konsequenz für die neue Implementierung |
|---|---|---|---|
| P0 | Notfallinformationen und Medikationsdaten werden als Base64-Payload direkt im QR-Link mitgeführt. Base64 ist keine Verschlüsselung; der Besitz des Links reicht für die dort enthaltenen Angaben. Ein bereits ausgegebener QR-Payload lässt sich serverseitig nicht zurückholen. | `src/views/Notfallmappe.tsx:15`, `:41` | Kein Gesundheits-Payload in URL oder QR. Bewusst freigegebener minimaler Datenumfang, undurchsichtiger zufälliger Token, Widerruf, Rechte und Ablauf testen. Ausdrucke und bereits kopierte Daten bleiben außerhalb einer Rückholgarantie. |
| P0 | Der Belastungsfragebogen ist ausdrücklich `validated: false`; eigene HPS-nahe Arbeitsformulierungen werden dennoch mit Prozentwerten und festen Schwellen ausgewertet. | `src/instrument.ts:38`, `:77`, `:78` | Keine wissenschaftlich validierte HPS behaupten. Eigene Befindlichkeitsfragen deskriptiv benennen; keine übernommenen klinischen Grenzwerte. Instrumentlizenz und Fachprüfung als offene Voraussetzung führen. |
| P0 | Der allgemeine Bundle-Export schließt standardmäßig Fragebogenantworten der aktiven Person ein. | `src/fhir.ts:60`, `:77`, `:81` | Familien-/Pflegefallexport und privater Eigenexport strikt trennen. Ausschluss privater Antworten durch serverseitige Auswahllogik und Negativtests absichern. |
| P0 | Erneutes Antippen löscht die dokumentierte Medikamentengabe und erhöht den Bestand. Es gibt keine unveränderliche Korrekturhistorie. | `src/meds.ts:28` | Append-only Korrekturereignis mit Grund, Autor und Bezug; historisches Planabbild, Konkurrenz- und Idempotenzschutz. |
| P0 | Sämtliche Daten liegen in einem globalen Browserzustand; eine aktive Demofigur ersetzt die Kontenidentität. | `src/types.ts`, `src/store.tsx:12`, `:114` | Authentifizierte Konten, Fallzuordnung, serverseitige Rechte und echte Synchronisation. UI-Ausblendung gilt nicht als Zugriffsschutz. |
| P0 | Die Assistenten-API akzeptiert im gezeigten Handler Anfragen ohne erkennbare Konten-/Mitgliedschaftsprüfung. Ein Frontend-Schalter ist aus. | `src/assistant.ts:41`, `api/assistant.ts:80` | Deaktivierte UI schützt Serverroute nicht. Konto, Fallrechte, Ratenbegrenzung, Payloadgrenzen und minimalen freigegebenen Kontext serverseitig prüfen; ohne eingerichtete Integration geschlossen bleiben. |
| P0 | Der Assistentenkontext enthält Freitext aus dem Tagebuch und Medikationsangaben. Diese können sensible Inhalte enthalten, auch wenn separate Diagnosenfelder ausgelassen werden. | `src/assistant.ts:45`, `:62`, `:74` | Keine Anonymitätsbehauptung aufgrund ausgelassener Kontaktfelder. Datenflüsse und Empfänger korrekt dokumentieren; ohne geeignete Voraussetzungen keine realen Pflegedaten an externes Modell senden. |
| P0 | Die Ausfallfunktion schreibt eine neue zuständige Person direkt ein, obwohl die Nachricht von angefragter Vertretung spricht. | `src/views/Dienstplan.tsx:264`, `:272`, `:284` | Anfrage, Annahme und Ablehnung getrennt modellieren; bis Annahme keine gesicherte Ersatzversorgung darstellen. |
| P1 | Nachbereitung hängt an Terminbeginn plus 60 Minuten, wird lokal ermittelt und blendet alte Termine nach 14 Tagen aus. | `src/components/ArztNachbereitung.tsx:12`, `:13`, `:34` | Geplantes/bestätigtes Ende, persistenter Job, Empfänger und Versionsbezug, Wiedervorlage, kein stilles Verschwinden. |
| P1 | Ein Folgetermin ohne Zeit wird automatisch mit 09:00 Uhr gespeichert. | `src/components/ArztNachbereitung.tsx:61` | Unbekannte Zeit ausdrücklich modellieren; keinen scheinbar bestätigten Termin erfinden. |
| P1 | „Familie benachrichtigen“ erzeugt einen lokalen Hinweis und Toast. | `src/store.tsx:77` | Persönliche Nachrichten-/Lesezustände, tatsächlichen Versand und Empfang unterscheiden. Hintergrundverfügbarkeit nachweisen. |
| P1 | Nicht zur aktuellen Zustandsversion passende lokale Daten werden nicht umfassend migriert. | `src/store.tsx:15` | Versionierte Migrationen mit Prüfung, Sicherung und nachvollziehbarer Zuordnung. Keine unbemerkte Vermischung oder Datenverwerfung. |
| P1 | FHIR-Struktur ist im Ausgangscode ausdrücklich vereinfacht, ohne offizielle Profile. | `src/fhir.ts` | Konkrete Ressourcen/Versionen, Referenzen und Codes dokumentieren; validieren. Keine ePA-/Praxisintegration behaupten, solange sie nicht eingerichtet und getestet ist. |

## Besonders wichtige Negativtests

1. Helferkonto mit reinen Einkaufsrechten versucht direkte Datei- und Gesundheits-API-Aufrufe.
2. Falladministrator ruft private Befindlichkeitsantworten eines anderen Mitglieds ab.
3. Widerruf erfolgt während bestehender Sitzung und während ein Dateilink bereits bekannt ist.
4. Zwei Geräte bestätigen dieselbe Medikamentengabe oder übernehmen dieselbe Aufgabe gleichzeitig.
5. Nachbereitungsjob wird mehrfach, nach Absage und nach Wechsel der Begleitung ausgeführt.
6. Ein allgemeiner Export enthält keine privaten Fragebogenantworten oder fallfremden Dateien.
7. Ein QR-Code wird nach Widerruf auf einem unabhängigen Gerät geöffnet.
8. Zeitcontrolling unterscheidet angenommene Planung und tatsächlichen Abschluss und zählt verknüpfte Arztbegleitung nicht doppelt.

## Architekturhinweise zur neuen Serverversion

- Sites-Identitätsheader nur innerhalb der garantierten vertrauenswürdigen Hostinggrenze akzeptieren. Ein separat bereitgestellter öffentlicher Server darf beliebige clientseitige `oai-authenticated-user-id`-Header nicht als Authentifizierung behandeln.
- Fallberechtigungen immer serverseitig prüfen; Privatheit braucht eigene Besitzerprüfung unabhängig von Familienadministration.
- Fall-, Objekt- und Dateiverknüpfungen zusammen prüfen. Ein gültiges Objekt in einem anderen Fall darf keine Referenzübernahme erlauben.
- R2-/D1-Bindings allein liefern keine klinische Freigabe, AV-Prüfung, nachgewiesene EU-Gesamtverarbeitung oder DiPA-Zertifizierung.
- Eine private Hostingfreigabe und eine App-Einladung sind getrennte Zugriffsebenen. Ein gültiger Einladungscode hebt die aktuelle Site-Zugangspolitik nicht auf.
