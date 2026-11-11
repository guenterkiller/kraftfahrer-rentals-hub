# Fahrerexpress – SEO- und Sicherheitsprüfung, 11.11.2026

## Ergebnis vorher / nachher
- `/fahrer-infos`: vorher 0 H1, jetzt genau 1 H1 „Interner Informationsbereich“. Wortlaut, Schrift, Position und Abmessungen bei 1280 und 390 px byte-/wertgleich zur bisherigen Darstellung; kein Browser-Laufzeitfehler.
- H1-Ausnahmen aus Prerendering und Exportvalidator entfernt. Alle 22 Sitemap-Seiten werden gleich streng geprüft.
- Kundenbestätigung: beide optionalen Datumswerte vor Nutzung ausdrücklich geprüft; bekannte Typprüfung bestanden. Kein Mailtext und keine Berechnung verändert. Zusätzlicher Datums-Regressionsfall testet leere/einzelne/mehrere und umgekehrte Datumsangaben.
- Zusätzlicher reiner Test-Typfehler (`never[]` beim Euro-RegExp-Ergebnis) durch ausdrücklichen Rückgabetyp `string[]` behoben; keine Produktionslogik geändert.
- npm audit: **23 → 15 Meldungen**, davon **3 → 2 high**, **17 → 11 moderate**, **3 → 2 low**; keine kritischen Meldungen. Gezielt kompatible Updates, kein `audit fix --force`.
- Aktualisiert: picomatch 2.3.1→2.3.2, serialize-javascript 7.1.2→7.1.4, fast-uri 3.1.8→3.1.9, postcss-selector-parser 6.0.10/6.1.4→6.1.6, sucrase 3.35.0→3.35.1, Vitest 4.1.11→4.1.12. Alle sonstigen direkten Produktivversionen aus dem bisherigen package-lock erhalten.
- Veraltetes binäres bun.lockb entfernt: es hatte neue Installationen am aktuellen npm-Lock vorbei auf einen älteren Stand zurückgesetzt. Aktuelles bun.lock aus dem endgültigen package-lock importiert. Testwerkzeug verwendet seine eigene kompatible Vite-Version, Website bleibt Vite 5.4.21.

## Ausgelieferte SEO-Qualität
- **22/22 HTTP 200** über echten Apache 2.4.69 mit den unveränderten, byteidentischen IONOS-Konfigurationen. Öffentliche Pfade liefern die zugehörige Prerender-Datei, nicht bloß die SPA-Hülle; Antwortbytes mit Datei verglichen. Zusätzlich Darstellung ohne JavaScript geprüft.
- **22 individuelle Title, Description und H1**, jeweils exakt einmal; korrekte selbstreferenzielle www-Canonicals und OG/Twitter-URLs, nicht leer, `index, follow`, kein blockierender X-Robots-Tag. JSON-LD aller Seiten syntaktisch gültig, höchstens ein LocalBusiness und ein FAQPage je Seite.
- Sitemap enthält weiterhin genau die 22 bisherigen URLs. Robots erlaubt alle Sitemap-Seiten. Alle 24 unterschiedlichen internen Linkziele antworteten lokal und öffentlich mit 200; dies allein ist bei SPA-Routen kein Beleg für fertige HTML-Inhalte.
- Slash-/Prerender-Datei-Weiterleitungen lokal und live: 301 zur öffentlichen URL ohne Schleife; /index.html 301 zur Startseite. HTTP/non-www der echten Domain leiten auf HTTPS/www um. Admin-Anmeldung bleibt SPA-200.
- Die vier Schwerpunktseiten `/lkw-fahrer-buchen`, `/kraftfahrer-mieten`, `/fahrer-fuer-speditionen`, `/preise-und-ablauf` besitzen individuelle Metadaten, genau eine H1 und ihre bisherige Buchungsschaltfläche öffnet/erreicht das sichtbare Formular; ohne Absenden geprüft.
- Öffentliche IONOS-Seiten nur gelesen: 22/22 liefern bereits Inhalte, aber `/fahrer-infos` **live weiterhin 0 H1**. Alle bisher ausgelieferten Title/Description/Canonical/Robots/OG-Werte stimmen mit dem geprüften Export überein. Diese Arbeit hat IONOS nicht verändert.

