# Klärung: Warum die automatische Interessenmail keinen Verdienst zeigt (nur Analyse, keine Änderung)

## Befund (code-belegt)
Es gibt zwei getrennte Mailwege:

1. **Unverbindliches Auftragsangebot (Interessenmail)** – `supabase/functions/_shared/driver-job-offers.ts`, Funktion `inviteHtml` (aufgerufen von `dispatchDriverJobOffers` nach Vertragsannahme/Freischaltung). Gleiches Prinzip in `broadcast-job-invites/index.ts`.
   - Die Vorlage enthält nur Einsatzort, Zeitraum, Fahrzeugtyp, Führerschein, Besonderheiten, Aufgabenbeschreibung, Links und den Hinweis „Ein persönliches verbindliches Angebot mit vereinbarter Vergütung erhalten Sie erst nach einer Zuteilung“.
   - Es gibt dort **kein Vergütungsfeld und keine Datenquelle** dafür. Die Mail an TEST-Peter (Völklingen 11.01.–15.01.2027) kam aus diesem Weg; deshalb kein Verdienst.
2. **Persönliches verbindliches Angebot** – `_shared/short-offer.ts` / `_shared/driver-offer-remuneration.ts`, Box „Ihre Vergütung für diesen Auftrag“ (gestern umgesetzt).
   - Quelle: `job_assignments.rate_type` + `rate_value` (vom Admin bei Zuteilung eingetragenes Fahrerhonorar) × bezahlte Einheiten, minus Provision nach `tarif_type` (20 %/25 %), festgeschrieben im unveränderlichen `assignment_invites.offer_snapshot`.
   - Existiert erst **nach** Admin-Zuteilung. Die gestrige Optimierung betraf nur diesen Weg; die Interessenmail wurde bewusst nicht mit Beträgen versehen.

## Ist die Fahrer-Nettovergütung vor der Zuteilung gespeichert?
Nein. In `job_requests` liegen nur Kundenwerte (`tarif_netto`, `tarif_mehrstunde_netto`, `kosten_uebersicht`). Ein Fahrerhonorar gibt es ausschließlich in `job_assignments` – also erst nach Zuteilung. Eine Zahl in der ersten Mail wäre heute nur durch Ableitung aus dem Kundenpreis möglich – das ist verboten (Kundenpreis ≠ Fahrervergütung, Risiko doppelter Provision).

## Vorschlag (minimal, zur Auswahl – nichts davon umgesetzt)

**Option A – Fahrerhonorar je Auftrag vor dem ersten Versand festlegen (empfohlen)**
- Neue Pflichtangabe beim Admin-Freigeben eines Auftrags: „Fahrerhonorar netto (vor Provision)“ + Einheit (Tag / 5-Tage-Woche / Pauschale), als unveränderlicher Freigabe-Snapshot am Auftrag gespeichert (neue Spalten oder eigene Tabelle; Datenbankänderung nötig).
- Interessenmail zeigt groß „Ihre voraussichtliche Vergütung“ = Honorar − Provision nach bestehender Funktion `commissionPctForTarif` (eine einzige Abzugsstelle, keine doppelte Provision), mit Einheit, Zeitraum, Mo–Fr, CE, Ort; weiterhin klar unverbindlich.
- Spätere Zuteilung übernimmt diesen Wert als Vorschlag für `rate_value`; Abweichung nur bewusst durch Admin.
- Server-Sperre: Auftrag ohne festgelegtes Honorar wird nicht versendet, interne Meldung „Fahrerhonorar fehlt“.

**Option B – Versand ohne Preis unterbinden (ohne neue Daten)**
- `dispatchDriverJobOffers` und `broadcast-job-invites` senden nur, wenn ein Fahrerhonorar vorliegt; da es das heute nie gibt, würden **alle** automatischen Interessenmails ausbleiben, bis Option A existiert.

## Auswirkungen auf den automatischen Versand nach Vertragsannahme
- A: Automatik bleibt; Aufträge ohne Honorar werden übersprungen und protokolliert. Bestehende freigegebene Aufträge (z. B. Völklingen) brauchen eine Nachpflege durch den Admin, sonst kein Versand – keine rückwirkende Änderung ohne Freigabe.
- B: Automatik versendet faktisch nichts mehr.
- Bereits versendete Mails (auch an TEST-Peter) bleiben unverändert; kein erneuter Versand.

## Offene Entscheidung des Betreibers
1. Option A oder B?
2. Bei A: Einheit des Honorars (Tag, 5-Tage-Woche, Gesamtpauschale) und ob An-/Abfahrt angezeigt wird.
3. Freigabe der dafür nötigen Datenbankerweiterung.

## Nachweise bei Umsetzung (nach Freigabe)
Tests: ohne Honorar → blockiert; mit Honorar → richtiger Nettobetrag; Kundenpreis/Provision nicht in der Mail; Provision nur einmal; Originalrenderer-HTML/Screenshot mit TEST-Daten; kein realer Versand, kein IONOS.
