import { usePageTracking } from "@/hooks/usePageTracking";
import { useWebVitals } from "@/hooks/useWebVitals";

/**
 * Wrapper component for tracking - must be inside BrowserRouter
 */
export const TrackingWrapper = () => {
  usePageTracking();
  useWebVitals();
  return null;
};
