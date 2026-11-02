# Übergabe – NOVALIS

Entwicklungsstand vom 29.10.2026.

- Grundlegende technische und visuelle Neufassung des übergebenen Prototyps.
- 59 automatisierte API-/Fachlogik-/Integritätsprüfungen erfolgreich; Details und Ausführungszeit in `TEST_RESULTS.json`.
- TypeScript-Prüfung ohne Fehler.
- Browserprüfung wichtiger Abläufe einschließlich persönlicher Einrichtung, Arztbericht, Medikamentenstatus, Fallwechsel, Aufgaben und schmaler Ansicht; Grenzen in `BROWSER_QA.md`.
- 60 Anforderungen separat bewertet, ohne pauschale Abnahmebehauptung: `ACCEPTANCE_MATRIX.md`.
- SVG-Assets und ursprünglicher Quellstand mit Herkunftsnotizen enthalten.

Die veröffentlichte Anwendung ist privat und als Entwicklungsfassung gekennzeichnet. Die Demo benötigt keine künstliche Anmeldung und verwendet fiktive Beispiele. Eine echte Anmeldung beginnt ohne erfundene Pflegeinformationen.

Für einen Familien-Piloten sind unabhängige Konten und die kontrollierte Hosting-Freigabe zusätzlich zur Einladung innerhalb der App erforderlich. Für Gesundheitsdaten im Echtbetrieb sind die in `SECURITY_PRIVACY.md` aufgeführten Maßnahmen und Freigaben zwingend noch abzuarbeiten. Die DiPA-Vorbereitung in `DIPA_ROADMAP.md` ist eine Arbeitsgrundlage; es gibt keinen Zulassungs-, Erstattungs- oder Wirksamkeitsnachweis.

Die Webseite und das Quellcodepaket enthalten keine API-Schlüssel oder sonstigen Zugangstokens. Externe Integrationen werden nur als vorhanden bezeichnet, wenn sie tatsächlich angebunden sind. Offene Erweiterungen sind in `IMPLEMENTATION.md` erfasst.

## Bereitstellung

Private App: https://novalis-pflege-gemeinsam.budnicktm.chatgpt.site

Produktions-Build und Veröffentlichung erfolgreich. Produktiver Hintergrund-Writer mit HTTP 200 geprüft; noch keine fälligen produktiven Fälle (`processed: 0`). Stündlicher Cloud-Zeitplan in Europe/Berlin gespeichert und aktiviert. Die Plattform erlaubt höchstens einen Hintergrundlauf pro Stunde; dies ist keine sofortige Pushzustellung. Siehe `SCHEDULE.md`.
