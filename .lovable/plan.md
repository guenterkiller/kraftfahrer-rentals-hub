# Tarifabgrenzung Spezialfahrzeuge: Baumaschinenführer/Mischmeister vs. LKW CE

Ziel: Der Tarif „Baumaschinenführer/Mischmeister“ (489 € netto/Einsatztag bis 8 Std., 60 € netto je angefangene Mehrstunde) gilt auch für Spezialfahrzeuge, wenn die Bedienung einer fest aufgebauten Maschine/Anlage wesentlicher Bestandteil des Einsatzes ist. Reiner Transport ohne maßgebliche Maschinenbedienung bleibt LKW CE.

## 1. Buchungsformular (`src/components/SimpleBookingForm.tsx`)

- Kategoriekarte umbenennen/erweitern: „Baumaschinenführer / Mischmeister / Spezialfahrzeuge (Maschinenbedienung)“ mit Beispielhinweis: Saugwagen, Saugbagger, Pumptruck / Estrich-Pumptruck, Betonpumpe, Mischfahrzeug, Spül- und Reinigungsfahrzeug, Kanal- und Entsorgungsfahrzeug, Arbeitsmaschine.
- Neue Pflichtabfrage (Radiogruppe), sichtbar für alle Kategorien, direkt unter der Fahrertyp-Auswahl:
  „Muss der Fahrer am Einsatzort eine fest aufgebaute Maschine oder Anlage bedienen (z. B. Pumpe, Saug-, Misch-, Förder- oder Arbeitsanlage)?“
  Antworten: „Ja, Maschinen-/Anlagenbedienung ist wesentlicher Teil des Einsatzes“ · „Nein, reiner Transport / Fahren“ · „Unklar / muss geprüft werden“.
- Tätigkeitsauswahl erweitern um: Saugwagen / Saugbagger, Pumptruck / Estrich-Pumptruck, Betonpumpe, Mischfahrzeug, Spül-/Reinigungsfahrzeug, Kanal-/Entsorgungsfahrzeug, Arbeitsmaschine / Spezialfahrzeug (bestehende Optionen bleiben).
- Anzeige-Logik statt Stichwortraten:
  - „Ja“ → Tarifhinweis 489 € / 60 € Mehrstunde wird eingeblendet, auch wenn LKW CE gewählt wurde (Hinweis: „Für diesen Einsatz gilt der Tarif Baumaschinenführer/Mischmeister“).
  - „Nein“ + LKW CE → LKW-CE-Tarif unverändert.
  - „Unklar“ oder Widerspruch (LKW CE + Ja, oder Spezialfahrzeug + Nein) → kein automatischer Tarif, stattdessen Hinweisbox: „Tarifzuordnung wird vor Bestätigung manuell geprüft.“ Der Auftrag wird als prüfbedürftig markiert.
- Die Angaben fließen zusätzlich in Klartext in die Auftragsbeschreibung/Anforderungen ein (keine DB-Migration nötig).

## 2. Zentrale Tariflogik (neu: `src/lib/tarifZuordnung.ts`)

Eine einzige Funktion `resolveTarif({ kategorie, maschinenbedienung, taetigkeit, beschreibung })` liefert:
- `tarif: 'lkw_ce' | 'lkw_ce_woche' | 'fernfahrer' | 'baumaschine' | 'pruefung'`
- `label`, `netto`, `mehrstunde`, `needsReview`, `reason`.

Regeln (Priorität): explizite Maschinenbedienung „Ja“ → `baumaschine`; „Unklar“ oder widersprüchliche Angaben → `pruefung`; Stichwörter aus dem Freitext (Saugwagen, Pumptruck, Betonpumpe, Mischer, Spülwagen, Kanal, Estrich-Pumpe …) lösen **nie allein** einen Tarif aus, sondern nur `pruefung`, wenn die Abfrage nicht dazu passt.

## 3. Edge Functions / E-Mails

- `supabase/functions/submit-fahrer-anfrage/index.ts`: die Stichwortprüfung (`baumaschine|bagger|radlader`) durch die gleiche Regel-Logik ersetzen (portierte Kopie unter `supabase/functions/_shared/tarif-zuordnung.ts`). Bei `pruefung` wird im Admin-Betreff und in der Admin-Mail „Tarif manuell prüfen“ ausgegeben.
- `send-fahrer-anfrage-email` + `_shared/email-templates/customer-booking-confirmation.tsx`:
  - Fahrertyp korrekt benennen (inkl. Spezialfahrzeug-Tätigkeit).
  - Neuer Abschnitt in den Konditionen: Abgrenzung „Maschinenbedienung → 489 € / 60 € Mehrstunde; reiner Transport → LKW-CE-Tarif“.
  - Bei `pruefung`: statt Preisangabe der Satz „Die endgültige Tarifzuordnung wird vor der verbindlichen Bestätigung geprüft und Ihnen mitgeteilt.“
- `_shared/email-templates/admin-booking-notification.tsx`: Block „Tarifzuordnung“ mit Antwort auf die Maschinenbedienungs-Frage und Prüfmarkierung.

## 4. Preis-/Infoseiten (redaktionell)

`src/pages/PreiseUndAblauf.tsx` und `src/pages/BaumaschinenfuehrerBuchen.tsx`: Klarstellung ergänzen, dass der Tarif auch für Spezialfahrzeuge mit Maschinenbedienung gilt (Aufzählung wie oben) und reiner CE-Transport beim LKW-CE-Tarif bleibt. Grundpreise unverändert.

## 5. Bestehender Auftrag Blaukat Estrich GmbH

Keine automatische Änderung, kein Mailversand. Vorschlag zur Freigabe: Tarif im Datensatz auf „Baumaschinenführer/Mischmeister – Estrich-Pumptruck, 489 € netto/Tag, 60 €/Mehrstunde“ setzen (Estrich-Pumptruck-Bedienung). Erst nach Deiner Freigabe.

## Nicht geändert

Grundpreise, Zuschlagsregeln, DB-Schema/RLS, Vermittlungslogik, Provisionsangaben. Kein Deploy und kein Mailversand ohne Freigabe.
