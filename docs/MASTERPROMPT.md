# Masterprompt Version 2: NOVALIS – Pflege gemeinsam gestalten

Stand: 29. Oktober 2026. Version 2 berücksichtigt die ZIP pflege-app-prototyp-main.zip sowie beide angehängten Logo-Referenzen. Referenzoberfläche: https://pflege-app-prototyp.vercel.app/

Die Bestandsaufnahme berücksichtigt die sichtbare Weboberfläche und eine statische Prüfung zentraler Quelldateien der bereitgestellten ZIP. Ein vollständiger Laufzeit-, Backend-, Sicherheits- oder Zertifizierungsaudit wurde damit nicht durchgeführt. Die nachfolgenden Anforderungen sind ein konkreter Entwicklungsauftrag. Technische Produktvorgaben sind nicht automatisch gesetzliche Einzelpflichten. Eine spätere DiPA-Aufnahme oder Medizinproduktekonformität wird durch diesen Prompt nicht zugesichert.

---

## Beginn des kopierbaren Entwicklungs-Prompts

Du übernimmst die Verantwortung als Senior Full-Stack-Entwickler, Softwarearchitekt und Produktdesigner mit Erfahrung in barrierefreien Anwendungen für häusliche Pflege. Arbeite mit der Perspektive einer pflegenden Angehörigen, einer pflegebedürftigen Person und einer ambulanten Pflegefachperson. Medizinische Inhalte und regulatorische Entscheidungen benötigen zusätzlich geeignete Fachverantwortliche; erfinde keine fachliche Freigabe.

Entwickle die bestehende Anwendung unter https://pflege-app-prototyp.vercel.app/ zu einer erheblich besseren, zusammenhängenden und zuverlässig nutzbaren Familien-Pflege-App weiter. Verwende entsprechend der beigefügten Wortmarke NOVALIS als Arbeitstitel; FamilienPflege ist der bisherige Projektname. Eine rechtliche Verfügbarkeit des Namens wird dadurch nicht behauptet. Erhalte sinnvolle Funktionen und vorhandene Daten, überarbeite aber Informationsarchitektur, Gestaltung, Abläufe, Datenmodell und technische Umsetzung dort grundlegend, wo es dem Produkt dient.

Ziel ist eine App für den häuslichen Pflegealltag, die Pflegebedürftige unterstützt, Angehörige konkret entlastet und auf eine mögliche spätere Aufnahme in das deutsche DiPA-Verzeichnis vorbereitet wird. Die Anwendung soll übersichtlich wirken, obwohl sie fachlich und technisch anspruchsvoll ist.

Die Quellcodegrundlage liegt bereits in der angehängten ZIP `pflege-app-prototyp-main.zip` vor. Entpacke sie, prüfe die Dateien und arbeite konkret an diesem Projekt weiter. Fordere nicht erneut pauschal den Quellcode an. Nutze die Website nur ergänzend. Liefere eine grundlegend überarbeitete, funktionierende Implementierung und die notwendigen technischen Unterlagen. Bleibe nicht bei einer Designbeschreibung, einer Farbänderung oder einer Sammlung neuer Screens stehen.

Die weiteren Anhänge sind `image(10).png` mit der horizontalen NOVALIS-Wortmarke und `Orangefarbenes Pflanzen-App-Symbol auf Creme(1).png` mit dem groß dargestellten Emblem. Nutze sie gemeinsam als verbindliche Form- und Stilreferenz. Das gewünschte Vektorformat heißt SVG. Erzeuge hochwertige echte Vektorpfade und transparente Logoassets; die beige App-Icon-Kachel der Vorlage gehört nicht in das freigestellte Logo.

Diese aktualisierten Vorgaben haben Vorrang vor widersprechenden älteren Vorgaben: Orange, Hellorange, Beige und zurückhaltende Sonnenuntergangsverläufe ersetzen das bisherige grüne Design; persönliche Einrichtung erfolgt beim ersten echten Login; mehrere Pflegende können mehrere Pflegebedürftige unterstützen; Arzttermine erhalten einen vollständigen automatisierten Nachbereitungsprozess; Wochenplanung und Zeitmanagement werden zentrale Funktionen. Alle weiteren sinnvollen Anforderungen bleiben erhalten.

### 1. Denke vom Pflegealltag aus

Die wichtigste Nutzerin ist beispielsweise Christina: Sie arbeitet, organisiert Termine, kümmert sich um ihre Mutter und muss sich ständig merken, wer bereits welche Aufgabe übernommen hat. Abends möchte sie in wenigen Sekunden verstehen, was noch offen ist. Ihr Bruder Markus soll zuverlässig helfen können, ohne zuerst mehrere Chatverläufe zu lesen. Anna, die gepflegt wird, möchte weiterhin selbst entscheiden, eigene Aufgaben erledigen und nicht nur verwaltet werden.

Entwirf ebenso für allein pflegende Partner, erwachsene Kinder mit großer Entfernung, Familien mit mehreren Pflegebedürftigen und Menschen ohne digitale Erfahrung. Pflege betrifft auch jüngere Erwachsene mit Behinderungen oder chronischen Einschränkungen. Verwende deshalb keine ausschließlich auf ältere Mütter zugeschnittene Produktlogik.

Die App muss insbesondere diese Fragen schnell beantworten:

- Was ist heute wichtig und was kann warten?
- Was wurde tatsächlich erledigt und von wem?
- Was ist noch nicht bestätigt?
- Wer kann helfen, wenn ich ausfalle?
- Welche Veränderungen sollte ich beim nächsten Fachkontakt ansprechen?
- Wie kann ich die gepflegte Person unterstützen, ohne ihre Selbstständigkeit einzuschränken?
- Welcher konkrete Schritt entlastet mich diese Woche?

Vermeide Schuldgefühle, Wettbewerb unter Angehörigen und den Eindruck dauernder Überwachung. Eine geringe Zahl dokumentierter Aufgaben ist kein Beweis für geringe Unterstützung. Berücksichtige emotionale Arbeit, Wegezeiten, Nachtbereitschaft und unterschiedliche Möglichkeiten zur Mithilfe.

### 2. Arbeite gezielt am tatsächlich gelieferten Quellcode

Die ZIP enthält eine React-/TypeScript-Anwendung mit Vite, Tailwind und PWA-Konfiguration. Es existieren ein eigener Hash-Router, ein lokaler Store und eine optionale Assistenten-API. Die Hauptdaten sind browserlokal; ein echtes Konten-, Pflegefall- und Synchronisationsbackend ist in dieser Grundlage nicht umgesetzt. Behandle die Zustandsumschaltung zwischen Demofiguren nicht als Authentifizierung.

Berücksichtige die folgenden konkreten Einstiegspunkte:

| Datei oder Bereich | Befund und Entwicklungsauftrag |
|---|---|
| `src/App.tsx` | Auf 480 Pixel begrenzte Container und feste Navigation grundlegend zu einem responsiven App-Rahmen umbauen; bestehende Fachfunktionen integriert erhalten. |
| `tailwind.config.js`, `src/index.css` | Salbeigrüne Tokens, Buttons, Fokusrahmen und Kontrastmodus durch ein konsistentes warmes Designsystem ersetzen. |
| `src/components/Onboarding.tsx` | Es gibt bereits vier Einrichtungsschritte; auch die Einrichtung außerhalb der Demo startet mit `createDemoState()`. Echte persönliche Einrichtung, eigene Daten und die Rolle der gepflegten Person ergänzen. |
| `src/components/Tour.tsx` | Die zusätzliche neun Schritte lange Tour vom verpflichtenden ersten Einstieg trennen und in kurze kontextbezogene Hilfen überführen. |
| `src/components/ArztNachbereitung.tsx` | Nachbereitung existiert bereits: bisher Terminbeginn plus 60 Minuten, Nachfrage bei geöffneter App, Freitext und Medikationsänderungsfrage. Zu persistentem Prozess mit geplantem oder bestätigtem Ende, adressierter Erinnerung, Uploads und Folgeaufgaben ausbauen. |
| `src/types.ts` | `Appointment` hat bisher Datum, Startzeit, Begleitung und ein kleines Ergebnisobjekt, aber kein vollständiges Zeitfenster-, Dokumenten- oder Nachbereitungsmodell. Viele Daten sind global statt pro Pflegefall. |
| `src/planning.ts`, `src/views/Familie.tsx` | Verfügbarkeit ist bisher im Wesentlichen eine Liste von Wochentagen. Konkrete Zeitfenster, Wochenrückmeldungen, Ausnahmen, Kapazität und fallübergreifende Konflikte ergänzen. |
| `src/views/Dienstplan.tsx` | Aufgaben haben keine belastbare Dauer- und Zeitfensterplanung. Die Verteilungsübersicht zählt teilweise vergangene zugewiesene Aufgaben auch ohne Erledigungsnachweis. Geplant, angenommen und tatsächlich erledigt konsequent trennen. |
| `src/views/Dienstplan.tsx`, Funktion `Absent` | Der bestehende Ausfallablauf schreibt Zuständigkeiten bereits um, obwohl der Text von angefragter Vertretung spricht. Anfrage und angenommene Übernahme als getrennte Zustände implementieren. |
| `src/store.tsx` | `notifyFamily()` erzeugt bisher lokale Hinweise und einen Toast. Echte benutzerbezogene Benachrichtigungen, dauerhafte Speicherung, Rechte und Synchronisation entwickeln; Speicherfehler nicht still übergehen. |
| `src/types.ts`, `src/store.tsx` | `activePerson` ersetzt bisher den Ansichtswechsel. Kontoidentität, gepflegte Person, Mitgliedschaft und Rollen je Pflegefall voneinander trennen. |
| `src/demoData.ts`, `src/store.tsx` | Zustandsversionen werden bisher nicht umfassend migriert. Bestehende Daten kontrolliert zuordnen und migrieren, statt sie bei Versionswechsel still zu verwerfen. |
| `src/assistant.ts`, `api/assistant.ts`, `src/components/Voice.tsx` | Optionale KI-Anbindung und Sprachabläufe sind vorhanden. Der Client-Schalter `AI_FEATURE = false` schützt eine Serverroute nicht. Vor Aktivierung serverseitige Identität, Rechte, Kontextbegrenzung, Missbrauchsschutz und Datenverarbeitung prüfen. Keine echten Pflegedaten zum Test versenden. |
| `src/fhir.ts`, `src/views/Export.tsx` | Bestehende vereinfachte Exporte erhalten und fachlich sowie technisch sauber weiterentwickeln. |
| `public/icon.svg`, `index.html`, `vite.config.ts` | Branding, PWA-Manifest, Icons und Themefarben auf NOVALIS umstellen; Plattformanforderungen und sichere Aktualisierung berücksichtigen. |

Korrigiere außerdem die bereits beschriebenen Probleme der Tagespriorisierung, vergangener „nächster“ Termine, Medikamentenkorrekturen und nicht ausreichend geklärter Belastungsinstrumente. Erstelle eine Bestandsmatrix mit Befund, geplanter Änderung, Risiko und Abnahmeprüfung. Kennzeichne, was im Code nachgewiesen und was noch zu testen ist.

Die Neugestaltung soll erkennbar grundlegend sein: neuer responsiver App-Rahmen, neuer persönlicher Einstieg, neue Pflegefallstruktur, neue Zeitplanung, zusammenhängende Arzttermin-Nachbereitung und echte dokumentenbezogene Zusammenarbeit. Erhalte dabei sinnvolle Fachlogik, statt die Anwendung durch eine rein dekorative Startseite zu ersetzen.

### 3. Definiere einen tragfähigen DiPA-Kern

Arbeite mit einer präzisen Zweckbestimmung. Ausgangsvorschlag, fachlich und regulatorisch zu prüfen:

