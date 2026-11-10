# Technischer Optimierungsplan mit Desktop-Schutz
# Fernfahrer-Wochenpreis (09.11.2026, ausschließlich Vorschau)
- [x] Exklusive Fernverkehr-Auswahl erhalten; je 5 abrechenbare Einsatztage exakt 2.121,06 € netto, zusätzliche Tage 450 €, keine Zuschläge oder Admin-/DB-Einstellung; vorbereitete Mailquellen angeglichen.
- [x] 113 Frontend-Regeltests und 2 isolierte Bestätigungstests bestanden; Formular bei 1280/390 px: 8 Tage 3.471,06 € netto / 4.130,56 € brutto, Rückwechsel CE 2.933,75 €. Automatische Prüfung OK; keine echte Buchung/Mail oder Bereitstellung/Veröffentlichung. Bestehende ältere IONOS-/Admin-Liveabnahmen bleiben separat blockiert.
# Vollständiges IONOS-Paket (Auftrag 03.11.2026)
- [ ] Aktuelles Produktionspaket mit 22 Seiten erstellen und prüfen: kein dist vorhanden; manueller Projektbuild in dieser Arbeitsumgebung nicht zulässig, kein unterstützter Build-Export nachgewiesen.
- [ ] Verwaltung angemeldet ohne echten Versand prüfen: external_unmanaged, keine verfügbare Administrator-Sitzung; vorhandene isolierte Prüfungen ersetzen Liveabnahme nicht.
- [ ] ZIP erst nach vollständiger Produktionsdateiprüfung bereitstellen; keine Veröffentlichung/kein IONOS-Upload und keine echten Buchungen/E-Mails.
# Abschlussprüfung vor IONOS (03.11.2026)
- [x] Ausschließlich Unterkunftstext auf Eventseite ersetzt. Vier Eventtätigkeiten vorhanden und auswählbar nach Auswahl bestehender Spezialfahrzeug-Hauptkategorie; kein Defekt, keine Formularlogik geändert.
- [x] 96 Frontend-Regeltests, 56 Deno-Versand-/Wiederholungsprüfungen und 4 Prerender-/Paketregeltests bestanden. Tatsächliches Eventformular lokal abgefangen, Kostenvorschau und alle vier Datenflüsse geprüft; Vertragsmail-Wiederholung isoliert im Browser Fehler→Erfolg geprüft. 22 Sitemap-Seiten Desktop/Mobil besucht: 21 mit H1, bestehende /fahrer-infos ohne H1; keine Laufzeitfehler. Keine echten Mails/Buchungen, keine Bestands-/SEO-/Preisänderung.
- [ ] Vollständige IONOS-Uploadbereitschaft nicht bestätigt: aktuelles Produktions-dist mit 22 validierten Prerender-Dateien fehlt. /fahrer-infos besitzt bereits keine H1; die bestehende Prerender-Prüfung berücksichtigt diese Ausnahme ausdrücklich, daher kein zusätzlicher Fehler und keine Änderung. Authentifizierte Verwaltungs-Liveabnahme mit externem Supabase nicht verfügbar; isolierte Tests ersetzen sie nicht. Keine Veröffentlichung/kein Upload.
# Showtruck-Leistungsbereich Startseite (nur Vorschau)
- [x] Genau eine Bild-Text-Kachel nach Begriffsklarstellung vor ProductCards mit freigegebenem Text und zwei Links ergänzt; Formular unverändert, daher keine neue Vorauswahllogik.
- [x] KI-generiertes Bild als WebP 640/1024 px (40/88 KB), Lazy Loading, feste Seitenverhältnisse und Alt-Text. 27 Tarif-/Event-/Kostentests bestanden; Bild/Links/Formular bei 1280/390/320 px geprüft; SEO, bisherige Texte und Links bei Desktop/Mobil identisch. Neuer Bereich ohne Überlauf; bekannter 320-px-Seitenüberlauf unangetastet. Keine Buchung, Mail, Veröffentlichung oder IONOS-Upload; Leistungskennzahlen nicht als verschlechterungsfrei nachgewiesen.
# Aktivierung Eventtätigkeiten in Bestätigungsmails (Freigabe 03.11.2026)
- [x] Ausschließlich geprüfte Weitergabe/Anzeige in beide bestehende Versandfunktionen und Vorlagen übernommen; exakte Übereinstimmung mit Entwürfen außer Importpfaden/Serverstart bestätigt.
- [x] Bestehende vier Event-Datenflussprüfungen auf tatsächliche Handler übertragen; insgesamt 15 Deno-Prüfungen bestanden, einschließlich Kostenvorschau/Hotelbudget/Bestätigung und simuliertem Versandfehler. Keine echten Buchungen/Mails.
- [x] send-fahrer-anfrage-email und submit-fahrer-anfrage erfolgreich produktiv bereitgestellt; Webseiten/SEO/Preise/Buchungslogik/Bestandsdaten unverändert. Verwaltungsoberfläche und Eventauswahl bleiben bis zum Nutzer-IONOS-Upload Vorschau; keine Veröffentlichung/kein Upload.
# Eventauswahl im Buchungsformular (nur Vorschau, 03.11.2026)
- [x] Vier Tätigkeiten im bestehenden Spezialfahrzeugfeld ergänzt; vier Hauptkategorien und 489-Euro-Tarif erhalten.
- [x] Bestätigungsweitergabe als ungeschaltete Entwürfe unter preview/event-booking vorbereitet; Fahrerangebot nutzt vorhandenes Feld fahrzeugtyp, Bestands-Snapshots unverändert.
- [x] 27 Vitest- und 4 isolierte Deno-Tests sowie Browserauswahl/Kostenvorschau/abgefangene Formularübertragung bestanden; keine echten Buchungen/Mails oder Bereitstellung/Veröffentlichung. Produktive Bestätigungsaktivierung wartet auf ausdrückliche Freigabe.
# Versandfehler Fahrerangebote und Vertragsmails (03.11.2026)
- [x] Fehlgeschlagenen Angebotsversand mit unverändertem gültigem Link/Angebot wiederholbar gemacht; Verwaltung unterscheidet bestätigten/übersprungenen Versand.
- [x] Vertragsmail-Wiederholung im bestehenden Vertragsstatus-Bereich für freigeschaltete Fahrer erreichbar; mail-only-Serverweg ohne Freischaltung, neue Links, Angebote oder Adminmail.
- [x] 41 Deno- und 5 Vitest-Prüfungen sowie isolierte Browserprüfung bestanden; keine echten Mails/Vorgangsänderungen. Beide Serverfunktionen bereitgestellt; Verwaltungsänderungen auf IONOS erst nach gesondertem Upload.
# Showtruck- und Eventfahrer (Vorschau)
- [x] Zusätzliche Freigabe: nur neue Leistungsseite um Musical-/Veranstaltungstourneen, Messetransporte, Bühnentechnik und separat vereinbarbare Tourneepauschalen ergänzt; 26 Tests und Browserprüfung bei 1280/390/320 px bestanden. Übrige Seiten, Formulare, Navigation, Preise und Versand unverändert; nichts veröffentlicht.
- [x] Spezialfahrzeug-Preisübersicht um freigegebene Einsatzarten ergänzt, bestehende Preise/Konditionen erhalten.
- [x] /showtruck-eventfahrer mit bestehender Buchungsmöglichkeit, Links von Leistungs-/Preisseiten und zusätzlichem Sitemap-Eintrag vorbereitet.
- [x] 26 automatisierte Prüfungen bestanden; Seite, Suchmaschinenangaben und Buchungssprung bei 1280/390/320 px geprüft, automatische Prüfung OK; keine Buchung, E-Mail oder Veröffentlichung. Veröffentlichung wartet auf ausdrückliche Nutzerfreigabe.
# Zukünftige verbindliche Fahrerangebote (Freigabe 30.10.2026)
- [x] Unveränderliche Versandbasis v2 für neue Angebote und alte v1-Darstellung bestehender Angebote gesichert; keine Auftrags-/Nachweisänderungen.
- [x] Einsatzangaben und interne Netto-Vergütung in Fahrermail/Annahmeseite einheitlich ergänzt; Kundenkosten unverändert getrennt.
- [x] Beide Verwaltungsdialoge und beide Speicherwege trennen Firma/Ansprechpartner; keine Bestandskorrektur.
- [x] 35 Deno- und 45 Vitest-Prüfungen ohne echte Buchungen/Mails/Annahmen sowie isolierte Browserprüfung bestanden; drei Serverfunktionen bereitgestellt. Otte/Kessner-Daten/Nachweis nur lesend nachgeprüft, Details docs/verbindliche-fahrerangebote-korrektur.md.
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

