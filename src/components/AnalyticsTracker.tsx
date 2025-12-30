/**
 * Analytics Tracker Component
 * Wird nach initialem Render geladen (Code-Splitting)
 * DSGVO-konform mit Consent-Check
 */
import { usePageTracking } from "@/hooks/usePageTracking";
import { useWebVitals } from "@/hooks/useWebVitals";

export function AnalyticsTracker() {
  usePageTracking();
  useWebVitals();
  return null;
}
