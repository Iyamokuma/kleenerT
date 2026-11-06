import { createClient } from '@supabase/supabase-js';

const env = import.meta.env;
const url = env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY
  || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  || env.VITE_SUPABASE_ANON_KEY
  || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && key);

// Null until the env vars are set, so the booking form can fall back to email.
// Sessions persist so admins stay signed in to /admin.
export const supabase = isSupabaseConfigured
  ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })
  : null;