## Bestehende Qualitätsgrenzen – dokumentiert, nicht ungefragt umgeschrieben
- 13 Titel über 60 Zeichen, 8 Beschreibungen über 160 Zeichen: mögliche Kürzung in Suchergebnissen, keine festen Google-Grenzen; vorhandene Suchbegriffe/Texte aus Rankingschutz unverändert.
- Vorhandenes FAQ-Markup stimmt auf mehreren Seiten nicht wörtlich mit sichtbaren Fragen überein: Startseite, Ersatzfahrer, Mietfahrer, kurzfristige LKW-Fahrer, Speditionsfahrer, BF3. Gültiges JSON ist keine Bestätigung eines Google-Rich-Results. Abgleich benötigt eine gezielte freigegebene Folgemaßnahme; keine neuen FAQs hinzugefügt.
- Mehrere Nebenrouten außerhalb der 22 Sitemap-Seiten liefern nur SPA-Fallback (z. B. Vermittlungsbedingungen/Alias-/Adminrouten). Keine neuen Seiten oder Sitemap-Einträge angelegt.
- Die robots-Regel `/admin/` erfasst `/admin/login`, nicht den exakten Pfad `/admin`; Robots ist keine Zugriffssicherung. Keine Rollen oder Rechte verändert.
- OG verwendet weiter dasselbe vorhandene Websitebild. Keine neuen Bild-/Rankingversprechen.
- Vorhandene statische Tracking-/Schema-Snippets im index.html unverändert erhalten; sie entsprechen nicht vollständig den hinterlegten Nur-GTM/Nur-useSEO-Konventionen. Keine Trackingbereinigung in diesem gezielten Auftrag.

## Verbleibende npm-Risiken (15 Meldungen sind nicht 15 unabhängige Lücken)
| Paket / installierter Stand | Schwere | Relevanz und Grund für verbleibenden Befund |
|---|---|---|
| vite 5.4.21 | high | Entwicklungsserver-/Windows-Editor-/Dateizugriffslücken; nicht Bestandteil des statischen IONOS-Servers. Sicherer Fix erfordert Hauptversionsmigration; nicht ungeprüft übernommen. Lokales Buildskript startet keinen dauerhaften Entwicklungsserver. |
| zod 3.23.8 | high | Speicherverbrauch bei übergroßen begrenzten Collections. Keine direkte Zod-Nutzung im Websitequelltext gefunden; bekannte Serverimporte verwenden String-/Objekt-/Enumregeln, keine betroffenen Array/Set/Map-Schemata. Serverimporte sind unabhängig vom npm-Website-Lock. Fix erst Zod ≥4.6.6, daher API-Migration nötig; keine Entwarnung für beliebige transitive Nutzung. |
| esbuild 0.21.5 | moderate | Entwicklungsserver-Cross-Origin-Auslesen; Werkzeug, nicht statisches IONOS-Laufzeitpaket. Vite-5-Kette; kein ungeprüfter Hauptversionswechsel. |
| glob 11.1.0 (workbox-build) | moderate | AbortSignal-Abbruch/Traversal bei Werkzeugausführung; Service-Worker-Erzeugung im Build, nicht ausgelieferte Glob-Laufzeit. Kompatibler Fix in dieser Hauptversion nicht verfügbar. |
| minimatch 10.2.6 | moderate | Globparts-Verstärkung/DoS; ESLint-/Workbox-Buildketten, keine öffentliche Benutzer-Eingabe an diese Pakete. Fix ab 11.0.1 erfordert Hauptversions-/Abhängigkeitswechsel. |
| deepmerge 4.3.1 | low | Prototype-Poisoning gemergter Objekte; Rollup-Resolver/Buildkette. Kein neueres kompatibles 4.x verfügbar. |
| typescript-eslint 8.71.2 und @typescript-eslint/eslint-plugin/parser/type-utils/typescript-estree/utils | moderate (6 abgeleitete Meldungen) | Durchreichen derselben minimatch-Lücke; ausschließlich Entwicklungs-/Lint-Werkzeuge. Neueste verfügbare 8.72.2 weiterhin betroffen. |
| @rollup/plugin-node-resolve 16.0.3 | low (abgeleitet) | Durchreichen deepmerge; Buildwerkzeug. |
| vite-plugin-pwa 1.2.0 / workbox-build 7.4.1 | moderate (2 abgeleitete Meldungen) | Durchreichen glob/minimatch/deepmerge; erzeugt statischen Service Worker, die Parser-/Dateisystempakete laufen nicht im Browser. Nicht auf eine ältere PWA-Version zurückgestuft. |

