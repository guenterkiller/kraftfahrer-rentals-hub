# Prüfbericht: Vertrags- und Zahlungskonstrukt Fahrerexpress (nur Lesen, keine Änderungen)

Dieser Bericht enthält keinen Umsetzungsschritt. Eine Freigabe löst keine Änderung aus.

## 1. Wer stellt wem die Rechnung?

Vertraglich gilt ein Zwei-Stufen-Modell (Agenturmodell), keine Rechnung im Namen des Fahrers:
- Der Fahrer stellt seine Rechnung an Fahrerexpress. `supabase/functions/send-driver-confirmation/index.ts` Z. 223: „Der Fahrer stellt seine Rechnung nach Einsatzende an Fahrerexpress … – bereits nach Abzug des vereinbarten Vermittlungsanteils … Fahrerexpress stellt dem Auftraggeber eine Gesamtrechnung."
- Fahrerexpress stellt dem Auftraggeber die Rechnung im eigenen Namen. `src/pages/Vermittlungsbedingungen.tsx` Z. 86–89: „Die Abrechnung der beauftragten Einsätze erfolgt über die Fahrerexpress-Agentur. Der Auftraggeber erhält eine Rechnung über die vereinbarten Leistungen." `src/pages/PreiseUndAblauf.tsx` Z. 492: „Vertragspartner des Auftraggebers ist die Fahrerexpress-Agentur."
- Datenbank-Kommentar (Migration `20251126085134_…sql` Z. 12): „driver invoices Fahrerexpress, and Fahrerexpress invoices the customer."
- Direkt abrechnen ist verboten: `_shared/email-templates/driver-registration-confirmation.tsx` Z. 53: „Es darf nicht direkt mit dem Auftraggeber abgerechnet werden … Die gesamte Abrechnung läuft über Fahrerexpress."

## 2. Wer schuldet wem die Vergütung?

- Der Auftraggeber schuldet sie **Fahrerexpress** (Vertragspartner, Rechnung durch die Agentur, 7 Tage).
- Fahrerexpress schuldet sie **dem Fahrer** (Rechnungsempfänger der Fahrerrechnung).
- Unsicherheit: `Vermittlungsbedingungen.tsx` Z. 70 („Fahrerexpress schuldet die Organisation und Koordination …") und `PricingSection.tsx` Z. 260 („Vermittlung nach § 652 BGB (Maklervertrag)") stehen im Spannungsverhältnis zur eigenen Vertragspartnerschaft und Gesamtrechnung. Ein Makler schuldet keine Leistung und rechnet in der Regel nicht die Hauptleistung ab. Rechtliche Prüfung empfohlen.

## 3. Fälligkeit der Fahrerzahlung

- `src/lib/driverContractTerms.ts` / `supabase/functions/_shared/driver-contract-terms.ts`, Abschnitt 2: „Die Auszahlung an den Fahrer erfolgt grundsätzlich nach Eingang der entsprechenden Zahlung des Bestellers bei Fahrerexpress. Bei längeren Aufträgen kann eine wöchentliche Abrechnung individuell vereinbart werden."
- `driver-registration-confirmation.tsx` Z. 47: „Die Zahlung erfolgt nach vollständiger und ordnungsgemäßer Durchführung des Einsatzes; soweit im konkreten Auftragsangebot nichts anderes vereinbart ist, nach Zahlungseingang des Auftraggebers bei Fahrerexpress."
- **Es gibt keine konkrete Zahlungsfrist** (z. B. „x Tage nach Kundengeldeingang") gegenüber dem Fahrer. Ich habe keine gefunden.
- Unsicherheit: Es ist nicht geregelt, was gilt, wenn der Kunde nie zahlt (z. B. Zahlungsausfall, Insolvenz). Das Wort „grundsätzlich" lässt offen, ob das Ausfallrisiko beim Fahrer liegt. Solche Klauseln („pay-when-paid") können in AGB nach § 307 BGB unwirksam sein. Rechtliche Prüfung nötig.

## 4. Provisionsabzug (20 % / 25 %)

- Vertragstext, Abschnitt 1: 20 % bei normalen Aufträgen, 25 % bei Sonderaufträgen. „Berechnungsgrundlage sind sämtliche vereinbarten Nettovergütungen aus der Fahrleistung, einschließlich Mehrstunden und einsatzbezogener Zuschläge. An- und Abfahrtskosten sind provisionsfrei."
- Zeitpunkt: Der Abzug erfolgt schon **vor** der Rechnung des Fahrers, nicht als nachträgliche Verrechnung (`send-driver-confirmation` Z. 223; `driver-accept-job/index.ts` Z. 254).
- Tatsächliche Umsetzung: Es gibt **keine Funktion, die die Provision berechnet oder abzieht**. Gespeichert wird nur der Satz (`commission_pct` in der Zuteilung bzw. im Annahmenachweis, PDF-Zeile in `_shared/binding-acceptance-pdf.ts` Z. 68).

