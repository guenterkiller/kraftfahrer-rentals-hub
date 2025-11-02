# Handle-Driver-Job-Response - Test & Verification Guide

## ✅ Checkliste: Buttons funktionieren wirklich

- [ ] Absolute HTTPS-Links in der Mail (`https://kraftfahrer-mieten.com/functions/v1/handle-driver-job-response?...`)
- [ ] Query-Parameter bleiben intakt (Tracking für diese Links abschalten)
- [ ] Token gültig (`token_expires_at` in der Zukunft)
- [ ] Edge Function deployed und mit Service Role Key konfiguriert
- [ ] Friendly page erscheint bei Klick (kein 404/403)
- [ ] Admin-Mail in `email_log` sichtbar
- [ ] **Keine** Änderungen an `job_assignments` oder `job_requests`

---

## 🧪 Quick Tests

### 1. Test-Invite erstellen (SQL)

```sql
-- Ersetze :job_id und :driver_id durch echte IDs aus deiner DB
INSERT INTO assignment_invites (job_id, driver_id, token, token_expires_at, status)
VALUES (
  :job_id,  -- z.B. '123e4567-e89b-12d3-a456-426614174000'
  :driver_id,  -- z.B. '987fcdeb-51a2-43f7-8901-234567890abc'
  encode(gen_random_bytes(24), 'hex'),  -- Generiert 48-Zeichen Token
  now() + interval '48 hours',
  'pending'
)
RETURNING token, job_id, driver_id;
```

**Beispiel mit echten Werten:**
```sql
-- Test mit ersten verfügbaren Job und Fahrer
WITH first_job AS (
  SELECT id FROM job_requests WHERE status = 'open' LIMIT 1
),
first_driver AS (
  SELECT id FROM fahrer_profile WHERE status = 'approved' LIMIT 1
)
INSERT INTO assignment_invites (job_id, driver_id, token, token_expires_at, status)
SELECT 
  first_job.id,
  first_driver.id,
  encode(gen_random_bytes(24), 'hex'),
  now() + interval '48 hours',
  'pending'
FROM first_job, first_driver
RETURNING token, job_id, driver_id;
```

### 2. Manueller Link-Test (curl)

```bash
# Ersetze <TOKEN> mit dem Token aus obigem SQL
# Format 1: Normale Parameter (bevorzugt)
curl -i "https://kraftfahrer-mieten.com/functions/v1/handle-driver-job-response?a=accept&t=<TOKEN>"

# Format 2: Kompakt-Payload (Fallback bei Tracking-Problemen)
# Erstelle Base64: {"a":"accept","t":"<TOKEN>"}
echo -n '{"a":"accept","t":"<TOKEN>"}' | base64
curl -i "https://kraftfahrer-mieten.com/functions/v1/handle-driver-job-response?p=<BASE64_STRING>"
```

**Erwartetes Ergebnis:**
- HTTP 200 OK
- HTML-Seite mit "Rückmeldung erfasst"
- Freundliche Bestätigungsmeldung

### 3. Logging verifizieren (SQL)

```sql
-- Admin-Mail angekommen?
SELECT 
  created_at,
  recipient as to_email,
  subject,
  template,
  status,
  message_id,
  meta
FROM email_log
WHERE template = 'driver-response'
ORDER BY created_at DESC
LIMIT 10;

-- Fahrerantworten protokolliert?
SELECT 
  created_at,
  job_id,
  fahrer_email,
  antwort as action,
  ip,
  user_agent
FROM jobalarm_antworten
ORDER BY created_at DESC
LIMIT 20;
```

### 4. Invite-Status prüfen

