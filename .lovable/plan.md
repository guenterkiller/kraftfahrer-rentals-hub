# Technischer Optimierungsplan: mobile Fahrerexpress-Startseite

## Ziel und unveränderte Grenzen

Den frühen Ladeumfang reduzieren, ohne Bilder, Gestaltung, Farben, Texte, SEO-Daten, Preise, Formularinhalte, Buchungsregeln, Cookie-Einwilligung oder Conversion-Erfassung zu verändern. Dieser Plan ist keine Umsetzung: keine Codeänderungen, neuen Produktions-Builds, E-Mails, Veröffentlichung oder IONOS-Uploads. Server-Funktionen und produktive Daten bleiben unangetastet.

## Gesicherte Ausgangslage

- Das bestehende WebP-Bild ist rund 79 KiB groß, vorab geladen und hoch priorisiert; es bleibt unverändert.
- Direktes Google Ads und ein weiterer Google-Ads-Lader über GTM werden gleichzeitig angefordert. Mehrfaches Laden ist belegt, doppelte Conversion-Zählung nicht.
- Die fünf Unterseiten beginnen im direkten Browserlauf bereits nach rund 0,75–1,15 Sekunden zu laden. In der Lighthouse-Kontrollmessung beginnen sie nach rund 1,86–2,26 Sekunden, vor dem dortigen LCP von 3,5 Sekunden.
- Die kleinen nachgeladenen Seitendateien umfassen mindestens rund 14,5 KiB übertragen einschließlich zweier gemeinsam verwendeter Dateien. Der Preis-Seitenabruf hatte keine separat ausgewiesenen Transferbytes; daraus folgt nicht, dass sein Code kostenlos ist. Gemeinsame Formularabhängigkeiten können bei einer späteren Aufteilung zusätzlich geladen werden.
- Die erneute Service-Worker-Prüfung präzisiert den Vorbericht: `/index.html` leitet auf `/` weiter. Beim getesteten Wiederholungsbesuch lieferte der Service Worker ebenfalls vollständiges vorgerendertes Startseiten-HTML. Eine aktuell ausgelieferte leere Startseite ist damit **nicht nachgewiesen**.
- Sekundenangaben sind keine garantierten Einsparungen. Jede Maßnahme wird einzeln gegen denselben Ausgangsstand gemessen; Vorteile werden nicht addiert.

## 1. Google Ads: größte mögliche Einsparung, vorerst gesperrt

### Tatsächlich erforderliche Bestandteile

Die aktuell öffentlich ausgelieferte GTM-Version enthält:

| Bestandteil | Bestehende Auslösung |
|---|---|
| Conversion Linker | Start des GTM-Containers |
| Google-Tag `G-DWYHN7QBG3` | GTM-Initialisierung |
| Ads `AW-1009180387/DrscCMb1xNkcEOO9m-ED` | Formular-Absendereignis auf einer URL mit `fahrer-registrierung` |
| Ads `AW-1009180387/i1qMCNiKxdkcEOO9m-ED` | Ereignisname `conversion` |

`index.html` lädt zusätzlich direkt `gtag/js?id=AW-1009180387`, definiert die globale `gtag`-Warteschlange und setzt die Ads-Konfiguration. Mehrere Seiten und das aktive Buchungsformular benötigen diese globale Funktion für bestehende Ereignisse.

**Entscheidende Prüfgrenze:** Das aktive Formular enthält als direkte Conversion-Zieladresse noch `AW-1009180387/HIER_DAS_CONVERSION_LABEL_EINFÜGEN`. Die beiden echten GTM-Labels sind vorhanden, aber ihre vollständige Zuordnung zu allen gewünschten Google-Ads-Aktionen und möglichen GA4-Importen ist nicht verfügbar. Die Registrierung wird im veröffentlichten Container über das Absenden und nicht über den bestätigten Servererfolg ausgelöst. Diese bestehenden Einstellungen werden in diesem Optimierungsplan ausdrücklich nicht korrigiert oder umgestellt.

### Vorgeschlagenes Vorgehen

