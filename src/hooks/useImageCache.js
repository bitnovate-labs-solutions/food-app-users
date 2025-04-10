import { useMemo, useEffect, useState } from "react";

const CACHE_PREFIX = 'img_cache_';
const MAX_CACHE_SIZE = 5 * 1024 * 1024; // 5MB
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

function clearOldCache() {
  try {
    const now = Date.now();
    const keys = Object.keys(localStorage).filter(key => key.startsWith(CACHE_PREFIX));
    
    for (const key of keys) {
      const item = localStorage.getItem(key);
      if (item) {
        const { timestamp } = JSON.parse(item);
        if (now - timestamp > CACHE_EXPIRY) {
          localStorage.removeItem(key);
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

export function useImageCache(imageUrl) {
  const cacheKey = useMemo(() => `${CACHE_PREFIX}${imageUrl}`, [imageUrl]);

  // Read from localStorage first to avoid re-renders
  const initialUrl = useMemo(() => {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { url, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_EXPIRY) {
          return url;
        }
      }
    } catch (error) {
      console.error("Error reading from cache:", error);
    }
    return imageUrl;
  }, [cacheKey, imageUrl]);

  const [cachedUrl, setCachedUrl] = useState(initialUrl);

  useEffect(() => {
    if (!imageUrl) return;

    // Clear expired cache entries periodically
    clearOldCache();

    // Check if we need to clear cache due to size
    if (getCacheSize() > MAX_CACHE_SIZE) {
      clearOldCache();
    }

    // Preload the image in the background
    const img = new Image();
    img.src = imageUrl;
    
    img.onload = () => {
      try {
        const cacheData = {
          url: imageUrl,
          timestamp: Date.now()
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        setCachedUrl(imageUrl);
      } catch (error) {
        console.error("Error caching image:", error);
        clearOldCache();
      }
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl, cacheKey]);

  return cachedUrl;
}
