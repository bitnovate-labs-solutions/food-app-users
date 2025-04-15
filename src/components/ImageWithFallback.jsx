// To replace the fallback image with a Lucide React CircleAlert icon (or any other image) when an image fails to load
import { useState, useEffect } from "react";
import { CircleAlert } from "lucide-react";
import { motion } from "framer-motion";
import { useImageCache } from "@/hooks/useImageCache";

const ImageWithFallback = ({ 
  src, 
  alt, 
  className, 
  style, 
  width,
  height,
  quality = 80,
  ...props 
}) => {
  const [error, setError] = useState(false);
  const { cachedUrl, isImageLoaded } = useImageCache(src);

  useEffect(() => {
    if (!src) return;
    setError(false);
  }, [src]);

  if (error) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <CircleAlert size={48} className="text-gray-400" />
      </div>
    );
  }

  return (
    <motion.img
      src={isImageLoaded ? (cachedUrl || src) : src}
      alt={alt}
      className={className}
      style={style}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      onError={() => setError(true)}
      {...props}
    />
  );
};

export default ImageWithFallback;

// // Usage example:
// <ImageWithFallback
//   src="https://example.com/nonexistent.jpg"
//   alt="Fallback Example"
//   className="w-32 h-32 object-cover"
// />