1. Versionierten GTM-Export und Übersicht der bestehenden Ads-/GA4-Conversion-Aktionen lesend abgleichen: Labels, importierte Ereignisse, Attribution und zuständiger Lader.
2. In einer isolierten Testfassung ausschließlich den externen direkten Ads-Lader entfernen; globale `gtag`-Warteschlange, bisherige Konfiguration, Ereignisse, GTM, Linker und OpenAI-Pixel zunächst exakt erhalten.
3. Alle externen Messanfragen in dieser Testfassung abfangen, nicht an Google/OpenAI senden. Formularantworten simulieren, keine Daten speichern und keine E-Mails auslösen.
4. Nur bei nachgewiesener Gleichwertigkeit eine konkrete Lader-Entfernung zur Freigabe vorschlagen. Zeigt sich eine notwendige Änderung an Labels, Auslösern, Einwilligung oder Conversion-Semantik, diesen Schritt stoppen und separat vorlegen.

**Dateien:** gegebenenfalls `index.html`; zusätzliche isolierte Tests im Projekt. Keine geplanten Änderungen an `SimpleBookingForm.tsx`, `FahrerRegistrierung.tsx`, `CookieConsent.tsx` oder am GTM-Container.

**Erwarteter Vorteil:** Falls wirklich entbehrlich, entfällt ein direkter Download von rund 194 KiB. Der direkte Lader beanspruchte in der Kontrollmessung rund 0,87 Sekunden CPU-Zeit; das ist kein garantierter LCP- oder TBT-Gewinn. Eine Verschiebung weiterer Downloads kann den Nettoeffekt verkleinern.

**Risiko:** mittel bis hoch; fehlende Initialisierung, Attribution oder verlorene Ereignisse. Das Entfernen des gesamten `gtag`-Blocks ist ausdrücklich nicht vorgesehen.

**Erforderliche Tests:** Ausgangsstand gegen Testfassung für alle vorhandenen Ereignisnamen, Werte, Ziele und Reihenfolgen; Buchungserfolg, Fehler, Duplikat und Wiederholung; Registrierung und Teil-Upload; Kategorieaufrufe; verzögertes/fehlgeschlagenes GTM; alle vorhandenen Einwilligungszustände ohne Änderung ihres Verhaltens; Erstaufruf und Seitenwechsel. Das aktuelle Verhalten ist der Vergleichsmaßstab, keine neu erfundene Tracking-Regel. Ohne vollständigen Abgleich bleibt dieser Schritt gesperrt.

## 2. Unterseiten-Vorladen: erste risikoarme Umsetzungsstufe

**Dateien:** `src/hooks/usePrefetchRoutes.ts`, gegebenenfalls die Einbindung in `src/App.tsx`; neuer kleiner Vorlade-Koordinator mit Tests. Falls Link-Absicht als Auslöser genutzt wird: `src/components/Navigation.tsx` und die bestehenden Startseitenlinks in `src/pages/Index.tsx`.

**Änderung:** Die fünf bestehenden Zielseiten erhalten bleiben, aber kein pauschaler Start nach 2/3 Sekunden oder sofort verfügbarem Leerlauf. Vorrang für das tatsächlich angezeigte Linkziel bei Fokus oder Zeigerabsicht; ein Klick und die normale Navigation warten niemals auf spekulatives Vorladen. Optionales Hintergrundladen nur nach abgeschlossener Anfangsladephase, sichtbar und online, nicht bei Datensparmodus/langsamer Verbindung. Bei unbekannter Verbindung zunächst nur absichtsbezogen laden. Imports nacheinander statt im 100-ms-Takt starten; Buchungszugriff hat Vorrang. Auf Routenwechsel und im Adminbereich ausstehende Arbeit abbrechen; bereits gestartete Imports lassen sich nicht zuverlässig abbrechen.

**Erwarteter Vorteil:** Die gemessenen mindestens 14,5 KiB spekulativen Seitenabrufe und ihre Auswertung verlassen die kritische Phase. Größerer indirekter Vorteil bei langsamer Verbindung und gemeinsamen schweren Abhängigkeiten; konkrete Sekunden erst im Vergleich messbar.

**Risiko:** niedrig; ein erstmaliger Unterseitenwechsel ohne vorherige Absicht kann länger dauern. Kein Verlust von Links oder Inhalten.

**Tests:** identische fünf URLs und normale Klicknavigation; frühe Buchung; langsame/unbekannte Verbindung, offline, Datensparmodus, Hintergrundtab; keine Parallelflut; Importfehler beeinträchtigt Navigation nicht; Aufräumen nach Routenwechsel; React-StrictMode erzeugt keine doppelten Aufträge; kein Vorladen im Adminbereich. Vergleich mit und ohne Service Worker getrennt messen.

