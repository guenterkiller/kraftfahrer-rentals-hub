import { useEffect, useRef } from 'react';

/**
 * Prefetch wichtige Landing-Page Chunks nach First Paint
 * Verwendet requestIdleCallback für minimale Auswirkung auf Performance
 */
export function usePrefetchRoutes() {
  const hasPrefetched = useRef(false);

  useEffect(() => {
    // Nur einmal ausführen
    if (hasPrefetched.current) return;
    hasPrefetched.current = true;

    const prefetchChunks = () => {
      // Wichtigste Landingpages prefetchen (nur JS-Chunks, keine Daten)
      const routesToPrefetch = [
        () => import('../pages/Mietfahrer'),
        () => import('../pages/ErsatzfahrerLkw'),
        () => import('../pages/LkwFahrerKurzfristig'),
        () => import('../pages/LKWFahrerBuchen'),
        () => import('../pages/PreiseUndAblauf'),
      ];

      // Chunks sequentiell mit kleiner Verzögerung laden
      // um Network nicht zu überlasten
      routesToPrefetch.forEach((importFn, index) => {
        setTimeout(() => {
          importFn().catch(() => {
            // Silent fail - Prefetch ist optional
          });
        }, index * 100); // 100ms Abstand zwischen Chunks
      });
    };

    // Nach First Paint und wenn Browser idle ist
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(prefetchChunks, { timeout: 3000 });
    } else {
      // Fallback: nach 2s
      setTimeout(prefetchChunks, 2000);
    }
  }, []);
}
