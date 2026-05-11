import { useState, useRef, useEffect } from "react";
import { ImageIcon } from "lucide-react";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
}

export default function LazyImage({ src, alt, className = "", onLoad }: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [inView, setInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px" }
    );
    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);

  // Reset state when src changes
  useEffect(() => {
    setLoaded(false);
    setError(false);
  }, [src]);

  const handleLoad = () => {
    setLoaded(true);
    setError(false);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
    setLoaded(true);
  };

  if (error) {
    return (
      <div className={`bg-secondary/50 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <ImageIcon size={24} className="mx-auto text-muted-foreground/40 mb-1" />
          <span className="text-[10px] text-muted-foreground/50">No image</span>
        </div>
      </div>
    );
  }

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-secondary/50 animate-pulse rounded" />
      )}
      {inView && (
        <img
          src={src}
          alt={alt}
          className={`${className} transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      )}
    </div>
  );
}