npm-Audit berücksichtigt den npm-Lock inklusive Entwicklungswerkzeugen. Der zusätzliche Produktionsscanner nennt Zod (high) und die PWA-Ketten glob/minimatch (moderate); PWA ist zwar in dependencies einsortiert, wird hier nur vom Vite-Build importiert.

## Tests und offene Prüfungen
- Frisches `npm ci --legacy-peer-deps`: erfolgreich; abschließendes `npm run build`: erfolgreich; Validator **22/22** erfolgreich.
- **140/140 Website-Regeltests**, **6/6 Prerender-/Exporttests**, **160/160 isolierte Servertests**, ein bewusst ignorierter Druckexporttest.
- Servertests umfassen bestätigte Vergütung/Einheiten/Einsatzort, 0 Fahrer-Mails bei fehlenden Angaben, Snapshot-/Wiederholungs-/Zuteilungsregeln; keine Netzwerkfreigabe für echten Mailversand.
- Website-Typprüfung `oj typecheck -b --noEmit`: bestanden. Kundenbestätigungsmodul `deno check`: bestanden; gesamte isolierte Testsammlung einschließlich Typprüfung: bestanden.
- Gesamte Produktions-Server-Typprüfung wurde durchgeführt und ist **nicht vollständig grün**: bestehende Fehler in `approve-driver-and-send-jobs/index.ts:202/210` (privates `resend.headers`, unzulässige Sendoption `headers`) und `respond-invite/index.ts:432` (`reply_to` statt SDK-Option `replyTo`). Nicht in diesem Auftrag am operativen Versand geändert; idempotenter Versand muss vor einer Änderung gesondert geschützt werden.
- Sechs vorhandene Live-Endpunkt-Tests in `respond-invite/index_test.ts` wurden ohne Netzrecht versucht und deshalb blockiert; anschließend aus der isolierten Sammlung ausgeschlossen. Kein echter Endpunkt-Test und kein echter Auftrag wurde ausgelöst.

## GitHub / nächste lokale Erstellung
GitHub main zuletzt geprüft: `bbaec53236a212d970f1d01b47b25541d7905236`. Die dort abrufbaren Dateien sind **noch nicht bytegleich** mit den hier abgeschlossenen Korrekturen. Kein direkter GitHub-Schreibconnector verfügbar; automatische Git-Synchronisierung kann erst nach dem Antwortende erfolgen. Dieser Commit wird ausdrücklich **nicht** als fertiger Liefercommit behauptet.

Der Inhaber muss **nach bestätigter Synchronisierung** PowerShell erneut ausführen und lokal NEU bauen. Nicht mit dem alten lokalen Ordner oder dem obigen noch unveränderten Remote-Stand arbeiten. Keine Serverfunktionen bereitgestellt, keine Veröffentlichung, kein IONOS-Upload, keine echten E-Mails oder Auftragsänderungen. Preise, Wochenrabatte, Provision und Vertrags-/Kundentexte unverändert.