## 3. Komponenten und Abhängigkeiten: konservative Ladegrenzen

### Sofort eingebunden lassen

- `Index`, `useSEO`, Navigation, Hero, Hauptinhalt-/Sprungziele und `ProductCards`.
- Inline-Texte, FAQ, interne Links sowie bestehende Cookie-Anzeige.
- Router, zentrale Buchungsnavigation, `ScrollToTop`, globale Meldungs-/Tooltip-Infrastruktur.
- **`FahreranfrageSection` und `SimpleBookingForm` einschließlich Validierung, Tarif-/Kostenberechnung und Formularfeldern.** In der ersten Stufe wird das Formular nicht verzögert: damit bleiben sämtliche direkten und lokalen Buchungszugänge unverändert zuverlässig.

### Präzise Kandidaten, aber nicht pauschal freigeben

| Kandidat | Dateien | Empfehlung / Vorteil | Risiko und Tests |
|---|---|---|---|
| Admin-Zugangsschutz | `src/App.tsx`, bestehendes `src/components/AdminRoute.tsx` | Import ausschließlich an geschützter Admin-Route; kein unnötiger Admin-Code im frühen Startseitenumfang | Niedrig bis mittel: Zugriffsschutz bleibt unverändert; Tests ohne Sitzung, Nicht-Admin, Admin, verzögerter Import, unveränderte Weiterleitung. Supabase entfällt dadurch **nicht**, solange das Formular direkt eingebunden bleibt. |
| `ProcessSteps`, `WhyFahrerexpress`, `TestimonialsSection` | `Index.tsx` und diese drei Komponenten; gegebenenfalls neuer lokaler Ladebaustein | Gemeinsame nachgelagerte Gruppe statt drei Mini-Dateien; weniger frühe React-Arbeit möglich | Mittel: variable Höhe/Scrollposition und vollständiger HTML-Inhalt. Nur umsetzen, wenn gleiches Erscheinungsbild, kein zusätzlicher CLS und vollständiges Prerendering nachgewiesen werden. |
| `LegalSecuritySection`, `BookingPriorityBanner`, `EUDriverRecruitment`, `ContactSection` | `Index.tsx` und diese vier Komponenten | Nachgelagerte zweite Gruppe möglich | Mittel: Buchungslinks und `#eu-fahrer` müssen auch vor dem Laden zuverlässig bleiben; unveränderte Tastatur-/Linkfunktion und schnelle Scrollsprünge testen. |
| Footer | `Index.tsx`, `Footer.tsx` | Bereits geteilt, derzeit aber sofort angefordert; wirklich späteres Mounten möglich | Kleiner Vorteil: gemessen rund 1,8 KiB. Mittleres Risiko für Endseitenhöhe, Footerlinks und vollständige HTML-Ausgabe; deshalb geringe Priorität. |
| Erfolgshinweis im Formular | `SimpleBookingForm.tsx`, `PWAInstallSuccessBox.tsx` | Code erst vor Anzeige des bereits bestehenden Erfolgshinweises laden | Sehr kleiner Vorteil; geteilte Icons/Card-Abhängigkeiten bleiben. Erfolg darf nicht verzögert/verdeckt werden; Schließen und unveränderte Anzeige testen. Nur bei messbarem Nutzen. |

Die statischen Abschnitte benutzen überwiegend ohnehin benötigte Icons, Buttons und Cards. Spätere Einbindung entfernt diese gemeinsamen Bibliotheken nicht automatisch. Daher **keine seriöse KiB- oder Sekunden-Zusage für diese Gruppen vor einer Bundle-Gegenprüfung**. Kein `form-vendor`-/`date-vendor`-Vorteil behaupten: das aktive Formular importiert React Hook Form und date-fns nicht direkt.

### Buchungsformular selbst: nicht Bestandteil der ersten Umsetzung

Ein späteres Formular wäre nur mit eigenem stabilen Ankerbereich, explizitem Laden bei jedem Buchungslink/direkten Hash und Scrollen nach tatsächlicher Bereitschaft sicher. Das heutige rund zweisekündige Scroll-Polling genügt nicht; ein leerer Anker würde fälschlich als fertiges Formular erkannt. Die bestehende frühe PWA-Ereigniserfassung und einmal eingegebene Daten müssten erhalten bleiben. Variable Formularhöhe ohne sichtbare Platzhalter oder Layoutverschiebung ist zusätzlich nachzuweisen. Unter den aktuellen Grenzen ist diese Änderung **nicht gefahrlos freigabefähig** und bleibt zurückgestellt.

