# Prüfbericht Tracking (nur lesend) – Conversion-Platzhalter und doppelte Einbindung

Vorgabe übernommen: Die Begriffe Leihfahrer, Mietfahrer, Lkw-Fahrer mieten, Ersatzfahrer, Fahrer buchen usw. bleiben unverändert. Titel, Beschreibungen, URLs, H1, Inhalte, Canonicals und interne Links werden nicht angefasst. Dieser Bericht enthält keine Code-, Datei- oder Live-Änderung.

## A. Sicher nachgewiesene Fehler (im Code belegt)

1. **Die Google-Ads-Conversion sendet einen Platzhalter.**
   - Fundstelle: `src/components/SimpleBookingForm.tsx` Z. 313–317: `send_to: 'AW-1009180387/HIER_DAS_CONVERSION_LABEL_EINFÜGEN'`.
   - Die Stelle ist richtig gewählt: Sie wird erst ausgelöst, nachdem der Server die Anfrage erfolgreich gespeichert hat (nach der Erfolgsmeldung, nicht bei Duplikat oder Fehler).
   - Fehler: Google Ads kennt kein Label mit diesem Text. Diese direkte Conversion wird daher keiner Conversion-Aktion zugeordnet. Abgeschlossene Buchungsanfragen werden auf diesem Weg **nicht** als Ads-Conversion gezählt.
   - `src/components/BookingForm.tsx` Z. 146–150 enthält denselben Platzhalter. Diese Datei wird aber von keiner Seite eingebunden, ist also ohne Wirkung.

2. **Alle Tracking-Skripte laden ohne Einwilligung.**
   - `index.html` Z. 12–14: Das OpenAI-Ads-Pixel (`EEB1snaQc3cMEcJBTbRQ4X`) lädt sofort, zusätzlich mit `debug:true`.
   - `index.html` Z. 16–22: Google Tag Manager `GTM-53BTCC64` lädt sofort.
   - `index.html` Z. 24–31: gtag.js `AW-1009180387` lädt sofort mit `gtag('config', …)`.
   - Es gibt keinen Google-Consent-Mode-Standard (`gtag('consent','default',…)`) und keine Abfrage von `fx:consent:v1` vor dem Laden.
   - `src/components/CookieConsent.tsx` Z. 92–95 sendet beim Zustimmen oder Ablehnen nur interne Ereignisse (`consent:marketing:on/off`). Auf diese Ereignisse reagiert nirgends im Code etwas (Suche ohne Treffer). Die Auswahl „Marketing aus“ hat damit **keine Wirkung** auf Google Ads, den Tag Manager oder das OpenAI-Pixel.
   - Nur die eigene Seiten- und Web-Vitals-Messung prüft die Einwilligung (`usePageTracking.tsx` Z. 114, `useWebVitals.tsx` Z. 45).
   - Ergänzend: Die Conversion-Aufrufe im Formular (Z. 271 und 313) prüfen keine Einwilligung.

3. **Die Formularereignisse werden ohne Ziel gesendet.**
   - `SimpleBookingForm.tsx` Z. 271–283 sendet `category_submit_…` mit Wert schon **vor** dem Absenden an den Server, also auch bei späterem Fehler oder Duplikat.
   - Weil gtag.js nur mit der Google-Ads-Kennung eingerichtet ist und kein GA4 im Code steht, gehen diese Ereignisse an Google Ads und erscheinen dort nicht als Conversion.
   - Die Seitenaufruf-Ereignisse `category_view_…` (z. B. `ErsatzfahrerLkw.tsx` Z. 6–7, `Mietfahrer.tsx`, `LkwFahrerKurzfristig.tsx`, `FahrerFuerSpeditionen.tsx`, `BaumaschinenfuehrerBuchen.tsx`, `FlüssigbodenService.tsx`) laufen ebenfalls ohne Einwilligungsprüfung.

## B. Nur Risiken (im Code nicht beweisbar, hängt von externer Konfiguration ab)

- **Doppelzählung:** Enthält der Tag-Manager-Container zusätzlich ein Google-Ads-Conversion-Tag oder ein Google-Tag mit `AW-1009180387`, werden Seitenaufrufe doppelt erfasst und Conversions möglicherweise doppelt gezählt. Das ist nur im Container prüfbar.
- **Ob überhaupt Buchungen gezählt werden,** hängt davon ab, ob im Tag Manager ein eigener Trigger existiert (z. B. auf die Erfolgsmeldung oder ein `dataLayer`-Ereignis). Im Code wird kein solches Ereignis an den Tag Manager übergeben (kein `dataLayer.push` mit Buchungsereignis). Ohne Container-Prüfung bleibt das offen.
- **OpenAI-Pixel:** Ob `debug:true` gewollt ist und ob `lead_created` (Z. 320–322) im OpenAI-Konto ankommt, ist nur dort prüfbar.
- **Rechtliches Risiko:** Ohne Einwilligung geladene Werbeskripte widersprechen dem eigenen Cookie-Hinweis. Die rechtliche Bewertung trifft nicht Lovable.

## C. Erforderliche externe Informationen