## 5. Leistungsnachweis / unterschriebene Stundenzettel

- Vertragstext, Abschnitt 3: „Jeder Fahrer muss mit seiner Rechnung den zugehörigen Leistungsbericht einreichen. Der Leistungsbericht muss vom Besteller unterschrieben und abgestempelt sein. Ohne ordnungsgemäßen Leistungsbericht erfolgt keine Zahlungsfreigabe."
- Die Begriffe „Stundenzettel" oder „Stundennachweis" kommen nicht vor. Es gibt keine Upload- oder Prüffunktion für Leistungsberichte.

## 6. Vorzeitiger Auftragsabbruch

- Gegenüber dem Fahrer gibt es nur eine Mitteilungspflicht (`send-driver-confirmation` Z. 229, Ziffer 8): „… unverzüglich zu informieren, wenn absehbar ist, dass er den Einsatz nicht, nicht rechtzeitig oder nicht vollständig durchführen kann."
- Bei Nichterscheinen: Gebühr von 150 € (`send-no-show-notice/index.ts` Z. 90, Feld `no_show_fee_cents`; Ablauf über einen Admin-Button).
- Nicht geregelt: wie ein teilweise erbrachter Einsatz vergütet wird oder welche Folgen ein Abbruch für den Fahrer hat.
- Gegenüber dem Kunden gelten Stornostufen (Memory: unter 24 h 80 %, am selben Tag 100 %). Sie wurden hier nicht erneut wörtlich geprüft. Ihre Auswirkung auf die Vergütung des Fahrers ist nicht geregelt.

## 7. Zahlungsverzug

- Kunde: `Vermittlungsbedingungen.tsx` Z. 216–222: „Rechnungen sind innerhalb von 7 Kalendertagen ab Rechnungsdatum ohne Abzug zu begleichen. Bei Zahlungsverzug gelten die gesetzlichen Regelungen des § 288 BGB … 9 Prozentpunkte über dem Basiszinssatz."
- Fahrerexpress gegenüber dem Fahrer: keine Regelung gefunden. Es gilt also das Gesetz, wobei die Fälligkeit wegen Abschnitt 3 unklar bleibt.

## 8. Tatsächlich umgesetzt vs. vertraglich geregelt

| Thema | Im Vertragstext | Im System umgesetzt |
|---|---|---|
| Agenturmodell | ja | Feld `billing_model='agency'` (alle 79 Aufträge) |
| Kundenrechnung | ja | nur Status `customer_invoice_status='draft'` bei Annahme (`driver-accept-job` Z. 234); keine Rechnungserstellung |
| Fahrerrechnung / Auszahlung | ja | Felder `subcontractor_invoice_status` / `payout_status` vorhanden, alle stehen auf `draft`/`pending` und werden nirgends im Code fortgeschrieben |
| Provisionsabzug | ja | nur der Satz wird gespeichert, keine Berechnung |
| Leistungsbericht | ja | keine Funktion |
| Nichterscheinen 150 € | ja | Admin-Markierung und Mail |
| Fristen / Mahnwesen | nur für Kunden | keine |

Die Abrechnung läuft also tatsächlich außerhalb des Systems (manuell).

## 9. Offene Punkte und Unsicherheiten

1. Die eigene Seite `/fahrer-vermittlungsbedingungen` ist in den Seitenrouten von `src/App.tsx` **nicht vorhanden**, wird aber in Abschnitt 4 des Vertragstexts verlinkt. Die zuletzt gültige Fassung (`TERMS_VERSION_DRIVER = 2026-07-26`) ist im Code nicht als Text auffindbar. Das deckt sich mit dem früher gemeldeten falschen Bedingungslink.
2. Es fehlt eine Zahlungsfrist gegenüber dem Fahrer, und das Ausfallrisiko ist offen (pay-when-paid).
3. Die Einordnung als Maklervertrag (§ 652) passt nicht zur Vertragspartnerschaft mit Gesamtrechnung.
4. Die Vergütung bei Abbruch oder Teilleistung ist nicht geregelt.
5. Verschiedene Fassungen weichen leicht voneinander ab. Beispiel: In der Registrierungsmail sind Diesel, Maut und Hotel provisionsfrei, im Vertragstext nur An- und Abfahrt.
6. Für die Absage durch den Kunden (Storno) gibt es keine Regel zur Fahrervergütung.

Alle Aussagen beruhen auf Code und Texten im Projekt sowie auf einer Datenbankabfrage, die nur gelesen hat. Rechtsverbindliche Bewertung nur durch einen Anwalt.
