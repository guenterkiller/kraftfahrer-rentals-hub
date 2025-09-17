# Admin-Audit: Auftragsannahme & Bestätigung - Bestandsaufnahme

**Datum:** 2025-09-17  
**Zweck:** Vollständige Analyse der bestehenden Systeme vor Implementierung der Auftragsannahme-Funktion

---

## A. UI/Buttons - Admin & Fahrer-Ansichten

### Admin-Bereich (`src/pages/Admin.tsx`)
**Route:** `/admin` (geschützt durch `AdminRoute`)

**Bestehende Buttons/Actions:**
1. **"Fahrer zuweisen"** - Zeile 942
   - Button: `onClick={() => handleAssignDriver(req.id)}`
   - Öffnet Dialog für Fahrer-Zuweisung zu Job
   - Status: ✅ VORHANDEN

2. **"Zuweisen & E-Mail senden"** - Zeile 1050
   - Button in Dialog: `onClick={assignDriverToJob}`
   - Sendet Assignment-E-Mail via `assign-driver-to-job` Edge Function
   - Status: ✅ VORHANDEN (ähnliche Funktionalität)

3. **"Fahrer freigeben"** - Zeile 528
   - Button: `onClick={() => handleApproveDriver(f.id)}`
   - Ruft `approve-driver-and-send-jobs` Edge Function auf
   - Status: ✅ VORHANDEN

4. **"Job an alle senden"** - Zeile 951  
   - Button: `onClick={() => handleSendJobToAll(req.id)}`
   - Broadcast via `broadcast-job-to-drivers` Edge Function
   - Status: ✅ VORHANDEN

**Status-Management:**
- Job-Status: `'open'`, `'assigned'` (Zeile 332)
- Fahrer-Status: `'pending'`, `'approved'`, `'rejected'`

### Fahrer-Admin (`src/pages/FahrerAdmin.tsx`) 
**Route:** `/fahrer-admin`

**Bestehende Actions:**
1. **"Freigeben"** - Zeile 438
2. **"Ablehnen"** - Zeile 444
3. **Dokument-Vorschau** - Zeile 408

### ❌ FEHLENDE FUNKTIONALITÄT:
- **Auftrag annehmen/ablehnen** (Fahrer-Sicht)
- **Auftragsbestätigung senden** (automatisch)
- **Status "Confirmed"** nach E-Mail-Versand

---

## B. Mail-/PDF-System

### Bestehende Edge Functions (alle in `supabase/functions/`)

1. **`assign-driver-to-job`** ✅
   - **Zweck:** E-Mail an Fahrer bei Job-Zuweisung
   - **Template:** Inline HTML mit Rechtsbedingungen (Zeile 81-86)
   - **Empfänger:** Fahrer
   - **BCC:** Admin (info@kraftfahrer-mieten.com)

2. **`send-fahrer-anfrage-email`** ✅
   - **Zweck:** Bestätigung nach Fahreranfrage
   - **Empfänger:** Admin + Kunde

3. **`broadcast-job-to-drivers`** ✅
   - **Zweck:** Job-Alert an alle Fahrer
   - **Rate Limiting:** 10 E-Mails/Sekunde

4. **`approve-driver-and-send-jobs`** ✅
   - **Zweck:** Fahrer-Freigabe + Job-Benachrichtigung

5. **`handle-driver-response`** ✅
   - **Zweck:** Verarbeitung Fahrer-Antworten auf Job-Alerts

6. **`send-contact-email`** ✅
7. **`send-job-alert-emails`** ✅

### Mail-Konfiguration
- **Service:** Resend API
- **Absender:** `info@kraftfahrer-mieten.com` (teilweise noch `noreply@resend.dev`)
- **Secrets:** `RESEND_API_KEY`, `MAIL_FROM`, `ADMIN_TO`

### ❌ FEHLENDE PDF-GENERIERUNG:
- Keine PDF-Bibliothek vorhanden
- Nur HTML-E-Mails, keine Anhänge

