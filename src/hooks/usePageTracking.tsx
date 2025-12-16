import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { loadConsent } from '@/lib/consent';

const VISITOR_ID_KEY = 'fe_visitor_id';
const TRACKED_KEY = 'fe_tracked_pages';

/**
 * Prüft ob der Zugriff aus der Lovable-Preview stammt
 */
const isLovablePreview = (): boolean => {
  const referrer = document.referrer || '';
  const hostname = window.location.hostname;
  
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
 * Generiert oder holt persistente Visitor-ID
 */
const getVisitorId = (): string => {
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  
  if (!visitorId) {
    // Generiere einzigartige ID basierend auf Timestamp + Random
    visitorId = `v_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  
  return visitorId;
};

/**
 * Holt das heutige Datum als String (YYYY-MM-DD)
 */
const getTodayKey = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Prüft ob diese Route heute von diesem Visitor bereits getrackt wurde
 */
const wasTrackedToday = (route: string): boolean => {
  try {
    const tracked = JSON.parse(localStorage.getItem(TRACKED_KEY) || '{}');
    const today = getTodayKey();
    
    // Alte Einträge bereinigen (nicht von heute)
    if (tracked.date !== today) {
      localStorage.setItem(TRACKED_KEY, JSON.stringify({ date: today, routes: [] }));
      return false;
    }
    
    return tracked.routes?.includes(route) || false;
  } catch {
    return false;
  }
};

/**
 * Markiert Route als heute getrackt
 */
const markTrackedToday = (route: string): void => {
  try {
    const today = getTodayKey();
    const tracked = JSON.parse(localStorage.getItem(TRACKED_KEY) || '{}');
    
    if (tracked.date !== today) {
      localStorage.setItem(TRACKED_KEY, JSON.stringify({ date: today, routes: [route] }));
    } else {
      const routes = tracked.routes || [];
      if (!routes.includes(route)) {
        routes.push(route);
        localStorage.setItem(TRACKED_KEY, JSON.stringify({ date: today, routes }));
      }
    }
  } catch {
    // Silent fail
  }
};

/**
 * Hook to track unique page views in Supabase (DSGVO-konform)
 * - Trackt nur wenn Analytics-Zustimmung vorliegt
 * - Schließt Lovable-Preview Zugriffe aus
 * - Eindeutige Nutzer: 1x pro Route pro Tag pro Visitor
 */
export const usePageTracking = () => {
  const location = useLocation();
  const isTracking = useRef(false);

  useEffect(() => {
    const trackPageView = async () => {
      if (isTracking.current) return;
      
      try {
        const route = location.pathname;
        
        // 1. Lovable-Preview ausschließen
        if (isLovablePreview()) {
          return;
        }
        
        // 2. DSGVO: Nur tracken wenn Analytics-Zustimmung vorliegt
        const consent = loadConsent();
        if (!consent?.given || !consent?.categories?.analytics) {
          return;
        }
        
        // 3. Eindeutige Nutzer: Nur 1x pro Route pro Tag
        if (wasTrackedToday(route)) {
          console.debug('⏸️ Page tracking skipped - already tracked today:', route);
          return;
        }

        isTracking.current = true;
        
        const visitorId = getVisitorId();
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
          markTrackedToday(route);
          console.debug('✅ Unique page view tracked:', route, '| Visitor:', visitorId);
        }
      } catch (error) {
        console.debug('Page tracking failed:', error);
      } finally {
        isTracking.current = false;
      }
    };

    trackPageView();
  }, [location.pathname]);
};
