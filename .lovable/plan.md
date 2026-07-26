## Ziel
Umsetzung der freigegebenen juristischen Optimierungen 1–7. Keine SEO-, Design-, Marketing- oder Modelländerungen. Nur Zustimmungsprotokollierung, Verlinkung, Versionierung und interne Wording-Anpassungen im Unternehmerbereich.

---

## 1. Vermittlungsbedingungen vor Registrierung einsehbar (Datei: `src/pages/FahrerRegistrierung.tsx`)

Die drei Zustimmungs-Checkboxen (Vermittlungszustimmung, Einsatzbereitschaft, Gewerbenachweis) erhalten einen sichtbaren Link auf die bestehende Seite `/fahrer-vermittlungsbedingungen` (öffnet in neuem Tab). Kein Textinhalt der Seite wird verändert.

- Alt: `Ich stimme den Vermittlungsbedingungen zu ...`
- Neu: `Ich stimme den` + Link (`/fahrer-vermittlungsbedingungen`, `target=_blank`) `Vermittlungsbedingungen` + `zu ...`

## 2. Registrierungs-Zustimmung revisionssicher speichern

**DB-Migration** – neue Spalten in `public.fahrer_profile`:
- `agb_version text` (z. B. `2026-07-26`)
- `agb_accepted_at timestamptz`
- `agb_ip inet`
- `agb_user_agent text`

**Edge Function `fahrerwerden`**: Beim Insert werden diese vier Werte gespeichert. IP aus Request-Header (`x-forwarded-for`), UA aus `user-agent`. Version aus neuer Konstante `TERMS_VERSION_DRIVER`.

**Frontend**: Übergibt `terms_version` mit dem FormData (aus zentraler Konstante `src/config/termsVersion.ts`).

## 3. Auftragsannahme vollständig dokumentieren

Bestehende Tabelle `public.job_driver_acceptances` (Spalten: `job_id, driver_id, billing_model, accepted_at, ip, user_agent, terms_version`) wird konsequent befüllt.

- **Edge Function `driver-accept-job`** (Token-Link-Flow): schreibt Eintrag mit IP/UA/`terms_version` bei jeder Annahme.
- **Edge Function `respond-invite`** (falls Annahmepfad): gleiches Verhalten.
- Kein neuer Vertragsinhalt, nur Persistierung der bereits vorhandenen Zustimmung.

## 4. DRV-kritische Begriffe (nur interner Unternehmerbereich + Unternehmer-E-Mails)

Betroffene Dateien (öffentliche Marketing-/SEO-Seiten wie `KraftfahrerMieten.tsx`, `FahrerFuerSpeditionen.tsx`, `Projekte.tsx`, `GermanyMap.tsx`, `HowItWorksTimeline.tsx`, `SimpleBookingForm.tsx`, `ProcessSteps.tsx`, `LkwFahrerKurzfristig.tsx` **bleiben unverändert**).

| Datei | Alt | Neu |
|---|---|---|
| `src/pages/FahrerRegistrierung.tsx` Z. 1256 | „Ich bestätige, dass ich grundsätzlich einsatzbereit bin ..." | „Ich bestätige, dass ich als selbstständiger Unternehmer an zukünftigen Auftragsangeboten interessiert bin und passende Angebote eigenverantwortlich prüfen möchte." |
| `src/pages/FahrerRegistrierung.tsx` Z. 228 (Fehlertext) | „grundsätzliche Einsatzbereitschaft" | „Interesse an Auftragsangeboten" |
| `supabase/functions/broadcast-job-to-drivers/_templates/job-notification.tsx` Z. 153 | „... werden Bewerbungen ... berücksichtigt. Bitte bewerben Sie sich ..." | „... werden Interessenbekundungen ... berücksichtigt. Bitte bekunden Sie Ihr Interesse nur, wenn ..." |
| `supabase/functions/send-driver-job-notification/index.ts` Z. 145 | dito | dito |
| `supabase/functions/send-test-job-invite/_templates/job-notification.tsx` Z. 153 | dito | dito |
| `src/components/JobAcceptanceDialog.tsx` Z. 161 | dito | dito |
| `supabase/functions/send-nurture-email/index.ts` Z. 74 | „Bevorzugte Disposition bei kurzfristigen Anfragen" | „Bevorzugte Vermittlungskoordination bei kurzfristigen Anfragen" |
| `supabase/functions/send-nurture-email/index.ts` Z. 126 (Subject) | „so optimieren Sie Ihre Einsatzplanung" | „so optimieren Sie Ihre Auftragsvermittlung" |
| `supabase/functions/handle-driver-job-response/index.ts` Z. 290–291 | „... an die Disposition weitergeleitet / Wir informieren die Disposition." | „... an die Vermittlungskoordination weitergeleitet / Wir informieren die Vermittlungskoordination." |

Nicht angefasst werden Fahrer-E-Mails, die den Begriff „Einsatzbereitschaft" ausschließlich zur Beschreibung der eigenen freien Entscheidung nutzen (`send-customer-assignment-notice`, `driver-inactive-notice`) — dort ist der Begriff bereits unternehmerkonform (Fahrer teilt Einsatzbereitschaft selbst mit).

## 5. Versionierung

Neue Datei `src/config/termsVersion.ts` und `supabase/functions/_shared/terms-version.ts` mit Konstante `TERMS_VERSION_DRIVER = '2026-07-26'`. Statisches `'v1'` wird ersetzt. Bei künftigen Änderungen der Vermittlungsbedingungen wird ausschließlich diese Konstante hochgezogen — akzeptierte Fassung bleibt in DB nachvollziehbar.

## 6. Keine Provisions-Offenlegung
Keine Änderung notwendig — aktueller Zustand entspricht bereits der Vorgabe. Kein Auftrags-Template listet interne Marge auf.

## 7. Geschäftsmodell
Bleibt unverändert. Keine Datei angefasst, die Ablauflogik/Preise/Provisionen betrifft.

---

## Technische Umsetzungsschritte

```
1. Migration: ALTER TABLE fahrer_profile ADD agb_version/accepted_at/ip/user_agent
2. src/config/termsVersion.ts + supabase/functions/_shared/terms-version.ts anlegen
3. FahrerRegistrierung.tsx: Link + Wording + terms_version im POST
4. fahrerwerden/index.ts: terms_version, IP, UA in fahrer_profile speichern
5. driver-accept-job/index.ts (+ respond-invite falls vorhanden): Eintrag in job_driver_acceptances
6. Wording-Ersetzungen laut Tabelle Punkt 4
7. Build & manuelle Verifikation (Registrierungsformular sichtbar, DB-Feldbefüllung)
```

Nach Umsetzung: vollständiger Änderungsbericht (Datei / Alt / Neu / Begründung / Auswirkung) folgt als Chatantwort.
