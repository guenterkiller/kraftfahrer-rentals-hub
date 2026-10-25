# Änderungsplan: neue Übernachtungsregelung (Hotelbudget 0–75 € netto)

## Geprüfte Stellen (heutiger Stand)
- **Anfrageformular**: Unterkunftsauswahl mit drei Optionen (vom Auftraggeber gestellt / vom Fahrer organisiert mit „Kostenobergrenze je Nacht“ / keine Übernachtung). Die Obergrenze muss heute größer als 0 € sein, nach oben gibt es keine Grenze. Gilt für die Tarife LKW-Fahrer CE, Wochenpreis und Baumaschinenführer/Mischmeister.
- **Vorkalkulation**: Unterkunftskosten werden nicht eingerechnet, sondern als offene Position genannt („bis zur vereinbarten Kostenobergrenze …“).
- **Server-Prüfung beim Absenden**: lehnt 0 € und ungültige Werte ab, eine Obergrenze nach oben fehlt.
- **Bestätigungs-E-Mail an den Kunden**: zeigt die gewählte Option, die Obergrenze und die offene Position.
- **Verwaltung**: zeigt die Option und die Obergrenze an.
- **Fahrerzuweisung**: Eine automatische Bewertung nach Entfernung gibt es nicht; die Zuweisung erfolgt manuell durch Sie.
- **Datenbank**: Für das Feld der Obergrenze gibt es keine Beschränkung. Es ist **keine Datenbankänderung nötig**.

## Geplante Änderungen
1. **Feld „Hotelbudget je erforderlicher Übernachtung (€ netto)“**: zulässig von 0,00 bis 75,00 €, mit höchstens zwei Nachkommastellen. Werte über 75 € oder negative Werte werden im Formular **und** auf dem Server abgelehnt. Die gemeinsame Prüfregel bleibt, damit beide Seiten dasselbe zulassen. Der Hinweis unter dem Feld lautet dann: „0 € bedeutet, dass Sie keine Hotelkosten übernehmen.“
2. **Neuer Grundsatztext** an derselben Stelle im Formular, wortgleich in der Kunden-E-Mail:
   > Übernachtungskosten entstehen nur, wenn kein geeigneter und verfügbarer Fahrer aus unmittelbarer Nähe des Einsatzortes vermittelt werden kann und deshalb ein auswärtiger Fahrer mit erforderlicher Übernachtung eingesetzt wird. Ortsnahe Fahrer haben bei gleicher Eignung Vorrang. Bei einem ortsnahen Fahrer werden keine Hotelkosten berechnet. Bei einem auswärtigen Fahrer werden nur die tatsächlich erforderlichen und vereinbarten Übernachtungskosten bis zu Ihrem Hotelbudget (höchstens 75,00 € netto je Übernachtung) berechnet und vor verbindlicher Beauftragung mit Ihnen abgestimmt. Die Angabe eines Hotelbudgets bedeutet nicht, dass automatisch Übernachtungskosten entstehen.
3. **Vorkalkulation und E-Mail**: Die offene Position nennt das Budget. Bei 0 € steht dort „Keine Hotelkosten – Sie übernehmen keine Übernachtungskosten.“ Ein Betrag wird weiterhin nicht eingerechnet.
4. **Verwaltung / Fahrerzuweisung**: Bei der Anfrage erscheint ein Hinweis: „Ortsnahe Fahrer bei gleicher Eignung bevorzugen; Hotelkosten nur bei auswärtigem Fahrer, bis Budget X €, vorher mit dem Kunden abstimmen. Bei 0 € keine Hotelkosten.“ Die Zuweisung selbst bleibt unverändert.
5. **Unverändert bleiben**: die Fernfahrer-Pauschale (Übernachtung im Führerhaus), Tagessätze, Fahrtkosten (25 km frei, dann 0,40 €/km), Zuschläge, Stornoregeln, der Versand und die Auftragsannahme. Bestehende Anfragen behalten ihre gespeicherten Werte.

## Offene Entscheidung
- Die Option **„Unterkunft wird vom Auftraggeber gestellt“** und die Option **„Keine Übernachtung erforderlich“**: beibehalten (Vorschlag) oder durch das eine Hotelbudget-Feld ersetzen?

## Technische Details
- Module `kostenUebersicht` (Frontend und Serverfunktion, gleicher Inhalt per Test geprüft): Texte, `parseUnterkunftObergrenze` (0 bis 75 zulassen), Fehlermeldung, `offenePositionen`.
- `submit-fahrer-anfrage`: Fehlermeldung und Detailtext an die neue Spanne anpassen. Später nur nach Ihrer Freigabe einspielen.
- E-Mail-Vorlage `customer-booking-confirmation`, `Admin.tsx` (Hinweis), Gedächtnisnotiz zu Übernachtungskosten.
- Tests: 0 und 75 werden angenommen, 75,01 und −1 abgelehnt, Text der offenen Position bei 0 €. Frontend und Server liefern dasselbe Ergebnis.
- Es werden keine E-Mails versendet und nichts veröffentlicht.
