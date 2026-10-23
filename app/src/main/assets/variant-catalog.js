"use strict";
/* Informationskatalog, keine Freischaltung nicht implementierter Varianten. */
window.SchachNovaVariantCatalog=[
  {
    "id": "chess960",
    "name": "Schach960",
    "description": "Start: 960 mögliche spiegelbildliche Grundreihen; Läufer auf unterschiedlichen Feldfarben, König zwischen den Türmen. Ziel: Schachmatt wie im Standardschach. Rochade: König endet auf g- oder c-Linie, Turm auf f- oder d-Linie; die Wege müssen regelgerecht frei und sicher sein."
  },
  {
    "id": "atomic",
    "name": "Atomschach",
    "description": "Start: normale Schachaufstellung. Ziel: den gegnerischen König durch eine Explosion entfernen. Bei jedem Schlag verschwinden schlagende und geschlagene Figur sowie benachbarte Nichtbauern im 3×3-Bereich. Benachbarte Bauern überleben; den eigenen König darf man nicht sprengen."
  },
  {
    "id": "horde",
    "name": "Horde",
    "description": "Start: Schwarz hat normale Figuren, Weiß eine Horde von 36 Bauern ohne König. Ziel: Weiß setzt Schwarz matt; Schwarz entfernt sämtliche weißen Figuren. Weiße Bauern können aus ihren besonderen Anfangsreihen unter bestimmten Bedingungen zwei Felder ziehen."
  },
  {
    "id": "racingkings",
    "name": "Racing Kings",
    "description": "Start: spezielle symmetrische Aufstellung ohne Bauern auf den unteren zwei Reihen. Ziel: den eigenen König auf Reihe 8 bringen. Schachgeben ist verboten. Erreicht Weiß zuerst die Ziellinie, erhält Schwarz einen Ausgleichszug; erreicht Schwarz sie ebenfalls, ist es Remis."
  },
  {
    "id": "crazyhouse",
    "name": "Crazyhouse",
    "description": "Start: normales Brett. Ziel: Schachmatt. Geschlagene Figuren wechseln die Farbe und kommen in den eigenen Vorrat. Einsetzen auf ein freies Feld ersetzt einen Zug; Bauern dürfen nicht auf Reihe 1 oder 8 eingesetzt werden. Geschlagene umgewandelte Bauern werden wieder Bauern."
  },
  {
    "id": "capablanca",
    "name": "Capablanca-Schach",
    "description": "Start: üblicherweise 10×8 mit Kanzler (Turm+Springer) und Erzbischof (Läufer+Springer). Ziel: Schachmatt. Rochade und Bauernumwandlung sind an das größere Brett angepasst; konkrete Aufstellung hängt vom Regelwerk ab."
  },
  {
    "id": "janus",
    "name": "Janus-Schach",
    "description": "Start: 10×8-Brett mit zwei zusätzlichen Janus-Figuren pro Seite. Janus zieht wie Läufer und Springer. Ziel: Schachmatt; besondere Anfangsstellung und Rochade auf dem breiteren Brett beachten."
  },
  {
    "id": "grand",
    "name": "Grand Chess",
    "description": "Start: 10×10-Brett mit zusätzlichem Kanzler (Turm+Springer) und Erzbischof (Läufer+Springer). Ziel: Schachmatt. Die Figuren stehen nicht wie im Standardschach; Bauernumwandlung und Rochade folgen Sonderregeln."
  },
  {
    "id": "seirawan",
    "name": "Seirawan-Schach",
    "description": "Start: Standardschach plus zwei Reservefiguren, Falke (Läufer+Springer) und Elefant (Turm+Springer). Wenn eine Figur ihre Grundreihe verlässt, kann eine Reservefigur auf deren Ausgangsfeld eingesetzt werden. Ziel: Schachmatt."
  },
  {
    "id": "bughouse",
    "name": "Tandemschach (Bughouse)",
    "description": "Start: zwei Standardbretter, vier Spieler in zwei Teams. Geschlagene Figuren gehen an den Partner, der sie als Zug einsetzen kann. Bauern dürfen nicht auf der ersten oder letzten Reihe eingesetzt werden. Ein Matt auf einem Brett entscheidet das Teamspiel."
  },
  {
    "id": "duck",
    "name": "Entenschach",
    "description": "Start: normales Schachbrett plus neutrale Ente. Jeder Zug besteht aus einem Figurenzug und dem Versetzen der Ente auf ein freies Feld. Die Ente blockiert Zugwege und kann nicht geschlagen werden. Ziel ist das Schlagen des gegnerischen Königs; Schachgebote spielen keine normale Rolle."
  },
  {
    "id": "placement",
    "name": "Aufstellungsschach",
    "description": "Start: Figuren werden vor dem eigentlichen Spiel auf der eigenen Grundreihe platziert, statt die normale Startstellung zu übernehmen. Anschließend wird nach Schachregeln gespielt. Ziel: Schachmatt. Zulässige Platzierungen und Rochade hängen von der konkreten Variante ab."
  },
  {
    "id": "extinction",
    "name": "Extinction",
    "description": "Start: normale Aufstellung. Ziel: alle gegnerischen Figuren mindestens einer Figurenart beseitigen (z. B. sämtliche Springer). Der König ist dabei nicht wie im Standardschach vor Schach geschützt; Schlagen kann entscheidend sein."
  },
  {
    "id": "knightmate",
    "name": "Knightmate",
    "description": "Start: Variante mit vertauschten Rollen von König und Springer. Der Springer ist die königliche Figur, die nicht geschlagen werden darf; der bisherige König zieht als gewöhnliche Figur. Ziel: Mattsetzen des königlichen Springers."
  },
  {
    "id": "threecheck",
    "name": "Drei-Schach",
    "description": "Start: normales Schach. Ziel: Schachmatt oder dem Gegner insgesamt drei Schachgebote geben. Jedes Zug-Schach zählt einmal, auch Doppelschach. Die Anzahl der Schachgebote wird separat gespeichert."
  },
  {
    "id": "hill",
    "name": "King of the Hill",
    "description": "Start: normales Schach. Ziel: Schachmatt oder den eigenen König legal auf d4, e4, d5 oder e5 bringen. Der König darf sich dafür nicht ins Schach bewegen."
  },
  {
    "id": "antichess",
    "name": "Räuberschach",
    "description": "Start: normales Brett. Ziel: alle eigenen Figuren verlieren oder keine legalen Züge mehr haben. Schlagzwang: Gibt es einen Schlagzug, muss geschlagen werden. Es gibt kein Schach oder Matt; der König darf geschlagen werden. Bauern können auch zum König umwandeln."
  },
  {
    "id": "shogi",
    "name": "Shogi",
    "description": "Start: japanisches 9×9-Brett mit eigenen Figuren. Ziel: den gegnerischen König mattsetzen. Geschlagene Figuren kommen in die Hand und dürfen später eingesetzt werden. Viele Figuren können in der gegnerischen Zone befördert werden; für Einsetzen gelten Sonderverbote."
  },
  {
    "id": "xiangqi",
    "name": "Xiangqi",
    "description": "Start: 9×10-Brett mit Fluss und zwei Palästen; Figuren stehen auf Linienkreuzungen. Ziel: Mattsetzen des Generals. Kanonen benötigen beim Schlagen einen Sprungstein, Elefanten überqueren den Fluss nicht und Generäle dürfen sich nicht frei gegenüberstehen."
  },
  {
    "id": "janggi",
    "name": "Janggi",
    "description": "Start: koreanisches 9×10-Brett mit Palästen und eigenen Bewegungsregeln. Ziel: den gegnerischen General mattsetzen. Kanonen springen über Figuren; einige Figuren ziehen auf Palastdiagonalen. Passzüge und besondere Patt-/Punktregeln sind möglich."
  },
  {
    "id": "makruk",
    "name": "Makruk",
    "description": "Start: thailändisches 8×8-Schach mit anderer Anfangsstellung. Dame und Läufer sind deutlich schwächer als im westlichen Schach. Bauern werden früher umgewandelt. Ziel: Matt; besondere Zugzählregeln begrenzen lange Endspiele."
  },
  {
    "id": "minishogi",
    "name": "Mini-Shogi",
    "description": "Start: 5×5-Brett mit reduzierter Shogi-Armee. Ziel: den König mattsetzen. Geschlagene Figuren können eingesetzt werden; Beförderung erfolgt in der gegnerischen Zone. Für Bauerneinsätze gelten Einschränkungen."
  },
  {
    "id": "shatranj",
    "name": "Shatranj",
    "description": "Start: historische 8×8-Aufstellung. Ziel: den König mattsetzen; in traditionellen Regeln können auch Patt oder das Entblößen des Königs gewinnen. Die Dame zieht nur ein Feld diagonal, der Elefant springt zwei Felder diagonal."
  },
  {
    "id": "amazon",
    "name": "Amazonenschach",
    "description": "Start: Schach mit zusätzlicher Amazonenfigur. Die Amazone zieht wie Dame und Springer zusammen. Ziel: Schachmatt. Brettgröße und genaue Ausgangsstellung können je nach Regelvariante abweichen."
  },
  {
    "id": "hoppelpoppel",
    "name": "Hoppel-Poppel",
    "description": "Start: normales Brett. Läufer und Springer tauschen ihre Bewegungsarten: Läufer springen wie Springer, Springer gleiten diagonal wie Läufer. Ziel: Schachmatt."
  },
  {
    "id": "losalamos",
    "name": "Los-Alamos-Schach",
    "description": "Start: 6×6-Brett ohne Läufer, mit angepasster Figurenaufstellung. Ziel: Schachmatt. Bauern ziehen nur ein Feld vorwärts; keine Rochade oder en passant."
  },
  {
    "id": "torpedo",
    "name": "Torpedo-Schach",
    "description": "Start: normales Brett. Bauern dürfen aus jeder Reihe um ein oder zwei freie Felder vorwärts ziehen, nicht nur beim ersten Zug. Ziel: Schachmatt. En passant und Umwandlung müssen entsprechend berücksichtigt werden."
  },
  {
    "id": "berolina",
    "name": "Berolina-Schach",
    "description": "Start: normales Schachbrett mit Berolina-Bauern. Bauern ziehen diagonal nach vorne auf freie Felder und schlagen gerade nach vorne. Ziel: Schachmatt. Doppelzug und en passant haben Sonderregeln."
  },
  {
    "id": "fivecheck",
    "name": "Fünf-Schach",
    "description": "Start: normales Schach. Ziel: Schachmatt oder fünf Schachgebote gegen den gegnerischen König. Ein Zug mit Doppelschach zählt als ein Schachgebot."
  },
  {
    "id": "capahouse",
    "name": "Capablanca-Crazyhouse",
    "description": "Start: größeres Capablanca-Brett mit Kanzler und Erzbischof. Ziel: Schachmatt. Wie bei Crazyhouse werden geschlagene Figuren dem eigenen Vorrat hinzugefügt und können als Zug wieder eingesetzt werden."
  }
];
