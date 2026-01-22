import { Suspense, lazy, ComponentType, useRef, useState, useEffect } from 'react';

interface LazySectionProps {
  /** Lazy-loaded component factory */
  component: () => Promise<{ default: ComponentType<any> }>;
  /** Minimum height for placeholder to prevent CLS */
  minHeight?: string;
  /** Additional className for the wrapper */
  className?: string;
  /** Props to pass to the lazy component */
  componentProps?: Record<string, any>;
}

/**
 * Layout-stabiler Placeholder mit fixer Höhe für CLS-Vermeidung
 */
const SectionPlaceholder = ({ minHeight = '400px' }: { minHeight?: string }) => (
  <div 
    className="py-16 bg-background" 
    style={{ minHeight }}
    aria-hidden="true"
  >
    <div className="container mx-auto px-4">
      <div className="h-8 bg-muted/50 rounded w-1/3 mx-auto mb-6 animate-pulse" />
      <div className="h-4 bg-muted/30 rounded w-2/3 mx-auto mb-3 animate-pulse" />
      <div className="h-4 bg-muted/30 rounded w-1/2 mx-auto animate-pulse" />
    </div>
  </div>
);

/**
 * LazySection - Lädt Komponenten mit IntersectionObserver oder Fallback-Timer
 * 
 * FIX: Komponente wird sofort nach kurzer Verzögerung geladen,
 * IntersectionObserver beschleunigt das Laden wenn sichtbar
 */
export function LazySection({ 
  component, 
  minHeight = '400px',
  className = '',
  componentProps = {}
}: LazySectionProps) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  // Memoize lazy component to prevent recreation on each render
  const LazyComponentRef = useRef<ComponentType<any> | null>(null);
  
  if (!LazyComponentRef.current) {
    LazyComponentRef.current = lazy(component);
  }
  
  const LazyComponent = LazyComponentRef.current;

  useEffect(() => {
    const element = ref.current;
    
    // Sofort laden nach 500ms als Fallback
    const fallbackTimer = setTimeout(() => {
      setShouldLoad(true);
    }, 500);

    if (!element) return () => clearTimeout(fallbackTimer);

    // IntersectionObserver für schnelleres Laden wenn sichtbar
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          clearTimeout(fallbackTimer);
          observer.disconnect();
        }
      },
      {
        rootMargin: '300px',
        threshold: 0
      }
    );

    observer.observe(element);

    return () => {
      clearTimeout(fallbackTimer);
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {shouldLoad ? (
        <Suspense fallback={<SectionPlaceholder minHeight={minHeight} />}>
          <LazyComponent {...componentProps} />
        </Suspense>
      ) : (
        <SectionPlaceholder minHeight={minHeight} />
      )}
    </div>
  );
}

export default LazySection;