# Build-Ursachenanalyse Windows (lesend)
- [x] GitHub main = Projektstand d945567d; Annahmeseiten-Änderung enthalten.
- [ ] Sauberer Testbuild aus frischem Klon: wartet auf Freigabe; erste Windows-Fehlermeldung von `npm run build` fehlt noch.

# Kurzes Fahrer-Angebot MIAG/Scholz
- [ ] Kurzmail + Annahmeseite nur mit Endbetrag nach Provision (450 € Fahrersatz, 20 %, 360 €/vergüteter Tag); Konflikt 8 Tage vs. CE-Woche/Wochenende markieren, Bestand unverändert: wartet auf Klärung (vorheriger Auftrag liegt mir nicht vor).
# Kurze Fahrerangebotsmail, Vertraulichkeit, IONOS v3 (10.11.2026)
- [x] Kurzmail als Standard (send-driver-confirmation), CE-Woche/Wochenende-Widerspruch sperrt Betrag; respond-invite, admin-assign-driver, send-driver-confirmation bereitgestellt.
- [x] Kundenmails automatisiert geprüft: keine Verstöße. 140 Deno- + 125 Vitest-Prüfungen bestanden.
- [x] Druckübersicht v2 (164 S.) und ionos-upload-fahrerexpress_v3.zip (113 Dateien, 22/22 Seiten).
- [ ] GitHub main (13f3b35) ≠ Projektstand vor dieser Runde (8cd9681); Abgleich nach Rundenende durch Nutzer prüfen.

