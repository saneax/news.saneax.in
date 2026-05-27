// Supabase client — gracefully degrades when env vars are missing
// Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable comments/auth

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
export const isSupabaseReady = !!(SUPABASE_URL && SUPABASE_ANON_KEY)
