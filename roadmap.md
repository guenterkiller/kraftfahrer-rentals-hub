# Übernachtungskosten mit Fernfahrer-Ausnahme
- [x] Freigegebene Regelung auf Preise & Ablauf und tarifabhängig in Kunden-/Admin-Anfragevorlagen ergänzen, ohne Preis-/Formular-/SEO-Änderung.
- [x] 7 isolierte Tests beider Anfragevorlagen, 10 Text-/Tarifregressionstests und Browserprüfung bei 320/375/390/768 Pixel bestanden; keine echten Anfragen oder Mails; automatische Build-Prüfung OK.
- [ ] Aktivierung der geänderten E-Mail-Vorlagen: kein Edge-Deployment ohne gesonderte Freigabe zur Veröffentlichung.

# Technische IONOS-Prüfung und mobiler Überführungs-CTA
- [x] Einheitliche Apache-Konfiguration; Paket übernimmt die geprüfte Datei unverändert, Abbruch bei Build-/Validierungsfehlern.
- [x] Export umfasst alle 21 unveränderten Sitemap-URLs; HTML-Abnahme und 21 aus der Vorschau erzeugte Testdateien erfolgreich geprüft.
- [ ] Tatsächlicher Produktions-dist-Abnahmelauf: automatische Vorschau-Builds melden OK, stellen hier aber keinen dist-Ordner bereit; Produktionsartefakte nicht verfügbar.
- [x] Überführungs-CTA mit Umbruch und variabler Höhe; Formularfunktion unverändert.
- [x] Echter Apache 2.4: 21 HTTP-HTML-Antworten, 20 Slash-301, Querystrings, Direktdatei-Redirects, Assets und SPA-Fallback; Mobilprüfung bei 320/375/390/768 Pixel bestanden.
- [ ] IONOS-Live-Abnahme nach künftigem freigegebenem Upload; derzeit ausdrücklich kein Upload und keine Veröffentlichung.

# SEO-Freigabe A, B und D
- [x] A: Keine Widersprüche gefunden; Fahrzeugverantwortung in der vorhandenen FAQ präzisiert, FAQ-Auszeichnung folgt demselben Text.
- [x] B: Bestehende Startseiten-Linkzeile um /lkw-ueberfuehrung ergänzt; bisherige Links unverändert.
- [x] D: Je eine Überführungskarte auf /lkw-fahrer-buchen und /fahrer-fuer-speditionen ergänzt; bestehende Karten unverändert.
- [x] C: Nur geprüft: ursprüngliche Karte nicht eingebunden; problematischer Begriff in Service-Auszeichnung von /mietfahrer vorhanden; keine Änderung.
- [ ] E/F: Rankings und Klickzahlen warten auf zugängliche Google-Search-Console-Verbindung oder Nutzerexport; keine Verbindung verfügbar, Seitentitel unverändert.
- [x] Automatische Build-Prüfung „build OK“, alle drei internen Links im Browser und FAQ-Auszeichnung erfolgreich geprüft; Änderungsbericht abgeschlossen, nichts veröffentlicht.

# Auftragsstornierung
- [x] Status-Trigger und Versandzugänge lesend prüfen: Funktion vorhanden, aber kein aktiver Trigger daran gebunden.
- [x] Ausschließlich bestehenden RESEND_API_KEY wiederverwenden; kein neues Secret oder neuer Schlüssel.
- [x] Admin-Stornierung und zwei freigegebene Fahrer-Mails mit strengem Filter umgesetzt, ohne Schema-/RLS-Änderung.
- [x] Sechs isolierte Tests, Funktionstypprüfung und automatische Build-Prüfung erfolgreich; Edge-Deployment bestätigt.
- [x] Nachweisbericht mit Grenzen der Live-Prüfung liefern.
- [ ] Authentifizierter kompletter Stornierungsablauf samt bestehendem Resend-Laufzeitzugang: externe Supabase ohne verfügbare Admin-Testsitzung; reale Testmails nicht freigegeben.