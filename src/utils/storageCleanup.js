/**
 * Storage Cleanup Utility
 * Cleans up old storage data to prevent quota exceeded errors
 */

// Clean up old Supabase storage keys (from supabase-bo)
export const cleanupOldSupabaseStorage = () => {
  try {
    // Remove old supabase-bo storage keys
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('supabase.backoffice') || key.includes('supabase-bo'))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
        console.log('🧹 Removed old storage key:', key);
      } catch (error) {
        console.warn('Failed to remove storage key:', key, error);
      }
    });

    return keysToRemove.length;
  } catch (error) {
    console.error('Error cleaning up old Supabase storage:', error);
    return 0;
  }
};

// Get current storage usage
export const getStorageUsage = () => {
  try {
    let total = 0;
    const usage = {
      total: 0,
      byPrefix: {},
    };

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        const size = new Blob([value]).size;
        total += size;

        // Group by prefix
        const prefix = key.split('_')[0] || 'other';
        usage.byPrefix[prefix] = (usage.byPrefix[prefix] || 0) + size;
      }
    }

    usage.total = total;
    return usage;
  } catch (error) {
    console.error('Error calculating storage usage:', error);
    return { total: 0, byPrefix: {} };
  }
};

// Clear expired caches
export const clearExpiredCaches = () => {
  try {
    const now = Date.now();
    let cleared = 0;

    // Clear expired image cache (24 hours)
    const IMAGE_CACHE_EXPIRY = 24 * 60 * 60 * 1000;
    Object.keys(localStorage)
      .filter(key => key.startsWith('img_cache_'))
      .forEach(key => {
        try {
          const item = JSON.parse(localStorage.getItem(key));
          if (item && item.timestamp && (now - item.timestamp > IMAGE_CACHE_EXPIRY)) {
            localStorage.removeItem(key);
            cleared++;
          }
        } catch {
          // Invalid cache entry, remove it
          localStorage.removeItem(key);
          cleared++;
        }
      });

    // Clear expired geocode cache (7 days)
    const GEOCODE_CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000;
    Object.keys(localStorage)
      .filter(key => key.startsWith('geocode_'))
      .forEach(key => {
        try {
          const item = JSON.parse(localStorage.getItem(key));
          if (item && item.timestamp && (now - item.timestamp > GEOCODE_CACHE_EXPIRY)) {
            localStorage.removeItem(key);
            cleared++;
          }
        } catch {
          // Invalid cache entry, remove it
          localStorage.removeItem(key);
          cleared++;
        }
      });

    return cleared;
  } catch (error) {
    console.error('Error clearing expired caches:', error);
    return 0;
  }
};

// Aggressive cleanup when storage is getting full
export const aggressiveCleanup = () => {
  try {
    let totalCleared = 0;

    // 1. Remove old Supabase storage (CRITICAL - do this first)
    totalCleared += cleanupOldSupabaseStorage();

    // 2. Clear ALL expired caches aggressively
    totalCleared += clearExpiredCaches();

    // 3. Clear oldest geocode cache entries (reduce from 7 days to 1 day)
    const geocodeEntries = [];
    Object.keys(localStorage)
      .filter(key => key.startsWith('geocode_'))
      .forEach(key => {
        try {
          const item = JSON.parse(localStorage.getItem(key));
          if (item && item.timestamp) {
            const age = Date.now() - item.timestamp;
            // Clear entries older than 1 day
            if (age > 24 * 60 * 60 * 1000) {
              localStorage.removeItem(key);
              totalCleared++;
            } else {
              geocodeEntries.push({ key, timestamp: item.timestamp });
            }
          }
        } catch {
          // Invalid entry, remove it
          localStorage.removeItem(key);
          totalCleared++;
        }
      });

    // If still many geocode entries, remove oldest 50%
    if (geocodeEntries.length > 10) {
      geocodeEntries.sort((a, b) => a.timestamp - b.timestamp);
      const toRemove = Math.floor(geocodeEntries.length / 2);
      geocodeEntries.slice(0, toRemove).forEach(({ key }) => {
        localStorage.removeItem(key);
        totalCleared++;
      });
    }

    // 4. Clear oldest image cache entries
    const imageCacheEntries = [];
    Object.keys(localStorage)
      .filter(key => key.startsWith('img_cache_'))
      .forEach(key => {
        try {
          const item = JSON.parse(localStorage.getItem(key));
          if (item && item.timestamp) {
            imageCacheEntries.push({ key, timestamp: item.timestamp });
          }
        } catch {
          // Invalid entry, remove it
          localStorage.removeItem(key);
          totalCleared++;
        }
      });

    // Sort by timestamp (oldest first) and remove oldest 50%
    if (imageCacheEntries.length > 20) {
      imageCacheEntries.sort((a, b) => a.timestamp - b.timestamp);
      const toRemove = Math.floor(imageCacheEntries.length / 2);
      imageCacheEntries.slice(0, toRemove).forEach(({ key }) => {
        localStorage.removeItem(key);
        totalCleared++;
      });
    }

    // 5. Clear any other non-essential cache entries
    const nonEssentialKeys = Object.keys(localStorage).filter(key => 
      !key.startsWith('supabase.main.auth') && 
      !key.startsWith('img_cache_') && 
      !key.startsWith('geocode_') &&
      key !== 'isExistingUser' &&
      key !== 'pwa_install_dismissed'
    );
    
    // Remove oldest 25% of non-essential entries
    if (nonEssentialKeys.length > 20) {
      const toRemove = Math.floor(nonEssentialKeys.length / 4);
      nonEssentialKeys.slice(0, toRemove).forEach(key => {
        try {
          localStorage.removeItem(key);
          totalCleared++;
        } catch {}
      });
    }

    if (totalCleared > 0) {
      console.log(`🧹 Aggressive cleanup: Removed ${totalCleared} items`);
    }
    return totalCleared;
  } catch (error) {
    console.error('Error during aggressive cleanup:', error);
    // Last resort: try to clear everything except Supabase auth
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (!key.startsWith('supabase.main.auth')) {
          try {
            localStorage.removeItem(key);
          } catch {}
        }
      });
    } catch {}
    return 0;
  }
};

// Check storage quota and cleanup if needed
export const checkAndCleanupStorage = () => {
  try {
    // Always clean up old Supabase storage first (this is critical)
    cleanupOldSupabaseStorage();
    
    const usage = getStorageUsage();
    const maxStorage = 5 * 1024 * 1024; // 5MB (typical localStorage limit)
    const usagePercent = (usage.total / maxStorage) * 100;

    // Only log if storage is getting high to avoid console spam
    if (usagePercent > 50) {
      console.log('📊 Storage usage:', {
        total: `${(usage.total / 1024).toFixed(2)} KB`,
        percent: `${usagePercent.toFixed(1)}%`,
        breakdown: Object.entries(usage.byPrefix).map(([prefix, size]) => ({
          prefix,
          size: `${(size / 1024).toFixed(2)} KB`,
        })),
      });
    }

    // If storage is more than 80% full, do aggressive cleanup
    if (usagePercent > 80) {
      console.warn('⚠️ Storage is getting full, performing aggressive cleanup...');
      aggressiveCleanup();
    } else if (usagePercent > 60) {
      // If more than 60% full, clear expired caches
      clearExpiredCaches();
    } else {
      // Even if not full, clear expired caches periodically
      clearExpiredCaches();
    }
  } catch (error) {
    console.error('Error checking storage:', error);
    // If checking fails, try aggressive cleanup anyway
    try {
      aggressiveCleanup();
    } catch (cleanupError) {
      console.error('Error during fallback cleanup:', cleanupError);
    }
  }
};

