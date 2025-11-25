import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { loadConsent } from '@/lib/consent';

/**
 * Hook to track page views in Supabase (DSGVO-konform)
 * Trackt nur wenn Analytics-Zustimmung vorliegt
 * Automatically logs each route change with timestamp, user agent, and referrer
 */
export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    const trackPageView = async () => {
      try {
        // DSGVO: Nur tracken wenn Analytics-Zustimmung vorliegt
        const consent = loadConsent();
        if (!consent?.given || !consent?.categories?.analytics) {
          console.debug('⏸️ Page tracking skipped - no analytics consent');
          return;
        }

        const userAgent = navigator.userAgent;
        const referrer = document.referrer || null;
        // Only track pathname, ignore query parameters (forceHideBadge, tokens, etc.)
        const route = location.pathname;

        const { error } = await supabase
          .from('page_views')
          .insert({
            route,
            user_agent: userAgent,
            referrer,
          });

        if (error) {
          console.debug('Page tracking error:', error);
        } else {
          console.debug('✅ Page view tracked:', route);
        }
      } catch (error) {
        // Silently fail - analytics should not break the app
        console.debug('Page tracking failed:', error);
      }
    };

    trackPageView();
  }, [location.pathname]);
};