## 22-Seiten-Inventar
| Seite | Title | Description | H1 |
|---|---|---|---|
| / | LKW Fahrer buchen & mieten – deutschlandweit ab 349 € | LKW Fahrer deutschlandweit buchen – Ersatzfahrer, Aushilfsfahrer & Mietfahrer bundesweit. Kurzfristig, auf Abruf, ohne Arbeitnehmerüberlassung. | LKW Fahrer buchen – deutschlandweit |
| /lkw-fahrer-buchen | LKW CE Fahrer buchen – Berufskraftfahrer mit Fahrerkarte / Fahrerexpress | LKW Fahrer buchen: selbstständige CE-Fahrer und Berufskraftfahrer mit Fahrerkarte und Module 95 für Sattelzug, Kipper und Baustelle – deutschlandweit, 349 €/Tag. | LKW CE Fahrer buchen – qualifizierte Berufskraftfahrer deutschlandweit |
| /baumaschinenfuehrer-buchen | Baumaschinenführer buchen deutschlandweit – ab 489 €/Einsatztag | Baumaschinenführer & Mischmeister mieten, leihen oder bestellen – Baggerfahrer, Radladerfahrer, Flüssigboden auf Abruf. Tageweise, ohne AÜG. 489 €/Einsatztag. | Baumaschinenführer deutschlandweit buchen |
| /ersatzfahrer-lkw | Ersatzfahrer LKW – Vertretung bei Krankheit, Urlaub & Fahrerausfall / Fahrerexpress | Fahrer krank, im Urlaub oder ausgefallen? Ersatzfahrer LKW als Krankheits- oder Urlaubsvertretung – selbstständige CE-Fahrer deutschlandweit nach Verfügbarkeit. | Ersatzfahrer LKW – wenn Ihr Fahrer krank ist oder ausfällt |
| /lkw-ueberfuehrung | LKW Überführung auf eigener Achse – LKW überführen lassen / Fahrerexpress | LKW Überführung auf eigener Achse: Fahrerexpress vermittelt selbstständige Fahrer, die Ihren LKW oder Ihr Nutzfahrzeug überführen. Deutschlandweit. Jetzt anfragen. | LKW Überführung auf eigener Achse – Fahrer für Ihre Überführung |
| /mietfahrer | Mietfahrer & Leihfahrer LKW – Fahrer für einige Tage oder Wochen / Fahrerexpress | LKW Fahrer mieten für einige Tage oder Wochen: Mietfahrer und Leihfahrer als selbstständige, vermittelte Fahrer – keine Arbeitnehmerüberlassung. Deutschlandweit ab 349 €/Tag. | Mietfahrer und Leihfahrer LKW – für einige Tage oder mehrere Wochen |
| /lkw-fahrer-kurzfristig | LKW Fahrer kurzfristig gesucht – für Zusatztouren & Auftragsspitzen / Fahrerexpress | Fahrer kurzfristig gesucht für eine zusätzliche Tour oder Auftragsspitze? Wir vermitteln selbstständige LKW-Fahrer CE deutschlandweit nach Verfügbarkeit, ab 349 €/Tag. | LKW Fahrer kurzfristig – für zusätzliche Touren und Auftragsspitzen |
| /fahrer-fuer-speditionen | Fahrer für Speditionen – LKW-Fahrer bei Fahrermangel & planbarem Bedarf / Fahrerexpress | Für Speditionen und Logistikunternehmen: selbstständige CE-Fahrer für planbare Einsätze, Urlaubszeiten und wiederkehrende Engpässe. Deutschlandweit, ab 349 €/Tag. | Fahrer für Speditionen – Fahrermangel planbar ausgleichen |
| /kraftfahrer-mieten | Kraftfahrer mieten – Fahrer für LKW, Fahrmischer & Baustelle / Fahrerexpress | Kraftfahrer für LKW, Fahrmischer, Kipper und Baustelle: Wir vermitteln selbstständige Fahrer und Baumaschinenführer deutschlandweit nach Verfügbarkeit. Keine Fahrzeugvermietung. | Kraftfahrer mieten – Fahrer für LKW, Bau und Spezialfahrzeuge |
| /fluessigboden-service | Mischmeister Flüssigboden deutschlandweit – ab 489 €/Tag | Mischmeister für Flüssigboden deutschlandweit – Subunternehmer mit CE, Radlader, Bagger. Bis zu 2 Mitarbeiter einsparen. | Mischmeister für Flüssigboden – Subunternehmer mit CE, Radlader & Bagger |
| /fahrer-registrierung | Selbstständige LKW-Fahrer mit CE-Führerschein gesucht / Fahrerexpress | Fahrervermittlung für selbstständige LKW-Fahrer & Berufskraftfahrer mit CE, C1, C, D1, D oder DE. Jetzt für Aufträge in Deutschland und europaweit registrieren. | 🚛 Selbstständige LKW-Fahrer mit CE-Führerschein gesucht |
| /preise-und-ablauf | Preise & Ablauf – LKW Fahrer mieten ab 349 € tageweise | LKW CE Fahrer, Baumaschinenführer und Mischmeister für Flüssigboden – transparente Tagessätze & Ablauf. Ab 349 €/Tag. | Fahrer mieten, leihen oder bestellen – Preise & Ablauf |
| /begleitfahrzeuge-bf3 | BF3-Fahrer buchen deutschlandweit – ab 649 €/Tag | BF3-Fahrer deutschlandweit – nur Fahrer, kein Fahrzeug. Kurzfristig für Schwertransporte, ohne AÜG. 649 €/Tag. | BF3-Fahrer deutschlandweit buchen – ab 649 € netto/Tag |
| /bf3-ablauf-kosten | BF3-Fahrer Ablauf & Kosten – Begleitfahrer für Schwertransport / Fahrerexpress | Alles über BF3-Fahrer: Ablauf, Kosten, Berechtigung und Checkliste für Schwertransporte. Qualifizierte BF3-Fahrer deutschlandweit. Fahrzeug stellen Sie. | BF3-Fahrer: Ablauf & Kosten |
| /projekte | Projekte & Referenzen – Fahrer-Vermittlung deutschlandweit | Erfolgreiche Fahrereinsätze deutschlandweit: Referenzen aus München, Hamburg, Speyer. Bundesweite Fahrer-Vermittlung. | Projekte & Einsatzbeispiele |
| /versicherung | Versicherungen – Schutz für selbstständige LKW-Fahrer & Ersatzfahrer / Fahrerexpress | Schutz vor Altersarmut: Berufsunfähigkeitsversicherung, Krankentagegeld & Altersvorsorge für selbstständige Kraftfahrer und Ersatzfahrer. Jetzt absichern! | 🛡️ Absichern statt abrutschen |
| /wissenswertes | Wissenswertes – Fahrer mieten, leihen oder bestellen rechtssicher | Mietfahrer, Leihfahrer, Aushilfsfahrer rechtssicher beauftragen: externe Fahrer-Dienstleistungen ohne Arbeitnehmerüberlassung. | Wissenswertes für Auftraggeber |
| /vermittlung | Fahrervermittlung deutschlandweit – LKW Fahrer bundesweit | Fahrervermittlung deutschlandweit – selbstständige Berufskraftfahrer bundesweit. Vermittlung selbstständiger Unternehmer auf Basis eines Dienst- oder Werkvertrags. | Fahrervermittlung deutschlandweit |
| /fahrer-infos | Interner Bereich für Partner / Fahrerexpress | Informationen für registrierte Partner und Fahrer | Interner Informationsbereich |
| /impressum | Impressum / Fahrerexpress-Agentur | Impressum der Fahrerexpress-Agentur – Kontaktdaten, Geschäftsführung und rechtliche Angaben gemäß TMG. | Impressum |
| /datenschutz | Datenschutzerklärung / Fahrerexpress-Agentur | Datenschutzerklärung der Fahrerexpress-Agentur – transparente Informationen zur Datenverarbeitung, DSGVO-konform. | Datenschutz |
| /showtruck-eventfahrer | Showtruck-Fahrer & Eventfahrer mieten – bundesweit / Fahrerexpress | Showtruck-Fahrer, Eventfahrer und Fahrer für Werbefahrzeuge, Promotiontrucks, Tourneen und Roadshows bundesweit anfragen. Selbstständige Fahrer ab 489 € netto/Tag. | Showtruck-Fahrer & Eventfahrer mieten – bundesweit |
