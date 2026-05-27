// Supabase client — gracefully degrades when env vars are missing
// Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable comments/auth

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || null
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || null

export const isSupabaseReady = !!(SUPABASE_URL && SUPABASE_ANON_KEY)

// Expose for CommentSection (avoids top-level await in SSR-sensitive contexts)
if (typeof window !== 'undefined') {
  window.__SUPABASE_URL__ = SUPABASE_URL
  window.__SUPABASE_ANON_KEY__ = SUPABASE_ANON_KEY
}

export default null
