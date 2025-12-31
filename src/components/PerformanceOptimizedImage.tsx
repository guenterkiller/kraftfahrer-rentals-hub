import { useState } from 'react';

interface PerformanceOptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width: number;
  height: number;
  priority?: boolean;
  sizes?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

/**
 * Performance-optimierte Bildkomponente für bessere Core Web Vitals
 * - Explizite Dimensionen verhindern CLS (Cumulative Layout Shift)
 * - Lazy Loading für Nicht-kritische Bilder
 * - Aspect-ratio preservation während des Ladens
 * - Skeleton Placeholder für bessere UX
 */
const PerformanceOptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  width, 
  height,
  priority = false,
  sizes = '100vw',
  objectFit = 'cover'
}: PerformanceOptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Aspect Ratio für Layout Stability berechnen
  const aspectRatio = (height / width) * 100;

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
  };

  if (hasError) {
    return (
      <div 
        className={`bg-muted flex items-center justify-center ${className}`}
        style={{ 
          width: '100%',
          paddingBottom: `${aspectRatio}%`,
          position: 'relative'
        }}
        role="img"
        aria-label={`Bild konnte nicht geladen werden: ${alt}`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-muted-foreground text-sm">Bild nicht verfügbar</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{
        width: '100%',
        paddingBottom: `${aspectRatio}%`
      }}
    >
      {/* Skeleton Placeholder für bessere UX während des Ladens */}
      {!isLoaded && (
        <div 
          className="absolute inset-0 bg-muted animate-pulse"
          aria-hidden="true"
        />
      )}
      
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        // @ts-expect-error fetchpriority is a valid HTML attribute
        fetchpriority={priority ? 'high' : 'auto'}
        onLoad={handleLoad}
        onError={handleError}
        className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ objectFit }}
        decoding="async"
      />
    </div>
  );
};

export default PerformanceOptimizedImage;
