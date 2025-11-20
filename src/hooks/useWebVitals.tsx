import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to track Core Web Vitals (for admin analytics only)
 * Tracks LCP, FID, CLS, FCP, TTFB
 */
export const useWebVitals = () => {
  const location = useLocation();

  useEffect(() => {
    const route = location.pathname;

    const reportWebVital = async (metric: any) => {
      try {
        const rating = metric.rating || 'unknown';
        
        await supabase
          .from('web_vitals')
          .insert({
            route,
            metric_name: metric.name,
            metric_value: metric.value,
            rating: rating,
          });
      } catch (error) {
        console.debug('Web vitals tracking failed:', error);
      }
    };

    // Track Core Web Vitals using the Web Vitals API
    if ('PerformanceObserver' in window) {
      try {
        // Track LCP (Largest Contentful Paint)
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          const lcp = lastEntry.renderTime || lastEntry.loadTime || lastEntry.startTime;
          
          reportWebVital({
            name: 'LCP',
            value: lcp,
            rating: lcp < 2500 ? 'good' : lcp < 4000 ? 'needs-improvement' : 'poor'
          });
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

        // Track FID (First Input Delay)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            const fid = entry.processingStart - entry.startTime;
            reportWebVital({
              name: 'FID',
              value: fid,
              rating: fid < 100 ? 'good' : fid < 300 ? 'needs-improvement' : 'poor'
            });
          });
        });
        fidObserver.observe({ type: 'first-input', buffered: true });

        // Track CLS (Cumulative Layout Shift)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          
          reportWebVital({
            name: 'CLS',
            value: clsValue,
            rating: clsValue < 0.1 ? 'good' : clsValue < 0.25 ? 'needs-improvement' : 'poor'
          });
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });

        // Track FCP (First Contentful Paint)
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            reportWebVital({
              name: 'FCP',
              value: entry.startTime,
              rating: entry.startTime < 1800 ? 'good' : entry.startTime < 3000 ? 'needs-improvement' : 'poor'
            });
          });
        });
        fcpObserver.observe({ type: 'paint', buffered: true });

        // Track TTFB (Time to First Byte)
        const navigationEntry = performance.getEntriesByType('navigation')[0] as any;
        if (navigationEntry) {
          const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
          reportWebVital({
            name: 'TTFB',
            value: ttfb,
            rating: ttfb < 800 ? 'good' : ttfb < 1800 ? 'needs-improvement' : 'poor'
          });
        }
      } catch (error) {
        console.debug('Web vitals observer setup failed:', error);
      }
    }
  }, [location.pathname]);
};
