# Verbindliche Fahrerannahme (Variante A)

## Ziel
Wenn der Admin einen Fahrer zuteilt, bleibt der Ablauf wie heute. Zusätzlich bekommt der Fahrer in der bestehenden Zuteilungsmail einen persönlichen Button „Auftrag verbindlich annehmen“. Seine Annahme wird getrennt, fälschungssicher und mit vollständigem Vertragstext dokumentiert. Eine Admin-Zuteilung wird nirgends als Fahrerannahme dargestellt.

## Festlegungen
- Vermittlungsprovision 20 % (normal) oder 25 % (Sonderauftrag); der Admin wählt bei der Zuteilung aus, Standard ist 20 %.
- Berechnungsgrundlage: sämtliche Nettovergütungen der Fahrleistung einschließlich Mehrstunden und einsatzbezogener Zuschläge; An- und Abfahrtskosten provisionsfrei.
- Link: persönlich, einmalig nutzbar, gültig 48 Stunden, längstens bis Einsatzbeginn.
- Nach Ablauf: Mail an den Admin, keine automatische Neuzuteilung.
- Bestätigung an Fahrer und Fahrerexpress per E-Mail mit vollständigem Vertragstext und PDF.
- Bestehende Interessenbekundungen, Aufträge, Zuweisungen und Annahmeprotokolle bleiben unverändert.

## Ablauf

```text
Admin teilt zu (unverändert, Status "bestätigt" = Admin-Auswahl)
  -> Zuteilungsmail (bestehend) + Button "Auftrag verbindlich annehmen"
  -> Bestätigungsseite: Auftragsdaten + Vertragstext + Pflichtkästchen (leer)
  -> Button "Auftrag und Bedingungen verbindlich annehmen"
  -> Nachweis gesperrt gespeichert, PDF erzeugt
  -> Bestätigungsmail an Fahrer + info@kraftfahrer-mieten.com
Frist abgelaufen -> Mail an Admin, Anzeige "Fahrerannahme abgelaufen"
```

## Vertragstext (Version 2026-10-15, eigener Textbaustein)
1. **Vermittlungsprovision** – 20 % bzw. 25 % (Wert aus der Zuteilung), Grundlage wie oben, An- und Abfahrt provisionsfrei.
2. **Zahlungsbedingungen** – Auszahlung grundsätzlich nach Zahlungseingang des Bestellers bei Fahrerexpress; bei längeren Aufträgen kann eine wöchentliche Abrechnung individuell vereinbart werden; individuelle Vereinbarungen werden ausdrücklich dokumentiert. **[Rechtlich prüfen]**
3. **Leistungsbericht** – mit jeder Rechnung einzureichen, vom Besteller unterschrieben und abgestempelt; ohne ordnungsgemäßen Leistungsbericht keine Zahlungsfreigabe. **[Rechtlich prüfen]**
4. Verweis auf die geltenden Fahrer-Vermittlungsbedingungen (bestehende Version).

Die Kennzeichnung „Rechtlich prüfen“ steht nur im Plan und im Admin-Bericht, nicht im Text für den Fahrer.
Der bisherige Satz zum Vermittlungsanteil in der Zuteilungsmail („in der Regel 20 %, bis zu 25 % … ohne An- und Abfahrt …“) wird durch einen Verweis auf den Vertragstext ersetzt. Das ist die einzige Textänderung an der bestehenden Mail und vermeidet einen Widerspruch.

## Anzeige im Admin-Bereich (Schutz vor Verwechslung)
- Die bisherige Kennzeichnung „Bestätigt“ heißt künftig **„Admin-Zuteilung bestätigt“**.
- Daneben steht ein eigener Status **„Fahrerannahme: ausstehend / verbindlich angenommen am … / abgelehnt / abgelaufen“**.
- „Verbindlich angenommen“ erscheint nur, wenn ein gesperrter Annahmenachweis vorliegt, nie aufgrund des Zuweisungsstatus.
- Im Zuteilungsfenster gibt es eine neue Auswahl „Provision: 20 % normal / 25 % Sonderauftrag“.

## Sicherheit und Nachweis
- Link-Code: 32 zufällige Bytes, eindeutig, gebunden an genau eine Zuteilung und einen Fahrer.
- Server-Prüfung bei jeder Annahme: Link gültig, Frist nicht abgelaufen, noch nicht genutzt, Zuteilung nicht storniert, Fahrer stimmt überein, Pflichtkästchen gesetzt, Zustimmungstext vollständig übermittelt.
- Einmaligkeit: Ein Doppelklick oder zweiter Aufruf erzeugt keinen zweiten Nachweis.
- Gespeichert werden: Fahrer-ID, Auftrags- und Zuteilungsnummer, Provisionssatz, vollständiger Vertragstext, Vertragsversion, Zustimmungstext, Auftragsdaten (Besteller, Einsatzort, Tätigkeit, Zeitraum, Satz, Satzart), Zeitpunkt, IP-Adresse, Browser und ein digitaler Fingerabdruck über diese Inhalte.
- Gesperrter Nachweis: Verbindliche Annahmen können danach weder geändert noch gelöscht werden, auch nicht durch den Admin.
- Ändert der Admin Satz, Zeitraum oder Provision, wird der offene Link ungültig; über „Annahmelink erneut senden“ geht ein neuer Link raus.
- Das PDF liegt im bestehenden privaten Speicherbereich für Bestätigungen und ist nur für den Admin abrufbar.
- Die Bestätigungsseite wird nicht indexiert und zeigt nur Daten zum eigenen Link.

