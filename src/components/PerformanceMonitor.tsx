import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Clock, Gauge } from 'lucide-react';

interface PerformanceMetrics {
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  fcp: number | null;
  ttfb: number | null;
}

/**
 * Performance Monitor Komponente für Core Web Vitals
 * Zeigt Echtzeit-Metriken während der Entwicklung
 * Nur im Development-Modus sichtbar
 */
const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null,
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Nur im Development anzeigen
    if (import.meta.env.MODE !== 'development') return;

    // Performance Observer für LCP
    if ('PerformanceObserver' in window) {
      try {
        // LCP Observer
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          setMetrics((prev) => ({
            ...prev,
            lcp: lastEntry.renderTime || lastEntry.loadTime,
          }));
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

        // FCP Observer
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            setMetrics((prev) => ({
              ...prev,
              fcp: entries[0].startTime,
            }));
          }
        });
        fcpObserver.observe({ type: 'paint', buffered: true });

        // CLS Observer
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as any[]) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              setMetrics((prev) => ({
                ...prev,
                cls: clsValue,
              }));
            }
          }
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });

        // FID Observer (deprecated, aber noch unterstützt)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            setMetrics((prev) => ({
              ...prev,
              fid: (entries[0] as any).processingStart - entries[0].startTime,
            }));
          }
        });
        fidObserver.observe({ type: 'first-input', buffered: true });

        // TTFB aus Navigation Timing
        const navEntry = performance.getEntriesByType('navigation')[0] as any;
        if (navEntry) {
          setMetrics((prev) => ({
            ...prev,
            ttfb: navEntry.responseStart,
          }));
        }

        return () => {
          lcpObserver.disconnect();
          fcpObserver.disconnect();
          clsObserver.disconnect();
          fidObserver.disconnect();
        };
      } catch (error) {
        console.warn('Performance Observer nicht verfügbar:', error);
      }
    }
  }, []);

  // Rating-Funktion für Metriken
  const getRating = (metric: string, value: number): { color: string; label: string } => {
    switch (metric) {
      case 'lcp':
        if (value < 2500) return { color: 'bg-green-500', label: 'Gut' };
        if (value < 4000) return { color: 'bg-yellow-500', label: 'Mittel' };
        return { color: 'bg-red-500', label: 'Schlecht' };
      
      case 'fid':
        if (value < 100) return { color: 'bg-green-500', label: 'Gut' };
        if (value < 300) return { color: 'bg-yellow-500', label: 'Mittel' };
        return { color: 'bg-red-500', label: 'Schlecht' };
      
      case 'cls':
        if (value < 0.1) return { color: 'bg-green-500', label: 'Gut' };
        if (value < 0.25) return { color: 'bg-yellow-500', label: 'Mittel' };
        return { color: 'bg-red-500', label: 'Schlecht' };
      
      case 'fcp':
        if (value < 1800) return { color: 'bg-green-500', label: 'Gut' };
        if (value < 3000) return { color: 'bg-yellow-500', label: 'Mittel' };
        return { color: 'bg-red-500', label: 'Schlecht' };
      
      case 'ttfb':
        if (value < 800) return { color: 'bg-green-500', label: 'Gut' };
        if (value < 1800) return { color: 'bg-yellow-500', label: 'Mittel' };
        return { color: 'bg-red-500', label: 'Schlecht' };
      
      default:
        return { color: 'bg-gray-500', label: 'N/A' };
    }
  };

  const formatValue = (metric: string, value: number | null): string => {
    if (value === null) return 'Lädt...';
    
    if (metric === 'cls') {
      return value.toFixed(3);
    }
    
    return `${Math.round(value)}ms`;
  };

  // Nur im Development-Modus rendern
  if (import.meta.env.MODE !== 'development') return null;

  return (
    <>
      {/* Toggle Button (fixed bottom-right) */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:bg-primary/90 transition-all"
        aria-label="Performance Monitor anzeigen"
      >
        <Gauge className="h-5 w-5" />
      </button>

      {/* Performance Panel */}
      {isVisible && (
        <div className="fixed bottom-20 right-4 z-50 w-96 max-h-[80vh] overflow-auto">
          <Card className="shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5" />
                Core Web Vitals Monitor
              </CardTitle>
              <CardDescription>
                Development-Modus | Echtzeitmetriken
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Diese Werte sind Development-Metriken. Production kann abweichen.
                </AlertDescription>
              </Alert>

              {/* LCP */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">LCP (Largest Contentful Paint)</span>
                  </div>
                  {metrics.lcp !== null && (
                    <Badge className={getRating('lcp', metrics.lcp).color}>
                      {getRating('lcp', metrics.lcp).label}
                    </Badge>
                  )}
                </div>
                <div className="text-2xl font-bold">{formatValue('lcp', metrics.lcp)}</div>
                <p className="text-xs text-muted-foreground">Ziel: &lt; 2.5s</p>
              </div>

              {/* FID */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">FID (First Input Delay)</span>
                  </div>
                  {metrics.fid !== null && (
                    <Badge className={getRating('fid', metrics.fid).color}>
                      {getRating('fid', metrics.fid).label}
                    </Badge>
                  )}
                </div>
                <div className="text-2xl font-bold">{formatValue('fid', metrics.fid)}</div>
                <p className="text-xs text-muted-foreground">Ziel: &lt; 100ms</p>
              </div>

              {/* CLS */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">CLS (Cumulative Layout Shift)</span>
                  {metrics.cls !== null && (
                    <Badge className={getRating('cls', metrics.cls).color}>
                      {getRating('cls', metrics.cls).label}
                    </Badge>
                  )}
                </div>
                <div className="text-2xl font-bold">{formatValue('cls', metrics.cls)}</div>
                <p className="text-xs text-muted-foreground">Ziel: &lt; 0.1</p>
              </div>

              {/* FCP */}
              <div className="space-y-1 pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-muted-foreground">FCP (First Contentful Paint)</span>
                  {metrics.fcp !== null && (
                    <Badge variant="outline" className="text-xs">
                      {getRating('fcp', metrics.fcp).label}
                    </Badge>
                  )}
                </div>
                <div className="text-lg font-semibold">{formatValue('fcp', metrics.fcp)}</div>
              </div>

              {/* TTFB */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-muted-foreground">TTFB (Time to First Byte)</span>
                  {metrics.ttfb !== null && (
                    <Badge variant="outline" className="text-xs">
                      {getRating('ttfb', metrics.ttfb).label}
                    </Badge>
                  )}
                </div>
                <div className="text-lg font-semibold">{formatValue('ttfb', metrics.ttfb)}</div>
              </div>

              <Alert className="mt-4">
                <AlertDescription className="text-xs">
                  📊 Für genaue Production-Metriken nutzen Sie{' '}
                  <a 
                    href="https://pagespeed.web.dev/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline font-medium"
                  >
                    PageSpeed Insights
                  </a>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default PerformanceMonitor;
