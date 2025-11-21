import { createClient } from "@supabase/supabase-js";
import { aggressiveCleanup } from "@/utils/storageCleanup";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// Custom storage adapter that handles quota errors gracefully
const createSafeStorage = () => {
  return {
    getItem: (key) => {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        if (error.name === 'QuotaExceededError' || error.message?.includes('quota')) {
          console.warn('Storage quota error on getItem, performing cleanup...');
          aggressiveCleanup();
          try {
            return localStorage.getItem(key);
          } catch {
            return null;
          }
        }
        return null;
      }
    },
    setItem: (key, value) => {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        if (error.name === 'QuotaExceededError' || error.message?.includes('quota')) {
          console.warn('Storage quota error on setItem, performing cleanup...');
          aggressiveCleanup();
          try {
            localStorage.setItem(key, value);
          } catch (retryError) {
            // If still failing, try to clear Supabase session storage and retry
            try {
              // Clear old session data
              Object.keys(localStorage)
                .filter(k => k.startsWith('supabase.') || k.includes('supabase'))
                .forEach(k => {
                  try {
                    localStorage.removeItem(k);
                  } catch {}
                });
              localStorage.setItem(key, value);
            } catch {
              // If all else fails, just log and continue
              console.warn('Unable to store session data, continuing without persistence');
            }
          }
        } else {
          throw error;
        }
      }
    },
    removeItem: (key) => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        // Ignore errors on remove
      }
    },
  };
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: "supabase.main.auth",
    storage: createSafeStorage(),
  },
});