## Betroffene Dateien
- `supabase/functions/send-driver-confirmation/index.ts`: erzeugt den Link, ergänzt den Button und passt den Satz zur Provision an
- `supabase/functions/respond-invite/index.ts`: neuer Modus „verbindliche Annahme“ (Laden, Annehmen, Ablehnen); der bestehende Interessens-Modus bleibt unverändert
- `supabase/functions/_shared/driver-contract-terms.ts` (neu): Vertragstext mit Version für den Mailversand
- `src/lib/driverContractTerms.ts` (neu): gleicher Text für die Webseite
- `supabase/functions/_shared/binding-acceptance-pdf.ts` (neu): PDF der Annahmebestätigung
- `supabase/functions/check-binding-acceptance-expiry/index.ts` (neu): findet abgelaufene Links und benachrichtigt den Admin einmalig; läuft stündlich zeitgesteuert
- `src/pages/FahrerAntwortBestaetigen.tsx`: zusätzliche Ansicht für die verbindliche Annahme; die bestehende Ansicht bleibt
- `src/components/AdminAssignmentDialog.tsx`: Auswahl der Provision
- `supabase/functions/admin-assign-driver/index.ts`: übernimmt die Provision
- `src/pages/Admin.tsx`: getrennte Statusanzeige, Button „Annahmelink erneut senden“
- `supabase/functions/admin-data-fetch/index.ts`: liefert den Annahmestatus mit
- Tests: `respond-invite/binding_test.ts`, `_shared/driver-contract-terms_test.ts` (neu)
- `AGENTS.md`: eine Regel zur Trennung von Admin-Zuteilung und Fahrerannahme

Nicht betroffen: Registrierung, Interessensmails, Kundenmails, Preisberechnung, Rechnungen, öffentliche Seiten, SEO.

## Datenbankänderungen (nur zusätzliche Spalten, nichts gelöscht)
- **Zuweisungen** (`job_assignments`): neue Spalte `commission_pct` (nur 20 oder 25 erlaubt, Standard 20; vorhandene Zuweisungen behalten leer = unverändert).
- **Persönliche Links** (`assignment_invites`):
  - neue Spalten `purpose` (Standard „interest“, neu „binding“), `assignment_id`, `expiry_notified_at`
  - bestehende Links werden automatisch zu „interest“, ihr Verhalten ändert sich nicht
- **Annahmeprotokoll** (`job_driver_acceptances`):
  - neue Spalten `contract_text`, `contract_version`, `commission_pct`, `content_hash`, `pdf_path`
  - Die bisherige Einmaligkeitsregel (Auftrag + Fahrer) gilt künftig nur noch für Interessenbekundungen. Für verbindliche Annahmen gilt eine eigene Regel: höchstens eine je Zuteilung.
  - Eine Sperre verhindert, dass verbindliche Annahmen geändert oder gelöscht werden.
  - Vorhandene 8 Einträge bleiben unverändert.
- **Zeitsteuerung:** stündlicher Aufruf der Fristprüfung (pg_cron). Falls diese Erweiterung nicht verfügbar ist, läuft die Prüfung beim Öffnen des Admin-Bereichs.
- Keine neuen Tabellen, keine Änderung an Zugriffsregeln für Besucher.

## Tests (ohne echten Versand, ohne Echtdaten)
1. Automatisch:
   - Link-Prüfung (gültig, abgelaufen, Einsatzbeginn überschritten, schon genutzt, falscher Fahrer, storniert)
   - Pflichtkästchen fehlt
   - Doppelklick
   - Fingerabdruck stabil
   - Provision 20/25 im Text
   - Vertragstext Webseite = Mail
2. Datenbank:
   - Gesperrter Nachweis lässt sich nicht ändern oder löschen.
   - Bestehende Einträge und Interessens-Links funktionieren unverändert.
3. Mailvorschau ohne Versand: Zuteilungsmail mit Button, Bestätigungsmail und PDF-Inhalt.
4. Browser (320/375/768/1280 px):
   - Bestätigungsseite
   - Admin-Anzeige: Nach der Admin-Zuteilung steht „Fahrerannahme: ausstehend“, nie „angenommen“.
5. Fristablauf simuliert: genau eine Admin-Benachrichtigung, keine Neuzuteilung.
6. Rückfall-Prüfung: bestehender Interessens-Link, Admin-Zuteilung, Kundenmail und Build mit 21 vorgerenderten Seiten.
7. Echte Testmail nur nach Ihrer gesonderten Freigabe, ausschließlich an info@kraftfahrer-mieten.com.

## Vor dem Produktivbetrieb rechtlich prüfen lassen
- Zahlung erst nach Zahlungseingang beim Besteller (Ausfallrisiko, fehlende Höchstfrist)
- Keine Zahlungsfreigabe ohne unterschriebenen und gestempelten Leistungsbericht (Fall der Verweigerung durch den Besteller)
- Provision auf Mehrstunden und Zuschläge sowie die Abgrenzung von Normal- und Sonderauftrag (Transparenz)
- Abstimmung mit den bestehenden Fahrer-Vermittlungsbedingungen und früheren Provisionsangaben
- Scheinselbstständigkeit, Datenschutz (IP-Adresse, Aufbewahrungsdauer), Klick-Annahme als Vertragsschluss

## Nicht Teil dieser Umsetzung
Keine Veröffentlichung, kein IONOS-Upload, keine automatische Neuzuteilung, keine Änderung bestehender Stornoregeln.