„NOVALIS unterstützt erwachsene pflegende Angehörige bei der häuslichen Versorgung pflegebedürftiger Personen durch ein strukturiertes Pflege- und Entlastungsprogramm. Die Anwendung hilft, konkrete Pflegeprobleme zu erkennen, passende alltagsbezogene Maßnahmen umzusetzen, Unterstützung verbindlich einzubinden und den Verlauf zu reflektieren. Ziel sind eine geringere Belastung der Angehörigen und eine stabilere häusliche Versorgung.“

Seit 1. Juli 2026 ist die Entlastung pflegender Angehöriger beziehungsweise die Stabilisierung häuslicher Versorgung ausdrücklich in den DiPA-Rahmen einbezogen. Allgemeine Lebensorganisation, bloße Information oder Kommunikation sowie die Arbeitsorganisation von Pflegediensten sind jedoch gesetzlich abgegrenzt. Leite deshalb nicht aus Kalender, Chat oder Wissensbibliothek allein eine Erstattungsfähigkeit ab. Prüfe den konkreten Produktzweck anhand von § 40a SGB XI und § 9 DiPAV. [Q1, Q2, Q3]

Baue den zentralen Ablauf als wiederkehrenden Unterstützungsprozess:

1. Eine aktuelle Schwierigkeit auswählen, beispielsweise nächtliche Belastung, unsichere Aufgabenteilung oder Überforderung bei der Alltagsbegleitung.
2. Die Situation mit wenigen verständlichen Fragen erfassen.
3. Ein realistisches Ziel gemeinsam festlegen.
4. Aus fachlich freigegebenen Maßnahmen einen kleinen Plan auswählen.
5. Den Plan im Alltag umsetzen und bei Bedarf Unterstützung einbinden.
6. Nach einem vereinbarten Zeitraum prüfen, was geholfen hat.
7. Den Plan anpassen oder einen geeigneten Fachkontakt vorschlagen.

Beispiel: Christina plant für zwei Wochen einen freien Nachmittag, organisiert eine bestätigte Vertretung und erhält eine kurze Anleitung für eine verständliche Übergabe. Die App fragt anschließend nach der tatsächlichen Entlastung. Dies ist eine zu prüfende Wirkungshypothese, kein bereits belegter Behandlungseffekt.

Grenze die erste Zielgruppe für die Nutzenprüfung enger ein als die gesamte Bevölkerung. Dokumentiere Einschlusskriterien, Ausschlusskriterien, vorausgesetzte Fähigkeiten, Grenzen und erforderliche Unterstützung. Priorisiere einen belastbaren Hauptnutzen vor einer Vielzahl unbewiesener Versprechen.

### 4. Entwickle eine klare Navigation

Nutze auf Smartphones fünf Hauptbereiche:

- Heute: die persönliche Tagesübersicht.
- Plan: Aufgaben, Termine, Verfügbarkeiten und Vertretungen.
- Gesundheit: Medikamente, Beobachtungen, Messwerte und relevante Dokumente.
- Entlastung: der persönliche Unterstützungsbereich mit Zielen, Maßnahmen und optionalen Checks.
- Mehr: Familie, Notfallmappe, Wissen, Leistungen, Einstellungen und Hilfe.

Der Pflegekreis muss zusätzlich direkt über einen gut sichtbaren Zugang erreichbar sein. Zeige oben stets, zu welcher gepflegten Person die aktuellen Inhalte gehören. Der Wechsel zwischen mehreren Pflegebedürftigen darf nicht mit einem Wechsel des angemeldeten Kontos verwechselt werden.

Verwende echte Routen und sinnvolle Detailseiten. Browser-Zurück, direkte Links, Wiederherstellung nach Neuladen und verständliche Seitentitel müssen funktionieren. Halte den Navigationszustand nachvollziehbar. Verstecke wichtige Standardaktionen nicht ausschließlich hinter langen Wischgesten oder einem Sprachassistenten.

### 5. Gestalte NOVALIS mit Orange, Beige und Sonnenuntergangsfarben

Ersetze das bisherige grüne Marken- und Oberflächendesign vollständig. Keine salbeigrünen Hauptbuttons, grünen aktiven Tabs, grünen Fokusrahmen oder grüne Willkommensgrafik. Verwende warme Orange-, Apricot-, Terrakotta-, Sand- und Beigetöne. Ein Status benötigt nicht zwingend Grün; Status werden mit Text und eindeutigen Symbolen verständlich.

Entwickle ein hochwertiges Designsystem. Mögliche Startwerte, deren tatsächlich verwendete Kombinationen du prüfst:

| Verwendung | Ausgangswert |
|---|---|
| Hintergrund, warmes Beige | `#F7F0E6` |
| Karten, Elfenbein | `#FFFCF7` |
| Helle orange Fläche | `#FFE1C3` |
| Markenorange, dekorativer Akzent | `#F47932` |
| Dunkles Terrakotta, mögliche primäre Aktion | `#A94418` |
| Apricot und Gold für dezente Verläufe | `#F4BD77` |
| Warmes Korall für dezente Verläufe | `#ED9376` |
| Haupttext, Espresso | `#3E2A22` |
| Sekundärtext | `#715B4A` |
| Dezente Trennlinien | `#DAC8B4` |

Nutze Sonnenuntergangsverläufe gezielt im Willkommen, auf kleinen Markenflächen und gegebenenfalls in einer ruhigen Startseitenkarte. Die App bleibt überwiegend beige und klar. Lange Texte, Dokumente, Medikationspläne und Kalender benötigen ruhige Flächen. Auf hellorangefarbenen Buttons steht dunkler Text; weiße Schrift ist nur bei nachgewiesen ausreichendem Kontrast zulässig. Das Markenorange darf nicht jede Warnung wie einen Normalzustand aussehen lassen. Dringlichkeit wird zusätzlich über Symbol, Überschrift und Text differenziert.

Gestalte eine professionelle mobile App mit klarer Typografie, konsistenten Icons, großzügigen Touchflächen und zurückhaltenden Schatten. Keine überladenen Verläufe, wechselnden Emoji-Stile, austauschbaren Dashboard-Kacheln oder dekorativen Erfolgszahlen. Nutze auf Desktop eine Seitenleiste und angemessene Inhaltsbreite; plane für Smartphone, Tablet und Desktop eigenständig sinnvolle Ansichten.

Das Logo ist die stilisierte orange Pflanzen- beziehungsweise Personenform aus den Anhängen. Rekonstruiere es sauber als echtes SVG mit Vektorpfaden und bei Bedarf skalierbaren SVG-Verläufen. Die zentralen Negativräume, die runde Aussparung, Symmetrie und Proportionen sind zu erhalten. Kein in SVG eingebettetes PNG, kein Base64-Bild und kein bloß umbenanntes Rasterbild. Die mitgelieferten PNGs werden dadurch nicht nachträglich zu Original-Vektordateien; dokumentiere die Rekonstruktion und prüfe die Formtreue visuell.

Liefere mindestens ein transparentes Emblem, eine transparente horizontale Wortmarke mit NOVALIS und eine einfarbige Variante. Entferne aus diesen Logoassets Creme-Kachel, Hintergrund, Mockup-Schatten, Ränder und Freistellungsreste vollständig. Der ausgesparte Kreis und die Zwischenräume sollen tatsächlich transparent sein. Schneide keine Blattspitzen ab. Nutze präzise Pfade, passende `viewBox` und keine unnötigen Filter, die bei kleinen Größen unscharf werden.

Vorgesehene neue Assets sind beispielsweise `public/brand/novalis-symbol.svg`, `public/brand/novalis-wordmark.svg` und `public/brand/novalis-symbol-mono.svg`. Erzeuge zusätzlich benötigte PNG-Größen aus der Vektorbasis. Das eigentliche Logo bleibt transparent; nur plattformspezifische App-Icons dürfen eine bewusst erzeugte beige Hintergrundfläche mit korrekter Sicherheitszone erhalten. Prüfe das Emblem bei kleinen Icongrößen und stark vergrößert. Verwende keine fremden Logos oder ungeklärten Schriften.

Integriere das Branding konsistent in ersten Einstieg, App-Kopf, Anmeldung, Ladezustand, PWA-Manifest und geeignete Druckausgaben. Das Logo soll Orientierung geben, ohne auf jeder Fachseite den halben Bildschirm einzunehmen. Beschrifte bedeutungstragende Bilder zugänglich und blende rein dekorative Wiederholungen für Screenreader aus.

Respektiere reduzierte Bewegung. Der Assistentenbutton darf keine Formulare, Aktionen oder Navigation verdecken. Qualität entsteht durch funktionierende Details, gute Lesbarkeit und konsistente Gestaltung.

### 6. Baue Barrierefreiheit in alle Abläufe ein

Setze WCAG 2.2 AA als Entwicklungsziel und prüfe zusätzlich die für die konkrete DiPA einschlägigen Anforderungen. Eine bestandene automatische Prüfung allein ist kein Nachweis vollständiger Barrierefreiheit. [Q6, Q11]

Produktvorgaben:

- Gut lesbare Basisschrift, auf dem Smartphone möglichst 17 bis 18 Pixel.
- Wichtige Touchflächen möglichst mindestens 48 mal 48 CSS-Pixel; dies ist unsere großzügigere Produktvorgabe.
- Textvergrößerung, hohe Vergrößerung und schmale Ansichten ohne Verlust zentraler Funktionen.
- Ausreichende Text- und Komponentenkontraste; Farbe nie als einziges Statusmerkmal.
- Vollständige Tastaturbedienung, sichtbarer Fokus und logische Fokusreihenfolge.
- Korrekte Labels, Überschriften und verständliche Screenreader-Ausgaben.
- Dialoge mit sauberem Fokusmanagement und Rückkehr zum auslösenden Element.
- Fehler an der richtigen Eingabe erklären, bereits erfasste Angaben erhalten.
- Kalender auch als zugängliche Terminliste anbieten.
- Schriftgröße und Kontrast individuell einstellbar, ohne personenbezogene Informationen anderer Personen offenzulegen.
- Authentifizierung ohne unnötige Gedächtnisaufgaben; Passwortmanager und Einfügen unterstützen.
- Kurze Sätze, verständliche Begriffe und eine schrittweise Darstellung komplexer Vorgänge.

Teste zusätzlich mit Menschen, die wenig digitale Erfahrung, eingeschränkte Feinmotorik, Sehbeeinträchtigungen oder hohe aktuelle Belastung haben. Bezeichne verständliche Alltagssprache nicht ohne entsprechende Aufbereitung als zertifizierte Leichte Sprache.

### 7. Kläre persönliche Anforderungen beim allerersten Login

Dieser Ablauf ist verbindlich: Beim ersten echten Login oder bei der ersten Registrierung mit Einladung muss geklärt werden, wer die Person ist, welche Rolle sie in welchem Pflegefall übernimmt und wie sie die App bedienen möchte. Eine spätere optionale Einstellung ersetzt diese Ersteinrichtung nicht. Die Einrichtung wird pro Konto gespeichert, ist unterbrechbar und wird nach einem normalen erneuten Login nicht jedes Mal wiederholt.

Schon auf der ersten Einstiegsseite müssen Schriftgröße und wichtige Bedienhilfen erreichbar sein. Menschen sollen sich nicht erst durch schlecht lesbare Formulare arbeiten müssen, bevor sie die Schrift vergrößern können.

Gliedere den Einstieg in wenige kurze, verständliche Abschnitte mit Fortschritt, Zurück und fortsetzbaren Entwürfen:

