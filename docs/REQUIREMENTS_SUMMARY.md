# Anforderungen und Umsetzungsschwerpunkte

## Produktkern

Eine koordinierte häusliche Pflege mit persönlichem Einstieg, mehreren Pflegenden und mehreren Pflegebedürftigen, bestätigten Zuständigkeiten, kontrolliert geteilten Dokumenten und einem unterstützenden Entlastungsprozess. Eine Kalender-/Chatoberfläche allein soll nicht als bereits nachgewiesen wirksame Pflegeintervention beworben werden.

## Verbindliche zusammenhängende Abläufe

1. Erstlogin: Identität, persönliche Bedienpräferenzen und Rolle je Fall; echte Einrichtung ohne erfundene Familiendaten; fortsetzbar und pro Konto gespeichert.
2. Pflegefall: angemeldetes Konto und gewählte gepflegte Person getrennt; fallbezogene Mitgliedschaften und Dokumentrechte; private Angehörigendaten gesondert schützen.
3. Woche: konkrete Zeitfenster und Kapazität abfragen, passende Aufgaben anfragen, Annahme abwarten, offene Lücken zeigen; Zeiten ohne Doppelzählung auswerten.
4. Arzttermin: Beginn und geplantes/bestätigtes Ende, bestätigte Begleitung, dauerhafter Job, individuelle Nachbereitungserinnerung, Entwurf und Veröffentlichung, Uploads und Folgeaufgaben.
5. Medikamente: historischer Plan, eindeutige Einzelgabe, tatsächlicher Autor und Zeitpunkt; Korrekturereignisse statt Löschung, Konkurrenzschutz und ehrliche Bestandsunsicherheit.
6. Dokumente: sichere private Ablage, Typ-/Größenprüfung, Status, Zuordnung und Freigabe; keine falsche AV-/OCR-/Integrationsbehauptung.
7. Entlastung: persönliche Selbsteinschätzung und konkrete Maßnahmen; keine ungeprüfte HPS-Auswertung oder erfundene Wirkung.
8. Interface: echtes transparentes SVG, Orange/Beige, ruhige responsive Flächen, gleichwertige einfache Ansicht, zugängliche Formulare und Notfallzugang.

## Freigabegrenzen

Die technische Fassung muss unterscheiden zwischen tatsächlich implementiert, geprüft, simuliert, blockiert und noch nicht vorhanden. Eine Demo ist keine Authentifizierung; ein Toast ist keine versandte Nachricht; ein geplanter Zeitpunkt beweist keinen erfolgten Arztbesuch; ein privates Hosting ist keine DiPA-Aufnahme; ein gespeichertes Bild ist keine geprüfte Befundinterpretation.

## Datenflussprüfung vor Echtbetrieb

Kontoidentität → Fallmitgliedschaft → Objektberechtigung → Verarbeitung/Ablage → Freigabe/Export → Widerruf/Löschung. Alle Wege müssen dieselbe Grenze einhalten: API, Dateien, Suche, Benachrichtigungen, QR, Export und Assistenz. Dienstleister, Logs, Backups und Unterauftragnehmer gehören in die tatsächliche Datenflussprüfung.
