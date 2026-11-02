# Technische Architektur

## Daten und Identität

Der Browser verwendet dieselbe Herkunft für Oberfläche und API. Die Plattform prüft die Anmeldung und setzt vertrauenswürdige Identitätsheader. Der Server ordnet diese Identität einem Konto zu; es gibt keine vom Browser frei gewählte Benutzer-ID und keine Demo-Rollenumschaltung im echten Betrieb.

Die Schichten sind: Plattformzugang → Konto → aktive Kreismitgliedschaft → erlaubte Pflegeprofile → objektspezifische Lese-/Schreibrechte. Eine Einladungsannahme erzeugt eine eigene Mitgliedschaft und ersetzt kein Konto. Tokens werden nur gehasht gespeichert. API-Antworten und Dateien werden mit `no-store` ausgeliefert.

## Tabellen

| Tabelle | Aufgabe |
|---|---|
| accounts | Identität, persönliche Bedienpräferenzen, Einstieg |
| circles / members / recipients | Pflegekreise, Rechte und gepflegte Personen |
| records | typisierte Einträge, Sichtbarkeit, Autor, Version, Soft-Delete |
| dose_events | unveränderliche Gaben- und Korrekturereignisse |
| medication_revisions | vorherige Medikationsplanstände |
| notifications / jobs | persönliche Hinweise und fällige Hintergrundarbeit |
| invitations | einmalige, befristete, widerrufbare Einladungen |
| files | Metadaten privater R2-Objekte mit Fall-/Berichtsbezug |
| consents / audits | protokollierte Bestätigungen und ausgewählte Zugriffsereignisse |
| emergency_shares | befristete, widerrufbare Tokenfreigaben |

JSON-Payloads sind pro Eintragsart validiert, aber noch kein vollständiger klinischer Terminologiestandard. Historische Medikation bleibt gesondert erhalten. Soft-Delete ist keine rechtliche Löschung.

## Rollen

| Rolle | Standardrechte |
|---|---|
| Verwaltung | Plan, Gesundheit, Dokumente schreiben; Mitglieder verwalten |
| Angehörige Person | Plan, Gesundheit und Dokumente lesen/schreiben; keine Mitgliederverwaltung |
| Alltagshilfe | Plan und Aufgaben; keine Gesundheitsinformationen oder Dokumente |
| Fachperson | Plan, Gesundheitsinformationen und freigegebene Dokumente lesen |

Alle Rollen gelten nur für die ausgewählten Pflegeprofile. Private Antworten und Ziele bleiben bei ihrem Autor. Eine Fachperson mit Leserechten kann nicht als schreibberechtigte Berichtsbegleitung eingesetzt werden. Für eine spätere granulare Rechteverwaltung ist eine zusätzliche Verwaltungsoberfläche erforderlich.

## Konkurrenz und Jobs

Einträge verwenden optimistische Versionen. Eine veraltete Bearbeitung erhält HTTP 409. Die erste reguläre Medikamentengabe pro Plan/Termin besitzt zusätzlich einen eindeutigen Datenbankschlüssel. Eine Serienänderung erfolgt als einzelne SQL-Operation nur, solange alle beobachteten Versionen stimmen.

Terminänderungen verwerfen alte ausstehende Jobs und veraltete Nachbereitungshinweise. Jobs prüfen beim Ausführen erneut Terminversion, Begleitung, Rechte, Absage und veröffentlichten Bericht. Eindeutige Deduplizierung verhindert doppelte Hinweise. Wiedervorlagen bleiben als Jobs gespeichert.

Die Wochenabfrage wird donnerstags um 18 Uhr für die Folgewoche erzeugt. Diese Fassung erlaubt Ein-/Ausschalten; eine freie Auswahl des Wochentages ist noch nicht als Einstellung verfügbar. Der regelmäßig aufgerufene Writer verarbeitet fällige Jobs auch ohne geöffneten Browser. Details und Betriebsgrenze: `SCHEDULE.md`.

## Dateien und Exporte

R2-Schlüssel werden serverseitig erzeugt und nicht als öffentliche URLs ausgeliefert. Jeder Abruf prüft Fall- und Berichtsrechte erneut. Geprüft werden Größe, erlaubter MIME-Typ und Dateisignatur. `unverified` bedeutet ausdrücklich keine Schadsoftwarefreigabe.

JSON/PDF exportieren den gewählten Fall ohne private Entlastungsdaten. Der JSON-Export enthält Gabenereignisse und sichtbare Dateimetadaten, nicht die Datei-Binärdaten. Das FHIR-R4-Bundle ist ein einfacher Entwicklungs-Export von Patient, MedicationStatement und Observation; keine amtliche Profilvalidierung oder ePA-Anbindung.

## Laufzeitgrenzen

Die Oberfläche fragt bei Sichtbarkeit alle 30 Sekunden neue Daten ab; keine Echtzeit-WebSocket-Zusage. Offline bleiben offene Formulare erhalten, werden aber nicht automatisch synchronisiert. Der Service Worker speichert nur Markenassets und eine datenfreie Offline-Seite. Der Server benötigt weiterhin betriebliche Rate-Limits, Monitoring, längere Lasttests und unabhängige Sicherheitsprüfung.
