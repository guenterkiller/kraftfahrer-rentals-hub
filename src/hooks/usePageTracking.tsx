import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to track page views in Supabase (for admin analytics only)
 * Automatically logs each route change with timestamp, user agent, and referrer
 */
export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    const trackPageView = async () => {
      try {
        const userAgent = navigator.userAgent;
        const referrer = document.referrer || null;
        // Only track pathname, ignore query parameters (forceHideBadge, tokens, etc.)
        const route = location.pathname;

        await supabase
          .from('page_views')
          .insert({
            route,
            user_agent: userAgent,
            referrer,
          });
      } catch (error) {
        // Silently fail - analytics should not break the app
        console.debug('Page tracking failed:', error);
      }
    };

    trackPageView();
  }, [location.pathname]);
};