Betroffene Dateien wären erst bei separater Freigabe `Index.tsx`, `FahreranfrageSection.tsx`, `SimpleBookingForm.tsx`, `bookingNavigation.ts`, `ScrollToTop.tsx` sowie direkte Scrollzugriffe in `LandingPageLayout.tsx`, `LkwUeberfuehrung.tsx` und `FlüssigbodenService.tsx`. Keine solchen Änderungen in Stufe 1.

## 4. Service Worker: nur Diagnose, keine Änderung

**Dateien zur Prüfung:** `vite.config.ts`, `src/main.tsx`, `public/.htaccess`, `public/htaccess-ionos`, ausgeliefertes `sw.js` und dessen Cache Storage. Apache-Konfiguration und Service Worker bleiben unverändert.

Der Fallback ist `index.html`. Dessen direkte URL wird produktiv auf `/` weitergeleitet; im frischen kontrollierten Wiederholungsbesuch wurde vollständiges Startseiten-HTML geliefert. Risiko für andere Routen bleibt: ein Fallback mit Startseiteninhalt ist nicht gleichbedeutend mit deren routenspezifischem Prerender-HTML.

**Nächste Prüfung:** Dokumentantworten bei Erstbesuch und kontrolliertem Wiederholungsbesuch für `/`, `/mietfahrer`, `/lkw-fahrer-buchen` und direkte persönliche Seiten vergleichen: Herkunft aus Cache, tatsächlicher Root-Inhalt, Titel/Canonical, Aktualisierung nach neuem Asset-Stand. Keine persönlichen Antwortaktionen auslösen. Installations-Precache lädt Vendor-Dateien nach dem Seitenladen; daher kann er reine Code-Aufteilung teilweise wieder neutralisieren.

**Erwarteter Vorteil:** zunächst Messklarheit, kein behaupteter Geschwindigkeitsgewinn. Erst bei belegter Beeinträchtigung separate SW-Maßnahme vorlegen.

**Risiko späterer Änderungen:** mittel bis hoch für Offline-Zugriff, Aktualisierung und persönliche Links. Kein Umbau, Cache-Löschen bei Nutzern oder Hydration-Wechsel Bestandteil dieses Plans.

## Abnahme und Reihenfolge

1. Nach ausdrücklicher Umsetzungsfreigabe zuerst nur das Unterseiten-Vorladen optimieren; Formular und sichtbare Abschnitte direkt eingebunden lassen.
2. Google-Ads-Lader erst nach vollständigem Conversion-Abgleich separat entscheiden. Keine Änderung von Labels, Auslösern oder Cookie-Verhalten zur Ermöglichung der Optimierung.
3. Admin-Ladegrenze und sekundäre Abschnitte nur einzeln mit nachgewiesenem Nettovorteil aufnehmen; keine pauschale Lazy-Loading-Umstellung.
4. Service Worker ausschließlich weiter prüfen.

**Gemeinsame Funktionstests:** alle Buchungswege in Header/Mobilmenü, Hero, Produktkarten, Kontakt, Prioritätsbanner und Footer; `/fahrer-buchen#buchungsformular` sowie bestehende Hashziele; lokale Unterseitenbuchung; langsames Laden, Zurück/Vorwärts und Tastaturbedienung. Bestehende Unterkunfts-/Tarif-/Kostenübersichtstests behalten und ausführen. Erfolgs-/Fehlerfälle mit simulierten Serverantworten und abgefangenen Trackern testen, ohne reale Anfragen oder Mails.

**Abnahme nach späterer Implementierung:** alle 21 Sitemap-Seiten vollständig vorgerendert, einschließlich nachgelagerter Abschnitte, mit unveränderten SEO-Daten und Tracking-Auslösern; keine Platzhalter im ausgelieferten Inhalt. Mobil und Desktop visuell vergleichen, CLS unverändert. Je mindestens drei mobile Vergleichsläufe mit gleicher Lighthouse-Version, Verbindung und Cookie-Auswahl; Median, Dateiumfang, LCP-Element und TBT getrennt für frische und SW-kontrollierte Besuche dokumentieren. Keine Veröffentlichung durch diese Abnahme.