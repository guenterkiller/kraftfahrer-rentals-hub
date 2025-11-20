interface PerformanceOptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width: number;
  height: number;
  priority?: boolean;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
}

/**
 * Performance-optimierte Bildkomponente mit Aspect Ratio Container
 */
const PerformanceOptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  width, 
  height,
  priority = false,
  objectFit = 'cover',
}: PerformanceOptimizedImageProps) => {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      className={className}
      style={{ objectFit }}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
    />
  );
};

export default PerformanceOptimizedImage;
