# Ursachenanalyse Auftrag Völklingen 66333 (nur lesend geprüft, nichts geändert)

Auftrag `e885a607-2018-45a0-82f1-b31e82699710`, eingegangen 16.11.2026 08:51:08 (Berlin), echter Auftrag (kein Test).

## 1. Was der Kunde tatsächlich gespeichert hat (Originaldaten)
- Tarif: „LKW-Fahrer CE – Wochenpreis“ (1.645 € je Woche, 5 Einsatztage)
- Zeitraum: 17.11.2026 (Di) bis 23.12.2026 (Mi), „37 Kalendertage“
- Kästchen „Wochenendarbeit erforderlich“: **nicht angekreuzt** (Feld „Besonderheiten“ leer)
- Es gibt **kein Feld**, in dem der Kunde Wochenendtage einzeln auswählt. Die 10 gespeicherten Sa/So-Tage hat das System aus dem Kalender abgeleitet.
- Anzahl Wochen oder Tage hat der Kunde **nicht angegeben**, nur Start und Ende.
- Bestätigung: Pflicht-Checkbox gesetzt, Text und Bedingungen gespeichert (Version `auftraggeber-b598fc8b5a207da5`), Eingang 08:51:08.
- Nachträgliche Änderungen: keine an Preis oder Zeitraum. Nur Freigabe und Versand an 22 Fahrer um 09:04 Uhr.

## 2. Warum 13.681,75 € netto entstehen
Die Berechnung `berechneKostenUebersicht` steht in `src/lib/kostenUebersicht.ts` (gleich in `supabase/functions/_shared/kosten-uebersicht.ts`). Sie läuft beim Absenden im Formular und wird auf dem Server neu berechnet und gespeichert (`submit-fahrer-anfrage`).
Beim Wochenpreis zählt sie **jeden Kalendertag** zwischen Start und Ende:
- 27 Werktage → 5 Wochen × 1.645 € + 2 Tage × 329 €
- **jeder** Samstag/Sonntag im Zeitraum wird automatisch als Einsatztag berechnet (349 € + 25 % bzw. + 50 %), ohne zu prüfen, ob Wochenendarbeit angekreuzt ist.

Ergebnis: Die 10 Wochenendtage (4.798,75 €) sind ein **Systemfehler**, keine Kundenauswahl. Ohne sie hätte die Vorkalkulation 8.883,00 € netto ergeben.

## 3. Hat der Kunde diese Zahlen gesehen?
- **Im Formular vor dem Absenden: ja.** Die Tabelle „Vorkalkulation“ zeigt diese Positionen.
- **In der Kunden-Bestätigungsmail: laut Vorlage ja.** `customer-booking-confirmation.tsx` gibt die Positionen für alle Tarife außer Fernverkehr aus. Diese Mail wird in `email_log` nicht protokolliert. Dass sie zugestellt wurde, ist darum **nicht belegt**, sie wird aber regulär ausgelöst.
- Admin-Mail und Admin-Ansicht zeigen dieselben Positionen.
- **Fahrer haben sie nicht bekommen.** In den 22 Fahrermails (auch an Arlind Emini, 09:04:19) gibt es keine Kostentabelle.

## 4. Was gebucht oder verbindlich ist
- Nichts. Status „sent“, also nur unverbindliche Anfrage. Laut Formular und Mail entsteht ein Auftrag erst nach Bestätigung und Zuteilung.
- Arlind Emini: nur Interessenanfrage, offen und unbeantwortet. **Keine Zuteilung, kein verbindliches Angebot, keine Annahme.**
- Abgesagt haben Tim Alisch und Alexander Speier. Andere Fahrer haben nicht zugesagt.
- Kein Betrag ist vereinbart. 13.681,75 € ist nur eine gespeicherte Vorkalkulation.

## Unklar
- Ob die Kundenmail zugestellt wurde (nur im Versandprotokoll des Mail-Dienstes prüfbar).
- An welchen Tagen der Kunde wirklich Einsätze will. Das muss telefonisch geklärt werden. Nichts raten.