---

## C. Datenbank (Supabase)

### Bestehende Tabellen

1. **`job_requests`** ✅
   - Spalten: `id`, `customer_name`, `customer_email`, `einsatzort`, `zeitraum`, `status`, etc.
   - Status: `'open'`, `'assigned'` (erweitern um `'accepted'`, `'confirmed'`)

2. **`fahrer_profile`** ✅
   - Fahrer-Stammdaten mit Status

3. **`job_mail_log`** ✅ (seit Migration 2025-09-13)
   - Spalten: `job_request_id`, `fahrer_id`, `email`, `status`, `subject`, `mail_template`
   - Für E-Mail-Protokollierung

4. **`jobalarm_antworten`** ✅
   - Fahrer-Antworten auf Job-Alerts

5. **`admin_log`** ✅
   - Admin-Aktionen

### ❌ FEHLENDE TABELLEN:
- **`job_assignments`** (Job-Fahrer-Zuordnung mit Details)
- **PDF-Storage** (Bestätigungs-PDFs)

### Bestehende RLS-Policies
- Admin-Only Access für sensible Daten
- Public Insert für Formulare

---

## D. Routing & Auth

### Routen (aus `src/App.tsx`)
- `/admin` - Geschützt durch `AdminRoute`
- `/admin/login` - Öffentlich
- `/fahrer-admin` - Ungeschützt (❗)
- `/fahrer-registrierung` - Öffentlich

### Auth-System
- **LocalStorage-basiert** (nicht Supabase Auth)
- Admin-Email hardcoded: `guenter.killer@t-online.de`
- Session-Timeout: 7 Tage
- Auto-Logout bei Inaktivität (60 Min)

### ❌ FEHLENDE FAHRER-AUTH:
- Keine Fahrer-spezifische Anmeldung
- Keine Token für Job-Annahme/Ablehnung

---

## E. No-Touch-Zonen

### ⚠️ NICHT VERÄNDERN:
1. **Bestehende Edge Functions** (außer Erweiterung)
2. **Mail-Absender-Konfiguration** (IONOS/Resend/DKIM)
3. **Formulare & Validierungen** (`FahreranfrageSection.tsx`)
4. **Admin-Auth-System** (`AdminRoute.tsx`)
5. **RLS-Policies** (nur erweitern)

---

## Empfehlung für minimal-invasive Umsetzung

### ✅ Wiederverwenden:
1. **Bestehende Mail-Infrastruktur** (Resend + Templates)
2. **`job_mail_log` Tabelle** für E-Mail-Archivierung
3. **Admin-UI Pattern** aus `Admin.tsx`
4. **Button-Komponenten** mit bestehenden Variants

### 🔧 Minimal erweitern:
1. **Job-Status** um `'accepted'`, `'confirmed'` erweitern
2. **Neue Edge Function:** `send-order-confirmation`
3. **Neue Route:** `/job/{jobId}/response?token={token}` für Fahrer-Antworten
4. **PDF-Library** hinzufügen (jsPDF oder Puppeteer)
5. **Storage Bucket** für Bestätigungs-PDFs

### 🏗️ Neu erstellen:
1. **Fahrer-Annahme-UI** (einfache Ja/Nein-Buttons)
2. **PDF-Template** für Auftragsbestätigung
3. **E-Mail-Template** mit Rechtsbedingungen
4. **Feature-Flag** `ORDER_CONFIRMATION_ENABLED`

---

## Nächste Schritte

1. **User-Freigabe** für dieses Audit abwarten
2. **PDF-Library** evaluieren und hinzufügen
3. **DB-Migration** für erweiterte Status-Werte
4. **Edge Function** `send-order-confirmation` entwickeln
5. **Fahrer-Response-Route** implementieren

**Geschätzter Aufwand:** 2-3 Tage Entwicklung + Testing
**Risiko:** Minimal, da bestehende Flows unberührt bleiben