# Database Deduplication Audit Report

**Datum:** 2025-09-17  
**Ziel:** Identifikation und sichere Konsolidierung von Dubletten-Tabellen  
**Status:** Phase 1 - Audit (Read-Only)

---

## Executive Summary

**Gefundene Dubletten-Familien:**
1. **Admin-Konfiguration:** `admin_settings` (aktiv) ↔ `admin_config` (nicht existent)
2. **Admin-Logging:** `admin_log` (legacy) ↔ `admin_actions` (moderne Struktur) 
3. **E-Mail-Logging:** `email_log` (neu) ↔ `mail_log` (legacy) ↔ `job_mail_log` (spezialisiert)
4. **Jobalarm-System:** `jobalarm_fahrer` + `jobalarm_antworten` (wenig genutzt)

---

## Detailauswertung

### 1. Admin-Familie

#### admin_settings ✅ AKTIV
- **Code-Referenzen:** 2 Edge Functions (`send-driver-confirmation`, `is_admin_user()`)
- **DB-Status:** 1 Zeile, RLS aktiviert, 435 reads
- **Zweck:** Single-Row Konfiguration für Admin-E-Mail
- **Policies:** Admin-only Select/Insert/Update/Delete
- **Empfehlung:** ✅ **BEHALTEN** (kanonische Tabelle)

#### admin_config ❌ NICHT EXISTENT
- **Status:** Tabelle existiert nicht in der DB
- **Code-Referenzen:** Keine
- **Empfehlung:** ❌ **IGNORIEREN** (Phantomtabelle)

#### admin_log 🔄 LEGACY
- **Code-Referenzen:** 1 Core-Datei (`src/pages/Admin.tsx`)
- **DB-Status:** 0 Zeilen, 828 reads (meist leer)
- **Zweck:** Allgemeine Admin-Aktivitäten (timestamp, event, email, ip)
- **Policies:** Admin-only Select, System Insert
- **Empfehlung:** 🔄 **VIEW AUF admin_actions** (kompatibel halten)

#### admin_actions ✅ MODERNE STRUKTUR
- **Code-Referenzen:** 2 Core-Dateien (`AdminAssignmentDialog.tsx`, `Admin.tsx`)
- **DB-Status:** 0 Zeilen, wenig genutzt aber strukturierter
- **Zweck:** Job-spezifische Admin-Aktionen (assignment_id, job_id, action)
- **Policies:** Admin-only Select/Insert
- **Empfehlung:** ✅ **BEHALTEN** (kanonische Tabelle)

### 2. E-Mail-Logging Familie

#### email_log ✅ MODERNE STRUKTUR
- **Code-Referenzen:** 2 neue Edge Functions (`send-driver-confirmation`, `send-order-confirmation`)
- **DB-Status:** 0 Zeilen, strukturiert mit assignment_id + job_id
- **Zweck:** Moderne E-Mail-Archivierung mit Job-Kontext
- **Policies:** Admin-only Select, System Insert
- **Empfehlung:** ✅ **BEHALTEN** (kanonische Tabelle)

#### mail_log 🔄 LEGACY
- **Code-Referenzen:** 1 Edge Function (`approve-driver-and-send-jobs`)
- **DB-Status:** 4 Zeilen, einfache Struktur (recipient, template, success)
- **Zweck:** Basis-E-Mail-Logging ohne Job-Kontext
- **Policies:** Admin-only Select, System Insert
- **Empfehlung:** 🔄 **VIEW AUF email_log** (Daten migrieren)

#### job_mail_log 🔄 SPEZIALISIERT
- **Code-Referenzen:** 2 Edge Functions (`broadcast-job-to-drivers`, `log_job_mail()`)
- **DB-Status:** 9 Zeilen, sehr detailliert (driver_snapshot, meta, reply_to)
- **Zweck:** Job-spezifische E-Mail-Archivierung mit Fahrer-Kontext
- **Policies:** Admin-only Select, keine Insert-Policy (!)
- **Empfehlung:** 🔄 **DATEN NACH email_log MIGRIEREN** + View

### 3. Jobalarm-Familie

#### jobalarm_fahrer 🟡 WENIG GENUTZT
- **Code-Referenzen:** 2 Dateien (`JobAlertSection.tsx`, `send-job-alert-emails`)
- **DB-Status:** 1 Zeile, 46 reads (wenig Aktivität)
- **Zweck:** Job-Alert Subscriptions
- **Policies:** Public Insert, Admin/User Select/Delete
- **Empfehlung:** 🟡 **FEATURE-FLAG EVALUIEREN** (ggf. deaktivieren)

