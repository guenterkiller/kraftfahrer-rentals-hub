import { useState } from 'react';

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

  // Generate WebP path by replacing extension
  const getWebPPath = (imagePath: string) => {
    return imagePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  };

  // Generate responsive srcset
  const generateSrcSet = (imagePath: string, format: 'webp' | 'original' = 'original') => {
    const responsiveSizes = [640, 768, 1024, 1280, 1920];
    const path = format === 'webp' ? getWebPPath(imagePath) : imagePath;
    
    return responsiveSizes.map(size => `${path} ${size}w`).join(', ');
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
        style={{ width, height }}
        role="img"
        aria-label={`Bild konnte nicht geladen werden: ${alt}`}
      >
        <span className="text-muted-foreground text-sm">Bild nicht verfügbar</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!isLoaded && (
        <div 
          className="absolute inset-0 bg-muted animate-pulse"
          style={{ width, height }}
          aria-hidden="true"
        />
      )}
      
      <img
        src={src}
        srcSet={generateSrcSet(src, 'original')}
        sizes={sizes}
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
    </div>
  );
};

export default LazyImage;