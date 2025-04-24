import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SECOND_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SECOND_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Second Supabase environment variables");
}

export const backOfficeSupabase = createClient(supabaseUrl, supabaseAnonKey);
