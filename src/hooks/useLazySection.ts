import { useState, useEffect, useRef, RefObject } from 'react';

/**
 * Hook für IntersectionObserver-basiertes Lazy Loading
 * Lädt Komponenten erst wenn sie nahe am Viewport sind (rootMargin: 200px)
 * Verhindert TBT durch Verzögerung von Off-Screen Komponenten
 */
export function useLazySection(rootMargin = '200px'): [RefObject<HTMLDivElement>, boolean] {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // IntersectionObserver für Viewport-Tracking
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Observer entfernen nach erstem Laden
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold: 0
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [rootMargin]);

  return [ref, isVisible];
}

/**
 * Wrapper-Komponente für lazy-loaded Sections
 * Zeigt Placeholder mit stabiler Höhe bis Section sichtbar wird
 */
export interface LazySectionProps {
  children: React.ReactNode;
  minHeight?: string;
  className?: string;
}
