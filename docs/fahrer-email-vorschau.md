# Fahrer-E-Mail-Überarbeitung – ausschließlich Vorschau

Die Vorschau ist unter `/admin/email-vorschau` ausschließlich im Entwicklungsbetrieb erreichbar. Keine echten Daten, Tokens, Versandaktionen oder Freigaben. Antwort-/Abmelde-/Vertragsaktionen sind absichtlich wirkungslos; bestehende produktive URLs bleiben unverändert.

## Tatsächliche Versandvorlagen (unverändert)
- Fahrerregistrierung: `fahrerwerden` verwendet `_shared/email-templates/driver-registration-confirmation.tsx` und `admin-driver-notification.tsx`.
- Manuelle Freischaltung: `approve-driver-and-send-jobs` verwendet die lokalen Vorlagen `driver-approval-email.tsx` und `admin-driver-approval-notification.tsx`; Auftragsangebote dort sind Inline-HTML mit Verfügbarkeitsantwort und separater endgültiger Bestätigung.
- Weitere Angebotswege: `broadcast-job-to-drivers` mit lokaler `job-notification.tsx`, `broadcast-job-invites` mit Inline-HTML, `send-driver-job-notification` mit Inline-HTML/Telefonantwort. Diese sind nicht ein identischer Antwortprozess. Die Vorschau unterscheidet deshalb Verfügbarkeitsprüfung, Broadcast-Annahme und Telefonantwort, ohne deren Rechtswirkung zu ändern.

## Vergütungsdaten – lesende Schema- und Codeprüfung
`job_assignments` enthält `rate_type`, `rate_value` und `commission_pct`, aber keine strukturierten vereinbarten Fahrtkosten oder vollständig bezifferten Mehrstunden/Zuschlagsbeträge. Ein Tages-/Stundensatz plus Zeitraum ist kein sicherer Gesamtauftragswert: Einsatzmengen dürfen nicht erfunden werden. `job_requests.tarif_*` und `kosten_uebersicht` gehören zur unverbindlichen Kunden-Vorkalkulation, nicht zu einer nachgewiesenen individuellen Fahrervereinbarung. Keine bestehenden Datensätze wurden hierfür gelesen oder verändert; nur Spaltenmetadaten.

Die aktuellen Angebotsvorlagen erhalten keine vollständigen individuellen Vergütungsdaten. Daher ist ein automatischer produktiver Gesamtbetrag aus dem bestehenden Stand nicht sicher ableitbar.

## Geänderte Entwürfe
Eine gemeinsame kompakte Darstellung für interne Registrierung, Fahrerregistrierung, Fahrerfreischaltung, internes Freischaltungsergebnis und Auftragsangebot; Kontakt-/Adress-/Unterlagenfelder einschließlich Anzahl und Ablehnungsgrund bleiben als Platzhalter sichtbar. Leere Zusatzabschnitte werden nicht als Tabellen erzeugt. Vertragslink, Abmeldelink und bestehende Antwortwege werden nur wirkungslos dargestellt. Die Freischaltungsbestätigung hat Varianten für vorhandene/fehlende passende Angebote. Die vorhandene interne Versandbehauptung bleibt als Entwurf erhalten; ihre tatsächliche Zustellungsprüfung ist nicht Gegenstand dieser Vorschau.

## Rechenregel (keine neuen Preise)
- Provisionsbasis = ausdrücklich vereinbarte Fahrleistung + bereits vereinbarte bezifferte Mehrstunden + bereits vereinbarte bezifferte Zuschläge.
- Provision = Basis × 20 % regulär bzw. 25 % bei ausdrücklich vereinbartem Sonderauftrag, auf Cent gerundet.
- Fahrer-Netto = Basis − Provision.
- Gesamte vorgesehene Fahrer-Nettovergütung = Fahrer-Netto + ausdrücklich vereinbarte An-/Abfahrtskosten (provisionsfrei).
- Fehlende Werte, ungültige Beträge, nicht bestätigte Vereinbarung oder fehlender Provisionssatz sperren den Angebotsentwurf. Explizite 0 € für nicht vereinbarte Mehrstunden/Zuschläge oder vereinbarte kostenfreie Fahrt bleiben erlaubt. Keine Nullersetzung fehlender Angaben, keine Hotelbudget-/Tarif-/Kilometerschätzung, keine Preisverhandlung.
- Tests verwenden klar künstliche Rechenwerte, keine neu festgelegten Vergütungssätze.

## Grenze
Die Sperre ist ausschließlich eine Vorschauprüfung, noch keine Sperre des produktiven Versands. Produktionsvorlagen und alle Serverfunktionen, Freischaltung, Berechtigungen, Bestandsdaten und Vertragsnachweise bleiben unverändert. Zur späteren tatsächlichen Integration fehlen eine freigegebene eindeutige Quelle der vereinbarten Mengen/Geldbeträge und die Freigabe für unmittelbar produktive Funktionsänderungen. Bis dahin keine Behauptung einer vollständigen produktiven Vergütungsaufstellung oder durchgängigen serverseitigen Versandblockade.