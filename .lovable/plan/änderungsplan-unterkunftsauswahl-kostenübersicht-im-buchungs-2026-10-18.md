# Änderungsplan: Unterkunftsauswahl & Kostenübersicht im Buchungsformular

Nur die freigegebenen Punkte. Keine Freigabelinks, keine neuen Buchungsschritte, keine Änderung an Fahrerannahme, laufenden Aufträgen, Preisen oder Stornoregeln.

## 1. Datenbank (eine Migration, Tabelle `job_requests`)

Neue Spalten (alle nullable, bestehende Aufträge unverändert):
- `unterkunft_option` (Text: `gestellt` / `fahrer_organisiert` / `keine`)
- `unterkunft_obergrenze` (numeric, netto, nur bei Option „Fahrer organisiert")
- `kosten_uebersicht` (jsonb, Snapshot der im Formular angezeigten Vorkalkulation)

Keine neuen Tabellen, keine Änderung bestehender Spalten, RLS unverändert.

## 2. Buchungsformular (`src/components/SimpleBookingForm.tsx`)

- Neuer Abschnitt „Übernachtung / Unterkunft" mit drei Radio-Optionen:
  1. „Unterkunft wird vom Auftraggeber gestellt und bezahlt."
  2. „Unterkunft wird vom Fahrer organisiert. Der Auftraggeber übernimmt die Kosten bis zu einer vorher vereinbarten Obergrenze." → Pflichtfeld Kostenobergrenze (€ netto, numerisch validiert)
  3. „Keine Übernachtung erforderlich."
- Anzeige nur bei relevanten Tarifen: CE, Wochenpreis, Baumaschinen/Mischmeister. Beim Fernfahrertarif wird stattdessen der bestehende Führerhaus-Hinweis gezeigt (Übernachtung grundsätzlich im Führerhaus, 45-Std.-Ruhezeit) – keine Auswahl, da die Regelung tariflich festgelegt ist. Bei Überführung keine Unterkunftsauswahl (individuelles Angebot).
- Neue Kostenübersicht vor dem Absenden:
  - Tarifpreis × Einsatztage (Wochenpreis: volle Mo–Fr-Wochen zu 1.645 €, Resttage zum Tagessatz; erkannte Samstage +25 %, Sonn-/Feiertage +50 % auf den Tagessatz)
  - Zwischensumme netto, 19 % USt, Brutto
  - Kennzeichnung: „Unverbindliche Vorkalkulation"
  - Offene Positionen ausdrücklich als offen gekennzeichnet: An-/Abfahrtskosten (abhängig vom Standort des eingesetzten Fahrers, werden vor verbindlicher Auftragserteilung mitgeteilt) und ggf. Unterkunftskosten bis zur Obergrenze
  - Keine Schätzwerte, keine erfundenen Beträge
- Validierung: Obergrenze Pflicht bei Option 2 (zod-Schema, client- und serverseitig)

## 3. Kalkulationsmodul (wortgleich Frontend/Function)

- Neues Modul `src/lib/kostenUebersicht.ts` + identische Kopie `supabase/functions/_shared/kosten-uebersicht.ts` (Gleichheit per Test, wie bei berlinTime/tarifTexte)
- Reine Berechnung aus vorhandenen Tarifwerten (349/1.645/450/489 €, Zuschläge 25/50 %); keine neuen Preise

## 4. Backend (`supabase/functions/submit-fahrer-anfrage/index.ts`)

- Neue Felder validieren (Option als Enum-Wert, Obergrenze numerisch ≥ 0, Pflicht bei Option 2)
- Kostenübersicht serverseitig neu berechnen (nicht dem Client trauen) und als Snapshot speichern
- Übergabe an `send-fahrer-anfrage-email`

## 5. Kundenbestätigung (`customer-booking-confirmation.tsx`)

- Neuer Abschnitt „Ihre Angaben zur Unterkunft" (gewählte Option + ggf. Obergrenze)
- Neuer Abschnitt „Vorkalkulation" mit den berechneten Positionen, Netto/USt/Brutto und ausdrücklich gekennzeichneten offenen Positionen
- Hinweissatz: „Offene Zusatzkosten (An-/Abfahrt, ggf. Unterkunft) werden Ihnen vor verbindlicher Auftragserteilung mitgeteilt und bedürfen Ihrer Zustimmung." – exakter Wortlaut wird vor Umsetzung zur Freigabe vorgelegt
- Bestehende Texte, Tarife und Widerspruchslösung unverändert

## 6. Admin-Ansicht (`src/pages/Admin.tsx`)

- In den Auftragsdetails: Unterkunftsoption, Obergrenze und Vorkalkulation anzeigen (nur Anzeige, keine neuen Aktionen)

## 7. Tests & Prüfung

- Tests für Kalkulationsmodul (Tagessatz, Wochenpreis-Mischung, Wochenend-/Feiertagszuschläge, USt-Rundung) und Modul-Gleichheit Frontend/Function
- Bestehende Tests (berlinTime, tarifZuordnung, overnightCosts) müssen weiterlaufen
- Produktions-Build mit 21/21 Prerender-Seiten

## Ausdrücklich ausgeschlossen

- Keine Freigabelinks/Bestätigungsseiten für Kunden, keine neuen Buchungsschritte
- Keine Änderung an Fahrerannahme, Provision, Zuteilungsablauf, laufenden Aufträgen
- Keine Änderung an Preisen, Stornoklauseln, Cookie-Logik, SEO-Texten
- Kein Deployment von E-Mail-Funktionen und keine Veröffentlichung ohne gesonderte Freigabe