#### jobalarm_antworten 🟡 WENIG GENUTZT
- **Code-Referenzen:** 1 Edge Function (`handle-driver-response`)
- **DB-Status:** 0 Zeilen, 0 reads (ungenutzt)
- **Zweck:** Fahrer-Antworten auf Job-Alerts
- **Policies:** Admin Select, Public Insert
- **Empfehlung:** 🟡 **FEATURE-FLAG EVALUIEREN** (ggf. deaktivieren)

---

## Code-Referenz Matrix

| Tabelle | Frontend | Edge Functions | DB Functions | Status |
|---------|----------|---------------|--------------|--------|
| `admin_settings` | - | 2 (aktiv) | 1 (is_admin_user) | ✅ AKTIV |
| `admin_log` | 1 (Admin.tsx) | - | 1 (log_driver_profile_access) | 🔄 LEGACY |
| `admin_actions` | 2 (Admin, Dialog) | - | - | ✅ AKTIV |
| `email_log` | - | 2 (neue) | - | ✅ AKTIV |
| `mail_log` | - | 1 (legacy) | 1 (log_job_mail) | 🔄 LEGACY |
| `job_mail_log` | - | 1 (broadcast) | 1 (log_job_mail) | 🔄 SPEZIELL |
| `jobalarm_fahrer` | 1 (JobAlert) | 1 (send-alerts) | - | 🟡 WENIG |
| `jobalarm_antworten` | - | 1 (responses) | - | 🟡 UNGENUTZT |

---

## Nutzungsstatistiken (DB-Level)

| Tabelle | Live Rows | Sequential Scans | Index Scans | Bewertung |
|---------|-----------|------------------|-------------|-----------|
| `admin_settings` | 1 | 436 | 2 | ✅ Sehr aktiv |
| `admin_log` | 0 | 23 | 31 | 🔄 Leer, aber abgefragt |
| `admin_actions` | 0 | 1 | 1 | 🔄 Neu, wenig genutzt |
| `email_log` | 0 | 17 | 1 | ✅ Neu, wenig genutzt |
| `mail_log` | 4 | 20 | 1 | 🔄 Legacy mit Daten |
| `job_mail_log` | 9 | 23 | 6 | 🔄 Aktiv mit Daten |
| `jobalarm_fahrer` | 1 | 25 | 5 | 🟡 Wenig Aktivität |
| `jobalarm_antworten` | 0 | 22 | 15 | 🟡 Leer |

---

## Funktions-Abhängigkeiten

| Funktion | Tabellen-Referenzen | Zweck |
|----------|-------------------|-------|
| `is_admin_user()` | `admin_settings` | Admin-Auth via E-Mail |
| `log_driver_profile_access()` | `admin_log` | Legacy-Logging |
| `log_job_mail()` | `job_mail_log`, `mail_log` | Duales E-Mail-Logging |

---

## Konsolidierungs-Empfehlung

### ✅ BEHALTEN (Kanonische Tabellen)
1. **`admin_settings`** - Single-Row Admin-Config
2. **`admin_actions`** - Moderne Job-spezifische Admin-Logs  
3. **`email_log`** - Moderne E-Mail-Archivierung

### 🔄 KOMPATIBILITÄTS-VIEWS ERSTELLEN
1. **`admin_log`** → View auf `admin_actions` (Mapping: event→action, timestamp→created_at)
2. **`mail_log`** → View auf `email_log` (Mapping: recipient→recipient, template→template)
3. **`job_mail_log`** → Daten nach `email_log` migrieren + View

### 🟡 FEATURE-FLAG EVALUIERUNG
1. **`jobalarm_fahrer`** + **`jobalarm_antworten`** → Admin-only RLS + Feature-Flag OFF
   - Wenig genutzt, möglicherweise überflüssig geworden
   - Später entscheiden: behalten oder entfernen

---

## Risikobewertung

| Risiko | Mitigation |
|--------|------------|
| **Code-Bruch** | Kompatibilitäts-Views für alle Legacy-Referenzen |
| **Datenverlust** | Vollständige Backups vor Migration |
| **Performance** | Views sind read-only, kein Write-Overhead |
| **Rollback** | Backup-Tabellen für 14 Tage aufbewahren |

---

## Nächste Schritte

**⚠️ STOPP - WARTE AUF FREIGABE ⚠️**

Nach GO vom Admin:
1. **Backups erstellen** (alle Legacy-Tabellen)
2. **Daten migrieren** (`job_mail_log` → `email_log`)
3. **Views anlegen** (Kompatibilität für Legacy-Code)
4. **RLS prüfen** (Views read-only, Kanonische admin-only)
5. **Smoke-Tests** (Admin-UI, Edge Functions)
6. **14-Tage-Wartezeit** vor finalem DROP

**Geschätzter Aufwand:** 2-3 Stunden Migration + Testing  
**Produktionsrisiko:** Minimal (Views erhalten Kompatibilität)