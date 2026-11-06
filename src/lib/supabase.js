import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Null until the env vars are set, so the booking form can fall back to email.
export const supabase = url && anonKey
  ? createClient(url, anonKey, { auth: { persistSession: false } })
  : null;
