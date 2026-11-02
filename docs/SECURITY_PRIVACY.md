# Datenschutz, Sicherheit und Freigabesperren

## Tatsächlich vorhandene technische Maßnahmen

Serverseitige Identität und Fallrechte; getrennte private Datensätze; geschützte Dateiabrufe; gehashte Einladungs- und Notfalltokens; befristete Freigaben und Widerruf; Same-Origin-Prüfung für Browsermutationen; `no-store`; Signatur-/Typ-/Größenprüfung von Uploads; Versionierung, eindeutige Gabenereignisse und Korrekturgründe; ausgewählte Audit-Ereignisse; keine extern aktive KI, Tracker oder Werbung.

Die Originalfassung ist nur als Referenzarchiv enthalten. Ihre früheren ungeschützten KI-, QR- und Fragebogenfunktionen werden nicht übernommen. Das neue Logo ist ein Vektorasset ohne externen Fontabruf.

## Bedrohungen und verbleibende Arbeit

| Bedrohung | Aktuelle Grenze | Vor Echtbetrieb erforderlich |
|---|---|---|
| fremdes Pflegeprofil über API-ID | Mitgliedschaft und Fallumfang werden geprüft | unabhängige Rechte-/Penetrationstests, systematische Negativtests aller Routen |
| fremde private Antworten | Autorprüfung in Lesen und Export | Datenschutz-Audit mit zwei echten Konten auf mehreren Geräten |
| weitergereichte Dateilinks | erneute Rechteprüfung bei jedem Abruf | AV-/CDR-Quarantäne, Scannerfehler- und Bereinigungsprozesse |
| verlorener QR-Code | Zufallstoken, 24 h, Widerruf, begrenzte Felder | fachlich abgestimmtes Notfall-/Einwilligungsmodell und Missbrauchsbegrenzung |
| konkurrierende Gaben | eindeutiger Schlüssel und Korrekturereignisse | verteilte Last-/Wiederholungs- und Netzwerkfehlerprüfungen |
| Sitzungs- oder Geräteverlust | Plattformauthentifizierung | Sitzungsende, Gerätefreigaben, MFA-Konzept und Wiederherstellungsprüfung |
| Fehlbedienung / Therapieirrtum | keine automatische Therapieentscheidung | pflegefachliche Gebrauchstauglichkeit, Risikoakte und Inhaltsfreigabe |
| Infrastrukturverlust | lokaler SQLite-Backup-Test vorhanden | produktive D1+R2-Backups, Verschlüsselung, RPO/RTO und Wiederherstellungsübung |

**Kritischer Entwicklungsstatus:** Hochgeladene Dateien bleiben `unverified`, sind aber in dieser Testfassung für Berechtigte herunterladbar. Das ist keine sichere produktive Quarantäne. Echte Gesundheitsunterlagen dürfen hier noch nicht verarbeitet werden.

## Datenschutzarbeit vor Pilot mit Echtdaten

Verantwortlichen, Datenschutzbeauftragten und Auftragsverarbeiter bestimmen. Tatsächliche Datenflüsse einschließlich Identitätsanbieter, Plattform, Cloud, Logs, Support, Backups und Unterauftragnehmer dokumentieren. Rechtsgrundlagen, besondere Datenkategorien, Vertretungsbefugnisse, Datenschutzhinweise, Zweckbindung und getrennte freiwillige Einwilligungen prüfen. Eine Entwicklungsbestätigung ist keine fertige rechtswirksame Einwilligungs- und Widerrufsverwaltung für den Echtbetrieb.

Datenregionen, Drittlandbezüge und Verträge sind nicht verifiziert. Es gibt keinen zugesicherten EU-only-Betrieb. Erforderliche Datenschutz-Folgenabschätzung und Zertifizierungsnachweise bleiben offen. Speicherfristen, Auskunft, vollständige Löschung, Aufbewahrung, Rollenübergabe und Backup-Tombstones müssen produktiv umgesetzt und getestet werden. Ein Soft-Delete erfüllt diese Anforderungen nicht automatisch.

## Hintergrund-Writer und Zugangsgrenze

`POST /api/jobs/run` verarbeitet ausschließlich gespeicherte Fälligkeiten und gibt nur eine Anzahl zurück. Es vertraut in dieser Fassung auf die **owner-private Sites-Dispatch-Grenze** und den vom Cloud-Task verwendeten privaten Servicezugang. Der Endpoint ist kein allgemein öffentlich abgesicherter Cron-Endpunkt.

**Vor öffentlicher Freigabe oder Erweiterung der Hosting-Zugangsregel ist ein eigenständig authentifizierter, enger Dienstzugang einzubauen und zu testen.** Keine Service-Bearer, Auth-Header oder Repository-Tokens in Dateien, Quellcode oder Aufgabenprompt speichern. Ein Aufgabenlauf erhält dadurch keine Besuchersitzung und keine pauschalen Rechte auf andere Dienste.

## Kein Freigabeversprechen

Bestandene Entwicklungstests sind weder ISO-/BSI-Zertifikat noch rechtliches Gutachten oder pflegefachliche Freigabe. Die verbliebenen Risiken werden nicht durch einen Hinweistext beseitigt; die entsprechenden Maßnahmen müssen vor einem Echtbetrieb umgesetzt sein.
