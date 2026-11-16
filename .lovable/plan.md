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