1. **Lesen und Bedienen:** normale, große oder sehr große Schrift mit sofortiger Vorschau; Kontrastbedarf; größere Bedienelemente; reduzierte Bewegung und Orientierung an unterstützten Systemeinstellungen. Biete ein einfaches Layout an. Frage keine unnötigen Gesundheitsdiagnosen ab, um eine Schriftpräferenz festzulegen.
2. **Meine Nutzung:** Ich werde unterstützt; ich pflege oder helfe; beides; gegebenenfalls eingebundene Fachperson. Dieselbe Person kann in einem Pflegefall Unterstützung benötigen und in einem anderen selbst helfen. Eine ausgewählte Rolle erteilt noch keine ungeprüften Zugriffsrechte.
3. **Unser Pflegekreis:** bestehenden Kreis über Einladung verknüpfen oder neuen anlegen; eine oder mehrere gepflegte Personen zuordnen. Erfrage nur notwendige Stammdaten und Berechtigungsgrundlagen. „Pflegegrad unbekannt“, „noch nicht beantragt“ und „möchte ich später ergänzen“ müssen als ehrliche Zustände möglich sein; daraus folgt keine automatische Aussage zur Erstattungsberechtigung.
4. **Meine Oberfläche und Unterstützung:** einfache oder ausführlichere Ansicht, gewünschte Startansicht, Anrede, relevante Module und Benachrichtigungspräferenzen. Biete bei Bedarf einen verständlichen Hinweis auf spätere Sprach- beziehungsweise KI-Unterstützung. Dafür müssen weder Mikrofonzugriff noch KI-Datenverarbeitung erzwungen werden.
5. **Mein erster gemeinsamer Plan:** wichtigste Aufgabe oder nächster Termin, ein erstes Zeitfenster für Hilfe und die nötigen Einwilligungen. Eine allein pflegende Person kann ohne weitere Mitglieder sinnvoll starten.

Kritische Angaben wie Kontoidentität und erforderliche Einwilligung sind bewusst abzuschließen. Freiwillige Details bleiben überspringbar. Speichere `onboardingStatus`, Version und abgeschlossene Schritte pro Nutzer; Einstellungen gehören nicht global zur Demofamilie. Neue wesentliche Fragen können später gezielt ergänzt werden, ohne den ganzen Einstieg erneut zu erzwingen.

Schrift und Oberfläche müssen sofort reagieren und bei erneutem Login wieder verfügbar sein. Berücksichtige zugleich gerätespezifische Bedienbedürfnisse. Private Antwortdaten anderer Nutzer dürfen dadurch nicht sichtbar werden. Ein Wechsel der Schriftgröße darf nicht unbeabsichtigt sämtliche anderen Nutzer umstellen.

Eine Einladung führt direkt zum passenden Pflegekreis und berücksichtigt vorhandene Konten. Sie darf keinen fremden lokalen Zustand durch `createDemoState()` ersetzen. Neue echte Pflegekreise starten ohne erfundene Diagnosen, Termine und Familienmitglieder. Demo und echte Daten sind klar getrennt. Eine gepflegte Person erhält einen zu ihren Rechten und Wünschen passenden Einstieg.

Zeige die Einwilligung der gepflegten Person und gegebenenfalls wirksame Vertretungsbefugnis verständlich. Verwandtschaft allein reicht nicht als Vollzugriffsrecht. Speichere Einwilligungsstatus, Version und Zeitpunkt nachvollziehbar. Alle persönlichen Präferenzen bleiben später in den Einstellungen änderbar.

### 8. Baue Heute als Entscheidungshilfe für den Alltag

Die Startseite muss in etwa zehn Sekunden verständlich sein. Zeige in dieser Reihenfolge die aktuell wirklich wichtigen Informationen:

1. Ausgewählte gepflegte Person, Datum und Status der letzten Synchronisation.
2. Wenige priorisierte offene Punkte mit verständlicher Begründung.
3. Die als Nächstes tatsächlich anstehenden Aufgaben und dokumentationsbedürftigen Medikamententermine.
4. Den nächsten zukünftigen Termin beziehungsweise einen gesondert als vergangen gekennzeichneten Termin.
5. Wichtige neue Beobachtungen seit der letzten Nutzung.
6. Einen kleinen, passenden Entlastungsschritt.

Jeder Eintrag enthält Zeitpunkt oder Zeitfenster, Verantwortlichkeit, Status und eine klare Hauptaktion. Unterscheide „nicht dokumentiert“ von „nicht erfolgt“. Erfinde keine beruhigende Gesamtbewertung aus fehlenden Einträgen.

Biete einen Schnellzugriff für Aufgabe, Termin, Beobachtung und Hilfeanfrage. Organisiere Hinweise nach Dringlichkeit und Relevanz; vermeide wiederkehrende Warnungen ohne neue Information. Zeige einen hilfreichen Leerzustand, wenn nichts ansteht. Ein veralteter Datenstand muss sichtbar bleiben, auch wenn die Oberfläche ansonsten normal aussieht.

### 9. Beteilige die gepflegte Person

Ergänze eine freiwillige vereinfachte Ansicht für die gepflegte Person. Sie zeigt bei vorhandener Berechtigung beispielsweise den Tagesplan, bestätigte Besuche, eigene Wünsche, vereinbarte Alltagsaktivitäten und wichtige Kontakte.

Ermögliche Antworten wie „Ich möchte heute früher Besuch“, „Bitte ruft mich an“ oder „Dabei möchte ich Unterstützung“. Der Eingang einer Hilfebitte muss nachvollziehbar sein; zeige nicht „Familie informiert“, bevor die technische Zustellung entsprechend belegt ist. Eine Kontaktbitte ist kein garantiert überwachter Notruf.

Die Person soll selbst erledigte Tätigkeiten dokumentieren können, wenn dies zu ihren Fähigkeiten und dem vereinbarten Versorgungskonzept passt. Kennzeichne Selbstauskunft, Eintrag eines Angehörigen und Eintrag einer Fachperson unterschiedlich. Eine Demenzerkrankung allein darf nicht pauschal zur Entziehung aller Mitsprache führen.

### 10. Mache Aufgaben und Vertretungen verbindlich

Unterstütze Erstellen, Bearbeiten, Wiederholen, Übernehmen, Anfragen, Ablehnen, Abschließen, Korrigieren und kontrolliertes Entfernen von Aufgaben. Erfasse Titel, Kategorie, Zeitpunkt oder Zeitfenster, Dauer nach Bedarf, verantwortliche Person und optionale Notiz. Die Pflichtmaske bleibt kurz; erweiterte Angaben sind einklappbar.

Unterscheide offen, angefragt, angenommen, in Bearbeitung, erledigt, ausgefallen und abgesagt. Pro Aufgabe gibt es eine klar erkennbare Hauptverantwortlichkeit; mehrere unterstützende Personen sind möglich. Eine Anfrage ist keine angenommene Zusage.

Beim gleichzeitigen Übernehmen durch zwei Personen darf nur eine verbindliche Zuweisung entstehen. Die zweite Person erhält eine verständliche Rückmeldung mit aktuellem Zustand. Wiederholungsregeln erlauben die Änderung eines Einzeltermins oder der künftigen Serie, ohne historische Einträge zu überschreiben.

Baue „Ich falle aus“ aus: Zeitraum wählen, betroffene Aufgaben prüfen, geeignete Vertretungen vorschlagen, Anfragen auslösen, Antworten abwarten und Versorgungslücken sichtbar halten. Berücksichtige Zeitfenster, selbst angegebene Verfügbarkeit und gegebenenfalls notwendige Einweisung. Die App überträgt medizinisch anspruchsvolle Tätigkeiten nicht automatisch an irgendeine verfügbare Person.

Eine angekündigte Vertretung ersetzt die bisherige Zuständigkeit erst entsprechend der vereinbarten Übergaberegel. Für kurzfristige Ausfälle muss sichtbar bleiben, welche Aufgabe noch keine Lösung hat. Zeige optional die geschätzte zeitliche Verteilung, aber keine Rangliste „beste Pflegeperson“.

### 11. Ergänze Wochenplanung, Zeitfenster und ein kleines Zeitcontrolling

Das Planungsmodul soll die konkrete Frage beantworten: „Wann kann ich nächste Woche für Person X da sein, wie lange, für welche Aufgabe und wer übernimmt die restlichen Aufgaben?“ Ein bloßer Haken bei Montag oder Donnerstag genügt nicht.

Unterstütze datumsspezifische Verfügbarkeiten mit Beginn, Ende, optionalem Wiederholungsmuster, Ausnahmen und freiwilliger Kapazitätsangabe. Beispiele: Dienstag 17 bis 19 Uhr für Einkauf und Besuch; Samstag 9 bis 12 Uhr für Begleitung; Mittwoch nachmittags nur eventuell. Unterscheide verfügbar, möglicherweise verfügbar, nicht verfügbar und noch nicht geantwortet. Keine Rückmeldung bedeutet nicht verfügbar bestätigt.

Eine Verfügbarkeit ist noch keine angenommene Aufgabe. Sie kann für einen bestimmten Pflegefall oder als allgemein verfügbare Hilfe angegeben werden. Die endgültige Zuordnung erfolgt über eine klare Anfrage oder bewusste Übernahme. Berücksichtige die Verfügbarkeit einer Person über alle ihre Pflegefälle, ohne Daten anderer Pflegekreise unberechtigt offenzulegen: Im aktuellen Kreis reicht gegebenenfalls „bereits belegt“.

Ergänze eine kleine wöchentliche Abfrage. Beispiel: Am Donnerstag wird einmalig gefragt, welche Unterstützung in der kommenden Kalenderwoche möglich ist. Zeitpunkt, Erinnerung und Ruhezeiten sind konfigurierbar. Die Antwort kann auf der üblichen Woche basieren und wird für konkrete Daten bestätigt. Zeige wer geantwortet hat, wer noch offen ist und wann die Angaben aktualisiert wurden. Vermeide tägliche Wiederholungen ohne Änderung.

Aufgaben erhalten bei Bedarf ein festes Zeitfenster oder einen flexibel innerhalb eines Bereichs planbaren Termin, geschätzte Dauer, geplanten Beginn und Ende, optionale Wegezeit beziehungsweise Puffer sowie tatsächlichen Abschluss. Beispiele: Einkauf irgendwann zwischen 15 und 18 Uhr, Aufwand 45 Minuten; Arztbegleitung 9 bis 11 Uhr inklusive Fahrt. Notwendige medizinische Zeitvorgaben stammen aus dem vereinbarten Plan und werden nicht nach organisatorischer Bequemlichkeit verschoben.

Die Wochenansicht besitzt eine leicht lesbare Agenda und auf größeren Geräten eine Zeitrasteransicht. Filter: meine Aufgaben, bestimmte gepflegte Person, gesamter berechtigter Pflegekreis, unbesetzt und angefragt. Optionales Verschieben per Drag-and-drop braucht immer eine gleichwertige Bedienung per Button und Formular.

Schlage passende Personen anhand von Zeitfenster, bestätigter Verfügbarkeit, Abwesenheit, Kapazität und erforderlicher Einweisung vor. Erkläre kurz, warum ein Vorschlag passt. Kein automatisches verbindliches Verteilen auf Grundlage einer vermuteten freien Zeit. Zeige Überlappungen, unrealistische Wegezeiten und offene Lücken vor dem Speichern.

Das kleine Zeitcontrolling ist eine unterstützende Wochenübersicht: geschätzter Bedarf, bestätigte Aufgaben, noch unbesetzte Aufgaben, angenommene geplante Zeit, freiwillig dokumentierte tatsächliche Zeit und Kapazität nach Selbstauskunft. Trenne diese Größen klar. Bezeichne eine Planerfüllung nicht als medizinische Versorgungsqualität oder als sicheren Nachweis ausreichender Pflege.

