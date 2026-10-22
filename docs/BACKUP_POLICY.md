# SchachNova – Backup- und Release-Regeln

1. **Vor Änderungen**: letzten stabilen Git-Tag prüfen; neue Arbeit in eigenem Branch.
2. **Nach erfolgreichen Tests**: stabilen Git-Tag anlegen.
3. **Release-Artefakte**: APK, Quellcode-Archiv und SHA-256-Prüfsummen archivieren.
4. **Wiederherstellung**: auf den letzten stabilen Tag zurückgehen, ohne die Sicherung zu überschreiben.
5. **Signatur**: denselben Android-Signierschlüssel für Updates verwenden. Den privaten Schlüssel niemals öffentlich speichern.
6. **Tests**: Brettdarstellung, Figurenzüge, Zuglegalität, Rochade, en passant, Umwandlung, Schach/Matt/Patt, Uhr, Neustart und Offline-Modus prüfen.

**Status:** Diese Regeln sind dokumentiert. Automatische Backups und Builds sind erst aktiv, sobald passende Workflows und das Android-Projekt eingerichtet und erfolgreich ausgeführt wurden.
