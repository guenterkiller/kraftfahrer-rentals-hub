import { useState, useEffect, useRef } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  enableWebP?: boolean;
  sizes?: string;
}

const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  width, 
  height, 
  loading = 'lazy', 
  priority = false,
  enableWebP = true,
  sizes = '100vw'
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(priority);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer für progressives Lazy Loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.01
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [priority]);


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
        style={{ width, height }}
        role="img"
        aria-label={`Bild konnte nicht geladen werden: ${alt}`}
      >
        <span className="text-muted-foreground text-sm">Bild nicht verfügbar</span>
      </div>
    );
  }

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {!isLoaded && (
        <div 
          className="absolute inset-0 bg-muted animate-pulse"
          style={{ width, height }}
          aria-hidden="true"
        />
      )}
      
      {shouldLoad && (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
        loading={priority ? 'eager' : loading}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
          decoding="async"
          {...(priority && { fetchPriority: 'high' as any })}
        />
      )}
    </div>
  );
};

export default LazyImage;