Berechne Minuten und Stunden aus strukturierten Zeitdaten. Eine vergangene Aufgabe gilt nicht automatisch als erledigt. „Nicht dokumentiert“ bleibt offen. Überlappende Zeitfenster, Kalendertermine mit verknüpfter Begleitaufgabe und gleichzeitig ausgeführte Tätigkeiten dürfen nicht mehrfach als zusätzliche verfügbare oder geleistete Zeit addiert werden. Definiere pro Anzeige die Berechnung, den Bezugszeitraum und den Umgang mit gleichzeitigen Tätigkeiten. Ermögliche Korrekturen mit nachvollziehbarer Historie.

Halte die Zeiterfassung freiwillig und einfach: geplanter Aufwand übernehmen, tatsächliche Dauer kurz korrigieren oder Angabe auslassen. Kein verpflichtender Timer für jede menschliche Begegnung. Nutze verständliche Balken und Listen, keine Rangliste und keine moralische Bewertung von Angehörigen. Optional kann ein sachlicher Wochenexport erstellt werden, ohne private Belastungsantworten offenzulegen.

Beispiel: Christina pflegt Anna und unterstützt zusätzlich ihren Vater. Markus kann Dienstag von 17 bis 19 Uhr, Lena Samstag von 9 bis 12 Uhr. Die App zeigt offene Hilfe, schlägt passende Fenster vor, lässt die Beteiligten verbindlich annehmen und macht eine Doppelbelegung von Christina über beide Pflegefälle sichtbar. Sie zeigt nicht die privaten Termine des Vaters im Pflegekreis von Anna.

### 12. Überarbeite die Medikamentendokumentation gründlich

Die App organisiert einen bestehenden fachlich vorgegebenen Medikationsplan. Sie darf nicht eigenständig Medikamente auswählen, Dosierungen verändern, Wechselwirkungen verlässlich ausschließen oder bei fehlenden Gaben eine Nachholdosis empfehlen.

Trenne vier Datenobjekte: Medikationsplan, geplante Einzelgabe, tatsächliche Dokumentation und Bestandsbewegung. Ein Medikamentendatensatz enthält unter anderem Name, Stärke, Darreichungsform, Einheit, Einnahmeweg, Zeiten, Gültigkeitsbeginn, gegebenenfalls Ende, Herkunft des Plans und Zeitpunkt der letzten Bestätigung. Unterstütze Einheiten wie Tablette, Milliliter, Tropfen und Hub, ohne sie automatisch gleichzusetzen.

Erfasse Stückzahl oder Menge pro Gabe strukturiert. Bedarfsmedikation und besondere Schemata benötigen einen eindeutig hinterlegten fachlichen Plan. Wenn dieser fehlt, darf die App keine eigene Regel ergänzen. Eine technische Eingabehilfe ist keine pharmazeutische Sicherheitsprüfung.

Nutze für Einzelgaben verständliche Zustände wie geplant, Dokumentation offen, als eingenommen bestätigt, als verabreicht dokumentiert, abgelehnt, nach vorgegebenem Plan ausgelassen oder unklar. Zeige geplanten und tatsächlich dokumentierten Zeitpunkt sowie Autor und Datenquelle. „Unklar“ darf nicht automatisch in „gegeben“ übergehen.

Schütze vor Doppelbestätigung: Prüfe den aktuellen Serverzustand vor der Speicherung, verwende eindeutige Gaben-IDs und idempotente Aktionen. Gleichzeitige Dokumentation und mehrere Offlinegeräte müssen als mögliche Konflikte berücksichtigt werden. Die App kann eine physische Doppelgabe nicht garantieren verhindern; sie muss die Unsicherheit sichtbar machen und darf keine neue Gabe empfehlen.

Eine Korrektur erfordert eine erkennbare Aktion, einen geeigneten Grund und einen unveränderlichen Bezug auf den ursprünglichen Eintrag. Kein stilles Löschen medizinisch relevanter Historie durch erneutes Antippen. Planänderungen gelten ab einem festgelegten Zeitpunkt und verändern keine bereits dokumentierten Gaben.

Bestandsberechnung berücksichtigt tatsächliche Abgänge, neue Packungen, Korrekturen und unbekannte Bestände. Die Angabe „reicht noch ungefähr vier Tage“ muss rechnerisch zur Menge und zum gültigen Plan passen. Bei unregelmäßiger Einnahme zeige eine Schätzung oder „nicht berechenbar“.

Ein Nachbestellablauf kann Bedarf erkannt, zuständig, angefragt, Rezept erhalten, abgeholt und Bestand ergänzt umfassen. Ohne echte Praxisintegration heißt die Aktion „Nachbestellung organisieren“; sie darf nicht den Versand eines Rezepts behaupten.

### 13. Entwickle ein brauchbares Pflege- und Beobachtungstagebuch

Behalte die schnelle Erfassung, ergänze aber strukturierte Angaben für Trinken, Essen, Schlaf, Stimmung, Mobilität, Schmerzen, Hautbeobachtungen, Ausscheidung, Stürze und sonstige Veränderungen. Module werden nur aktiviert, wenn sie für die jeweilige Versorgung relevant sind.

Erfasse Beobachtungszeit und Dokumentationszeit getrennt. Biete einfache passende Eingaben: beispielsweise Menge mit Einheit, Auswahl einer beschreibenden Kategorie und optionale Notiz. Eine Angabe wie „etwa drei Gläser“ ist keine exakte Milliliter-Messung ohne zusätzlich festgelegte Glasgröße.

Messwerte können bei Bedarf manuell dokumentiert werden. Zeige Einheit, Quelle und Messzeit, erlaube Korrekturen mit Verlauf und verhindere technische Einheitenverwechslungen. Verändere eine Rohangabe nicht stillschweigend. Individuelle Zielbereiche dürfen nur mit nachvollziehbarer fachlicher Grundlage hinterlegt werden.

Keine universellen Trinkziele, keine automatischen Insulindosen und keine pauschalen medizinischen Entwarnungen. Unterschiedliche Erkrankungen können unterschiedliche Anforderungen bedeuten. Die erste Version dient der Dokumentation und Gesprächsvorbereitung; medizinische Interpretation erfordert eine gesonderte Prüfung des Funktionsumfangs.

Ermögliche Suche, Filter nach Person, Zeitraum und Kategorie sowie einen verständlichen Verlauf. Eine Zusammenfassung muss auf die zugrunde liegenden Einträge verweisen. Zeige fehlende Daten offen und leite aus bloßer App-Nutzung keine Verbesserung des Gesundheitszustands ab.

### 14. Ergänze konkrete Pflegebausteine

Baue eine kleine, fachlich qualitätsgesicherte Bibliothek an alltagsbezogenen Unterstützungsprogrammen. Mögliche Themen sind sichere Alltagsgestaltung, Kommunikation bei kognitiven Einschränkungen, Vorbereitung einer Pflegeübergabe, Förderung vorhandener Selbstständigkeit und Entlastung bei wiederkehrenden Versorgungsschwierigkeiten.

Ein Baustein besteht aus Ausgangssituation, Ziel, Voraussetzungen, kurzer Anleitung, umsetzbarer Maßnahme, Dokumentation und Rückblick. Zeige Grenzen, erforderliche Hilfsmittel und den Punkt, an dem eine persönliche Einweisung nötig ist. Führe keine Transfer-, Hebe- oder Mobilisationsanleitung ein, die ohne entsprechende fachliche Prüfung gefährlich werden kann.

Ein Beispiel ist „Morgens weniger Stress“: Die Familie identifiziert ein Problem, vereinbart einen passenden Ablauf, lässt Anna selbst übernehmen, was sie übernehmen möchte und kann, und prüft später gemeinsam, ob der Ablauf geholfen hat.

Alle pflegebezogenen Inhalte brauchen verantwortliche Fachprüfung, Quellen, Version, Freigabedatum und Wiedervorlage. Eine Wissenssammlung ergänzt den wirksamen Prozess; sie ersetzt ihn nicht. Nutzer sollen kurze, passende Hilfen erhalten und nicht erst lange Artikel lesen müssen.

### 15. Gestalte Entlastung als geschützten persönlichen Bereich

Ermögliche einen freiwilligen kurzen Befindlichkeits-Check, persönliche Ziele, konkrete Entlastungsmaßnahmen und eine Verlaufssicht. Beispiele sind eine Aufgabe abgeben, einen Vertretungszeitraum vorbereiten, einen Beratungstermin organisieren oder feste Erholungszeit planen.

Verwende einen validierten Fragebogen nur mit geklärter Nutzungserlaubnis, korrektem Wortlaut, dokumentierter Version und fachlich korrekter Auswertung. Eine selbst formulierte Arbeitsfassung darf nicht als validierte HPS bezeichnet oder mit deren wissenschaftlichen Eigenschaften beworben werden. Übernimm keine geschützten Fragebogentexte ohne Rechteklärung.

Falls zunächst eigene Fragen verwendet werden, benenne sie als persönliche Selbsteinschätzung. Erfinde keine klinischen Grenzwerte, Risikowahrscheinlichkeiten oder Prozentverbesserungen. Halte unterschiedliche Instrumentversionen und unvollständige Antworten auseinander. Messzeitpunkte müssen zum Evaluationskonzept passen, ohne den persönlichen Unterstützungsbereich bis dahin zu sperren.

Ein Ergebnis muss einen verständlichen, passenden nächsten Schritt ermöglichen. Eine Empfehlung zum Delegieren führt zur konkreten Aufgabe oder Anfrage; eine Beratungsempfehlung ermöglicht die Organisation eines Kontakts. Vorgeschlagene Hilfen sind nicht bereits erledigte Entlastung.

Antworten und Ergebnisse gehören der jeweiligen Person. Sie sind standardmäßig für andere Familienmitglieder, Falladministratoren und Pflegedienste unsichtbar. Auch eine Ampelfarbe ist eine personenbezogene Information und benötigt eine gezielte, freiwillige Freigabe. Krisenunterstützung braucht gesonderte fachliche Prüfung und darf keine automatisierte Diagnose darstellen.

### 16. Unterstütze mehrere Pflegende und mehrere Pflegebedürftige

Modelliere ausdrücklich eine Viele-zu-viele-Struktur: mehrere Konten unterstützen eine gepflegte Person; ein Konto kann mehrere gepflegte Personen unterstützen; mehrere Pflegebedürftige können einem Haushalt angehören, benötigen aber jeweils eindeutig zugeordnete Gesundheitsdaten und Berechtigungen. Die gepflegte Person kann mit eigenem Konto teilnehmen oder zunächst als Profil mit geeigneter Vertretung angelegt werden.

Trenne `UserAccount`, `UserPreferences`, `CareCircle`, `CareRecipient`, `Membership` und fallbezogene Berechtigungen. Ein Konto hat nicht automatisch dieselbe Rolle in allen Fällen. Der angemeldete Nutzer ist nicht die gerade betrachtete gepflegte Person. Ein Profilwechsel ist kein Kontowechsel und darf keine neue Berechtigung erteilen.

Jeder Termin, Medikationsplan, Tagebucheintrag, Pflegebaustein, Dokumentensatz und jede fallbezogene Aufgabe besitzt eine eindeutige Pflegefallzuordnung. Objekte können in einer berechtigten persönlichen Übersicht über mehrere Fälle aggregiert werden, ohne medizinische Details zwischen Kreisen zu vermischen. Eine gemeinsame Haushaltsaufgabe wird ausdrücklich modelliert und nicht als Vorwand verwendet, Gesundheitsdaten aller Haushaltsmitglieder freizugeben.

Lege serverseitig fest, wer lesen, erstellen, korrigieren, exportieren und freigeben darf. Ein Pflegedienst benötigt fallbezogene Rechte; eine Nachbarin mit Einkaufsaufgabe benötigt normalerweise weder Diagnosen noch Arztbriefe. „Für alle Nutzer sichtbar“ bedeutet bei Arztinformationen alle hierzu berechtigten Personen im betroffenen Pflegefall, nicht sämtliche Nutzer der Anwendung und nicht automatisch jeder gelegentliche Helfer.

