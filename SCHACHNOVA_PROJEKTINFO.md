# SchachNova – Projektinformationen

Stand: 24. Oktober 2026. Dieses Dokument ist die technische Übergabe für die Weiterentwicklung von **SchachNova**. Die tatsächlichen Dateien und Commits im Repository haben Vorrang vor älteren Chat-Zusammenfassungen.

## Repository und Build
- GitHub: https://github.com/dmpcwien/SchachNova
- Standardbranch: `main`
- Android-Quellcode: `app/src/main/`
- Web-Oberfläche, Navigation und Design: `app/src/main/assets/index.html`
- Schachregeln, Spielbrett und Zuganimation: `app/src/main/assets/chess.js`
- Trainingslogik: `app/src/main/assets/training.js`
- Android-Manifest: `app/src/main/AndroidManifest.xml`
- Signierter Release-Build: `.github/workflows/build-release.yml`
- Build-Seite: https://github.com/dmpcwien/SchachNova/actions/workflows/build-release.yml
- Android-Ressourcen für das App-Icon: `app/src/main/res/mipmap-*/ic_launcher.png`
- Signierung erfolgt über bestehende GitHub Actions Secrets. **Niemals Schlüssel oder Passwörter in dieses Dokument oder den Quellcode schreiben.**

## Produktvorgaben
1. SchachNova bleibt ein eigenständiges Projekt; nicht mit anderen Schach-Apps oder Repositories verwechseln.
2. Bestehende Spielmodi, Trainingsfunktionen, lokale Daten, Android-Paketkennung und dauerhaftes Release-Signierzertifikat erhalten.
3. Die APK muss über die vorherige Version installierbar bleiben (gleiche Paketkennung und Signatur).
4. Das Brett soll groß, symmetrisch, quadratisch und nicht scrollbar sein; 64 gleich große Felder.
5. Zuganimationen sollen flüssig und flackerfrei sein. Blindschach-Scheiben müssen sich mitbewegen.
6. Schachregeln und Varianten korrekt prüfen, insbesondere illegale Königszüge und Partieende.
7. Änderungen mit Tests absichern; eine erfolgreiche APK erst nach tatsächlichem Build bestätigen.

## Designentscheidung – Silber / Blau
- Standardoptik: dunkles Marineblau, elektrische blaue Akzente, silberne/chromfarbene Highlights.
- Schachfarben: **Silber = Weiß**, **Blau = Schwarz**.
- Standardbrett: Silber-Blau; weitere auswählbare Brettdesigns: Klassisch, Dunkel, Holz und Marmor.
- Originalfiguren bleiben als Alternative verfügbar.
- Die UI verwendet gespeicherte Optionen `schachnova_board_skin` und `schachnova_piece_skin` im lokalen Speicher.
- **Aktuelle Nutzerentscheidung:** Kein neuer echter 3D-Figurensatz. Die Figuren aus der bestätigten Videovorlage beibehalten; vorhandene auswählbare Figurenstile nicht ohne Zustimmung ersetzen.
- Das gewünschte Silber-Blau-App-Icon ist unter `app/src/main/res/mipmap-mdpi/ic_launcher.png` hinterlegt und im Manifest als `@mipmap/ic_launcher` eingetragen. Hochauflösende Dichtevarianten sind noch nachzuliefern.
- Das Icon soll dem vom Nutzer ausgewählten Motiv entsprechen; nicht eigenmächtig durch ein anderes Bild ersetzen.

## Wichtige Commits
- `87d6070` – Grundfarben und gemeinsames Silber-Blau-Brett.
- `da6063e` – Brett- und Figuren-Designauswahl, Speicherung.
- `9b9e185` – Überarbeitung des Hauptmenüs.
- `2287586` – plastische Metall-/Saphir-Effekte.
- `20a20d6` – eigener SVG-Figurensatz mit Original-Alternative.
- `b048677` – Icon-Bilddatei in das Repository übertragen.
- `b1fde88` – Icon im Android-Manifest registriert.

## Noch offen / verifizieren
- Hochauflösende Icon-Dateien für alle Android-mipmap-Dichten aus dem **original ausgewählten Motiv** integrieren.
- Darstellung der bestehenden Vorbild-Figuren auf einem echten Android-Gerät prüfen (inklusive Schachtraining und Varianten).
- Prüfen, dass die Auswahl der alten Brettdesigns tatsächlich funktioniert und die Schachbrettdarstellung in allen Modi konsistent ist.
- Zuganimation, Brettgeometrie, Spielregeln, Schachuhr, Bot und Varianten regressionsprüfen.
- GitHub Actions Build erfolgreich durchlaufen lassen, signierte APK installieren und Update über vorherige Version testen.
- **Kein Auftrag für echte 3D-Figuren.** Vorrang: Vorbildtreue, Silber-Blau-Farben, Menüs, flüssige Animationen, Regeln und updatefähige APK.

## Vorgehen bei der nächsten Bearbeitung
1. Zuerst aktuelle Dateien, `main`-HEAD und Actions-Status aus GitHub lesen.
2. Vorhandene Implementierung prüfen; nicht blind anhand alter Chat-Aussagen als fertig behandeln.
3. Kleine nachvollziehbare Commits erstellen und vorhandene Optionen erhalten.
4. APK-Link erst als erfolgreiches Ergebnis bezeichnen, wenn Build-Artefakt tatsächlich vorhanden ist.

## Weiterentwicklung am 24.10.2026
- `c74a794`: weitere Blau-Silber-Farbkorrekturen und Entfernung eines doppelten Menü-Handlers.
- `1f87e62`: Partievorbereitung und Varianten-Einstellungen zusammengeführt; GitHub Actions Build erfolgreich.
- `7a07b56`: doppelte Partievorbereitungs-Handler entfernt und Android-Zurück-Navigation korrigiert; APK-Build noch prüfen.
- Vorgabe für **alle App-Projekte**: Änderungen soweit möglich selbstständig implementieren, testen, Build prüfen, Fehler beheben und Projektinformationen in GitHub pflegen. Keine unbestätigten Erfolge melden; nicht im Hintergrund weiterarbeiten.
