# Fahrertyp-Erkennung, Tarifspeicherung und Besteller-E-Mail

Der Tarif wird künftig regelbasiert bestimmt, im Auftrag gespeichert und in der Besteller-E-Mail hervorgehoben. Bei Unklarheit wird kein Fahrertyp genannt, sondern zur manuellen Prüfung markiert.

## 1. Bereits vorbereitet (Frontend, noch ohne DB/E-Mail)

- `src/lib/tarifZuordnung.ts`: zentrale Regel-Logik (`resolveTarif`) mit Tarifschlüsseln `lkw_ce`, `lkw_ce_woche`, `fernfahrer`, `baumaschine`, `pruefung`.
- `src/components/SimpleBookingForm.tsx`: Pflichtfrage „Muss der Fahrer eine fest aufgebaute Maschine oder Anlage bedienen?“ (Ja / Nein / Unklar), erweiterte Spezialfahrzeug-Auswahl (Saugwagen, Saugbagger, Pumptruck / Estrich-Pumptruck, Betonpumpe, Mischfahrzeug, Spül-/Reinigungsfahrzeug, Kanal-/Entsorgungsfahrzeug, Arbeitsmaschine), Live-Anzeige des maßgeblichen Tarifs bzw. des Prüfhinweises.

## 2. Erkennung (Regeln statt einfacher Stichworte)

Reihenfolge:
1. Antwort „Ja“ auf Maschinen-/Anlagenbedienung → `baumaschine` (489 € / 60 € Mehrstunde), auch wenn LKW CE gewählt wurde.
2. Antwort „Unklar“ oder fehlende Antwort → `pruefung`.
3. Antwort „Nein“, aber Kategorie Spezialfahrzeug **oder** Freitext/Tätigkeit enthält Begriffe wie Baumaschinenführer, Mischmeister, Pumptruck, Estrichpumpe, Betonpumpe, Saugwagen, Saugbagger, Fahrmischer, Spülwagen, Kanalreinigung, Arbeitsmaschine, Flüssigboden → `pruefung` (nie automatisch ein Tarif aus Stichworten).
4. Sonst LKW CE / Wochenpreis / Fernfahrer wie bisher.

## 3. Datenbankmigration

Vorhandene Spalten in `job_requests` werden genutzt: `tarif_type`, `tarif_label`, `tarif_netto`, `tarif_unit`.
Neue Spalten (alle nullable, keine Datenänderung an bestehenden Zeilen):

```sql
ALTER TABLE public.job_requests
  ADD COLUMN IF NOT EXISTS tarif_mehrstunde_netto numeric,
  ADD COLUMN IF NOT EXISTS tarif_needs_review boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tarif_reason text,
  ADD COLUMN IF NOT EXISTS maschinenbedienung text,
  ADD COLUMN IF NOT EXISTS weekend_days text[],
  ADD COLUMN IF NOT EXISTS holiday_days text[];
```

Keine Änderung an RLS oder Grants (Tabelle besteht bereits, Policies bleiben unverändert).

## 4. Edge Functions

- `submit-fahrer-anfrage`: Stichwortprüfung `baumaschine|bagger|radlader` entfällt. Stattdessen `_shared/tarif-zuordnung.ts`; der ermittelte Tarif wird beim Anlegen des Auftrags in den oben genannten Spalten gespeichert und an die E-Mail-Funktion übergeben. Bei `pruefung`: Admin-Betreff „Neue Buchungsanfrage: Tarif manuell prüfen – <Ort>“.
- `send-fahrer-anfrage-email` + `_shared/email-templates/customer-booking-confirmation.tsx`: neuer hervorgehobener Tarifblock (siehe Vorschau), Wochenend-/Feiertagszeilen aus `analyzeWeekendHoliday`, vollständige Preisliste rückt nach unten als „weitere Tarife zur Information“.
- `_shared/email-templates/admin-booking-notification.tsx`: Block „Tarifzuordnung“ mit Antwort auf die Maschinenfrage, Tarif, Mehrstundensatz und Prüfmarkierung.
- Keine Zahlungsbedingungen werden ergänzt.

## 5. Vorschau Besteller-E-Mail (eindeutiger Fall)

```text
Für Ihren Einsatz maßgeblicher Tarif
------------------------------------
Fahrertyp:              Baumaschinenführer / Mischmeister (Maschinen- und Anlagenbedienung)
Tagessatz:              489,00 € netto je Einsatztag bis 8 Stunden
Mehrarbeit:             60,00 € netto je angefangene Stunde
An- und Abfahrt:        erste 25 km frei, danach 0,40 € netto je gefahrenem Kilometer

Zuschläge in Ihrem Einsatzzeitraum (automatisch erkannt)
Sa, 29.08.2026          25 % Zuschlag auf den Tagessatz  (611,25 € netto)
So, 30.08.2026          50 % Zuschlag auf den Tagessatz  (733,50 € netto)

Weitere Tarife zur Information: LKW CE 349 € · Wochenpreis 1.645 € · Fernfahrer 450 €
```

Unklarer Fall (keine Fahrertyp-Nennung):

```text
Tarifzuordnung wird geprüft
---------------------------
Ihre Einsatzbeschreibung wird vor der verbindlichen Bestätigung geprüft.
Den maßgeblichen Fahrertyp und Tagessatz teilen wir Ihnen mit der Bestätigung mit.
Wochenend- und Feiertagszuschläge: Samstag 25 %, Sonntag/Feiertag 50 %.
```

## 6. Tests

Neue Vitest-Datei `src/lib/__tests__/tarifZuordnung.test.ts`:
- „Ja“ + LKW CE gewählt → `baumaschine`, 489 €, 60 € Mehrstunde
- „Nein“ + Freitext „Estrichpumpe / Pumptruck“ → `pruefung`
- „Unklar“ → `pruefung`, kein Fahrertyp im Ergebnis-Label
- „Nein“ + reiner Transport → `lkw_ce` 349 €, Fernverkehr → 450 €, Wochenpreis → 1.645 €
- Wochenend-/Feiertagserkennung: Zeitraum 28.08.–04.09.2026 liefert Samstag- und Sonntagszuschläge

## 7. Bestehender Auftrag Blaukat Estrich GmbH

Keine rückwirkende Änderung, kein Mailversand. Nach Deiner separaten Freigabe würde der Auftrag auf Baumaschinenführer/Mischmeister (489 € / 60 €) gesetzt.
