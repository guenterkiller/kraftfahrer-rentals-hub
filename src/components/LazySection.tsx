import { Suspense, lazy, ComponentType, ReactNode } from 'react';
import { useLazySection } from '@/hooks/useLazySection';

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
 * LazySection - Lädt Komponenten erst wenn sie im/nahe Viewport sind
 * 
 * Verwendet IntersectionObserver mit rootMargin: 200px für Preloading
 * bevor die Section sichtbar wird. Zeigt stabilen Placeholder für CLS = 0.
 */
export function LazySection({ 
  component, 
  minHeight = '400px',
  className = '',
  componentProps = {}
}: LazySectionProps) {
  const [ref, isVisible] = useLazySection('200px');

  return (
    <div ref={ref} className={className}>
      {isVisible ? (
        <Suspense fallback={<SectionPlaceholder minHeight={minHeight} />}>
          <LazyComponentWrapper component={component} props={componentProps} />
        </Suspense>
      ) : (
        <SectionPlaceholder minHeight={minHeight} />
      )}
    </div>
  );
}

/**
 * Wrapper um lazy() aufzurufen wenn Component geladen werden soll
 */
function LazyComponentWrapper({ 
  component, 
  props 
}: { 
  component: () => Promise<{ default: ComponentType<any> }>;
  props: Record<string, any>;
}) {
  const LazyComponent = lazy(component);
  return <LazyComponent {...props} />;
}

export default LazySection;