```sql
-- Alle Invites für einen Job anzeigen
SELECT 
  ai.id,
  ai.status,
  ai.token,
  ai.token_expires_at,
  ai.responded_at,
  ai.created_at,
  fp.vorname,
  fp.nachname,
  fp.email,
  jr.customer_name,
  jr.einsatzort
FROM assignment_invites ai
LEFT JOIN fahrer_profile fp ON ai.driver_id = fp.id
LEFT JOIN job_requests jr ON ai.job_id = jr.id
WHERE ai.job_id = :job_id  -- Ersetze mit echter Job-ID
ORDER BY ai.created_at DESC;
```

---

## 🔍 Diagnose: "Wenn trotzdem nix kommt"

### A. Function überhaupt getroffen?

**Supabase Dashboard:**
1. Gehe zu: Functions → `handle-driver-job-response` → Logs
2. Ein Klick auf den Link sollte einen Log-Eintrag erzeugen
3. Suche nach: `📩 Driver response: action=...`

### B. Token findet keinen Invite?

```sql
-- Token-Lookup testen
SELECT * 
FROM assignment_invites 
WHERE token = '<TOKEN>';  -- Ersetze mit echtem Token
```

**Mögliche Probleme:**
- Kein Datensatz → Falscher Token oder wurde nie erstellt
- `token_expires_at` in Vergangenheit → Link abgelaufen
- `status != 'pending'` → Bereits beantwortet

### C. Mailer strippt Parameter?

**Manuelle Prüfung:**
1. Im Posteingang die E-Mail öffnen
2. Rechtsklick auf "Auftrag annehmen" Button
3. "Link-Adresse kopieren"
4. In Texteditor einfügen
5. Prüfen ob `?a=accept&t=...` noch komplett vorhanden ist

**Wenn Parameter fehlen:**
- Aktiviere den `p=` Fallback (Base64-Payload)
- Oder deaktiviere Link-Tracking im Mail-Provider

---

## 🎯 Kompletter E2E-Test

### Schritt 1: Test-Invite erstellen

```sql
-- Test-Job und Test-Fahrer IDs ermitteln
SELECT 
  'Job: ' || jr.id || ' (' || jr.customer_name || ')' as job_info,
  'Driver: ' || fp.id || ' (' || fp.vorname || ' ' || fp.nachname || ')' as driver_info
FROM job_requests jr
CROSS JOIN fahrer_profile fp
WHERE jr.status = 'open'
  AND fp.status = 'approved'
LIMIT 1;

-- Mit den IDs von oben:
INSERT INTO assignment_invites (job_id, driver_id, token, token_expires_at, status)
VALUES (
  '<JOB_ID>',
  '<DRIVER_ID>',
  encode(gen_random_bytes(24), 'hex'),
  now() + interval '48 hours',
  'pending'
)
RETURNING 
  token,
  'Accept: https://kraftfahrer-mieten.com/functions/v1/handle-driver-job-response?a=accept&t=' || token as accept_url,
  'Decline: https://kraftfahrer-mieten.com/functions/v1/handle-driver-job-response?a=decline&t=' || token as decline_url;
```

### Schritt 2: Link im Browser testen

1. Kopiere `accept_url` aus obigem Result
2. Öffne in privatem/inkognito Browser-Fenster
3. Erwartung: Grüne Bestätigungsseite "Rückmeldung erfasst"

### Schritt 3: Logging verifizieren

```sql
-- Wurde die Admin-Mail geloggt?
SELECT * FROM email_log 
WHERE template = 'driver-response' 
ORDER BY created_at DESC 
LIMIT 1;

-- Wurde die Antwort gespeichert?
SELECT * FROM jobalarm_antworten 
ORDER BY created_at DESC 
LIMIT 1;
```

### Schritt 4: WICHTIG - Keine DB-Änderungen!

```sql
-- Prüfe dass KEINE Assignment erstellt wurde
SELECT COUNT(*) as should_be_zero
FROM job_assignments
WHERE job_id = '<JOB_ID>' 
  AND driver_id = '<DRIVER_ID>'
  AND created_at > now() - interval '5 minutes';

-- Prüfe dass Job-Status NICHT geändert wurde
SELECT status, updated_at
FROM job_requests
WHERE id = '<JOB_ID>';
```

