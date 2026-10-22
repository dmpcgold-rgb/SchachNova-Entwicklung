# SchachNova Wertung – liglicko2 Integration

Referenz: https://github.com/niklasf/liglicko2
Lizenz: MIT oder Apache-2.0
Die Bibliothek ist in Rust implementiert. Sie beschreibt eine an Lichess angelehnte Glicko-2-Variante mit sofortigen Aktualisierungen nach jeder Partie und fraktionalen Wertungsperioden. Der Autor weist darauf hin, dass sie **nicht exakt** der Lichess-Implementierung entspricht.

## Verbindliche Integrationsregeln
- Eine Partie wird nur gewertet, wenn **beide** Spieler vor Spielbeginn eine gewertete Partie vereinbart haben.
- Die serverseitige, autoritative Wertungsberechnung muss die Rust-Bibliothek liglicko2 verwenden. Clientseitige Berechnungen sind nicht autoritativ.
- Bot-Partien, Offline-Partien und Analysepartien ändern keine Online-Spielerwertung.
- Der Server speichert pro Spieler und Spielmodus Rating, Abweichung, Volatilität und Zeitpunkt der letzten Aktualisierung.
- Nur ein serverseitig bestätigtes, einmaliges Endergebnis darf ein Rating-Update auslösen. Die Partie-ID dient als Idempotenzschlüssel.
- Wertungsupdates müssen beide Spieler atomar aktualisieren.
- Nach Partieende: alte Wertung, neue Wertung, Differenz (+/-), Rating-Abweichung und vorläufiger Status.
- Getrennte Wertungen für Bullet, Blitz, Rapid und Classical; keine Vermischung.
- Bei Remis Score::DRAW, Sieg Score::WIN, Niederlage Score::LOSS verwenden.
- Die Startwerte und die Umrechnung von Zeit zu liglicko2::Periods werden vor Inbetriebnahme als Server-Konfiguration festgelegt.
- Keine als echt bezeichnete Elo/Glicko-Wertung, solange kein Backend angebunden und getestet ist.

## Rust-Beispiel (für das spätere Backend)

```rust
use liglicko2::{RatingSystem, Score, Instant, Periods};

let system = RatingSystem::new();
let white = system.new_rating();
let black = system.new_rating();
let now = Instant::default() + Periods(1.0);
let (new_white, new_black) =
    system.update_ratings(&white, &black, Score::WIN, now)?;
```

Die Android-App selbst verwendet Kotlin und JavaScript. Die Rust-Bibliothek kann nicht durch bloßes Einfügen des GitHub-Links ausgeführt werden. Für echte gewertete Online-Partien ist die Backend-Integration erforderlich.
