# NOVALIS – Pflege gemeinsam gestalten

Grundlegende Neufassung des übergebenen Pflege-App-Prototyps. Orange, warmer Sonnenuntergang und Beige; eigene transparente SVG-Markenassets nach den bereitgestellten Logo-Vorlagen. Schwerpunkt ist die gemeinsame häusliche Pflege mit mehreren Angehörigen und mehreren gepflegten Personen.

**Status: funktionsfähige private Entwicklungsanwendung mit serverseitiger Datenhaltung. Ausschließlich fiktive Testdaten verwenden. Keine DiPA-Aufnahme, kein CE- oder Wirksamkeitsnachweis und keine Freigabe für den Echtbetrieb.**

## Einstieg

- „Die App mit Beispielen entdecken“ öffnet eine ausdrücklich fiktive Familie. Änderungen bleiben in der Demo im aktuellen Browser-Tab. Anhänge sind dort nur während der Sitzung abrufbar.
- „Persönlichen Einstieg ausprobieren“ zeigt den fünfteiligen Einstieg ohne vorausgefüllte Pflegefälle.
- „Anmelden & persönlich einrichten“ verwendet die echte Plattformanmeldung. Dann liegen strukturierte Daten in D1 und hochgeladene Dateien in privatem R2, mit serverseitiger Fall- und Objektprüfung.
- Die bereitgestellte Website ist zunächst nur für ihren Eigentümer zugänglich. Eine Einladung **innerhalb der App** ersetzt nicht die zusätzliche Zugangsfreigabe zur privaten Website. Für einen Familien-Test müssen beide Ebenen kontrolliert eingerichtet sein; die Website wurde nicht öffentlich gemacht.

## Umgesetzt

Persönliche Einrichtung und Bedienpräferenzen; mehrere Pflegekreise und Pflegeprofile; Rollen, einmalige Einladungen und Widerruf; Aufgaben mit Anfrage, eigener Zusage, Ablehnung und dokumentierter Erledigung; Zeitfenster, Abwesenheiten, endliche Wiederholungen und Wochenbilanz; Arzttermine mit bestätigter Begleitung; persistente Nachbereitungsjobs, persönliche Hinweise, Wiedervorlage, Entwürfe, Anhänge und Veröffentlichung; vorgegebener Medikationsplan mit Korrekturhistorie und Doppelbuchungsschutz; Beobachtungen und Nachrichten; private Entlastungsziele und freiwillige eigene Selbsteinschätzung; eingeschränkte widerrufbare QR-Freigaben; JSON-, PDF- und grundlegender FHIR-R4-Export; persönlicher Textassistent; PWA-Manifest und datensparsame Offline-Seite.

Es gibt keine vorgetäuschte Praxisbestellung, keinen aktiven Sensoranschluss, keine medizinische KI oder Dosierungsentscheidung und keine behauptete Pushzustellung. Die Textassistenz navigiert beziehungsweise öffnet ein prüfbares Formular; sie ist kein Sprachmodell.

## Entwicklung

Node.js 24 wird für die SQLite-Integrationstests benötigt; die Anwendung setzt mindestens Node.js 22.13 voraus. Paketmanager: pnpm, Version gemäß `package.json`.

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm build
```

Die mitgelieferten Sites-Helfer in `scripts/` stammen aus dem ursprünglichen Entwicklungsumfeld (OpenAI Sites auf Cloudflare Workers). Dort lief der Build über ein externes Plugin-Skript, das nicht Teil dieses Repositorys ist. Außerhalb dieser Umgebung sind `pnpm build` und `pnpm dev` der Einstieg; die Plattformanbindung (`.openai/hosting.json`, Bindings, Anmeldung) muss dann gegebenenfalls angepasst werden.

Die Anwendung setzt Cloudflare Workers mit den Bindings `DB` (D1) und `BUCKET` (R2) sowie vertrauenswürdig gesetzte Plattform-Identitätsheader voraus. Lokale Browser-Previews ohne Plattformanmeldung erhalten keine künstliche Identität und nutzen die ausdrücklich aktivierte Demo. Auf einer anderen Hosting-Plattform müssen diese Integrationen und die Authentifizierung bewusst ersetzt werden. Clientseitig gesetzte Identitätsheader sind kein gültiger Ersatz.

Migrationen liegen in `drizzle/`. Bei lokalen Previews werden ausschließlich noch nicht angewandte Migrationen ausgeführt. Bereits angewandte Migrationen niemals ändern. Die SQL-Dateien enthalten keine echten Pflegeinformationen. Schemaerweiterungen entstehen durch `pnpm db:generate`.

## Verzeichnis

| Pfad | Zweck |
|---|---|
| `app/novalis.tsx` | Oberfläche und überprüfbare Formularabläufe |
| `app/client.tsx` | API-Zustand, ausdrücklich getrennte Demo, Dialoge |
| `lib/server.ts` | Rechteprüfung, persistente Operationen, Jobs, Dateien, Freigaben |
| `lib/domain.ts` | Zeit-, Medikations-, Rechte- und Serienlogik |
| `db/schema.ts`, `drizzle/` | Tabellen und versionierte Migrationen |
| `public/brand/` | echte SVG-Vektoren und PWA-Icons |
| `tests/run.mjs` | echte API- und Datenintegritätsprüfungen mit SQLite-D1-Adapter |
| `docs/` | Umsetzung, Abnahmematrix, Sicherheitsgrenzen, DiPA-Vorbereitung |
| `legacy/` | übergebener Quellstand als nicht ausführbares Referenzarchiv |

Die ursprünglichen problematischen KI-, QR- und Fragebogenwege in `legacy/` werden nicht als App-Routen ausgeliefert und nicht in TypeScript mitkompiliert. Sie sind kein Teil des neuen Servers. Es erfolgt keine automatische Übernahme alter unstrukturierter Gesundheitsdaten.

## Prüfungen und Freigabe

`docs/TEST_RESULTS.json` enthält die tatsächlich ausgeführten automatisierten Tests, `docs/BROWSER_QA.md` die manuell geprüften Browserabläufe. Die 60 Anforderungen in `docs/ACCEPTANCE_MATRIX.md` sind bewusst nicht pauschal als bestanden markiert. Lokale Adaptertests ersetzen keine unabhängige Sicherheitsprüfung, echte Mehrgeräteprüfung oder Prüfung mit assistiven Technologien.

Vor einem Echtbetrieb sind unter anderem Schadsoftware-Quarantäne, Datenschutz- und Betriebsfreigabe, belastbare Lösch- und Backup-Prozesse, weitere Authentifizierungs- und Sicherheitstests sowie pflegefachliche und regulatorische Prüfungen erforderlich. Details: `docs/SECURITY_PRIVACY.md` und `docs/DIPA_ROADMAP.md`.