Dokumente benötigen Personenzuordnung, Kategorie, Datum, Urheber beziehungsweise Hochladenden, Version, Sichtbarkeit und Zugriffsrechte. Einladungen sind abgesichert, zeitlich begrenzt und widerrufbar. Verwende keine dauerhaft mehrfach nutzbaren Democodes im Echtbetrieb. Ein bestehendes Konto kann mehreren Kreisen beitreten, ohne neue parallele Konten erzeugen zu müssen.

Ergänze kontextbezogene Kommentare und eine kurze Übergabe „Seit deinem letzten Besuch“. Trenne Systemmeldungen von Nachrichten und persönliche von gemeinsamen Angaben. Private Befindlichkeits- und Belastungsantworten gehören nicht automatisch zum Fallaktenzugriff.

Widerrufe greifen serverseitig und berücksichtigen Sitzungen, Links und Offlinekopien. Prüfe Rechte auch bei Suche, Vorschauen, Benachrichtigungen, Assistentenaufrufen, Exports und direkten API-Aufrufen. Eine zentrale Familienverwaltung darf private Daten nicht allein wegen ihrer organisatorischen Rolle einsehen. Versprich keine Rückholung bereits exportierter Dateien.

### 17. Verbinde Termine, Begleitung und Klinikübergänge

Ermögliche das Anlegen, Bearbeiten, Absagen und Abschließen von Arzt-, Therapie-, Pflegeberatungs- und Versorgungsterminen. Jeder Termin besitzt Pflegefall, Beginn, Zeitzone, geplantes Ende oder bewusst erfasste Dauer, Ort, optionalen Kontakt, angefragte und bestätigte Begleitung sowie Vor- und Nachbereitung. Erfinde kein bestätigtes Terminende, wenn nur ein Beginn bekannt ist.

Termin und Aufgabe „Begleitung organisieren“ sind verknüpft. Eine Terminänderung aktualisiert Planung, Erinnerungen und Nachbereitungszeitpunkt konsistent. Es entstehen keine unabhängigen widersprüchlichen Kopien. Eine Begleitung gilt erst nach Annahme als organisiert. Ein Wechsel der Begleitung aktualisiert die zuständige Person; tatsächlich erfolgte Begleitung bleibt im Verlauf nachvollziehbar.

Ermögliche Gesprächsvorbereitung mit Fragen, ausgewählten Tagebucheinträgen und freigegebenem Medikamentenplan. Die Familie entscheidet, was exportiert wird. „Mit der Praxis teilen“ ist nur bei tatsächlich eingerichteter, autorisierter Übermittlung verfügbar. Vor dem Termin kann eine dezente Erinnerung an Fragen, benötigte Unterlagen und Fahrtplanung erfolgen.

Ergänze einen Übergangsmodus für Krankenhausaufnahme und Rückkehr nach Hause: offene Fragen, Dokumentenliste, neue Versorgungstermine und Überprüfung geänderter Pläne. Ein neu erfasster Entlassplan darf nicht ungeprüft den bisherigen Medikamentenplan überschreiben. Zeige die notwendige fachliche Abstimmung. Die Klinikperspektive hilft bei der Übergabe; der primäre Produktzweck bleibt die häusliche Versorgung.

### 18. Entwickle den automatischen Arzttermin-Nachlauf vollständig

Diese Funktion ist eine zentrale Produktanforderung. Nach einem Arztbesuch soll die begleitende Person automatisch eine persönliche In-App-Benachrichtigung erhalten, um Erkenntnisse, ärztlich besprochene Punkte und Unterlagen festzuhalten. Darauf greifen die entsprechend berechtigten Personen des betroffenen Pflegefalls gemeinsam zu.

Baue auf `src/components/ArztNachbereitung.tsx` auf. Der vorhandene Ansatz mit `WAIT_MINUTES = 60`, Abfrage beim Öffnen und lokalem Überspringen reicht dafür nicht aus. Ersetze ihn durch einen dauerhaften Termin- und Nachbereitungsprozess mit folgenden Anforderungen:

**Auslösung:** Nutze bestätigtes tatsächliches Besuchsende oder einen konfigurierbaren Zeitpunkt nach geplantem Ende. Beispielsweise 15 Minuten nach geplantem Ende kann eine neutrale Frage erscheinen: „Ist der Termin beendet? Halte die wichtigsten Punkte fest.“ Die App weiß ohne Bestätigung oder verlässliche Integration nicht, ob der Arztbesuch tatsächlich vorbei ist. Ein Zeitablauf darf keinen erfolgten Besuch behaupten. Fehlt eine Endeangabe, frage eine ungefähre Dauer oder eine manuelle Beendigung ab, statt verborgen stets eine Stunde anzunehmen.

**Dauerhafte Erinnerung:** Erzeuge die Nachbereitungsaufgabe serverseitig auch bei geschlossener App. Beim nächsten Öffnen ist sie zuverlässig vorhanden. Optionales Push ist eine Ergänzung und braucht passende Freigabe; garantierte Echtzeit-Zustellung wird nicht behauptet. Ein `useEffect`, `useMemo` oder lokaler Timer allein ist kein vollständiger Hintergrundprozess.

**Richtiger Empfänger:** Benachrichtige die bestätigte beziehungsweise tatsächlich begleitende Person für genau diesen Termin und diesen Pflegefall. Bei Wechsel oder Absage werden zukünftige Erinnerungen angepasst. Andere Personen erhalten nicht vorsorglich dieselbe persönliche Aufgabe. Eine spätere unterstützende Bearbeitung durch Berechtigte ist möglich und wird mit Autor dokumentiert.

**Keine Duplikate:** Eindeutige Ereignis-IDs, Versionsbezug und idempotente Verarbeitung verhindern Doppelmeldungen nach Neuladen, mehreren Geräten, Wiederholungsversuchen oder mehrfach ausgeführtem Scheduler. Plane Versandversuche und ihre Zustände getrennt von Lesebestätigungen. Abgesagte Termine erzeugen keine Aufforderung zu erfundenen Besuchsergebnissen.

**Bedienung:** Benachrichtigung und Terminkarte führen direkt zur richtigen Nachbereitung. Biete „Jetzt festhalten“, „Ich bin noch beim Termin“, „Später erinnern“ und bei Bedarf einen nachvollziehbaren Abschluss „Es gibt nichts zu ergänzen“. „Später“ setzt eine persistente Wiedervorlage; es darf nicht nur das aktuelle Fenster schließen. Alte offene Nachbereitungen verschwinden nicht nach 14 Tagen stillschweigend, sondern bleiben als offen oder bewusst archiviert nachvollziehbar. Mehrere offene Termine werden als Liste statt als blockierende Kette von Pop-ups gezeigt.

**Ergebnismaske:** Halte die erste Eingabe kurz und biete aufklappbare Details: Zusammenfassung, wichtige Aussagen nach Erinnerung der Begleitperson, vereinbarte Maßnahmen, offene Fragen, neue Termine, Dokumente und Information, ob eine Medikamentenänderung besprochen wurde. Kennzeichne dies zunächst als Bericht der eintragenden Person, nicht automatisch als ärztlich verifizierten Befund. „Nicht bekannt“, „wird nachgereicht“ und „nicht besprochen“ sind zulässige Antworten.

**Dokumente:** Unterstütze mehrere PDF- und Bilddateien, Auswahl vom Gerät und bei geeigneter Plattform ein bewusst ausgelöstes Abfotografieren von Unterlagen. Zeige Dateiname, Kategorie, Pflegefall, Vorschau, Ladefortschritt und tatsächlichen Uploadstatus. Nutze private Dateiablage, Größen- und Typprüfung, geeignete Sicherheitsprüfung sowie geschützte Vorschauen. Kamera- und sonstige Geräteberechtigungen werden erst bei Nutzung angefragt. Ein Uploadfehler darf nicht als hochgeladen gelten. OCR oder automatische Zusammenfassung ist optional und benötigt gesonderte Qualitäts- und Datenverarbeitungsprüfung.

**Folgeaktionen:** Aus einem berichteten Punkt kann eine ausdrücklich bestätigte Aufgabe entstehen, beispielsweise Befund nachreichen, Rezeptabholung organisieren, Rückfrage vorbereiten oder neuen Termin anlegen. Erfasse zuständige Person, Zeitfenster und Status. Ein neu vereinbartes Datum ohne Uhrzeit wird als noch zu klärender Termin gespeichert; ergänze nicht still 09:00 Uhr. Medikamentenänderungen erzeugen einen sichtbaren Klärungs- beziehungsweise Abgleichbedarf und übernehmen keine neue Dosierung automatisch.

**Gemeinsame Ablage:** Verknüpfe Ergebnis, Termin, Tagebuch, Dokumente und Folgeaufgaben über gemeinsame IDs. Ändert sich ein Ergebnis, muss erkennbar sein, welcher Stand aktuell ist; erzeuge keine widersprüchlichen Freitextkopien. Gespeicherte Entwürfe sind von veröffentlichten Ergebnissen zu unterscheiden. Berechtigte Mitglieder können veröffentlichte Ergebnisse und freigegebene Dateien im Pflegefall sehen. Notifizierungen an sie geben nur zulässige Informationen preis; persönliche Belastungsdaten bleiben außen vor.

**Verlauf:** Zeige offen, Entwurf, wartet auf Unterlagen, teilweise ergänzt, abgeschlossen und gegebenenfalls bewusst ohne Ergänzung beendet. Erfasse Erstellung, Speicherung, Bearbeitung und Veröffentlichung mit Autor und Zeitpunkt. Dokumentiere nachträgliche Ergänzungen und Dateiversionen. Erlaube Kommentare und gezielte Rückfragen nach den Fallrechten.

Konkreter Abnahmeablauf: Markus bestätigt Annas Arztbegleitung am Dienstag von 10 bis 11 Uhr. Nach dem geplanten Ende erhält er eine dezente Erinnerung. Er markiert den Besuch als beendet, ergänzt drei wichtige Punkte, lädt einen Arztbrief hoch und erstellt eine Rückfrageaufgabe. Christina sieht das veröffentlichte Ergebnis und den Brief mit ihrem eigenen Konto. Lena sieht es nur mit entsprechender Berechtigung. Eine reine Einkaufshilfe bekommt weder Dokument noch Diagnosen. Terminabsage, geänderte Dauer, Offline-Upload und Wechsel der Begleitung werden ebenfalls getestet.

### 19. Verbessere Soforthilfe und Notfallmappe

Erhalte einen dauerhaft gut auffindbaren Zugang zur Soforthilfe. In Deutschland muss ein direkter Zugang zum Notruf 112 erreichbar sein; verifiziere Kontaktangaben und ihre vorgesehenen Einsatzbereiche vor Veröffentlichung. Der Rufaufbau erfolgt erst nach bewusster Aktion des Nutzers.

Ein Notfall darf nicht erst einen Fragebogen durchlaufen müssen. Wenn strukturierte Fragen angeboten werden, brauchen Inhalt, Reihenfolge und Handlungshinweise fachliche Freigabe und regulatorische Bewertung. Biete „Ich weiß es nicht“ an und verhindere gefährliche Entwarnung aufgrund unsicherer Angaben. Ein Hinweistext allein macht eine fehlerhafte Triage nicht sicher.

Die Notfallmappe enthält freigegebene Stammdaten, wichtige Kontakte, Allergien einschließlich „nicht bekannt“ oder „nicht erfasst“, den aktuellen dokumentierten Medikationsplan sowie Hinweise zum Vorliegen und Aufbewahrungsort relevanter Vollmachten. Ein Statusfeld „Patientenverfügung vorhanden“ ist keine Interpretation ihres Inhalts.

Jeder Ausdruck erhält Personenzuordnung, Erstellungsdatum und Stand der Angaben. Teste Drucklayout und Lesbarkeit. Zeige deutlich, dass Daten veralten können.

