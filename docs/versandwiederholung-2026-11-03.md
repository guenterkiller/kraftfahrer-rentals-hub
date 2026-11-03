# Korrektur der Versandwiederholung – 03.11.2026

## Ursachen
- Fahrerangebote: Ein vor Versand gespeicherter Annahmelink bewirkte beim nächsten Aufruf `skipped:true`, auch nach Versandfehler. Drei Verwaltungsaktionen behandelten HTTP 200 unabhängig von `skipped` als Versandbestätigung.
- Vertragsmails: Die Freischaltung setzte den Fahrer vor dem Versand auf `approved`; danach war „Genehmigen“ nicht mehr erreichbar. Die bereits vorhandene Wiederhollogik wurde somit nicht erneut aufgerufen.

## Korrektur
- `supabase/functions/send-driver-confirmation/index.ts`: gültigen unbeantworteten Link und unveränderliche Angebotskopie bei fehlgeschlagenem Versand wiederverwenden; erfolgreich versandte/beantwortete Angebote überspringen, abgelaufene Links nicht ersetzen. SDK-Fehler, fehlende Versand-ID und Ausnahmen werden als Fehler protokolliert; Protokollfehler deutlich melden. Eindeutiger Wiederholschlüssel beim E-Mail-Dienst.
- `supabase/functions/approve-driver-and-send-jobs/index.ts`: expliziter `retry_contract_email`-Aufruf in derselben Funktion. Kein Statusupdate, keine neue Einladung, keine Fahrerangebote, keine Administrator-E-Mail im Wiederholmodus. Annahme/Ablehnung und abgelaufene/fehlende Links verhindern Versand. Prüf- und Protokollfehler nicht ignorieren.
- `src/components/admin/DriverContractStatus.tsx`: Wiederholaktion bei vorhandenem gültigem Link für bereits freigeschaltete, nicht gesperrte/deaktivierte Fahrer; konkrete Fehler-/Erfolgsmeldung.
- `src/pages/Admin.tsx` und `src/lib/adminMailResult.ts`: alle drei Angebotsaktionen unterscheiden bestätigten Versand von übersprungenem Versand; Serverfehler verständlich ausgeben. Falschen Hinweis auf erneute Freischaltung ersetzt.

## Prüfungen
- 41 Deno-Tests der beiden Versandfunktionen bestanden, einschließlich 21 isolierter tatsächlicher Handler-Szenarien. SDK und Datenzugriffe ersetzt; keine echten Mails oder Datenänderungen.
- 5 Vitest-Prüfungen der Verwaltungsauswertung bestanden.
- Isolierte Browserprüfung des tatsächlichen Vertragsstatus-Bereichs: Fehlermeldung, danach erreichbare Wiederholung und Erfolg nur mit simulierter Versandbestätigung; genau zwei mail-only-Aufrufe, keine Laufzeitfehler.
- Automatische Projektprüfung: build OK.
- Authentifizierter produktiver End-to-End-Versand nicht durchgeführt: externe Supabase, keine verfügbare Administrator-Sitzung; echte Testmails ausdrücklich ausgeschlossen.

## Veröffentlichung
Die zwei Serverfunktionen werden gezielt bereitgestellt; Verwaltungsänderungen sind in der Vorschau vorhanden, auf IONOS erst nach gesondertem Upload. Kein Upload/keine Veröffentlichung ausgeführt. Kein bestehender Auftrag, Link oder Nachweis verändert.