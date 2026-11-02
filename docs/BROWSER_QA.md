# Entwicklerprüfung im Browser

Geprüft im verwalteten Chrome-Browser auf der internen Vorschau. Die Prüfung verwendet ausschließlich fiktive Demoangaben. Sie ist keine Prüfung der echten Plattformanmeldung oder ein physischer Mehrgeräte-/Mobiltest.

- Desktop-Startseite: Logo, warme Farbwelt, Navigation, Pflegeprofilwähler und Tageskarten visuell kontrolliert.
- Neue Aufgabe mit Datum und Uhrzeit gespeichert; nach Neuladen wieder sichtbar.
- Arzt-Nachbereitung als Entwurf gespeichert, erneut geöffnet und anschließend veröffentlicht. Dabei entdeckten Fehler der Demo-Zustandsübergabe korrigiert und Ablauf wiederholt.
- Medikamentengabe ausdrücklich als „Unklar / Rückfrage nötig“ dokumentiert; entsprechender Status mit Person sichtbar.
- Pflegeprofil von Anna zu Paul und zurück gewechselt; fallbezogene Aufgaben, Medikamente und Termine wechseln passend.
- Vier wöchentliche Einzelaufgaben angelegt; Serienkennzeichnung und veränderte Aufgabenzahl sichtbar.
- Schmale Ansicht über iframe mit 390 CSS-Pixeln visuell geprüft: einspaltige Inhalte und untere Navigation, keine Überlagerung durch das Logo.
- Ersteinrichtung ohne vorgegebene Pflegefälle geöffnet; sehr große Schrift, Kontrast und einfache Ansicht ausgewählt; Rollenwahl und Profilanlage geprüft. Alle fünf Schritte abgeschlossen; ein leerer Plan mit genau dem selbst angelegten Testprofil erscheint ohne erfundene Inhalte.

Verbleibend: Browserauthentifizierung mit zwei unabhängig zugelassenen echten Konten, reale Geräte, Screenreader und Tastaturnutzung, alle Downloadabbruchfälle, PWA-Installation auf iOS/Android, produktiver Backup-/Restore-Test und unabhängiger Sicherheitstest. Die automatisierten API-Prüfungen stehen getrennt in `TEST_RESULTS.json`.
