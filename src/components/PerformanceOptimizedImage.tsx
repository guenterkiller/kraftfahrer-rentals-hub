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
  enableWebP?: boolean;
}

/**
 * Performance-optimierte Bildkomponente mit WebP-Support für bessere Core Web Vitals
 * - Automatischer WebP-Support mit JPG-Fallback
 * - Responsive srcset für verschiedene Bildschirmgrößen
 * - Explizite Dimensionen verhindern CLS (Cumulative Layout Shift)
 * - Lazy Loading für Nicht-kritische Bilder
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
  objectFit = 'cover',
  enableWebP = true
}: PerformanceOptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const aspectRatio = (height / width) * 100;

  // Generate WebP path by replacing extension
  const getWebPPath = (imagePath: string) => {
    return imagePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  };

  // Generate responsive srcset (640w, 768w, 1024w, 1280w, 1920w)
  const generateSrcSet = (imagePath: string, format: 'webp' | 'original' = 'original') => {
    const sizes = [640, 768, 1024, 1280, 1920];
    const path = format === 'webp' ? getWebPPath(imagePath) : imagePath;
    
    // For now, return the original image for all sizes
    // In production, you would have actual different sized images
    return sizes.map(size => `${path} ${size}w`).join(', ');
  };

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
      {/* Skeleton Placeholder */}
      {!isLoaded && (
        <div 
          className="absolute inset-0 bg-muted animate-pulse"
          aria-hidden="true"
        />
      )}
      
      <picture className="absolute inset-0">
        {/* WebP source for modern browsers */}
        {enableWebP && (
          <source
            type="image/webp"
            srcSet={generateSrcSet(src, 'webp')}
            sizes={sizes}
          />
        )}
        
        {/* Fallback image with srcset */}
        <img
          src={src}
          srcSet={generateSrcSet(src, 'original')}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={handleLoad}
          onError={handleError}
          className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ objectFit }}
          decoding="async"
        />
      </picture>
    </div>
  );
};

export default PerformanceOptimizedImage;
