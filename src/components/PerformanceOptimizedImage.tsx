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
 * Performance-optimierte Bildkomponente
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
}: PerformanceOptimizedImageProps) => {
  const aspectRatio = (height / width) * 100;

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{
        width: '100%',
        paddingBottom: `${aspectRatio}%`
      }}
    >
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        className="absolute inset-0 w-full h-full"
        style={{ objectFit }}
        decoding="async"
      />
    </div>
  );
};

export default PerformanceOptimizedImage;