Ein QR-Code darf keine vollständige öffentliche Gesundheitsakte durch die bloße Erstellung freischalten. Entwickle ein bewusstes Freigabekonzept für minimale Notfallinformationen, mit transparenter Erklärung des Zugangsrisikos, geeigneten Tokens, Widerruf und Zugriffsschutz. Soll ein bestimmter reduzierter Notfallzugang ohne Anmeldung funktionieren, muss dies eine ausdrückliche Produktentscheidung mit Einwilligung und Sicherheitsprüfung sein. Teste den Scan auf einem zweiten Gerät ohne vorhandene Sitzung.

### 20. Behandle Sensorik als gesonderte Erweiterung

Behalte den Tagesablauf-Simulator nur als eindeutig abgegrenzte Demo. Ein Sensorereignis zeigt eine registrierte Aktivität und beweist nicht, dass es einer Person gut geht. Fehlende Aktivität beweist keinen Notfall.

Für eine reale Integration sind Gerät, Datenquelle, letzte Übertragung, Batteriestatus soweit verfügbar, Konnektivität und Fehlerzustand zu modellieren. Unterscheide keine Aktivität, keine aktuellen Daten und technischen Ausfall. Unterstütze Abwesenheitszeiten und die bewusste Deaktivierung der Überwachung.

Bewegungs- oder Anwesenheitsdaten sind ebenfalls sensible Alltagsinformationen. Einwilligung, Zweckbindung und Datenminimierung sind erforderlich. Versprich keine Sturzerkennung oder Notrufüberwachung, wenn dies technisch und fachlich nicht vorhanden ist. Sensorik darf den Kernnutzen der ersten Version nicht von unbeschaffter Hardware abhängig machen.

### 21. Mache den Assistenten hilfreich und kontrollierbar

Erhalte einen textbasierten Assistenten als optionale Abkürzung. Er kann Fragen zu tatsächlich vorhandenen und freigegebenen Appdaten beantworten, Einträge vorbereiten oder zu einer passenden Funktion navigieren. Alle wichtigen Aufgaben bleiben auch über die normale Oberfläche erledigbar.

Mögliche Befehle sind „Was steht heute an?“, „Zeige offene Aufgaben für morgen“, „Bereite eine Notiz über den heutigen Schlaf vor“ oder „Ich brauche am Samstag eine Vertretung“. Bei Mehrdeutigkeit muss er nachfragen, insbesondere bei Person, Zeitpunkt, Menge oder Medikament.

Vor einer schreibenden Aktion zeigt er den vollständigen geplanten Eintrag. Speichern, Medikamentendokumentation, Freigaben und externe Übermittlung benötigen die passende bewusste Bestätigung. Eine allgemeine Zustimmung zum Gespräch autorisiert keine beliebigen Folgeaktionen.

Der Assistent darf nur Daten abrufen, die der angemeldete Nutzer serverseitig lesen darf. Freitext und hochgeladene Inhalte dürfen keine Systemanweisungen oder Rechteprüfungen überschreiben. Keine erfundenen Aufgaben, Termine, Beobachtungen oder medizinischen Erklärungen.

Spracheingabe ist optional. Prüfe lokale Verarbeitung oder einen ausdrücklich geeigneten Dienst einschließlich Auftragsverarbeitung, tatsächlicher Verarbeitungsorte und Löschkonzept. Sende Gesundheitsangaben nicht ungeprüft über die Browser-Spracherkennung. Biete eine gleichwertige Texteingabe und eine verständliche Anzeige des Erkennungszustands. Starte das Mikrofon nicht automatisch.

Der Kern muss ohne generatives Sprachmodell funktionieren. Falls später ein solches System ergänzt wird, benötigst du vor dem Produktivbetrieb eine eigene Datenfluss-, Sicherheits-, Qualitäts- und regulatorische Prüfung. Medizinische Diagnose und Dosierung sind kein allgemeiner Assistentenauftrag.

### 22. Baue saubere Dokumente und Exporte

Unterstütze Dokumente mit Kategorie, Datum, Quelle, Version und passender Freigabe. Relevante Kategorien können Arztbriefe, Medikationspläne, Pflegeinformationen und Vollmachtsunterlagen sein. Dateien benötigen private Speicherung, Größen- und Typprüfung sowie geeignete Schadsoftwareprüfung.

Erstelle gut lesbare PDF-Ausgaben für die Notfallmappe, den ausgewählten Pflegeverlauf und die Gesprächsvorbereitung. Exportiere nur den gewählten Zeitraum und ausdrücklich freigegebene Inhalte. Private Belastungsantworten dürfen nicht versehentlich im allgemeinen Familienexport landen.

Interoperabilität ist nach § 6 DiPAV ein eigenständiges Thema. Ein PDF oder eine beliebig benannte JSON-Datei allein genügt nicht als Beleg dafür. Prüfe geeignete Standards und für die Zweckbestimmung relevante Anforderungen. [Q6]

Bei FHIR-Nutzung definiere Version, Ressourcen, Profile, Codesysteme, Einheiten, Referenzen und Herkunft nachvollziehbar. Unterscheide insbesondere Verordnung, Medikamentenangabe und dokumentierte Verabreichung. Validiere Beispiele mit einem geeigneten Validator und dokumentiere die tatsächlich getestete Importfähigkeit. Behaupte keine ePA-, Praxis- oder Pflegesoftwareanbindung ohne vorhandene und geprüfte Integration.

Ein Download muss eine echte Datei erzeugen. Ein abgebrochener oder fehlgeschlagener Export braucht eine verständliche Fehlermeldung und darf keine Erfolgsmeldung anzeigen.

### 23. Ergänze Wissen und Leistungsorientierung sinnvoll

Ergänze kurze, geprüfte Informationen zu Pflegeberatung, Entlastungsmöglichkeiten, Hilfsmitteln und der Vorbereitung von Anträgen. Zeige Quelle und Aktualisierungsdatum. Leistungsbeträge, Voraussetzungen und Rechtsstände dürfen nicht als dauerhaft unveränderliche Texte behandelt werden.

Verknüpfe Informationen mit einem selbst gewählten nächsten Schritt, beispielsweise einer Beratungsvorbereitung oder einer Terminaufgabe. Vermeide bindende individuelle Rechtszusagen und die Behauptung einer garantierten Leistungsbewilligung. Regionale Angebote benötigen verifizierte Datenquellen; erfinde keine verfügbaren Plätze oder freien Termine.

Die Möglichkeit einer DiPA-Erstattung bedeutet keine staatliche Entwicklungsförderung. Stand dieser Vorgabe: Bei Bewilligung beträgt der gesetzliche Rahmen insgesamt bis zu 40 Euro monatlich für DiPA und separat bis zu 30 Euro für ergänzende Unterstützungsleistungen. Dies ist weder ein garantierter Apppreis noch automatisch Umsatz des Herstellers. Informiere transparent über tatsächlichen Status, Voraussetzungen und mögliche Mehrkosten. [Q4]

### 24. Setze Datenschutz und Sicherheit als Produkteigenschaften um

Erstelle eine Datenlandkarte mit Zweck, Kategorie, verantwortlicher Stelle, Empfängern, Speicherort, Aufbewahrung und Löschregeln. Berücksichtige Angehörigendaten und Gesundheitsinformationen der gepflegten Person getrennt. Leite konkrete Pflichten aus DSGVO, § 5 DiPAV und den aktuellen offiziellen Prüfkriterien ab. [Q5]

Unsere Architekturvorgabe ist eine geeignete Verarbeitung in EU-Regionen mit dokumentierten Dienstleistern. Prüfe dabei auch Supportzugriffe, Logs, Backups, Benachrichtigungsdienste, E-Mailversand, Sprachdienste und sämtliche Unterauftragnehmer. Eine EU-Datenbank allein beweist keine EU-Verarbeitung der Gesamtanwendung.

Notwendige Produktmaßnahmen:

- Sichere individuelle Konten, geeignete Wiederherstellung und nachvollziehbare Sitzungsverwaltung.
- Geeignete Mehrfaktoroptionen beziehungsweise Passkeys mit zugänglichem Wiederherstellungsverfahren.
- Servervalidierung und Autorisierung jeder relevanten Aktion und jedes Dateiabrufs.
- Strikte Trennung unterschiedlicher Pflegekreise und gepflegter Personen.
- Transportverschlüsselung, geeignete Verschlüsselung gespeicherter Daten und geordnetes Schlüsselmanagement.
- Keine geheimen Schlüssel im Frontend, keine sensiblen Inhalte in URLs oder gewöhnlichen Fehlermeldungen.
- Datensparsame Protokolle ohne ungefilterte Gesundheitsfreitexte.
- Schutz vor üblichen Webangriffen, Missbrauch und automatisierten Anmeldeversuchen.
- Sichere Uploads, zeitlich begrenzte private Downloadlinks und Prüfung ihrer Berechtigungen.
- Backup-, Wiederherstellungs-, Schwachstellen- und Vorfallverfahren.
- Erreichbarer Support mit klaren Zuständigkeiten und angemessenen Reaktionswegen.

Einwilligungen sind konkret, verständlich, versioniert und widerrufbar. Optionale Zwecke dürfen nicht vorausgewählt sein. Unterscheide erforderliche Versorgung, ausdrücklich freigegebene Beteiligung Dritter, Weiterentwicklung und eine gegebenenfalls gesondert geregelte Erprobung beziehungsweise Forschung. Prüfe hierfür die jeweils zulässige Rechtsgrundlage und Zweckbindung; eine breite Checkbox „Forschung und alles Weitere“ reicht nicht.

Ein Widerruf beendet die davon abhängige Verarbeitung. Entwickle den weiteren Ablauf einschließlich Exportmöglichkeit, Datenlöschung und möglicher rechtlich begründeter Aufbewahrung bewusst. Lösche nicht mit einer unverständlichen Checkbox versehentlich sämtliche Daten aller beteiligten Menschen.

Verwende keine Werbetracker, kein datenschutzwidriges Session-Replay und keine medizinischen Nutzungsdaten zum Training externer Modelle. „Anonymisiert“ darf nur für tatsächlich entsprechend behandelte Daten verwendet werden; Pseudonymisierung ist davon zu unterscheiden.

Prüfe Datenschutz-Folgenabschätzung, Auftragsverarbeitung und Datenschutzinformationen. Bereite Sicherheitsnachweise einschließlich des anwendbaren BSI-TR-03161-Umfangs und eines angemessenen Informationssicherheitsmanagements vor. Prüfe aktuelle Zertifizierungspflichten und Übergangsregelungen nach § 8 DiPAV, statt alte Stichtage ungeprüft zu übernehmen. [Q7, Q12]

### 25. Entwirf eine wartbare Architektur

Prüfe zuerst den vorhandenen Stack. Verwende ihn weiter, wenn er tragfähig ist. Begründe größere Wechsel anhand von Nutzen, Betriebsfähigkeit und Migrationsaufwand. Baue für die erste Version eine gut strukturierte modulare Anwendung; unnötige Microservices erschweren die Pflege.

Trenne Oberfläche, Fachlogik, API, Datenzugriff, Benachrichtigungen, Dateiablage und optionale Integrationen. Ergänze einen geeigneten dauerhaften Scheduler beziehungsweise Jobmechanismus für Wochenabfragen und Termin-Nachbereitung; plane Wiederholungsversuche, Abbruch, Neuplanung, Protokollierung und Duplikatschutz. Verwende durchgehende Typisierung, validierte Eingaben, eindeutige IDs, Datenbankmigrationen und nachvollziehbare Fehlerbehandlung. Konfiguration und Zugangsdaten gehören nicht in den Quellcode.

