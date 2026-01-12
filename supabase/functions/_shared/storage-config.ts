/**
 * Zentrale Storage-Konfiguration für alle Edge Functions
 * 
 * WICHTIG: Alle Fahrer-Dokumente werden im Bucket "fahrer-dokumente" gespeichert.
 * Der Bucket "driver-documents" ist deprecated und wird nicht mehr verwendet.
 */

// Haupt-Bucket für alle Fahrer-Dokumente
export const DRIVER_DOCS_BUCKET = "fahrer-dokumente";

// Legacy-Bucket (nur für Migration/Fallback beim Lesen)
export const LEGACY_DRIVER_DOCS_BUCKET = "driver-documents";

// Bucket für Auftragsbestätigungen
export const CONFIRMATIONS_BUCKET = "confirmations";

// Erlaubte MIME-Types für Fahrer-Dokumente
export const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png", 
  "application/pdf"
]);

// Maximale Dateigröße in Bytes (5 MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024;
