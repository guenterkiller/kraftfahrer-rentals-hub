# Übernachtungskosten mit Fernfahrer-Ausnahme
- [x] Freigegebene Regelung auf Preise & Ablauf und tarifabhängig in Kunden-/Admin-Anfragevorlagen ergänzen, ohne Preis-/Formular-/SEO-Änderung.
- [x] 7 isolierte Tests beider Anfragevorlagen, 10 Text-/Tarifregressionstests und Browserprüfung bei 320/375/390/768 Pixel bestanden; keine echten Anfragen oder Mails; automatische Build-Prüfung OK.
- [x] Beide Anfrage-Mailfunktionen nach Freigabe aktiviert; technische Erreichbarkeit geprüft.
- [ ] Echte Testanfrage normal/Fernfahrer: wartet auf gesonderte Freigabe.

# Technische IONOS-Prüfung und mobiler Überführungs-CTA
- [x] Einheitliche Apache-Konfiguration; Paket übernimmt die geprüfte Datei unverändert, Abbruch bei Build-/Validierungsfehlern.
- [x] Export umfasst alle 21 unveränderten Sitemap-URLs; HTML-Abnahme und 21 aus der Vorschau erzeugte Testdateien erfolgreich geprüft.
- [x] Tatsächlicher Produktions-dist-Abnahmelauf: „npm run build“ ausgeführt, Ausstieg 0, 21/21 vorgerenderte HTML-Dateien samt Canonical, Meta/OG und Inhalt geprüft.
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

# Mobile Darstellung und Storno-Grundlagen
- [x] Cookie-Schaltflächen bei 320 px: Umbruch nur unter 360 px, alle drei Buttons vollständig sichtbar; Zustimmungslogik unverändert, akzeptieren/speichern/ablehnen geprüft.
- [x] Automatische Build-Prüfung OK, 12 Tests und 4/4 Prerender-Prüfungen bestanden; Layout ab 375 px und am Computer unverändert.
- [x] Zwei Buttons im Abschnitt „EU-Fahrer willkommen" (Startseite): Textumbruch nur unter 360 px freigegeben und umgesetzt; bei 320/359 px vollständig im Kasten, ab 360 px nachweislich unverändert (keine Umbrüche, gleiche Höhen).
- [x] Selbe Sektion, beide Altfehler behoben (freigegeben): Textumbruch nun unter 470 px, Buttons unter 800 px untereinander; bei 360–1280 px bleibt der Text vollständig in der Button-Fläche und die Seite lässt sich nirgends seitlich schieben.
- [x] Produktions-Build nach der Korrektur: Ausstieg 0, 21/21 vorgerenderte Seiten geprüft.
- [x] Beide Buchungs-Mailfunktionen neu eingespielt (interne Benachrichtigung, Kundenbestätigung); Erreichbarkeit ohne Mailversand geprüft (405 bzw. 403 wie erwartet).
- [ ] Stornierungsbedingungen bleiben unverändert; Kalkulationsgrundlagen 349 € / 329 € (1.645/5) / 450 € / 489 € netto je Einsatztag notiert, Rechtprüfung der Pauschalen 80 %/100 % offen.
# Veröffentlichung
- [x] Sicherheitsprüfung vor der Veröffentlichung: keine kritischen Befunde; zwei Warnungen (offene Schreibregeln für Seitenaufruf- und Messwertetabellen) und ein Hinweis (Schutz vor geleakten Passwörtern aus).
- [ ] Veröffentlichung nicht erfolgt: die Veröffentlichungsanfrage wurde zweimal abgelehnt; nichts ist live, IONOS-Upload ebenfalls nicht erfolgt.
- [ ] Bei exakt 320 px: das lange Wort in der Überschrift „Kundenbewertungen & Erfahrungen" erzeugt 13 px seitlichen Spiel; rein optische Korrektur (Wortumbruch) wartet auf Freigabe.
