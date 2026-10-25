# Technischer Optimierungsplan mit Desktop-Schutz
# Fahrer-E-Mail-Vorschau und Vergütung
- [x] Tatsächliche Registrierungs-/Freischaltungs-/Angebotsvorlagen und Spaltenmetadaten geprüft; individuelle Fahrtkosten und bezifferte Mehrstunden fehlen als eindeutige Vergütungsquelle.
- [x] DEV-only /admin/email-vorschau mit fünf kompakten Entwürfen, unveränderten Antwortweg-Varianten und getrenntem Cent-Rechner ohne Versand/Datenzugriff erstellt.
- [x] 20 Vergütungsregeltests und 9 unveränderte Freigabetests bestanden; fünf Entwürfe bei 1280/390 px geprüft, Betragsrechnung und Sperre fehlender Fahrtkosten bestätigt, automatische Prüfung OK. Bericht docs/fahrer-email-vorschau.md.
- [ ] Integration in produktiven Versand bleibt gesperrt: benötigt Freigabe für Serveränderungen und eindeutige vereinbarte individuelle Vergütungsquelle; aktuelle Versandfunktionen bewusst unverändert.
# Fahrerregistrierung und manuelle Freischaltung
- [x] Registrierung, Vertragsentscheidung, Administratoranzeige und Angebotswege ausschließlich lesend geprüft: Registrierung pending, Vertragsannahme ohne Freischaltung; serverseitige Unterlagenprüfung fehlt.
- [x] Vorschau-Unterlagenprüfung, Vertragsanzeige und Registrierungs-Unterlagenhinweise umgesetzt; beide E-Mail-Entwürfe und § 4 Abs. 2 ausschließlich in docs/fahrerfreischaltung-vorschau.md vorbereitet, produktive Vorlagen und Vertragsmodule unverändert.
- [x] Isolierte Desktop-/Mobilprüfung mit simulierten Daten/Antworten: keine Freigabe ohne beide Prüfbestätigungen, genau ein manueller simulierte Aufruf danach; keine echte Freigabe oder Mail. Weiterleitung unverändert.
- [ ] Vollständige serverseitige Durchsetzung und Aktivierung der E-Mail-/Vertragsentwürfe: warten auf gesonderte Freigabe für unmittelbar produktive Funktionsänderungen; reine Vorschau kann diese Schutzregel nicht durchsetzen.
# IONOS-Freigabehindernisse
- [x] Sämtliche lokalen Aufrufer geprüft; unbenutzter submit_job_request für PUBLIC/anon/authenticated/service_role gesperrt. Drei Rollenaufrufe ohne Einfügung getestet; alle 79 Anfragen samt Prüfsumme unverändert. Aktiver Edge-/Adminweg bleibt unverändert; Legacy-Datenschutzfallback ausdrücklich erhalten.
- [x] Vollständiger GitHub-Baum guenterkiller/kraftfahrer-rentals-hub/main (0192afe1bc6b1a07da88627c260ce611d90fd7bd) entspricht dem aktuellen Stand bis auf die neuen Sicherheits-/Skript-/Architekturänderungen; anderes Repository zuletzt nicht öffentlich erreichbar. PowerShell auf nachgewiesenes Repository/main mit Clone-Abbruch und Commitausgabe umgestellt.
- [x] 53 Frontend-Regeltests, 8 isolierte Servertests, 4 Prerender-Regeltests und tatsächlicher Handler mit simulierten Speicher-/Versandabhängigkeiten bestanden; automatische Prüfung build OK. Keine Buchungen, E-Mails oder IONOS-Veröffentlichung.
- [ ] Vollständiges Produktionspaket verifizieren: automatische Prüfung liefert hier kein dist; manueller Projektbuild ist durch die Ausführungsumgebung gesperrt. Neues GitHub-Skript/Migration nach Synchronisation erneut prüfen; vollständige Uploadfreigabe bleibt ausstehend.
# Kundenbestätigung bei neuen Anfragen
- [x] Bestätigungsweg, Altformular-Ersatzprüfung und aktuelle Datenbankfelder/Zugriffsregeln lesend geprüft; konkreten technischen Plan für minimalen Nachweis und Administratoranzeige erstellt.
- [x] Nach Planfreigabe fünf optionale Nachweisfelder, atomaren Speicherweg, Serverzeit und Änderungs-/Nachtragschutz sowie deutsche Administratoranzeige umgesetzt; Altformular ohne behaupteten Nachweis erhalten.
- [x] 53 Regeltests, ein Deno-Test, isolierter tatsächlicher Anfragehandler und Desktop-/Mobilprüfung bestanden; Datenbankschutz mit zurückgerollten Prüfeinträgen geprüft, alle 79 bestehenden Anfragen unverändert. Anfragefunktion eingespielt; Bericht unter docs/kundenbestaetigung-pruefbericht.md.
- [ ] Altformular-Ersatzweg nach IONOS-Upload prüfen und nur mit gesonderter Freigabe entfernen; Upload/Veröffentlichung nicht freigegeben. Produktive End-to-End-Abnahme ohne echte Anfrage und externe Admin-Sitzung nicht durchgeführt.
# Sichere Löschverwaltung in Supabase
- [x] Dauerhafte atomare SQL-Editor-Löschfunktionen für Fahrer und Kundenaufträge sowie serverseitige Schutzprüfung eingerichtet; keine Archivierung oder Mails, keine neuen Sicherheitswarnungen.
- [x] Direkte Tabelleneditor-Löschung gegen Verlust geschützter Geschäfts-/Vertragsnachweise abgesichert; direkte Löschung, Funktionen, E-Mail-Bestätigung, Schutz/Rollback und anonyme Zugriffssperre mit zurückgerollten Beispieldaten geprüft; Prüfsummen der Bestands-/Auth-Daten unverändert.
- [x] Drei benannte Profile nachkontrolliert: zwei TEST-Profile zuvor gelöscht, drittes Testprofil nach ausdrücklicher Bestätigung des Administrators als selbst angelegter Testeintrag ebenfalls entfernt.
- [x] Günter-Testprofil einschließlich Vertragsnachweis, Vertragseinladung und 21 Angebotsverknüpfungen gelöscht; Fahreradresse wieder frei; Löschschutz in derselben Transaktion wiederhergestellt und mit zwei Prüfungen getestet.
- [x] Deutsche Bedienanleitung unter docs/supabase-loeschverwaltung.md erstellt; Registrierung/Vermittlung nur lesend geprüft, keine Mails oder Veröffentlichung.
# Fahrervertragseinladungen
- [x] Vorhandene Administratoransicht und Profilverknüpfung lesend geprüft; Umsetzungsvorschlag freigegeben.
- [x] Deutsche lesende Einladungsübersicht mit Namens-/E-Mail-Suche, gespeicherter Version, Einladungsdatum und vorhandenem Profilzugang ergänzt; keine Tabellen- oder Serveränderung.
- [x] Sieben Status-/Such-/Vertragsregressionstests bestanden; isolierte Desktop-/Mobilanzeige, Suche und Profilzugang ohne Schreibzugriffe geprüft; automatische Build-Prüfung OK.
- [ ] Authentifizierte Live-Abnahme: externe Supabase ohne verfügbare Administrator-Sitzung; isolierte Anzeigeprüfung ersetzt diese Abnahme nicht.

