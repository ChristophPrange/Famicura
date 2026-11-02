# Abnahmematrix – NOVALIS

Diese Matrix übernimmt die 60 Abnahmeszenarien aus dem bereitgestellten Masterprompt. Sie verbindet Prüfplan und tatsächlich vorhandene Evidenz. **Bestanden (Adapter)** bedeutet einen ausgeführten Test gegen die echte API-Logik mit SQLite-D1-/R2-Testadaptern. Es ist kein Nachweis für echte Plattformanmeldung oder unabhängige Freigabe. **Teilweise** benennt bewusst eine begrenzte Prüfung. Stand: 29.10.2026.

P0 bezeichnet hier eine Freigabesperre für den betroffenen Echtbetrieb; P1 eine wichtige Produktanforderung. Die Einstufung ist eine technische Priorisierung und keine formale medizinprodukterechtliche Risikoklasse. Screenshots allein belegen keine API-Rechte oder Datenintegrität.

| ID | Priorität | Prüfart | Anforderung / erwartetes Verhalten | Status | Evidenz / Version / Datum |
|---|---|---|---|---|---|
| AC-01 | P1 | E2E | Eine allein pflegende Person kann ohne zweite Person einen sinnvollen Pflegeplan beginnen. | Teilweise | Fünfteiliger Einstieg und leeres Testprofil im Browser vollständig durchlaufen; echte Anmeldung nicht im Browser geprüft |
| AC-02 | P1 | API/Integration | Ein Familienmitglied tritt über eine gültige Einladung bei und erhält nur die vorgesehenen Rechte. | Bestanden (Adapter) | Rollenbezogene Einladungsannahme mit unabhängigen Testidentitäten; Fallumfang geprüft; TEST_RESULTS.json |
| AC-03 | P1 | API/Integration | Eine abgelaufene oder widerrufene Einladung kann nicht verwendet werden. | Bestanden (Adapter) | Abgelaufene, widerrufene und bereits verwendete Tokens abgewiesen; TEST_RESULTS.json |
| AC-04 | P0 | API/Integration | Zwei Mitglieder übernehmen gleichzeitig dieselbe Aufgabe; es entsteht genau eine Hauptzuständigkeit. | Bestanden (Adapter) | Zwei konkurrierende PATCH-Aufrufe: ein Erfolg und ein 409; TEST_RESULTS.json |
| AC-05 | P1 | API/Integration | Eine Vertretung wird angefragt, lehnt ab und die offene Lücke bleibt sichtbar. | Bestanden (Adapter) | Vertretungsanfrage und Ablehnung erhalten Zuständigkeit und offene Lücke; TEST_RESULTS.json |
| AC-06 | P0 | API/Integration | Eine angefragte Vertretung wird nicht als bereits gesicherte Versorgung angezeigt. | Bestanden (Adapter) | pendingAssignee ersetzt keine angenommene Zuständigkeit; TEST_RESULTS.json |
| AC-07 | P1 | API/Integration, E2E | Eine Aufgabe wird bearbeitet und nach Neuladen auf einem zweiten berechtigten Gerät korrekt angezeigt. | Teilweise | Aufgabe nach Neuladen in Demo sichtbar; API-Persistenz geprüft, zweites reales Gerät offen |
| AC-08 | P0 | Fachlogik | Die Änderung einer Terminserie verändert keine dokumentierten vergangenen Einträge. | Bestanden (Adapter) | Serienänderung erhält vergangene und erledigte Instanzen und ihre Versionen; TEST_RESULTS.json |
| AC-09 | P0 | API/Integration | Ein Arzttermin wird verschoben; Begleitung und Erinnerung werden konsistent aktualisiert. | Bestanden (Adapter) | Verschiebung entfernt veraltete Hinweise und ersetzt den ausstehenden Job; TEST_RESULTS.json |
| AC-10 | P1 | Fachlogik | Eine vergangene Uhrzeit wird nicht als nächste zukünftige Gabe oder nächster zukünftiger Termin bezeichnet. | Teilweise | Zukünftiger Arzttermin im Browser kontrolliert; vollständiger Grenzfallkatalog offen |
| AC-11 | P0 | API/Integration | Zwei Personen dokumentieren dieselbe Medikamentengabe gleichzeitig; es entsteht keine unbemerkte Doppelbuchung. | Bestanden (Adapter) | Zwei konkurrierende Gabenbestätigungen erzeugen genau ein Ereignis; TEST_RESULTS.json |
| AC-12 | P0 | Fachlogik | Eine Gaben-Korrektur erhält den ursprünglichen Eintrag und dokumentiert Grund, Autor und Zeitpunkt. | Bestanden (Adapter) | Korrekturgrund verpflichtend; Original und Mengen-/Einheitensnapshot erhalten; TEST_RESULTS.json |
| AC-13 | P0 | Fachlogik | Eine Medikamentenplanänderung verändert nicht rückwirkend den historischen Plan. | Bestanden (Adapter) | Historischer Planstand und ursprüngliche Gabenmenge erhalten; TEST_RESULTS.json |
| AC-14 | P1 | Fachlogik | Ein unbekannter Bestand führt nicht zu einer erfundenen sicheren Reichweite. | Bestanden (Adapter) | Unbekannter Bestand bleibt unbekannt; TEST_RESULTS.json |
| AC-15 | P0 | Fachlogik | Milliliter, Milligramm und Stück werden weder technisch noch in Exporten verwechselt. | Teilweise | Strukturierte Stärke/Menge/Einheit und Snapshots vorhanden; umfassender Export-/Einheitenkatalog offen |
| AC-16 | P0 | API/Integration | Ein Offlinekonflikt wird sichtbar und nicht still überschrieben. | Teilweise | Versionskonflikt und Offline-Fehlertext implementiert; echter Offline-Netzwerkablauf nicht geprüft |
| AC-17 | P0 | API/Integration | Eine Nachbarin mit Einkaufsrecht kann weder Diagnosen noch private Belastungsdaten über direkte API-Aufrufe lesen. | Bestanden (Adapter) | Alltagshilfe erhält weder Medikamentendaten noch Schreibzugriff; private Antworten verborgen; TEST_RESULTS.json |
| AC-18 | P0 | API/Integration | Ein Pflegedienst verliert nach Widerruf den serverseitigen Zugriff, einschließlich auf bisherige Dateilinks entsprechend dem Sicherheitskonzept. | Bestanden (Adapter) | Widerruf der Mitgliedschaft sperrt bisherigen Dateiabruf serverseitig; TEST_RESULTS.json |
| AC-19 | P0 | API/Integration | Der allgemeine Familienexport enthält keine privaten Angehörigenantworten. | Bestanden (Adapter) | Private Antworten und fremde Pflegeprofile fehlen im Serverexport; TEST_RESULTS.json |
| AC-20 | P0 | API/Integration | Ein QR-Code funktioniert entsprechend dem ausdrücklich gewählten Freigabemodell auf einem zweiten Gerät und lässt sich widerrufen. | Teilweise | Tokenzugriff und Widerruf API-geprüft; private Hosting-Schranke und zweites reales Gerät offen |
| AC-21 | P1 | manuell/assistiv, E2E | Ablehnung des Mikrofonzugriffs verhindert nicht die normale Appnutzung. | Nicht aktiv / abgegrenzt | Mikrofonsteuerung nicht eingebaut; normale Bedienung braucht kein Mikrofon |
| AC-22 | P0 | E2E | Der Assistent bestätigt mehrdeutige Angaben, bevor er etwas speichert. | Teilweise | Textassistenz öffnet prüfbare Formulare; kein autonomer KI-Speichervorgang, vollständiger Mehrdeutigkeitstest offen |
| AC-23 | P0 | API/Integration | Ein nicht eingerichteter Praxisversand kann keine Meldung „Rezept bestellt“ auslösen. | Nicht aktiv / abgegrenzt | Keine Praxisintegration; nur interne Organisationsaufgabe, keine Bestellbestätigung |
| AC-24 | P0 | API/Integration | Ein Sensor ohne aktuelle Verbindung wird als technischer Datenmangel und nicht als sicherer Notfall oder sicherer Normalzustand dargestellt. | Nicht aktiv / abgegrenzt | Keine Sensorintegration und kein daraus abgeleiteter medizinischer Status |
| AC-25 | P0 | API/Integration | Eine fehlgeschlagene Pushzustellung wird nicht als gelesene Nachricht dargestellt. | Nicht aktiv / abgegrenzt | Keine Pushintegration; nur In-App-Hinweise, keine behauptete Push- oder Lesebestätigung |
| AC-26 | P1 | API/Integration, E2E | Ein abgebrochener Download erzeugt keine falsche Erfolgsmeldung. | Teilweise | Meldung bezeichnet Dateierzeugung; Abbruch des Browserdownloads nicht geprüft |
| AC-27 | P0 | API/Integration | Neue Nutzer erhalten keine vorausgewählten optionalen Einwilligungen. | Teilweise | Pflichtbestätigungen im Test-Einstieg nicht vorangekreuzt; optionale Forschung existiert nicht |
| AC-28 | P0 | API/Integration | Widerruf und Löschung betreffen nur die vorgesehenen Daten und Berechtigungen. | Teilweise | Zugriffswiderruf geprüft; vollständige Lösch-/Aufbewahrungs- und Übergabeprozesse offen |
| AC-29 | P1 | manuell/assistiv, E2E | Die Anwendung lässt sich bei vergrößerter Schrift, mit Tastatur und Screenreader durch zentrale Abläufe bedienen. | Teilweise | Sehr große Schrift und Kontrast visuell geprüft; Tastatur-/Screenreader-Audit offen |
| AC-30 | P0 | manuell/assistiv | Soforthilfe bleibt bei normalem Appfehler unmittelbar erreichbar, soweit der Gerätezustand dies zulässt. | Teilweise | Bewusster 112-Link in Notfall-, Fehler- und Offline-Ansicht; Fehlerkatalog nicht vollständig geprüft |
| AC-31 | P0 | API/Integration | Ein Wechsel der gepflegten Person kann keine Einträge versehentlich einem anderen Fall zuordnen. | Teilweise | Browser-Fallwechsel und serverseitige Fallrechte geprüft; vollständiger Mehrgerätefall offen |
| AC-32 | P0 | API/Integration | Wiederherstellung aus einem Backup wird tatsächlich getestet. | Teilweise | Vollständige SQLite-Sicherung/Wiederherstellung im Testadapter; produktives D1+R2-Backup offen |
| AC-33 | P1 | E2E | Beim ersten echten Login werden Rolle und persönliche Bedienpräferenzen geklärt; der Nutzer kann sich auch als gepflegte Person oder in beiden Rollen einrichten. | Teilweise | Alle Einstiegsschritte mit Rollenwahl im Demo-Browser geprüft; echte Anmeldung offen |
| AC-34 | P1 | E2E | Schriftgröße und Kontrast reagieren bereits im Einstieg; spätere Logins laden die persönlichen Einstellungen. | Teilweise | Sofortige Schrift-/Kontrastanpassung im Browser und API-Persistenz geprüft |
| AC-35 | P1 | API/Integration, E2E | Ein unterbrochener Einstieg wird fortgesetzt; die fertige Einrichtung erscheint nicht bei jedem Login erneut. | Teilweise | Einstiegsfortschritt wird gespeichert; Unterbrechung über echte erneute Anmeldung offen |
| AC-36 | P0 | API/Integration, E2E | Eine neue echte Einrichtung erzeugt keine erfundene Familie, Diagnosen oder Termine. | Bestanden (Adapter) | Erstes echtes API-Konto enthält keine erfundene Familie oder Gesundheitsdaten; TEST_RESULTS.json |
| AC-37 | P0 | API/Integration | Ein bestehendes Konto kann zwei Pflegekreisen beitreten, ohne Daten oder persönliche Einstellungen zu überschreiben. | Bestanden (Adapter) | Zweiter unabhängiger Pflegekreis erhält bestehenden Plan und persönliche Präferenzen; TEST_RESULTS.json |
| AC-38 | P0 | API/Integration, E2E | Zwei Pflegende sehen dieselben freigegebenen Daten einer gepflegten Person auf unterschiedlichen Geräten. | Teilweise | Zwei unabhängige API-Testidentitäten sehen freigegebenen Bericht; echte Geräteprüfung offen |
| AC-39 | P0 | API/Integration, E2E | Beim Wechsel zwischen zwei Pflegebedürftigen bleiben Dokumente, Medikamente, Termine und Rechte korrekt zugeordnet. | Teilweise | Demo-Wechsel Anna/Paul und API-Fallumfang geprüft; vollständiger Gerätetest offen |
| AC-40 | P1 | API/Integration | Die Wochenabfrage erzeugt pro relevanter Woche und Empfänger die vorgesehene Zahl an Erinnerungen; keine Antwort bleibt von bestätigter Verfügbarkeit unterscheidbar. | Bestanden (Adapter) | Wiederholte Wochenjobläufe erzeugen keine doppelten Deduplizierungsschlüssel; TEST_RESULTS.json |
| AC-41 | P1 | Fachlogik | Ein konkretes Dienstag-Zeitfenster erlaubt keine Verteilung einer außerhalb liegenden Aufgabe. | Bestanden (Adapter) | Außerhalb liegendes Zeitfenster wird nicht als verfügbar vorgeschlagen; TEST_RESULTS.json |
| AC-42 | P1 | Fachlogik | Wochenwiederholung, Ausnahmen und Abwesenheit werden vor Vorschlägen berücksichtigt. | Bestanden (Adapter) | Wocheninstanzen mit lokaler Uhrzeit, Abwesenheit und Belegung geprüft; TEST_RESULTS.json |
| AC-43 | P0 | Fachlogik | Fallübergreifende Doppelbelegung wird erkannt, ohne private Falldaten offenzulegen. | Bestanden (Adapter) | Fallübergreifender Konflikt mit neutraler Meldung ohne fremden Falltitel; TEST_RESULTS.json |
| AC-44 | P1 | Fachlogik | Termin und verknüpfte Begleitaufgabe werden im Zeitcontrolling nicht als zwei unabhängige Einsätze doppelt gezählt. | Teilweise | Zeitbilanz zählt Aufgabenfenster zusammen und keine Termine zusätzlich; komplexe Verknüpfungen offen |
| AC-45 | P1 | Fachlogik | Vergangene unerledigte Aufgaben gelten im Wochenbericht nicht automatisch als geleistete Pflegezeit. | Teilweise | Ist-Zeit nur aus als erledigt dokumentierten Aufgaben; vollständiger Wochenberichts-Grenzfalltest offen |
| AC-46 | P0 | Fachlogik, E2E | Die Arzt-Nachbereitung wird nach geplantem oder bestätigtem Ende für die richtige Begleitperson bereitgestellt, ohne einen erfolgten Besuch vorzutäuschen. | Teilweise | Persönlicher Fälligkeitsjob und Bericht im Browser geprüft; gesamter Endzeit-/Begleitwechselkatalog offen |
| AC-47 | P0 | API/Integration | Bei geschlossener App entsteht der Nachbereitungseintrag trotzdem serverseitig und ist beim nächsten Login sichtbar. | Teilweise | Writer arbeitet ohne Browser in API-Test; produktiver Writer-Aufruf separat dokumentiert, fällige produktive Testzustellung offen |
| AC-48 | P0 | API/Integration | Geänderte Begleitung oder Terminverschiebung aktualisiert die zukünftige Erinnerung; der alte Empfänger erhält keine veraltete Aufgabe. | Teilweise | Terminverschiebung getestet; vollständiger Wechsel der Begleitung über echte Konten offen |
| AC-49 | P0 | Fachlogik | Abgesagte Arzttermine erzeugen keine Ergebnisaufforderung und keine falschen Tagebucheinträge. | Bestanden (Adapter) | Abgesagter Termin erzeugt weder Job noch Nachbereitungshinweis; TEST_RESULTS.json |
| AC-50 | P0 | Fachlogik | Wiederholte Jobs und mehrere Geräte erzeugen keine doppelten Nachbereitungsaufforderungen. | Bestanden (Adapter) | Mehrfacher Joblauf erzeugt nur einen Hinweis; TEST_RESULTS.json |
| AC-51 | P1 | API/Integration, E2E | „Später erinnern“ bleibt über Neuladen und Gerätewechsel erhalten; „noch beim Termin“ passt die Wiedervorlage nachvollziehbar an. | Teilweise | Snooze als dauerhafter zukünftiger Job geprüft; echter Gerätewechsel offen |
| AC-52 | P1 | API/Integration, E2E | Mehrere offene Nachbereitungen lassen sich ohne blockierende Pop-up-Kette bearbeiten. | Teilweise | Keine Pop-up-Kette; Berichte über Terminliste zugänglich; Mehrfachfall nicht vollständig browsergeprüft |
| AC-53 | P0 | API/Integration, E2E | Arztbericht, mehrere Anhänge und Folgeaufgaben bleiben mit dem richtigen Termin und Pflegefall verknüpft. | Teilweise | Berichts-/Fallzuordnung und privater Anhang geprüft; mehrere Dateien plus Folgetermin nicht vollständig E2E-geprüft |
| AC-54 | P0 | API/Integration | Eine veröffentlichte Nachbereitung ist für berechtigte Mitglieder sichtbar; Entwürfe und nicht freigegebene Dateien bleiben geschützt. | Bestanden (Adapter) | Privater Entwurf/Anhang verborgen, veröffentlichter Bericht sichtbar; TEST_RESULTS.json |
| AC-55 | P0 | API/Integration | Ein fehlgeschlagener oder noch zu prüfender Upload wird nicht als vollständig verfügbar angezeigt und lässt sich passend fortsetzen. | Teilweise | Formatfehler und Entwurfsrechte geprüft; Quarantäne/Scanner und vollständige Upload-Wiederaufnahme offen |
| AC-56 | P0 | Fachlogik | Ein berichteter Medikamentenwechsel ändert nicht automatisch den aktiven Medikationsplan. | Teilweise | Medikamentenänderung als Berichtsfeld ohne Planmutation umgesetzt; vollständiger klinischer Abgleichprozess offen |
| AC-57 | P0 | Fachlogik | Ein neuer Arzttermin ohne bekannte Uhrzeit enthält keine erfundene Standardzeit. | Bestanden (Adapter) | Datums-Termin bleibt ohne Startzeit und ohne erfundenen Job; TEST_RESULTS.json |
| AC-58 | P1 | manuell/assistiv | SVG-Logoassets enthalten echte Vektorpfade, keine eingebetteten Rasterbilder und keinen Hintergrund; Negativräume sind transparent. | Bestanden (Adapter) | Echte SVG-Pfade ohne eingebettete Rasterbilder; visuelle Assetprüfung; TEST_RESULTS.json |
| AC-59 | P1 | manuell/assistiv, E2E | Orange-Beige-Design, Fokuszustände, Kontrastmodus, Druckansicht und PWA-Branding sind konsistent; die alte grüne Markenführung ist ersetzt. | Teilweise | Orange/Beige, Vektorlogo und 390px-Ansicht geprüft; Druck-/PWA-Installation/Audit offen |
| AC-60 | P1 | manuell/assistiv, E2E | Zentrale Abläufe funktionieren mit einfacher Ansicht und großer Schrift ebenso wie im erweiterten Zeitraster; Logo und Assistenzbutton verdecken keine Aktionen. | Teilweise | Sehr große Schrift, Kontrast und einfache Ansicht am Desktop geprüft; assistive Tests und vollständige schmale Reflow-Prüfung offen |