1. Das **echte Conversion-Label** der Aktion „Buchungsanfrage/Lead“ aus Google Ads (Ziele → Conversions → Aktion → Tag-Einrichtung → „Google-Tag selbst installieren“, Teil nach `AW-1009180387/`). Google Ads ist mit diesem Projekt nicht verbunden; ich konnte es daher nicht selbst lesen. Sie können Google Ads im Lovable-Editor-Chat verbinden, dann kann ich die Conversion-Aktionen nur lesend abfragen.
2. Eine **Übersicht des Tag-Manager-Containers `GTM-53BTCC64`**: alle Tags, Trigger und den Einwilligungsmodus. Dafür reicht ein Bildschirmfoto oder ein Export (Verwaltung → Container exportieren).
3. Ihre Entscheidung, ob **Google Ads über den Tag Manager oder direkt** gemessen werden soll. Empfehlung: über den Tag Manager, gemäß der Projektregel „nur GTM“.
4. Ob das **OpenAI-Pixel** bleiben soll und, falls ja, ohne `debug`.
5. Ihre Freigabe, die **Cookie-Logik** zu ändern. Sie ist bisher als unverändert festgelegt, für eine Einwilligungsprüfung aber zwingend.

## D. Minimalinvasiver Korrekturplan (erst nach Freigabe, ohne SEO-Wirkung)

Keiner der Schritte ändert sichtbare Inhalte, Titel, Beschreibungen, URLs, Canonicals, Sitemap oder interne Links. Er betrifft nur Skripte im Kopf der Seite und die Erfolgsstelle des Formulars, daher besteht kein Ranking-Risiko.

1. **Sofortkorrektur, kleinster Schritt:** Den Platzhalter in `SimpleBookingForm.tsx` Z. 315 durch das echte Label ersetzen. Zusätzlich an derselben Stelle ein `dataLayer.push({event:'buchung_erfolgreich', …})` ohne personenbezogene Daten, damit der Tag Manager einen sauberen Trigger erhält.
2. **Einwilligung durchsetzen:** Den Google-Consent-Mode-Standard „denied“ vor dem Tag Manager einfügen. `CookieConsent.tsx` setzt bei Zustimmung oder Ablehnung `gtag('consent','update',…)`; die gespeicherte Auswahl wird beim nächsten Seitenaufruf vor dem Laden gelesen. Das OpenAI-Pixel lädt erst nach Marketing-Zustimmung.
3. **Doppelte Wege abbauen:** Erst nachdem der Tag-Manager-Container geprüft ist, das direkte gtag.js aus `index.html` entfernen und das Ads-Conversion-Tag im Tag Manager auf `buchung_erfolgreich` auslösen. Ist der Container noch leer, bleibt das direkte gtag.js vorerst, damit keine Daten verloren gehen.
4. **Vorab-Ereignis korrigieren:** `category_submit_…` erst nach erfolgreicher Speicherung senden (Z. 271 hinter den Erfolgsfall verschieben).
5. Das unbenutzte `BookingForm.tsx` bleibt unverändert oder wird nur mit Ihrer Freigabe bereinigt.

## E. Testplan (ohne echte Buchungen oder Mails)

1. In der Vorschau mit abgefangenem Serveraufruf (simulierter Erfolg) prüfen: Vor der Zustimmung gehen keine Anfragen an `googleads`, `googletagmanager/gtag`, `bzrcdn.openai.com` oder `doubleclick`.
2. Nach „Marketing zustimmen“ läuft genau **eine** Conversion-Anfrage mit dem echten Label pro erfolgreicher Anfrage. Bei Fehler oder Duplikat läuft keine.
3. Nach „Ablehnen“ werden keine Werbeanfragen gesendet, auch nicht nach Neuladen der Seite.
4. Im Tag-Manager-Vorschaumodus auf der Live-Domain feuert das Ereignis `buchung_erfolgreich` einmal, und das Ads-Tag wird nicht doppelt ausgelöst.
5. In Google Ads die Tag-Diagnose prüfen und die Conversion-Aktion auf „Aktiv / Conversions erfasst“ kontrollieren (24–48 Std.).
6. Kontrollieren, dass Seitentitel, Beschreibungen, H1 und Canonicals aller 22 Seiten unverändert sind (Vergleich vorher/nachher).

## F. Checkliste IONOS-Livestand und Search Console (von Lovable aus nicht verifiziert)

**IONOS:**
- [ ] Im Seitenquelltext der Live-Domain (`view-source:https://www.kraftfahrer-mieten.com/`) nach `GTM-53BTCC64`, `AW-1009180387`, `oaiq` und `HIER_DAS_CONVERSION_LABEL` suchen. Der Platzhalter steht im Skript-Bundle (`/assets/*.js`), nicht im HTML.
- [ ] `/version.txt` live mit dem Stand in der Vorschau vergleichen.
- [ ] `/showtruck-eventfahrer` live aufrufen: Sind Eventbereich und Eventtarif vorhanden?
- [ ] Stichprobe von 3–4 Unterseiten: Im Quelltext steht fertiger Seiteninhalt, nicht nur `<div id="root"></div>`.
- [ ] Weiterleitungen von `http://` und ohne `www` führen mit 301 auf `https://www.`, ohne Schleife.
- [ ] `/robots.txt` und `/sitemap.xml` live erreichbar und identisch mit dem Projekt.

**Search Console:**
- [ ] Unter „Seiten“: alle 22 Sitemap-Adressen indexiert? Gründe für „Nicht indexiert“ notieren.
- [ ] Sitemap-Status „Erfolgreich“ mit 22 erkannten Adressen.
- [ ] URL-Prüfung der Startseite und von `/showtruck-eventfahrer`: von Google gewähltes Canonical gleich dem angegebenen.
- [ ] Core Web Vitals (Mobil/Desktop) ohne „Schlecht“-Adressen.
- [ ] Unter „Leistung“ die Suchanfragen mit „leihen / mieten / buchen“ nur beobachten; keine Textänderung.

Hinweis: Die neue Vorgabe zu den Suchbegriffen kann ich im Planmodus nicht dauerhaft speichern. Ich speichere sie als festen Projektgrundsatz, sobald Sie diesen Bericht freigeben.
