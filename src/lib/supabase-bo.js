import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SECOND_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SECOND_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase BO environment variables");
}

export const backOfficeSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false, // usually false for secondary clients
    storageKey: "supabase.backoffice.auth",
  },
});
