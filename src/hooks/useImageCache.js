import { useMemo, useEffect, useState } from "react";

const CACHE_PREFIX = "img_cache_";
const MAX_CACHE_SIZE = 5 * 1024 * 1024; // 5MB
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

// Global cache to prevent reloading
const globalCache = new Map();

const isCacheExpired = (timestamp) => Date.now() - timestamp > CACHE_EXPIRY;

// CLEAR OLD CACHE ============================================
const clearOldCache = () => {
  Object.keys(localStorage)
    .filter((key) => key.startsWith(CACHE_PREFIX))
    .forEach((key) => {
      try {
        const { url, timestamp } = JSON.parse(localStorage.getItem(key));
        if (isCacheExpired(timestamp)) {
          localStorage.removeItem(key);
          globalCache.delete(url);
        }
      } catch (error) {
        console.error("Error clearing old cache:", error);
      }
    });
};

// GET CACHE SIZE ============================================
const getCacheSize = () => {
  return Object.keys(localStorage)
    .filter((key) => key.startsWith(CACHE_PREFIX))
    .reduce((total, key) => {
      const item = localStorage.getItem(key);
      return total + (item ? item.length : 0);
    }, 0);
};

// GET IMAGE URL from source ============================================
const getImageUrl = (source) => {
  return typeof source === "string" ? source : source?.default || source;
};

// HOOK ============================================
export const useImageCache = (imageSource) => {
  const imageUrl = useMemo(() => getImageUrl(imageSource), [imageSource]);
  const cacheKey = useMemo(() => `${CACHE_PREFIX}${imageUrl}`, [imageUrl]);

  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [cachedUrl, setCachedUrl] = useState(null);
  const [error, setError] = useState(null);

  // Check cache and set initial state
  useEffect(() => {
    if (!imageUrl) return;

    let isCancelled = false;

    const loadImage = (url, onSuccess, onError) => {
      const img = new Image();
      img.src = url;
      img.loading = "eager";
      img.decoding = "async";
      img.onload = () => {
        if (!isCancelled) onSuccess();
      };
      img.onerror = () => {
        if (!isCancelled) onError();
      };
    };

    const handleSuccess = (imageUrl) => {
      setCachedUrl(imageUrl);
      setIsImageLoaded(true);
      setError(null);
      globalCache.set(imageUrl, true);
    };

    const handleFailure = (message) => {
      setCachedUrl(null);
      setIsImageLoaded(false);
      setError(message);
    };

    const tryUseLocalCache = () => {
      try {
        const cached = JSON.parse(localStorage.getItem(cacheKey));
        if (cached && !isCacheExpired(cached.timestamp)) {
          loadImage(
            cached.url,
            () => handleSuccess(cached.url),
            () => {
              localStorage.removeItem(cacheKey);
              globalCache.delete(cached.url);
              handleFailure("Failed to load cached image");
            }
          );
          return true;
        }
      } catch {
        handleFailure("Error reading cache");
      }
      return false;
    };

    // Reset states when image source changes
    setIsImageLoaded(false);
    setError(null);

    // 1. First check global cache
    if (globalCache.has(imageUrl)) {
      handleSuccess(imageUrl);
      return;
    }

    // 2. Then check local cache
    if (tryUseLocalCache()) {
      return;
    }

    // 3. Fallback: Load fresh image
    clearOldCache();
    if (getCacheSize() > MAX_CACHE_SIZE) {
      clearOldCache();
      // If still too large, clear more aggressively
      if (getCacheSize() > MAX_CACHE_SIZE) {
        // Clear oldest 50% of cache
        const cacheEntries = [];
        Object.keys(localStorage)
          .filter((key) => key.startsWith(CACHE_PREFIX))
          .forEach((key) => {
            try {
              const item = JSON.parse(localStorage.getItem(key));
              if (item && item.timestamp) {
                cacheEntries.push({ key, timestamp: item.timestamp });
              }
            } catch {
              localStorage.removeItem(key);
            }
          });
        cacheEntries.sort((a, b) => a.timestamp - b.timestamp);
        const toRemove = Math.floor(cacheEntries.length / 2);
        cacheEntries.slice(0, toRemove).forEach(({ key }) => {
          localStorage.removeItem(key);
        });
      }
    }

    loadImage(
      imageUrl,
      () => {
        try {
          const cacheData = { url: imageUrl, timestamp: Date.now() };
          localStorage.setItem(cacheKey, JSON.stringify(cacheData));
          handleSuccess(imageUrl);
        } catch (error) {
          // If quota exceeded, try cleanup and continue without caching
          if (error.name === 'QuotaExceededError' || error.message?.includes('quota')) {
            console.warn('Storage quota exceeded, clearing cache...');
            clearOldCache();
            // Continue without caching
            handleSuccess(imageUrl);
          } else {
          handleFailure("Error caching image");
          }
        }
      },
      () => handleFailure("Failed to load image")
    );

    return () => {
      isCancelled = true;
    };
  }, [imageUrl, cacheKey]);

  return { cachedUrl, isImageLoaded, error };
};