**Erwartung:** 
- `should_be_zero` = 0
- Job-Status unverändert (z.B. weiterhin 'open')

---

## 🚀 Production-Ready Schnelltest (alle freigegebenen Fahrer)

Erzeugt für alle approved Fahrer eines offenen Jobs Tokens + sofort klickfertige URLs:

```sql
-- 1) Einen offenen Job wählen (oder WHERE id = '…' setzen)
WITH job AS (
  SELECT id FROM job_requests
  WHERE status = 'open'
  ORDER BY created_at DESC
  LIMIT 1
),
drivers AS (
  SELECT id, vorname, nachname, email
  FROM fahrer_profile
  WHERE status = 'approved'
)

-- 2) Einladungen erzeugen (48h gültig)
INSERT INTO assignment_invites (job_id, driver_id, token, token_expires_at, status)
SELECT job.id, d.id, encode(gen_random_bytes(24), 'hex'), now() + interval '48 hours', 'pending'
FROM job, drivers d
ON CONFLICT DO NOTHING
RETURNING job_id, driver_id, token;

-- 3) Klick-URLs ausgeben (Akzeptieren & Ablehnen)
WITH inv AS (
  SELECT ai.job_id, ai.driver_id, ai.token, 
         d.vorname || ' ' || d.nachname as name, 
         d.email
  FROM assignment_invites ai
  JOIN fahrer_profile d ON d.id = ai.driver_id
  WHERE ai.token_expires_at > now()
    AND ai.status = 'pending'
    AND ai.job_id = (SELECT id FROM job_requests WHERE status = 'open' ORDER BY created_at DESC LIMIT 1)
)
SELECT
  name AS fahrer,
  email AS adresse,
  'https://kraftfahrer-mieten.com/functions/v1/handle-driver-job-response?a=accept&t=' || token AS accept_url,
  'https://kraftfahrer-mieten.com/functions/v1/handle-driver-job-response?a=decline&t=' || token AS decline_url
FROM inv
ORDER BY fahrer;
```

**Erwartung:** 
- Accept-URL aufrufen → grüne Bestätigungsseite
- Admin-Mail in `email_log`
- Eintrag in `jobalarm_antworten`
- KEINE Änderungen an `job_assignments`/`job_requests`

---

## 📧 Test mit echter E-Mail

```sql
-- Generiere Test-Link für echten Fahrer
WITH test_invite AS (
  INSERT INTO assignment_invites (job_id, driver_id, token, token_expires_at, status)
  SELECT 
    jr.id,
    fp.id,
    encode(gen_random_bytes(24), 'hex'),
    now() + interval '48 hours',
    'pending'
  FROM job_requests jr
  CROSS JOIN fahrer_profile fp
  WHERE jr.status = 'open'
    AND fp.status = 'approved'
    AND fp.email IS NOT NULL
  LIMIT 1
  RETURNING token, job_id, driver_id
)
SELECT 
  'https://kraftfahrer-mieten.com/functions/v1/handle-driver-job-response?a=accept&t=' || token as accept_link,
  'https://kraftfahrer-mieten.com/functions/v1/handle-driver-job-response?a=decline&t=' || token as decline_link
FROM test_invite;
```

Verwende diese Links in einer Test-E-Mail an dich selbst.

---

## 🛠️ Troubleshooting-Szenarien

### Szenario 1: "404 Not Found"
**Problem:** Function nicht deployed oder falsche URL
**Lösung:**
```bash
# Prüfe Supabase Functions Status
# Dashboard → Functions → handle-driver-job-response
# URL sollte sein: https://<PROJECT_ID>.supabase.co/functions/v1/handle-driver-job-response
```