- [x] Laufenden Plan um verbindlichen Erhalt von Desktop/Mobil, Einzelprüfungen und Rücknahme bei nachgewiesener Verschlechterung ergänzt; überarbeiteter Plan zur Prüfung vorbereitet, keine Umsetzung.
- [x] Ausschließlich Stufe 1 probeweise umgesetzt, Desktop/Mobil vorher/nachher und erneut gemessen; keine verlässlich verschlechterungsfreie Abnahme, daher vollständig zurückgenommen. 21 Seitenzustände je Geräteklasse unverändert, bestehende Tests bestanden; Prüfbericht dokumentiert Produktions-Prerender-/Messgrenzen. Alle anderen Stufen gesperrt; keine Veröffentlichung, Uploads oder E-Mails.

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

# Vermittlungsvertrag Fahrer (Abschlussauftrag)
- [x] Vertrag v2 mit § 6 Nr. 2 (12 Monate), § 7 Nr. 2 (Verschulden, Anrechnung), § 7a; ohne 2.500 €, ohne Festanstellung.
- [x] Persönliche Vertragsseite, 14-Tage-Link, Annahme/Ablehnung mit unveränderlichem Nachweis; Ablehnung deaktiviert + sperrt Werbe-Mails.
- [x] Angebotsmail angepasst; Registrierungshäkchen; Adminstatus + Linkerzeugung ohne Mail; Stichtagsschalter aus.
- [ ] Einspielen der Serverfunktionen und Live-Durchlauf: wartet auf Freigabe.
- [ ] Versand der Vertragslinks an die 41 Fahrer: wartet auf Freigabe.
