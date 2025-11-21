// Track last geocoding request time to respect rate limits
let lastGeocodeTime = 0;
const MIN_TIME_BETWEEN_REQUESTS = 1100; // 1.1 seconds (slightly more than 1 second to be safe)

/**
 * Geocode an address to get latitude and longitude coordinates
 * Uses OpenStreetMap Nominatim API (free, no API key required)
 * Respects rate limits (1 request per second)
 * 
 * @param {string} address - The address to geocode
 * @returns {Promise<{lat: number, lng: number} | null>} Coordinates or null if geocoding fails
 */
export async function geocodeAddress(address) {
  if (!address || typeof address !== "string" || address.trim() === "") {
    return null;
  }

  try {
    // Respect rate limits - wait if needed
    const now = Date.now();
    const timeSinceLastRequest = now - lastGeocodeTime;
    
    if (timeSinceLastRequest < MIN_TIME_BETWEEN_REQUESTS) {
      const waitTime = MIN_TIME_BETWEEN_REQUESTS - timeSinceLastRequest;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    // Use OpenStreetMap Nominatim API (free, no API key required)
    const encodedAddress = encodeURIComponent(address);
    // Add country code for better results (Malaysia)
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&countrycodes=my&limit=1`;

    lastGeocodeTime = Date.now();

    const response = await fetch(url, {
      headers: {
        "User-Agent": "FoodHunterApp/1.0", // Required by Nominatim
      },
    });

    if (!response.ok) {
      console.error("Geocoding API error:", response.statusText);
      return null;
    }

    const data = await response.json();

    if (data && data.length > 0) {
      const result = data[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
      };
    }

    return null;
  } catch (error) {
    // Only log if it's not a network error (to reduce console noise)
    if (error.name !== 'TypeError' || !error.message.includes('fetch')) {
    console.error("Error geocoding address:", error);
    }
    return null;
  }
}

/**
 * Geocode an address with caching to avoid repeated API calls
 * Uses localStorage to cache results
 * 
 * @param {string} address - The address to geocode
 * @returns {Promise<{lat: number, lng: number} | null>} Coordinates or null if geocoding fails
 */
export async function geocodeAddressWithCache(address) {
  if (!address || typeof address !== "string" || address.trim() === "") {
    return null;
  }

  // Check cache first
  const cacheKey = `geocode_${address}`;
  let cached = null;
  
  try {
    cached = localStorage.getItem(cacheKey);
  } catch (error) {
    // If we can't read from localStorage, continue without cache
    console.warn("Failed to read from localStorage:", error);
  }
  
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      // Cache is valid for 7 days
      const cacheAge = Date.now() - parsed.timestamp;
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
      
      if (cacheAge < maxAge) {
        return parsed.coordinates;
      }
    } catch (error) {
      // Invalid cache, continue to geocode
    }
  }

  // Geocode the address
  const coordinates = await geocodeAddress(address);

  // Cache the result (only if we have coordinates)
  if (coordinates) {
    try {
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          coordinates,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      // localStorage might be full or unavailable, continue anyway
      if (error.name === 'QuotaExceededError' || error.message?.includes('quota') || 
          error.message?.includes('QuotaExceeded')) {
        console.warn("Storage quota exceeded, clearing old geocode cache...");
        // Clear old geocode cache entries aggressively
        try {
          const keys = Object.keys(localStorage).filter(key => key.startsWith('geocode_'));
          const maxAge = 3 * 24 * 60 * 60 * 1000; // Reduce to 3 days for more aggressive cleanup
          const now = Date.now();
          let cleared = 0;
          
          keys.forEach(key => {
            try {
              const item = JSON.parse(localStorage.getItem(key));
              if (item && item.timestamp && (now - item.timestamp > maxAge)) {
                localStorage.removeItem(key);
                cleared++;
              }
            } catch {
              // Invalid entry, remove it
              localStorage.removeItem(key);
              cleared++;
            }
          });
          
          // If still can't store, clear even more aggressively (oldest 50%)
          if (cleared === 0 && keys.length > 0) {
            const entries = keys.map(key => {
              try {
                const item = JSON.parse(localStorage.getItem(key));
                return { key, timestamp: item?.timestamp || 0 };
              } catch {
                return { key, timestamp: 0 };
              }
            }).sort((a, b) => a.timestamp - b.timestamp);
            
            const toRemove = Math.floor(entries.length / 2);
            entries.slice(0, toRemove).forEach(({ key }) => {
              localStorage.removeItem(key);
            });
          }
          
          // Try one more time (but don't fail if it still doesn't work)
          try {
            localStorage.setItem(
              cacheKey,
              JSON.stringify({
                coordinates,
                timestamp: Date.now(),
              })
            );
          } catch {
            // If it still fails, just continue without caching
            console.warn("Still unable to cache after cleanup, continuing without cache");
          }
        } catch (cleanupError) {
          console.warn("Failed to cleanup geocode cache:", cleanupError);
        }
      } else {
      console.warn("Failed to cache geocoding result:", error);
      }
    }
  }

  return coordinates;
}

