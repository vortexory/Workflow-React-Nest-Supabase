import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_KEY as string;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true, // Ensure sessions are persisted
    autoRefreshToken: true, // Automatically refresh session tokens
    detectSessionInUrl: true, // Useful for OAuth flows
  },
});