## Reparaturvorschlag (erst nach Ihrer Freigabe)
1. **Sofort, ohne Code:** Kunde telefonisch informieren: Die Wochenendpositionen waren eine fehlerhafte automatische Vorkalkulation, Wochenendarbeit wurde nicht angefordert. Tatsächliche Einsatztage klären. Keine automatische Mail.
2. **Rechenlogik korrigieren (Formular und Server gleich):** Samstag, Sonntag und Feiertag nur berechnen, wenn „Wochenendarbeit erforderlich“ angekreuzt ist. Sonst diese Tage nicht berechnen und als „nicht gebucht“ ausweisen. Bei angekreuzter Wochenendarbeit bisheriges Verhalten. Tagessätze und Wochenpreis bleiben unverändert. Dazu Tests mit genau diesem Zeitraum: ohne Häkchen 8.883,00 € netto, mit Häkchen 13.681,75 € netto.
3. **Bestandsschutz:** Die gespeicherte Vorkalkulation dieses Auftrags bleibt unverändert als Nachweis. Im Admin bekommt sie einen Hinweis „Wochenendpositionen ohne Kundenauswahl berechnet“. Ob der Wert korrigiert wird, entscheiden Sie gesondert.
4. Keine Mails, keine Änderungen am Auftrag, kein GitHub- oder IONOS-Schritt ohne Ihre Freigabe.

## Nachtrag: Die tatsächlich versandte Kundenmail (nur lesend geprüft)
- **Versand belegt:** Eintrag im Mail-Protokoll `2c18988d-6a2e-404c-b8b7-26d0e1b44e77`
  - Vorlage `customer_booking_confirmation`, Status „sent“
  - Empfänger: die Kundenadresse dieses Auftrags (abgeglichen)
  - Betreff „Ihre Fahrerbuchung bei der Fahrerexpress-Agentur“
  - Versand 16.11.2026 08:51:11 (Berlin)
  - Kennung beim Versanddienst Resend: `01a1e356-aede-7b53-b981-80fbe7b2fc65`
- **Kein Inhalts-Snapshot gespeichert.** Das Protokoll enthält nur Metadaten, keinen Mailtext. Es ist außerdem nicht mit dem Auftrag verknüpft (Auftragsnummer leer). Den unveränderten Originaltext gibt es daher weder in der Datenbank noch in der Admin-Oberfläche.
- **Admin-Klickpfad:** keiner. Die Admin-Oberfläche hat keine Ansicht für das Mail-Protokoll. Im Auftrag sieht man nur die gespeicherte Vorkalkulation, nicht die Mail.
- **War die Übersicht mit 16.281,28 € in der Mail? Nach dem Code ja, höchstwahrscheinlich.** Die Server-Funktion übergibt der Mail-Vorlage genau die gespeicherte Vorkalkulation. Für den CE-Wochenpreis (kein Fernverkehr) gibt die Vorlage alle Positionen aus, dazu „Netto 13.681,75 €“ und „USt / Brutto 2.599,53 € / 16.281,28 €“. Das beruht auf Code und Daten. Mit eigenen Augen sehen lässt sich der Originaltext nur beim Versanddienst.
- **Original einsehen:** im Resend-Konto, das die Absenderadresse info@kraftfahrer-mieten.com versendet, unter „Emails“ die Kennung oben suchen. Dort stehen Empfänger, Betreff, Zustellstatus und, solange noch gespeichert, der Inhalt. Wie lange Resend Mails aufbewahrt, hängt vom Tarif ab und ist oft nur wenige Tage. Ich konnte das nicht prüfen, weil mir der Zugang zum Resend-Konto fehlt. Bitte **heute** sichern, zum Beispiel als Screenshot oder PDF. Alternativ: die Kopie im Postfach des Kunden. Die Protokolle der Server-Funktion zu diesem Versand sind nicht mehr abrufbar.

## Ergänzender Vorschlag (nach Freigabe)
5. Künftig zu jeder Kundenmail die Auftragsnummer und eine unveränderliche Kopie des versandten Inhalts speichern. Im Admin beim Auftrag eine Ansicht „Versandte Mails“ ergänzen.
