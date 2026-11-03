# Eventauswahl – ausschließlich Vorschau

## Umsetzung
- `src/components/SimpleBookingForm.tsx` ergänzt die vier freigegebenen Optionen aus `src/lib/eventTaetigkeiten.ts` im vorhandenen Spezialfahrzeug-Auswahlfeld.
- Vier Hauptkategorien, bestehender Übertragungswert (`Baumaschinenführer / Mischmeister – Tätigkeit`), Tarifzuordnung und Kostenberechnung unverändert.
- Konkrete Tätigkeit wird im bestehenden Feld `fahrzeugtyp` gespeichert; Verwaltung und zukünftige verbindliche Fahrerangebote verwenden dieses Feld. Bestandsdaten/Snapshots unverändert.

## Bestätigungsentwürfe
`preview/event-booking/` enthält unveröffentlichte Kopien der beiden Anfragefunktionen und Kunden-/Adminvorlagen. Ergänzt sind nur `selectedActivity: fahrzeugtyp` und eine getrennte Tätigkeitszeile; Tarifname und bisherige Inhalte bleiben erhalten.

Entwürfe sind nicht mit echtem Versand verbunden und liegen außerhalb `supabase/functions/`, da dort Änderungen automatisch produktiv bereitgestellt werden. Produktive Originale bleiben unangetastet; Entwürfe registrieren keinen Serverhandler. Übernahme der beiden Übergaben und Vorlagenzeilen erst nach gesonderter Aktivierungsfreigabe. Ein IONOS-Upload allein aktiviert diese Entwürfe nicht.

## Prüfungen
- 27 Vitest-Tests: vier Tätigkeiten, 489,00 € netto, bestehende Tarife/Kosten und identische Frontend-/Serverzuordnung bestanden.
- 4 Deno-Datenflusstests: beide Entwurfshandler mit simulierten DB-/Mailzugriffen, gerenderte Kunden-/Adminbestätigung, identische Kostenvorschau und Fahrerangebot mit Tätigkeit/Tarif bestanden.
- Zwei Werktage: 978,00 € netto + 185,82 € USt. = 1.163,82 € brutto, für jede Option.
- Browser: vier Hauptkategorien, alle neuen Auswahlen und Kostenvorschau geprüft; lokal abgefangener Formularaufruf enthält exakte Tätigkeit und bestehenden Tarif. Keine echte Buchung/Mail oder Laufzeitfehler.
- Automatische Projektprüfung fehlerfrei.

## Bestandsschutz
Keine Änderungen an Startseiten-Wiederholungen, Preisübersichten, FAQ, Überschriften, Eventseitentext, URLs, SEO, Sitemap, strukturierten Daten, internen Links, Preisen, Verträgen, Zahlungsabläufen oder Bestandsdatensätzen. Keine Veröffentlichung, kein Upload oder Edge-Deployment.