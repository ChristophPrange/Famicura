# Umsetzung und bewusste Grenzen

## Produktentscheidung

Der übergebene Vite-Prototyp wurde als Grundlage ausgewertet und in `legacy/` erhalten. Die aktuelle Fassung ist eine neue, serverfähige React-Anwendung mit getrennten Pflegefällen, persönlichen Kontoeinstellungen und nachvollziehbaren Ereignissen. Die alte grüne Gestaltung ist ersetzt. Die Originalanforderungen sind unverändert in `MASTERPROMPT.md` dokumentiert.

## Zusammenhängende Abläufe

1. Beim ersten Einstieg werden Schriftgröße und Kontrast sofort sichtbar. Rolle, Pflegeprofil, Erinnerungen und bewusste Bestätigungen folgen. Der Fortschritt wird pro Konto gespeichert. Wer eingeladen wird, kann die Anlage eines eigenen Profils überspringen und danach eine Einladung verwenden.
2. Ein Konto kann mehrere Kreise und mehrere gepflegte Personen sehen. Der Profilwähler steuert den sichtbaren Fall; die API prüft unabhängig davon Mitgliedschaft und Fallumfang.
3. Aufgaben bleiben offen, angefragt oder verbindlich zugesagt. Niemand darf eine fremde Zusage erzeugen. Vertretungsvorschläge ersetzen nicht die bestehende Zuständigkeit. Eine Ablehnung lässt die zu klärende Versorgungslücke sichtbar.
4. Verfügbarkeiten besitzen konkrete Daten und Anfangs-/Endzeiten. Vorschläge berücksichtigen im sichtbaren Fall bestätigte Zeitfenster, Abwesenheiten und bekannte Belegungen. Der Server prüft zusätzlich fallübergreifende bestätigte Doppelbelegungen mit einer neutralen Fehlermeldung.
5. Endliche Serien erzeugen sieben tägliche Aufgaben oder vier wöchentliche Aufgaben/Zeitfenster. Jede Instanz hat eine eigene ID und Version. Änderungen an offenen zukünftigen Serieneinträgen erhalten vergangene und erledigte Termine. Datum, Uhrzeit und Zuständigkeit werden pro Instanz geändert.
6. Ein Arzttermin braucht eine selbst bestätigte Begleitung. Eine dauerhafte Erinnerung wird zum bestätigten Ende oder 15 Minuten nach dem geplanten Ende fällig. Ohne Ende wird kein Zeitpunkt erfunden. Ein geplanter Zeitpunkt beweist nicht, dass der Besuch tatsächlich stattgefunden hat.
7. Die Begleitung kann Bericht, offene Punkte, mehrere Anhänge, Folgetermin und Folgeaufgabe ergänzen. Entwürfe bleiben bei der berichtenden Person. Nach Veröffentlichung erhalten nur leseberechtigte Mitglieder einen Hinweis. Berichtete Medikamentenänderungen ändern den aktiven Plan nicht automatisch.
8. Medikamentengaben sind eigene Ereignisse mit Autor, Zeit, Mengen-/Einheitensnapshot und Planversion. Eine Korrektur erhält das Original und braucht einen Grund. Eine bereits dokumentierte geplante Gabe lässt sich nicht als zweite reguläre Gabe speichern.
9. Persönliche Entlastungsziele und Befindlichkeitsantworten sind privat. Die eigene 1–5-Selbsteinschätzung wird ausdrücklich nicht als validiertes Instrument ausgewertet.
10. Ein QR-Zugang enthält ausschließlich einen Zufallstoken. Er gilt maximal 24 Stunden, ist widerrufbar und zeigt nur den beschriebenen Notfallauszug. Die private Website benötigt weiterhin einen zugelassenen Zugang; der Code ersetzt keine öffentliche Notfallkarte.

## Funktioniert nur im verbundenen Betrieb

Geräteübergreifende Daten, echte Einladungsannahme, persönliche Serverbenachrichtigungen, dauerhafte Anhänge und widerrufbare QR-Freigaben. Die ausdrücklich markierte Demo simuliert diese Prozesse nur für den aktuellen Browser-Tab; sie wird nicht als verifizierter Mehrbenutzerbetrieb dargestellt.

## Noch nicht umgesetzt oder nicht freigegeben

- Web-Push, E-Mail-/SMS-Versand, Hintergrundzustellung an ein ausgeschaltetes Mobilgerät und Lesebestätigungen anderer Personen.
- Medizinische KI, Mikrofonsteuerung, Sensoren, ePA-/Praxisintegration, OCR mit fachlicher Prüfung und automatisierte Rezeptbestellung.
- Unendliche Wiederholungsregeln, Drag-and-drop-Schichtplan und komplexe wiederkehrende Ausnahmen.
- Freigegebene körperbezogene Pflegeprogramme, lizenzierte validierte Instrumente und nachgewiesener pflegerischer Nutzen.
- Automatischer Import alter Browserdaten. Originaldaten zuerst gesondert sichern und auf Einwilligung, Autor, Fall und Instrumentversion prüfen; unbekannte Daten nicht still verwerfen oder klinisch umdeuten.
- Vollständige Konto-/Pflegekreislöschung mit Übergabe der Verwaltungsrolle, Datenaufbewahrung und R2-/Backup-Bereinigung über eine geprüfte Benutzeroberfläche. Der vorhandene API-Schutz verhindert eine unbedachte Löschung bei aktiver Kreisverwaltung.
- Schadsoftware-Quarantäne, professioneller Betriebs-Support, verifizierte Datenregion und vollständiger produktiver Backup-/Restore-Prozess.

Diese Punkte sind Entwicklungs- beziehungsweise Freigabearbeit. Das Vorhandensein entsprechender Tabellen oder UI-Hinweise ist kein Nachweis, dass eine externe Integration bereits besteht.