Ein geeignetes Datenmodell enthält mindestens Nutzerkonto, persönliche Einstellungen, Pflegekreis, gepflegte Person, fallbezogene Mitgliedschaft, Berechtigung, Einladung, Einwilligung, Aufgabe, Aufgabenserie, Verfügbarkeitsfenster, Wochenrückmeldung, Kapazitätsangabe, zeitliche Ausnahme, Vertretungsanfrage, Termin, Begleitungszusage, Nachbereitung, Nachbereitungsentwurf, Dokumentenverknüpfung, Folgeaufgabe, Medikationsplan, Einzelgabe, Dokumentationsereignis, Bestandsbewegung, Beobachtung, Pflegeprogramm, Maßnahme, persönliche Selbsteinschätzung, freigegebenes Instrument, Dokument, Benachrichtigungsereignis, benutzerbezogenen Lesezustand, geplantes Hintergrundereignis und Audit-Ereignis.

Kennzeichne private Angehörigendaten ausdrücklich. Alle fallbezogenen Objekte besitzen einen eindeutigen Bezug zur gepflegten Person. Familienadministration und Einwilligungshoheit dürfen nicht als identisches Feld modelliert werden.

Nutze Datenbanktransaktionen und geeignete Eindeutigkeitsregeln für konkurrierende Aktionen. Dokumentiere Erstellungs- und Änderungszeit, Autor, Datenquelle und Version dort, wo sie relevant sind. Medizinisch relevante Änderungen benötigen nachvollziehbare Korrekturereignisse.

Bereite einen klaren Betriebsaufbau mit Entwicklung, Test und Produktion vor. Echte Gesundheitsdaten gehören nicht in öffentliche Demos. Öffentliche Vercel-Erreichbarkeit ist für sich genommen kein Nachweis einer geeigneten Produktionsarchitektur. Prüfe sämtliche beteiligten Komponenten und Verträge.

### 26. Löse Zeit, Offlinebetrieb und Benachrichtigungen zuverlässig

Speichere Zeitpunkte eindeutig und bewahre bei zeitabhängigen Plänen die relevante lokale Zeitzone. Berücksichtige Europe/Berlin, Sommerzeitwechsel, Datumsgrenzen und wiederkehrende Termine. Eine tägliche Uhrzeit ist fachlich etwas anderes als ein fixer UTC-Zeitpunkt.

Vergangene Ereignisse bleiben vergangen. Eine neue App-Sitzung darf Beispieldaten nicht als reale aktuelle Ereignisse ausgeben. Testdaten benötigen eine kontrollierte Testuhr, damit Zeitlogik reproduzierbar geprüft werden kann.

Erlaube einen begrenzten Offlinebetrieb mit bewusster Datenminimierung. Zeige letzte Synchronisation und den tatsächlichen Status neuer Einträge: lokal vorbereitet, ausstehend, synchronisiert oder Konflikt. Speichere keine vollständigen Gesundheitsakten ungeschützt im Browser-LocalStorage.

Für konkurrierende Medikamentendokumentationen ist ein stilles „letzter Schreibzugriff gewinnt“ unzulässig als Produktstrategie. Zeige Unsicherheit und verlange geeignete Klärung. Berechtigungsänderungen und widerrufene Freigaben müssen bei der Synchronisation beachtet werden. Plane den Schutz und die Bereinigung lokaler Kopien.

Benachrichtigungen besitzen eine dokumentierte Zustandskette: Ereignis erstellt, Versand versucht, vom Dienst angenommen und gegebenenfalls vom Gerät bestätigt. Behaupte keinen Lesestatus ohne entsprechendes Signal. Pushmeldungen enthalten standardmäßig keine Diagnosen oder Medikamentennamen auf dem Sperrbildschirm.

Eine PWA darf auf mobilen Betriebssystemen keine sekundengenauen, garantierten Hintergrundalarme versprechen. Teste die tatsächlich unterstützten Plattformen und erkläre technische Grenzen. Ein aktivierter Hinweis ersetzt weder ein Notrufsystem noch eine verlässlich übernommene Verantwortung im Pflegekreis.

### 27. Definiere für jedes Bedienelement einen vollständigen Ablauf

„Alle Buttons funktionieren“ bedeutet nicht, dass jeder Klick lediglich ein Fenster öffnet. Lege für jedes interaktive Element mindestens fest: Zweck, Berechtigung, Eingaben, Validierung, Datenänderung oder Navigation, Erfolgszustand, Fehlerzustand und Abnahmetest.

Produktregeln:

- Keine toten Links, leeren onClick-Funktionen oder reinen Erfolgstoasts ohne ausgeführte Aktion.
- Gespeicherte Daten müssen nach Neuladen und bei berechtigtem Zugriff auf einem zweiten Gerät korrekt vorhanden sein.
- Speichern zeigt einen Ladezustand und schützt gegen versehentliche Mehrfachausführung.
- Fehler erhalten die Eingaben und erklären einen sinnvollen nächsten Schritt.
- Abbrechen verändert keine gespeicherten Fachdaten.
- Zurück und Schließen folgen einem konsistenten Verhalten; ungespeicherte Änderungen werden angemessen behandelt.
- Löschen und Korrigieren unterscheiden sich sichtbar und entsprechend der Datenart.
- Filter, Suche und Kalendernavigation verändern tatsächlich die angezeigten Inhalte.
- Telefonnummern, Druckansichten und Downloads funktionieren auf den unterstützten Geräten.
- Eine fehlende Berechtigung führt zu einer verständlichen Rückmeldung und wird serverseitig durchgesetzt.
- Eine externe Bestellung, Nachricht oder Freigabe wird erst nach tatsächlich ausgeführter Aktion als erfolgt bezeichnet.
- Noch nicht verfügbare Integrationen sind klar erklärt und nicht als funktionsfähige Hauptaktionen gestaltet.

Erstelle eine Interaktionsmatrix und prüfe sie systematisch. Implementiere die Kernabläufe vollständig; nutze für fehlende externe Dienste klar erkennbare Testadapter. Eine Simulation muss in Oberfläche und Dokumentation erkennbar bleiben und darf nicht als Produktionsintegration abgenommen werden.

### 28. Prüfe die Anwendung mit realistischen Abnahmeszenarien

Automatisiere risikorelevante Fachlogik, API-Rechte und zentrale Ende-zu-Ende-Abläufe. Ergänze manuelle Tests auf echten mobilen Geräten und mit assistiven Technologien. Screenshots allein prüfen weder Berechtigungen noch Datensicherheit.

Mindestens diese Szenarien müssen geprüft werden:

1. Eine allein pflegende Person kann ohne zweite Person einen sinnvollen Pflegeplan beginnen.
2. Ein Familienmitglied tritt über eine gültige Einladung bei und erhält nur die vorgesehenen Rechte.
3. Eine abgelaufene oder widerrufene Einladung kann nicht verwendet werden.
4. Zwei Mitglieder übernehmen gleichzeitig dieselbe Aufgabe; es entsteht genau eine Hauptzuständigkeit.
5. Eine Vertretung wird angefragt, lehnt ab und die offene Lücke bleibt sichtbar.
6. Eine angefragte Vertretung wird nicht als bereits gesicherte Versorgung angezeigt.
7. Eine Aufgabe wird bearbeitet und nach Neuladen auf einem zweiten berechtigten Gerät korrekt angezeigt.
8. Die Änderung einer Terminserie verändert keine dokumentierten vergangenen Einträge.
9. Ein Arzttermin wird verschoben; Begleitung und Erinnerung werden konsistent aktualisiert.
10. Eine vergangene Uhrzeit wird nicht als nächste zukünftige Gabe oder nächster zukünftiger Termin bezeichnet.
11. Zwei Personen dokumentieren dieselbe Medikamentengabe gleichzeitig; es entsteht keine unbemerkte Doppelbuchung.
12. Eine Gaben-Korrektur erhält den ursprünglichen Eintrag und dokumentiert Grund, Autor und Zeitpunkt.
13. Eine Medikamentenplanänderung verändert nicht rückwirkend den historischen Plan.
14. Ein unbekannter Bestand führt nicht zu einer erfundenen sicheren Reichweite.
15. Milliliter, Milligramm und Stück werden weder technisch noch in Exporten verwechselt.
16. Ein Offlinekonflikt wird sichtbar und nicht still überschrieben.
17. Eine Nachbarin mit Einkaufsrecht kann weder Diagnosen noch private Belastungsdaten über direkte API-Aufrufe lesen.
18. Ein Pflegedienst verliert nach Widerruf den serverseitigen Zugriff, einschließlich auf bisherige Dateilinks entsprechend dem Sicherheitskonzept.
19. Der allgemeine Familienexport enthält keine privaten Angehörigenantworten.
20. Ein QR-Code funktioniert entsprechend dem ausdrücklich gewählten Freigabemodell auf einem zweiten Gerät und lässt sich widerrufen.
21. Ablehnung des Mikrofonzugriffs verhindert nicht die normale Appnutzung.
22. Der Assistent bestätigt mehrdeutige Angaben, bevor er etwas speichert.
23. Ein nicht eingerichteter Praxisversand kann keine Meldung „Rezept bestellt“ auslösen.
24. Ein Sensor ohne aktuelle Verbindung wird als technischer Datenmangel und nicht als sicherer Notfall oder sicherer Normalzustand dargestellt.
25. Eine fehlgeschlagene Pushzustellung wird nicht als gelesene Nachricht dargestellt.
26. Ein abgebrochener Download erzeugt keine falsche Erfolgsmeldung.
27. Neue Nutzer erhalten keine vorausgewählten optionalen Einwilligungen.
28. Widerruf und Löschung betreffen nur die vorgesehenen Daten und Berechtigungen.
29. Die Anwendung lässt sich bei vergrößerter Schrift, mit Tastatur und Screenreader durch zentrale Abläufe bedienen.
30. Soforthilfe bleibt bei normalem Appfehler unmittelbar erreichbar, soweit der Gerätezustand dies zulässt.
31. Ein Wechsel der gepflegten Person kann keine Einträge versehentlich einem anderen Fall zuordnen.
32. Wiederherstellung aus einem Backup wird tatsächlich getestet.

