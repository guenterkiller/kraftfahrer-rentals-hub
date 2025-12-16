import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { loadConsent } from '@/lib/consent';

/**
 * Prüft ob der Zugriff aus der Lovable-Preview stammt
 */
const isLovablePreview = (): boolean => {
  const referrer = document.referrer || '';
  const hostname = window.location.hostname;
  
  // Lovable Preview URLs erkennen
  const lovablePatterns = [
    'lovable.dev',
    'lovableproject.com',
    '__lovable_token'
  ];
  
  return lovablePatterns.some(pattern => 
    referrer.includes(pattern) || hostname.includes(pattern)
  );
};

/**
 * Generiert einen Session-Key für Deduplizierung
 */
const getSessionKey = (route: string): string => {
  return `page_view_tracked_${route}`;
};

/**
 * Prüft ob diese Route in dieser Session bereits getrackt wurde
 */
const wasAlreadyTracked = (route: string): boolean => {
  const key = getSessionKey(route);
  const trackedAt = sessionStorage.getItem(key);
  
  if (!trackedAt) return false;
  
  // Erlaube erneutes Tracking nach 5 Minuten (für echte wiederholte Besuche)
  const trackedTime = parseInt(trackedAt, 10);
  const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
  
  return trackedTime > fiveMinutesAgo;
};

/**
 * Markiert Route als getrackt
 */
const markAsTracked = (route: string): void => {
  const key = getSessionKey(route);
  sessionStorage.setItem(key, Date.now().toString());
};

/**
 * Hook to track page views in Supabase (DSGVO-konform)
 * - Trackt nur wenn Analytics-Zustimmung vorliegt
 * - Schließt Lovable-Preview Zugriffe aus
 * - Deduplizierung: max 1x pro Route pro 5 Minuten
 */
export const usePageTracking = () => {
  const location = useLocation();
  const isTracking = useRef(false);

  useEffect(() => {
    const trackPageView = async () => {
      // Prevent double-tracking during React StrictMode
      if (isTracking.current) return;
      
      try {
        const route = location.pathname;
        
        // 1. Lovable-Preview ausschließen
        if (isLovablePreview()) {
          console.debug('⏸️ Page tracking skipped - Lovable Preview detected');
          return;
        }
        
        // 2. DSGVO: Nur tracken wenn Analytics-Zustimmung vorliegt
        const consent = loadConsent();
        if (!consent?.given || !consent?.categories?.analytics) {
          console.debug('⏸️ Page tracking skipped - no analytics consent');
          return;
        }
        
        // 3. Deduplizierung: Bereits getrackte Routes überspringen
        if (wasAlreadyTracked(route)) {
          console.debug('⏸️ Page tracking skipped - already tracked recently:', route);
          return;
        }

        isTracking.current = true;
        
        const userAgent = navigator.userAgent;
        const referrer = document.referrer || null;

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
          markAsTracked(route);
          console.debug('✅ Page view tracked:', route);
        }
      } catch (error) {
        // Silently fail - analytics should not break the app
        console.debug('Page tracking failed:', error);
      } finally {
        isTracking.current = false;
      }
    };

    trackPageView();
  }, [location.pathname]);
};
