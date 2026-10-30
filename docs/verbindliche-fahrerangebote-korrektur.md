# Korrektur zukünftiger verbindlicher Fahrerangebote – 30.10.2026

## Umfang
- Fahrermail und persönliche Bestätigungsseite zeigen bei neuen Angeboten dieselben gespeicherten Auftragszeilen: Firma, Ansprechpartner, Kundenadresse getrennt vom Einsatzort, Anforderungen/Beschreibung, Zeitraum, Einsatztage, vorhandene Tarif-Einsatzzeit, Mehrstundenpreis, Unterkunft und interne Nettoaufstellung.
- Die gespeicherte serverseitige Kostenvorschau wird nur verwendet, wenn der vereinbarte Zuteilungssatz und Zeitraum genau passen. Keine zweite Kundentarifberechnung. Abweichende/fehlende Berechnungsgrundlagen bleiben ausdrücklich offen.
- 698,00 € Fahrleistung ergeben bei 20 % exakt 139,60 € Vermittlungsanteil und 558,40 € Fahrer-Nettovergütung. An-/Abfahrt wird nicht in die Provisionsbasis aufgenommen; ein nicht gespeicherter Fahrtkostenbetrag ist kein Nullbetrag. Unterkunftsbudget ist keine Kostenpauschale.
- Kundenformular und Kundenbestätigung unverändert; der private Angebotsbaustein wird dort nicht verwendet.

## Bestandsschutz
- Neue optionale Spalte `assignment_invites.offer_snapshot`, nach Einfügung unveränderlich; bestehende Rollen/Zugriffsregeln unverändert.
- Vorhandene verbindliche Einladungen erhalten v1-Kopien ihrer derzeitigen Darstellungsvorlagen, keine nachträglich behaupteten Versandzeitnachweise. Ihre Anzeige verwendet weiterhin exakt die alten Auftragszeilen.
- Neue Angebote speichern v2 mit vollständigen, einheitlichen Zeilen vor Versand. Seite, Annahmenachweis und PDF verwenden diese gespeicherte Darstellung, nicht später geänderte Stammdaten.
- Kein bestehender Auftrag oder Annahmenachweis wurde umgeschrieben. Erneuter Versand bestehender Einladungen wird übersprungen, nicht durch einen neuen Link ersetzt.
- Die am 30.10. um 10:24:46 UTC bereits gespeicherte Kessner-Annahme wurde nur lesend festgestellt. Ihr Hash blieb `2dfd33f0febf03f05d253527f5523271b7741b6ea6f2ef8ea2f1bd0c412a0742`. Der Auftrag und die Zuteilung behalten ihre Änderungszeitpunkte 09:57:31 UTC. Diese Annahme wurde nicht durch die isolierten Tests ausgelöst.

## Kontaktkorrektur
- Beide Verwaltungsdialoge laden Firma aus `company` und Ansprechpartner aus `customer_name`, ohne gegenseitige Ersatzwerte.
- Edge Function `admin-update-contact` und bestehender RPC `admin_update_job_contact` speichern diese Felder getrennt; keine automatische Bestandskorrektur.

## Prüfung / Bereitstellung
- 35 Deno-Prüfungen: Originalversand mit simulierten Speicher-/Mailabhängigkeiten, Fehler und fehlende Versand-ID, kein Versand bei vorhandenen Links/Annahmen, Snapshot-Speicherfehler verhindert Versand, v1/v2-Seiten, Centbeträge, Datums-/PDF-Regeln.
- 45 Vitest-Prüfungen: Firma/Ansprechpartner, bestehende Kundenkosten und Bestätigung, Vergütung und Vertragswortlaut.
- Persönliche Seite im Browser mit ausschließlich simulierten Antworten geprüft; keine Annahme ausgelöst.
- Drei Edge Functions bereitgestellt: `send-driver-confirmation`, `respond-invite`, `admin-update-contact`. Keine echten Buchungen oder Testmails. Kein IONOS-Upload und keine Website-Veröffentlichung.
- Verwaltungsdialogänderungen sind im Projekt/Vorschau vorhanden; die externe IONOS-Seite erhält sie erst nach separat freigegebenem Upload.
- 25 bestehende Supabase-Sicherheitshinweise wurden durch diese Änderungen nicht neu verursacht und nicht außerhalb des Auftrags bearbeitet.