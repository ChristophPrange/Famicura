# Betrieb der Hintergrund-Erinnerungen

## Zweck

Fällige persönliche Nachbereitungs- und Wochenhinweise sollen serverseitig entstehen, auch wenn kein Browser geöffnet ist. Im geöffneten Browser werden Hinweise beim nächsten Abruf sichtbar; es handelt sich nicht um Push an ein ausgeschaltetes Telefon.

## Gespeicherter Aufrufweg

Der mit dieser privaten Site verknüpfte Cloud-Task liest die aktuelle Site-Metadatenantwort. Er verwendet ausschließlich den dort für dieselbe exakte Site-Herkunft ausgegebenen privaten Servicezugang und führt `POST /api/jobs/run` ohne Browser-Origin aus. Es werden keine Kontodaten, Patienteninformationen oder Drittanbieter-Apps benötigt. Die Antwort lautet `{processed: Anzahl}`.

Keine Tokens im Prompt, Repository, Log, URL oder in Artefakten speichern. Bei verweigertem Zugang nicht die Website öffentlich machen oder eine Browseranmeldung improvisieren. Fehlgeschlagene Läufe werden als fehlgeschlagen gemeldet; eindeutige Deduplizierung erlaubt einen späteren erneuten Versuch.

## Takt und Semantik

Gespeicherter Takt: stündlich zur vollen Stunde in `Europe/Berlin`, aktiviert. Die Plattform erlaubt höchstens einen Lauf pro Stunde; ein 15-Minuten-Takt wurde deshalb nicht gespeichert. Bei geschlossener App kann ein Hinweis zusätzlich bis zum nächsten stündlichen Lauf verzögert sein. Bei geöffneter App werden fällige Jobs außerdem bei den regulären Datenabrufen verarbeitet. Nachbereitung: bestätigtes tatsächliches Ende oder geplantes Ende plus 15 Minuten. Termin ohne Endzeit: keine erfundene Fälligkeit. Wochenabfrage: Donnerstag 18 Uhr für die nächste Woche. Persönliche Erinnerungspräferenzen werden berücksichtigt.

## Betriebsgrenze

Der Writer vertraut aktuell auf die owner-private Hosting-Zugangsgrenze. Vor einer Erweiterung der Hosting-Zugangsregel muss eine eigenständige enge Dienstauthentifizierung eingeführt und getestet werden. Die normale Familien-Mitgliedschaft innerhalb der App ist davon unabhängig. Der Produktionsaufruf und der gespeicherte Zeitplan werden nach der Bereitstellung separat geprüft und im Übergabebericht beschrieben.

## Verifizierter Stand

Nach der Veröffentlichung wurde der produktive Writer mit dem vorgesehenen privaten Servicezugang aufgerufen: HTTP 200, `processed: 0`. Die Datenbankabfrage funktioniert; es lagen noch keine fälligen produktiven Fälle vor. Der Cloud-Zeitplan wurde erfolgreich gespeichert und aktiviert. Ein zukünftiger automatischer Lauf oder eine tatsächliche fällige Zustellung wurde nicht vorweggenommen.