# Fernverkehr-Klarstellung (10.11.2026)
- [x] 450 €-Satz nur Fernverkehr, CE-Konflikt gesperrt, Wochenend-Kalendertage nicht automatisch vergütet; Tests, Druckübersicht v3, Serverfunktionen live.
- [ ] MIAG-Auftrag: Tarifart in der Verwaltung auf Fernfahrer stellen und vergütete Tage festlegen – wartet auf Inhaber.
- [ ] Website-Paket mit Dialogtext erst beim nächsten Upload durch Inhaber.

# Kurze operative Mails (10.11.2026)
- [x] Kunden-Eingangsbestätigung, Zuteilung, No-Show, Fahrerangebot, Annahmebestätigung, Auftragsbenachrichtigung gekürzt; Tests + Kurzübersicht; Funktionen live.
- [x] Windows-Build-Ursache (veraltete package-lock, Peer-Konflikt) behoben; Paket v4.
- [ ] Upload IONOS durch Inhaber.
# Abschlussauftrag Kurzmails (10.11.2026)
- [x] Kunden-Fernverkehrsmail: Einzeltag und vergünstigte Woche als getrennte Tarifoptionen; Tarife unverändert.
- [x] Baumaschinen-Testdaten passend; Fernverkehr-Wochenende nicht pauschal gesperrt; Zuteilungsmail ohne Schweigen-gilt-als-bestätigt; keine erfundene Adresse.
- [x] Tests, PDF v2, IONOS v5. GitHub-Abgleich nach Rundenende durch Nutzer zu prüfen.
# Abschlussprüfung Fernverkehr-Unterkunft (10.11.2026)
- [x] Kunden-Eingangsbestätigung Fernverkehr: Unterkunft „Übernachtung im Führerhaus/LKW (vorbehaltlich gesetzlicher Ruhezeiten); keine Hotelkosten" statt „Keine Übernachtung erforderlich"; nur Anzeige, keine Kosten. Tests CE Tag/Woche und Fahrerbetrag unabhängig vom Kundenpreis ergänzt; 152 Deno + 126 Vitest bestanden; Kurzübersicht v3 und IONOS-Paket v6.