33. Beim ersten echten Login werden Rolle und persönliche Bedienpräferenzen geklärt; der Nutzer kann sich auch als gepflegte Person oder in beiden Rollen einrichten.
34. Schriftgröße und Kontrast reagieren bereits im Einstieg; spätere Logins laden die persönlichen Einstellungen.
35. Ein unterbrochener Einstieg wird fortgesetzt; die fertige Einrichtung erscheint nicht bei jedem Login erneut.
36. Eine neue echte Einrichtung erzeugt keine erfundene Familie, Diagnosen oder Termine.
37. Ein bestehendes Konto kann zwei Pflegekreisen beitreten, ohne Daten oder persönliche Einstellungen zu überschreiben.
38. Zwei Pflegende sehen dieselben freigegebenen Daten einer gepflegten Person auf unterschiedlichen Geräten.
39. Beim Wechsel zwischen zwei Pflegebedürftigen bleiben Dokumente, Medikamente, Termine und Rechte korrekt zugeordnet.
40. Die Wochenabfrage erzeugt pro relevanter Woche und Empfänger die vorgesehene Zahl an Erinnerungen; keine Antwort bleibt von bestätigter Verfügbarkeit unterscheidbar.
41. Ein konkretes Dienstag-Zeitfenster erlaubt keine Verteilung einer außerhalb liegenden Aufgabe.
42. Wochenwiederholung, Ausnahmen und Abwesenheit werden vor Vorschlägen berücksichtigt.
43. Fallübergreifende Doppelbelegung wird erkannt, ohne private Falldaten offenzulegen.
44. Termin und verknüpfte Begleitaufgabe werden im Zeitcontrolling nicht als zwei unabhängige Einsätze doppelt gezählt.
45. Vergangene unerledigte Aufgaben gelten im Wochenbericht nicht automatisch als geleistete Pflegezeit.
46. Die Arzt-Nachbereitung wird nach geplantem oder bestätigtem Ende für die richtige Begleitperson bereitgestellt, ohne einen erfolgten Besuch vorzutäuschen.
47. Bei geschlossener App entsteht der Nachbereitungseintrag trotzdem serverseitig und ist beim nächsten Login sichtbar.
48. Geänderte Begleitung oder Terminverschiebung aktualisiert die zukünftige Erinnerung; der alte Empfänger erhält keine veraltete Aufgabe.
49. Abgesagte Arzttermine erzeugen keine Ergebnisaufforderung und keine falschen Tagebucheinträge.
50. Wiederholte Jobs und mehrere Geräte erzeugen keine doppelten Nachbereitungsaufforderungen.
51. „Später erinnern“ bleibt über Neuladen und Gerätewechsel erhalten; „noch beim Termin“ passt die Wiedervorlage nachvollziehbar an.
52. Mehrere offene Nachbereitungen lassen sich ohne blockierende Pop-up-Kette bearbeiten.
53. Arztbericht, mehrere Anhänge und Folgeaufgaben bleiben mit dem richtigen Termin und Pflegefall verknüpft.
54. Eine veröffentlichte Nachbereitung ist für berechtigte Mitglieder sichtbar; Entwürfe und nicht freigegebene Dateien bleiben geschützt.
55. Ein fehlgeschlagener oder noch zu prüfender Upload wird nicht als vollständig verfügbar angezeigt und lässt sich passend fortsetzen.
56. Ein berichteter Medikamentenwechsel ändert nicht automatisch den aktiven Medikationsplan.
57. Ein neuer Arzttermin ohne bekannte Uhrzeit enthält keine erfundene Standardzeit.
58. SVG-Logoassets enthalten echte Vektorpfade, keine eingebetteten Rasterbilder und keinen Hintergrund; Negativräume sind transparent.
59. Orange-Beige-Design, Fokuszustände, Kontrastmodus, Druckansicht und PWA-Branding sind konsistent; die alte grüne Markenführung ist ersetzt.
60. Zentrale Abläufe funktionieren mit einfacher Ansicht und großer Schrift ebenso wie im erweiterten Zeitraster; Logo und Assistenzbutton verdecken keine Aktionen.

Ergänze für jeden fehlgeschlagenen Test Fehlerursache, Korrektur und erneute Prüfung. Melde keine vollständige Funktionsfähigkeit, solange relevante Tests fehlen oder scheitern.

### 29. Bereite Nutzenprüfung und regulatorische Unterlagen vor

DiPA ist kein Gütesiegel, das sich allein durch sauberes Programmieren erzeugen lässt. Die Aufnahme erfordert einen eigenständigen Herstellerantrag und geeignete Nachweise. Eine Aufnahme zur Erprobung kann unter den gesetzlichen Voraussetzungen möglich sein; sie ersetzt Sicherheits- und Datenschutzanforderungen nicht. Prüfe den aktuellen Stand von § 78a SGB XI und dem BfArM-Verfahren. [Q8]

Für den pflegerischen Nutzen sind grundsätzlich quantitative vergleichende Studien vorgesehen. Ein hübscher Verlauf im eigenen Dashboard, hohe Nutzungszahlen oder positives Interviewfeedback allein belegen diesen Nutzen nicht. Plane die Evaluierung mit einer geeigneten unabhängigen wissenschaftlichen Einrichtung. Definiere Hauptzielgröße, Vergleich, Messzeitpunkte, Umgang mit Ausfällen und Auswertung vor Beginn. [Q9]

Als zu prüfende Hauptzielgröße kommt beispielsweise die Veränderung der Angehörigenbelastung mit einem geeigneten und rechtmäßig nutzbaren Instrument in Betracht. Sekundäre Maße können dokumentierte Versorgungslücken, organisatorischer Aufwand oder tatsächlich realisierte Entlastungszeiten sein. Klickzahlen und Aufgabenzahlen sind davon zu unterscheiden. Erfinde weder Fallzahlen noch statistische Signifikanz oder eine bereits nachgewiesene Wirkung.

Erstelle eine nachvollziehbare Zuordnung zwischen Zweckbestimmung, Zielgruppe, Funktionen, Risiken, behauptetem Nutzen und Nachweis. Die Anwendung darf im Marketing nicht mehr versprechen, als ihr Funktionsumfang und die Daten tragen.

Bewerte die Medizinproduktefrage funktionsbezogen. Die tatsächliche Zweckbestimmung, Aussagen und Funktionen sind entscheidend; ein Disclaimer entscheidet die Einordnung nicht allein. Prüfe insbesondere medizinische Auswertung, individuelle Handlungsempfehlungen, Triage, Sensorinterpretation und Arzneimittelentscheidungen anhand aktueller MDR-Regeln und einschlägiger Softwareleitlinien. [Q10]

Wenn Medizinprodukterecht greift, plane passende Pflichten und Fachprüfung ein. Prüfe die für DiPA geltende Risikoklassengrenze gesondert, statt DiGA-Regeln pauschal zu übertragen. Verwende keine erfundene CE- oder DiPA-Kennzeichnung.

Bereite mindestens diese Unterlagen vor: Zweckbestimmung, Zielgruppenbeschreibung, Rollen- und Rechtematrix, Gebrauchsanweisung, fachliche Inhaltsfreigaben, Risikoanalyse, Datenflussplan, Datenschutz- und Löschkonzept, Sicherheitskonzept, Prüfnachweise, Interoperabilitätskonzept, Evaluationskonzept, Supportkonzept und Versionshistorie. Dokumentiere außerdem offene Entscheidungen, Verantwortliche und Voraussetzungen für den Produktivbetrieb.

### 30. Setze in vollständigen, überprüfbaren Schritten um

Arbeite in dieser Reihenfolge:

1. Bestandsanalyse, Datenmodell, Zweckbestimmung und kritische Risiken klären.
2. NOVALIS-Logo als transparentes SVG rekonstruieren, Orange-Beige-Designsystem, responsive Navigation und persönlichen ersten Login umsetzen.
3. Konten, mehrere Pflegefälle, persönliche Einstellungen, fallbezogene Rechte, Dokumentenzugriff und echte Synchronisation umsetzen.
4. Heute, Aufgaben, konkrete Zeitfenster, Wochenabfragen, Zeitcontrolling, Termine einschließlich automatischer Nachbereitung, sichere Medikamentendokumentation und Tagebuch als zusammenhängende Kernabläufe fertigstellen.
5. Pflege- und Entlastungsprogramm sowie fachlich freigegebene Inhalte integrieren.
6. Notfallmappe, Dokumente, Exporte und unterstützte Benachrichtigungen fertigstellen.
7. Optionale Sensor- und Sprachintegrationen erst auf belastbarer Grundlage ergänzen.
8. Abnahme, Sicherheitsprüfung, barrierefreie Nutzbarkeit und Produktionsvorbereitung abschließen.

Vermeide ein Ergebnis mit sehr vielen begonnenen, aber unvollständigen Funktionen. Jeder Schritt liefert vollständig nutzbare Abläufe und passende Tests. Behalte die Gesamtanforderungen im Backlog und dokumentiere präzise, welche Funktionen produktionsreif, im Test, simuliert oder blockiert sind. Notwendige medizinische oder regulatorische Freigaben sind echte offene Voraussetzungen und werden nicht durch selbst verfasste Bestätigungen ersetzt.

Die abschließende Lieferung enthält das grundlegend überarbeitete ZIP-Projekt mit vollständigem Quellcode, startbarer Anwendung, echten transparenten SVG-Markenassets, Migrationen, synthetischen Testdaten, Einrichtungsanleitung, dokumentierter Konfiguration ohne Geheimnisse, Testbericht mit allen Abnahmeszenarien, Interaktionsmatrix sowie Architektur- und Produktunterlagen. Schließe Geheimnisse, reale Pflegedaten, `node_modules` und temporäre Dateien aus dem Lieferarchiv aus. Dokumentiere die Änderungen gegenüber der ursprünglichen ZIP. Ein erfolgreicher Build allein genügt nicht als Funktionsabnahme.

Zeige am Ende anhand konkreter Nutzungswege, wie Christina Hilfe organisiert, Markus verbindlich übernimmt, Anna beteiligt bleibt und eine Fachperson nur die freigegebenen Informationen erhält. Berichte ehrlich über verbleibende Grenzen. Eine lokale Demo ist keine automatisch zugelassene DiPA und eine optisch fertige Seite ist keine fertig betriebene Gesundheitsanwendung.

Das Ergebnis soll sich für die Familie so anfühlen: Ich verstehe, was wichtig ist. Ich muss mir weniger merken. Ich kann Hilfe verbindlich organisieren. Die gepflegte Person bleibt beteiligt. Ich weiß, welche Angaben aktuell und bestätigt sind. Die App nimmt mir Arbeit ab, statt neue Dokumentationspflichten zu erzeugen.

## Ende des kopierbaren Entwicklungs-Prompts

## Verifizierte Quellen zur fachlichen Weiterarbeit

Die Quellen wurden für die Einordnung des Entwicklungsauftrags recherchiert. Aktuelle Fassungen und die konkrete Anwendbarkeit sind vor Antragstellung und Produktivbetrieb erneut zu prüfen. Ein weiterhin verlinkter älterer DiPA-Leitfaden sollte nicht ungeprüft den Rechtsstand von 2026 ersetzen.

- Q1: Bundesgesundheitsministerium, Digitale Pflegeanwendungen und ergänzende Unterstützungsleistungen, Stand 14.09.2026: https://www.bundesgesundheitsministerium.de/themen/pflege/online-ratgeber-pflege/leistungen-der-pflegeversicherung/leistungen-im-ueberblick/digitale-pflegeanwendungen
- Q2: § 40a SGB XI, Definition, Abgrenzung und Leistungszugang: https://www.gesetze-im-internet.de/sgb_11/__40a.html
- Q3: § 9 DiPAV, pflegerischer Nutzen: https://www.gesetze-im-internet.de/dipav/__9.html
- Q4: § 40b SGB XI, Leistungsbeträge: https://www.gesetze-im-internet.de/sgb_11/__40b.html
- Q5: § 5 DiPAV, Datenschutz und Datensicherheit: https://www.gesetze-im-internet.de/dipav/__5.html
- Q6: § 6 DiPAV, Qualitätsanforderungen: https://www.gesetze-im-internet.de/dipav/__6.html
- Q7: § 8 DiPAV, Nachweis durch Zertifikate: https://www.gesetze-im-internet.de/dipav/__8.html
- Q8: § 78a SGB XI, Aufnahme und Erprobung: https://www.gesetze-im-internet.de/sgb_11/__78a.html
- Q9: § 11 DiPAV, Studien zum Nutzennachweis: https://www.gesetze-im-internet.de/dipav/__11.html
- Q10: MDCG 2019-11 Rev.1, Juni 2025, Qualifikation und Klassifikation von Software: https://health.ec.europa.eu/system/files/2025-06/mdcg_2019_11_en.pdf
- Q11: W3C, WCAG 2.2: https://www.w3.org/TR/WCAG22/
- Q12: BSI, TR-03161 Teil 2, Webanwendungen: https://www.bsi.bund.de/SharedDocs/Downloads/DE/BSI/Publikationen/TechnischeRichtlinien/TR03161/BSI-TR-03161-2.pdf?__blob=publicationFile&v=10
- Q13: BfArM, Digital and Health Data Insights, Juli 2026, Hinweis zur Aktualisierung des DiPA-Leitfadens: https://www.bfarm.de/SharedDocs/Newsletter/DE/2026/2026-07_Juli-Digital/2026_07-digital.html

