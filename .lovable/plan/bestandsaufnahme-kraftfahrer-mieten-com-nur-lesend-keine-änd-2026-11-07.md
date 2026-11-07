# Bestandsaufnahme kraftfahrer-mieten.com (nur lesend, keine Änderungen)

Grundlage: der aktuelle Stand in der Lovable-Vorschau. Was davon live auf IONOS liegt, hängt vom letzten Upload ab und ist hier nicht geprüft.

## Priorität 1 – direkter Einfluss auf messbare Kundenanfragen

1. **Google-Ads-Conversion ist fehlerhaft (vorhanden, aber falsch).**
   `src/components/SimpleBookingForm.tsx` Z. 313–317 und `src/components/BookingForm.tsx` Z. 146–150 senden `send_to: 'AW-1009180387/HIER_DAS_CONVERSION_LABEL_EINFÜGEN'`. Das ist ein Platzhalter. Google Ads ordnet diesen Wert keiner Conversion-Aktion zu, deshalb werden Formularanfragen wahrscheinlich nicht als Ads-Conversion gezählt.
   Maßnahme: Das echte Conversion-Label aus Google Ads (Ziele → Conversions → Tag-Einrichtung) eintragen oder die Conversion ganz über GTM auslösen.
   Extern prüfen: In Google Ads den Status der Conversion-Aktion ansehen („Keine aktuellen Conversions“ / „Inaktiv“).

2. **Doppelte Tracking-Wege (vorhanden, im Widerspruch zur Projektregel „nur GTM“).**
   `index.html` lädt GTM (`GTM-53BTCC64`), zusätzlich direkt gtag.js (`AW-1009180387`) und das OpenAI-Ads-Pixel. Zusätzlich gibt es auf mehreren Seiten eigene `gtag('event', 'category_view_…')`-Aufrufe (zum Beispiel `ErsatzfahrerLkw.tsx`, `Mietfahrer.tsx`). Läuft im GTM-Container auch ein Ads-/GA4-Tag, werden Daten doppelt gezählt. Ob die Aufrufe die Cookie-Einwilligung beachten, ist hier nicht belegt.
   Maßnahme: Einen Weg festlegen, am besten GTM mit Conversion-Trigger auf das Absenden des Formulars, und die direkten Aufrufe danach abbauen. Dafür ist Ihre Freigabe nötig.
   Extern prüfen: GTM-Container-Inhalt, GTM-Vorschaumodus, Ads-Tag-Diagnose.

3. **Suchbegriffe sprechen auch Zeitarbeit an (vorhanden, inhaltlich riskant).**
   `index.html` Z. 78/79/125 (Title, Description, Schema) und `src/pages/Wissenswertes.tsx` Z. 10–12 nutzen „leihen / Leihfahrer“. Diese Begriffe ziehen Suchende an, die Arbeitnehmerüberlassung erwarten. Gleichzeitig stellen die Texte klar „Keine Arbeitnehmerüberlassung“ (`LKWFahrerBuchen.tsx` Z. 50–51, `Vermittlung.tsx` Z. 39). Das kann unpassende Anfragen bringen.
   Maßnahme (Vorschlag, Textänderung nur mit Freigabe): Die Gewichtung im Title und in der Description auf „buchen / Fahrervermittlung / selbstständige Fahrer“ legen. In Search Console vorher prüfen, wie viele Klicks „leihen“ tatsächlich bringt.

## Priorität 2 – technisch vorhanden, Detailfehler

4. **Eine fehlende Überschrift:** `/fahrer-infos` (`src/pages/FahrerInfos.tsx`) hat keine H1-Überschrift. Bei der letzten Prüfung aller 22 Sitemap-Seiten war dies die einzige ohne. Die Seite richtet sich an Fahrer, daher geringer Einfluss auf Kundenanfragen.
5. **robots.txt:** Die Angabe `Host:` wird von Google nicht verwendet (harmlos). Die Blöcke für `Prerender`/`rendertron` sind wirkungslos. `/fahrer-vermittlungsbedingungen` ist gesperrt, was so beabsichtigt ist.
6. **Bildgröße:** `public/lovable-uploads` ist 13 MB groß. Welche Dateien davon tatsächlich auf Seiten geladen werden, ist hier nicht geprüft. Nicht verwendete Dateien vergrößern nur das Upload-Paket. Verwendete große PNG/JPG-Bilder bremsen mobile Seiten.

## Vorhanden und korrekt (aus früheren Prüfungen und Dateien belegt)

- Eigenes HTML je Seite: Nach dem Build werden alle Sitemap-Seiten vorgerendert (`scripts/prerender.mjs`). Der Build bricht ab, wenn eine Seite fehlt.
- Sitemap: 22 Adressen, alle mit www (`public/sitemap.xml`), einschließlich `/showtruck-eventfahrer`.
- Title, Description, Canonical und Schema je Seite werden einheitlich über `useSEO` gesetzt. In `index.html` steht kein festes Canonical, das sich mit den Seitenangaben doppeln würde.
- Schema.org: Organisation/Leistung in `index.html`, Seitenschema über `useSEO`. Einsatzgebiet ist „Deutschland“.
- Interne Links über `<Link>`, Buchungsknöpfe führen zu `#booking-form`.
- B2B-Abgrenzung „selbstständige Fahrer, keine Arbeitnehmerüberlassung“ steht auf `/vermittlung`, `/lkw-fahrer-buchen` und `/wissenswertes`.
- Mobil: Desktop und Mobil wurden zuletzt mit 1280, 390 und 320 px geprüft, ohne Überlauf.
- Systemschriften, vorab geladenes WebP-Startbild (~79 KB) und eingebettetes Basis-CSS sind vorhanden.

## Fehlt

- **llms.txt** gibt es nicht. Der Nutzen ist unsicher, weil kein Standard existiert. Niedrige Priorität, optional.
- Eigene Regeln für KI-Crawler (GPTBot, ClaudeBot, PerplexityBot) fehlen in robots.txt. Durch `Allow: /` sind diese Crawler bereits zugelassen, deshalb ist kein Handeln nötig.
- **Erfassung der Anrufe:** Im Code ist keine Messung von Klicks auf Telefonnummer oder E-Mail-Adresse zu finden. Sie wäre über einen GTM-Trigger möglich, ohne Code zu ändern.

## Nur extern prüfbar

- **IONOS:** Ob der neueste Stand (Eventbereich, Eventtarif, vorgerenderte Seiten) live ist, die Weiterleitungen in `.htaccess` (`public/htaccess-ionos`) und das Caching.
- **Search Console:** Indexierung der 22 Seiten, Fehler im Bericht „Seiten“, Core Web Vitals aus echten Nutzerdaten und Suchanfragen nach Absicht (buchen oder leihen).
- **Google Ads und GTM:** Conversion-Status, Container-Tags, Einwilligungsmodus.
- **Ladezeiten:** Echte Messung mit PageSpeed Insights auf der Live-Domain.

## Vorgeschlagene Reihenfolge (jeweils erst nach Ihrer Freigabe)

1. Echtes Conversion-Label eintragen oder Conversion über GTM auslösen.
2. Doppelte Tracking-Wege bereinigen.
3. Search-Console-Daten zu „leihen“ auswerten, danach über die Titelgewichtung entscheiden.
4. H1 auf `/fahrer-infos` ergänzen und nicht verwendete Bilder prüfen.
5. Optional: llms.txt.

Es wurden keine Änderungen vorgenommen.
