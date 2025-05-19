import { useImageCache } from "@/hooks/useImageCache";

export const CachedImage = ({ src, alt, ...props }) => {
  const { cachedUrl, isImageLoaded, error } = useImageCache(src);

  if (error) return <div>Error</div>;

  return (
    <img
      src={isImageLoaded ? cachedUrl : ""}
      alt={alt}
      style={{ opacity: isImageLoaded ? 1 : 0.3 }}
      {...props}
    />
  );
};