## Zusätzliche Querschnittsprüfungen

- Zwei unabhängige Konten und mindestens zwei Pflegefälle verwenden; keine bloßen UI-Rollenumschaltungen als Rechteprüfung zählen.
- Verweigerten Zugriff direkt an API, Dateiabruf, Suchergebnis, Benachrichtigung, Export und Assistent prüfen.
- Für Zustandswechsel Version und Autor vor/nach dem Vorgang festhalten; Wiederholungs- und Konkurrenzaufrufe ausführen.
- Zeitabhängige Prüfungen mit kontrollierter Uhr sowie Europe/Berlin, Tagesgrenze und Sommerzeitwechsel durchführen.
- Bei Hintergrundaufgaben offene und geschlossene Browser sowie Wiederholungsversuche und Abbruch/Neuplanung unterscheiden.
- Für Uploads mindestens falsche Dateisignatur, große Datei, nicht erlaubten Typ, Verbindungsabbruch, fremden Pflegefall und Widerruf testen.
- Mobile Betriebssysteme, Screenreader, reine Tastatur und hohe Textvergrößerung separat protokollieren.
- Bei nicht verfügbaren externen Integrationen oder fachlichen Freigaben Status **blockiert** mit konkreter Voraussetzung dokumentieren; nicht als bestanden markieren.

## Ergebnisprotokoll je Prüfung

Prüfer / Datum / Commit / Umgebung / Testdaten / Vorbedingung / Schritte / Soll / Ist / Evidenz / Fehler-ID / Wiederholungsprüfung.

## Zulässige Statuswerte

Nicht ausgeführt · Bestanden mit Evidenz · Fehlgeschlagen · Blockiert · Teilweise geprüft. Eine nicht implementierte Anforderung ist nicht bestanden.
