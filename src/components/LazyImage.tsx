interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
}

const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  width, 
  height, 
  loading = 'lazy', 
  priority = false,
  objectFit = 'cover',
}: LazyImageProps) => {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : loading}
      className={className}
      style={{ objectFit }}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
    />
  );
};

export default LazyImage;
