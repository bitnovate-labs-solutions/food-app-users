import { useMemo, useEffect, useState, useRef } from "react";

const CACHE_PREFIX = 'img_cache_';
const MAX_CACHE_SIZE = 5 * 1024 * 1024; // 5MB
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

// Global cache to prevent reloading
const globalCache = new Map();

function clearOldCache() {
  try {
    const now = Date.now();
    const keys = Object.keys(localStorage).filter(key => key.startsWith(CACHE_PREFIX));
    
    for (const key of keys) {
      const item = localStorage.getItem(key);
      if (item) {
        const { url, timestamp } = JSON.parse(item);
        if (now - timestamp > CACHE_EXPIRY) {
          localStorage.removeItem(key);
          globalCache.delete(url);
        }
      }
    }
  } catch (error) {
    console.error("Error clearing old cache:", error);
  }
}

function getCacheSize() {
  try {
    return Object.keys(localStorage)
      .filter(key => key.startsWith(CACHE_PREFIX))
      .reduce((total, key) => {
        const item = localStorage.getItem(key);
        return total + (item ? item.length : 0);
      }, 0);
  } catch (error) {
    console.error("Error getting cache size:", error);
    return 0;
  }
}

// Helper function to get the actual URL from an image source
function getImageUrl(imageSource) {
  // If it's already a string URL, return it
  if (typeof imageSource === 'string' && (imageSource.startsWith('http') || imageSource.startsWith('/'))) {
    return imageSource;
  }
  // If it's an imported asset (module), return its default export
  return imageSource?.default || imageSource;
}

export function useImageCache(imageSource) {
  const imageUrl = useMemo(() => getImageUrl(imageSource), [imageSource]);
  const cacheKey = useMemo(() => `${CACHE_PREFIX}${imageUrl}`, [imageUrl]);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [cachedUrl, setCachedUrl] = useState(null);
  const loadingRef = useRef(false);

  // Check cache and set initial state
  useEffect(() => {
    if (!imageUrl) {
      setIsImageLoaded(false);
      setCachedUrl(null);
      return;
    }

    // Check global cache first
    if (globalCache.has(imageUrl)) {
      setIsImageLoaded(true);
      setCachedUrl(imageUrl);
      return;
    }

    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { url, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_EXPIRY) {
          globalCache.set(url, true);
          setIsImageLoaded(true);
          setCachedUrl(url);
          return;
        }
      }
    } catch (error) {
      console.error("Error reading from cache:", error);
    }

    // If not in cache, start loading
    if (!loadingRef.current) {
      loadingRef.current = true;

      // Clear expired cache entries periodically
      clearOldCache();

      // Check if we need to clear cache due to size
      if (getCacheSize() > MAX_CACHE_SIZE) {
        clearOldCache();
      }

      // Preload the image in the background with priority
      const img = new Image();
      img.loading = "eager";
      img.decoding = "async";
      img.src = imageUrl;
      
      img.onload = () => {
        try {
          const cacheData = {
            url: imageUrl,
            timestamp: Date.now()
          };
          localStorage.setItem(cacheKey, JSON.stringify(cacheData));
          globalCache.set(imageUrl, true);
          setCachedUrl(imageUrl);
          setIsImageLoaded(true);
        } catch (error) {
          console.error("Error caching image:", error);
          clearOldCache();
        } finally {
          loadingRef.current = false;
        }
      };

      img.onerror = () => {
        loadingRef.current = false;
        console.error("Error loading image:", imageUrl);
      };

      return () => {
        img.onload = null;
        img.onerror = null;
      };
    }
  }, [imageUrl, cacheKey]);

  return { cachedUrl, isImageLoaded };
}
