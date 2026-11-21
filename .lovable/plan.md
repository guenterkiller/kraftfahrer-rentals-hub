# Befund und Vorschlag: offene Schreibregeln für Besucher- und Ladezeitdaten

## Befund (live gelesen, nichts geändert)
- `page_views` und `web_vitals` haben je eine Regel "Anyone can log ..." für das Einfügen, mit Rolle `public` und `WITH CHECK (true)`. Jeder darf also beliebige Zeilen einfügen, auch ohne die Webseite.
- Lesen dürfen nur Admins (`is_admin_user()`). Ändern und Löschen ist für niemanden erlaubt. Eine Datenpanne beim Lesen besteht also nicht.
- Es gibt keine Prüfregeln, Längenbegrenzungen oder Trigger, nur den Primärschlüssel.
- Bestand: 3.695 Seitenaufrufe (1,2 MB) und 20.671 Ladezeitwerte (3,9 MB).
- Schon vorhandene unplausible Werte: FCP bis 23.690.504 ms, LCP bis 99.641.008 ms, CLS bis 19,3.
- Geschrieben wird nur aus dem Browser mit dem öffentlichen Schlüssel, und zwar über `src/hooks/usePageTracking.tsx` und `src/hooks/useWebVitals.tsx` (über `AnalyticsTracker`). Das passiert nur mit Analyse-Einwilligung und nicht in der Vorschau. Keine Edge Function schreibt dort.
- Gelesen wird nur von `AdminAnalyticsDashboard.tsx`.
- Die öffentliche Erfassung ist also gewollt. Die Regel ist nur zu weit gefasst.

## Risiken
- **Verfälschung:** Jeder kann beliebige Routen, Werte und Texte einschleusen. Die Admin-Auswertung wird damit unzuverlässig, die bestehenden Ausreißer zeigen das bereits.
- **Speicher und Kosten:** Massenhaftes Einfügen ist unbegrenzt möglich. Auch sehr lange Texte in `user_agent`, `referrer` oder `route` sind möglich, ebenso eine wachsende Datenbank.
- **Kein Zugriff auf andere Daten:** Lesen, Ändern und Löschen bleiben gesperrt.

## Was RLS allein kann und was nicht
- **RLS kann:** Rollen festlegen (`anon`, `authenticated`), Werte plausibel prüfen (Metrik-Liste, Wertebereiche, Längen, Routenformat) und ein mitgeschicktes Datum oder eine mitgeschickte ID erzwingen.
- **RLS kann nicht:** Anonyme Absender verlässlich erkennen, Mengen begrenzen (kein Rate-Limit) oder beweisen, dass ein Wert wirklich aus dem Browser stammt. Der öffentliche Schlüssel ist bewusst öffentlich.

## Vorschlag (erst nach Freigabe; nur eine Migration, kein Code, keine neue Tabelle)
1. Beide Einfüge-Regeln ersetzen. Sie gelten dann nur für `anon, authenticated` und nur mit plausiblen Werten:
   - **page_views:** `route` beginnt mit `/` und ist höchstens 200 Zeichen lang. `user_agent` höchstens 512, `referrer` höchstens 1.024 Zeichen. `created_at` liegt innerhalb von ±5 Minuten um `now()`, falls es mitgesendet wird.
   - **web_vitals:** `metric_name` in (`LCP`, `FCP`, `CLS`, `FID`, `TTFB`, `INP`). `metric_value` zwischen 0 und 600.000, bei CLS zwischen 0 und 100. `rating` in (`good`, `needs-improvement`, `poor`, `unknown`) oder leer. `route` wie bei page_views.
2. Bestehende Daten bleiben unverändert. Die Auswertung kann Ausreißer später optional ausblenden, das ist ein eigener Auftrag.
3. Danach den Sicherheitsbefund erneut prüfen. Bleibt eine Restwarnung „anonymes Einfügen“, ist sie bewusst akzeptiert und wird mit Begründung markiert.

## Optional später (nicht Teil dieses Vorschlags)
- Mengenbegrenzung über eine kleine Edge Function als Zwischenstelle mit IP-Drossel. Dafür ist Code nötig, und die Rolle `anon` verliert das direkte Einfügen. Das ist eine größere Änderung.
- Regelmäßiges Löschen alter Rohdaten (z. B. älter als 13 Monate). Das ist eine Entscheidung zur Aufbewahrung.

## Tests vor Abschluss
- SQL als `anon`:
  - Ein gültiges Einfügen in beide Tabellen gelingt.
  - Abgelehnt werden: zu lange Texte, unbekannte Metrik, negativer oder überhöhter Wert, Route ohne `/`.
  - Lesen als `anon` liefert weiterhin keine Daten.
  - Die Testzeilen werden mit einer Testkennung angelegt und anschließend gezielt entfernt. Dafür ist eine gesonderte Freigabe nötig, da Löschen sonst gesperrt ist. Alternativ wird alles in einer zurückgerollten Transaktion getestet.
- Browser:
  - Mit Einwilligung entsteht ein Seitenaufruf, und die Ladezeitwerte werden ohne Fehler gespeichert.
  - Ohne Einwilligung wird nichts gespeichert.
  - Das Admin-Dashboard zeigt die Daten weiter an.
- Prüfen, dass `useWebVitals` keine anderen Metriknamen oder Ratings sendet. Das wird vor der Migration im Code verifiziert, weil `INP` und `unknown` möglich sind.

## Unverändert
Tracking (GTM, Pixel), SEO, Buchung, Admin, Mails, Edge Functions, weitere Tabellen und vorhandene Daten.