### Szenario 2: "Einladung nicht gefunden"
**Problem:** Token stimmt nicht oder Invite existiert nicht
**Lösung:**
```sql
-- Alle pending invites anzeigen
SELECT 
  id, 
  job_id, 
  driver_id, 
  token, 
  token_expires_at,
  CASE 
    WHEN token_expires_at < now() THEN 'EXPIRED'
    ELSE 'VALID'
  END as validity
FROM assignment_invites
WHERE status = 'pending'
ORDER BY created_at DESC;
```

### Szenario 3: "Link abgelaufen"
**Problem:** `token_expires_at` in der Vergangenheit
**Lösung:**
```sql
-- Extend expiry für Test
UPDATE assignment_invites
SET token_expires_at = now() + interval '48 hours'
WHERE token = '<TOKEN>';
```

### Szenario 4: "Keine Admin-Mail erhalten"
**Problem:** Resend API Key fehlt oder falsch
**Lösung:**
```sql
-- Prüfe email_log auf Fehler
SELECT status, error_message, created_at
FROM email_log
WHERE template = 'driver-response'
ORDER BY created_at DESC
LIMIT 5;
```

---

## 📊 Performance & Statistik

```sql
-- Antwortrate pro Job
SELECT 
  jr.id as job_id,
  jr.customer_name,
  jr.einsatzort,
  COUNT(DISTINCT ai.id) as invites_sent,
  COUNT(DISTINCT CASE WHEN ja.antwort = 'accept' THEN ai.id END) as accepted,
  COUNT(DISTINCT CASE WHEN ja.antwort = 'decline' THEN ai.id END) as declined,
  COUNT(DISTINCT CASE WHEN ai.status = 'pending' AND ai.token_expires_at > now() THEN ai.id END) as pending
FROM job_requests jr
LEFT JOIN assignment_invites ai ON jr.id = ai.job_id
LEFT JOIN jobalarm_antworten ja ON ai.job_id = ja.job_id
WHERE jr.created_at > now() - interval '30 days'
GROUP BY jr.id, jr.customer_name, jr.einsatzort
ORDER BY jr.created_at DESC;
```

---

## 🔐 Sicherheits-Check

```sql
-- Prüfe dass keine doppelten Antworten möglich sind
SELECT 
  token,
  COUNT(*) as response_count,
  string_agg(antwort, ', ') as responses
FROM jobalarm_antworten
GROUP BY token
HAVING COUNT(*) > 1;
-- Sollte LEER sein
```

---

## 🔒 Optional: One-Shot-Schutz (Doppel-Klick verhindern)

Falls du doppelte Admin-Mails verhindern willst:

```sql
-- Einmalige Antwort je Invite erzwingen:
ALTER TABLE assignment_invites 
ADD COLUMN IF NOT EXISTS responded_at TIMESTAMPTZ;
```

In der Function vor dem Email-Insert prüfen:
```typescript
// Prüfe ob bereits beantwortet
if (invite.responded_at) {
  return page("Bereits beantwortet", "Du hast auf diese Einladung bereits geantwortet.");
}

// ... Email senden & Logs schreiben ...

// Als beantwortet markieren
await supabase
  .from("assignment_invites")
  .update({ responded_at: new Date().toISOString() })
  .eq("id", invite.id);
```

---

## 🎯 Go-Live-Checkliste

- [ ] Function deployed: `handle-driver-job-response` mit Service Role Key
- [ ] Buttons verlinkt: `?a=accept&t=<token>` (oder Fallback `?p=<base64>`)
- [ ] Mail-Tracking AUS für genau diese beiden Link-URLs
- [ ] Logging aktiv: `email_log` + `jobalarm_antworten` befüllen sich
- [ ] Schnelltest durchgeführt (Production-Ready Test oben)
- [ ] Verifizierung: Admin-Mail erhalten, Logs sichtbar, KEINE DB-Änderungen

---

**Datum:** 2025-01-19  
**Version:** 2.1 (Production-Ready mit Schnelltests und One-Shot-Option)
