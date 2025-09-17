# E-Mail-Delivery mit PDF-Link und optionalem Anhang

## Übersicht

Das System wurde erweitert, um E-Mails mit vollständigem Inhalt zu versenden und PDFs als Download-Link bereitzustellen, mit optionaler Anhang-Funktion.

## Neue Features

### 1. Delivery Modi

- **`inline`** (Standard): E-Mail mit vollständigem Inhalt + PDF-Download-Link
- **`both`**: E-Mail mit vollständigem Inhalt + PDF-Download-Link + PDF als Anhang
- **`pdf-only`**: Kurze E-Mail mit nur PDF als Anhang

### 2. Datenbank-Erweiterung

```sql
-- Neue Spalten in email_log
ALTER TABLE public.email_log
  ADD COLUMN delivery_mode text NOT NULL DEFAULT 'inline',
  ADD COLUMN pdf_path text,
  ADD COLUMN pdf_url text;
```

### 3. Edge Function Updates

Die `send-driver-confirmation` Function unterstützt jetzt:
- Delivery-Modi über Request-Parameter `mode`
- Signierte URLs (14 Tage gültig) für PDF-Downloads
- Bedingte PDF-Anhänge basierend auf Modus
- Vollständige E-Mail-Templates mit PDF-Links

### 4. Admin-UI Erweiterung

- Neue Checkbox "PDF als Anhang senden" im Assignment-Dialog
- Automatische Modus-Auswahl basierend auf Checkbox-Status
- Erfolgs-Toasts zeigen den verwendeten Delivery-Modus an

## API-Verwendung

```typescript
// Edge Function Aufruf
await fetch('/functions/v1/send-driver-confirmation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    assignment_id: "uuid",
    mode: "both" // 'inline' | 'both' | 'pdf-only'
  })
});
```

## Sicherheit

- PDFs werden in privatem `confirmations` Bucket gespeichert
- Signierte URLs mit 14-tägiger Gültigkeit
- Admin-Zugriff auf PDFs über service_role
- Keine öffentlichen RLS-Policies erforderlich

## Testing

### Test 1: Standard-Versand (inline)
1. Admin → Job zuweisen (ohne PDF-Checkbox)
2. Erwartung: E-Mail mit vollständigem Inhalt + PDF-Link
3. Prüfen: `delivery_mode='inline'` in email_log

### Test 2: Mit PDF-Anhang (both)
1. Admin → Job zuweisen (mit PDF-Checkbox aktiviert)
2. Erwartung: E-Mail mit Inhalt + Link + PDF-Anhang
3. Prüfen: `delivery_mode='both'` in email_log

### Test 3: Adress-Validierung
1. Job mit unvollständiger Anschrift zuweisen
2. Erwartung: Versand blockiert, Fehlermeldung in UI
3. Prüfen: Kein `sent`-Log, möglicherweise `failed`-Log

## Monitoring

```sql
-- E-Mail-Logs prüfen
SELECT sent_at, recipient, template, delivery_mode, status, pdf_url
FROM public.email_log
ORDER BY sent_at DESC
LIMIT 10;
```

## Troubleshooting

### PDF-Link funktioniert nicht
- Prüfen ob PDF erfolgreich hochgeladen wurde
- Signierte URL könnte abgelaufen sein (14 Tage)
- Bucket-Berechtigung prüfen

### E-Mail ohne PDF-Link
- `delivery_mode='pdf-only'` verwendet möglicherweise keinen Link
- PDF-Upload-Fehler in Function-Logs prüfen
- Storage-Bucket-Konfiguration prüfen

### Anhang fehlt bei mode='both'
- FormData-Erstellung in Edge Function prüfen
- Resend API Limits prüfen
- PDF-Generierung erfolgreich?