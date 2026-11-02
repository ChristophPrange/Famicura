# Gestaltung und Bedienbarkeit

Die Oberfläche verwendet Creme und Beige als Grundflächen, dunkles warmes Braun für Text und ein dunkles Terrakotta-Orange für Aktionen. Helles Orange und Sonnenuntergangsverläufe tragen die Marke, ohne helle Schrift auf einen unruhigen Verlauf zu setzen. Die Bildschirmaufteilung folgt „Heute → Plan → Gesundheit → Entlastung → Mehr“. Pflegekreis und persönliche Einstellungen sind auf großen Bildschirmen zusätzlich direkt erreichbar.

Das übergebene NOVALIS-Emblem und der Schriftzug wurden als echte Vektoren nachgezeichnet. `public/brand/novalis-symbol.svg` und `novalis-wordmark.svg` enthalten Pfade statt eingebetteter PNGs. Dies ist eine hochwertige Rekonstruktion der Rastervorlagen, keine behauptete Lieferung einer unbekannten Original-Vektordatei. App-Icons besitzen bewusst einen beigen Hintergrund; die separaten Logoassets sind transparent.

| Token | Wert |
|---|---|
| Hintergrund | #F7F3ED |
| Papierfläche | #FFFDFA |
| Haupttext | #382A23 |
| Sekundärtext | #796A60 |
| Aktionsfarbe | #A94418 |
| Orange Akzent | #ED8248 |
| Beige | #F1E9DD |

Wichtige Buttons besitzen große Trefferflächen, beschriftete Formulare und sichtbare Fokuszustände. Native Dialoge sperren den Hintergrund und geben den Fokus zurück. Schriftgröße, Kontrast, vereinfachte Ansicht und Bewegungsreduktion sind persönlich speicherbar. Der reduzierte Modus reduziert dekorative Flächen; zentrale Funktionen bleiben zugänglich.

Die Entwicklerprüfung hat die normale Desktopdarstellung und eine schmale 390-CSS-Pixel-Ansicht betrachtet. Ein iframe ist kein physischer Mobilgerätetest. Screenreader, echte Tastatur-Nutzertests, Zoom/Reflow bei 400 Prozent, Druck/PDF-Layout und sämtliche Farbkombinationen müssen vor Barrierefreiheitszusage gesondert geprüft werden.
