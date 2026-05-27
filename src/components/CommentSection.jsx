import { useState, useEffect, useCallback } from 'react'

// ─── Supabase check ──────────────────────────────────
const isSupabaseReady = typeof window !== 'undefined' &&
  window.__SUPABASE_URL__ &&
  window.__SUPABASE_ANON_KEY__

let supabase = null
if (isSupabaseReady) {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    supabase = createClient(window.__SUPABASE_URL__, window.__SUPABASE_ANON_KEY__)
  } catch (e) {
    console.warn('Supabase init failed:', e)
  }
}

// ─── Comment Section ─────────────────────────────────
export default function CommentSection({ articleSlug }) {
  const [user, setUser] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Load comments
  const loadComments = useCallback(async () => {
    if (!supabase) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('id, content, created_at, profiles(display_name, avatar_url)')
        .eq('article_slug', articleSlug)
        .order('created_at', { ascending: true })
      if (!error && data) setComments(data)
    } catch (e) {
      console.warn('Failed to load comments:', e)
    }
    setLoading(false)
  }, [articleSlug])

  useEffect(() => {
    if (!supabase) return
    loadComments()
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [loadComments])

  // Google OAuth sign in
  const signInWithGoogle = async () => {
    if (!supabase) return
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + window.location.pathname,
      },
    })
    if (error) console.error('OAuth error:', error)
  }

  const signOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setUser(null)
  }

  // Submit comment
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newComment.trim() || !user || !supabase) return
    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          article_slug: articleSlug,
          user_id: user.id,
          content: newComment.trim(),
        })
      if (!error) {
        setNewComment('')
        loadComments()
      }
    } catch (e) {
      console.error('Comment submit error:', e)
    }
    setSubmitting(false)
  }

  // ─── No Supabase → show placeholder ──────────────
  if (!supabase) {
    return (
      <div className="mb-12 p-6 rounded-2xl bg-gray-50 border border-gray-100 text-center">
        <span className="text-2xl">💬</span>
        <p className="text-sm text-gray-500 mt-2">
          Comments coming soon — Google sign-in will be available once Supabase is configured.
        </p>
      </div>
    )
  }

  return (
    <div className="mb-12">
      {/* Section header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-800">
          💬 Comments {comments.length > 0 && <span className="text-violet-500">({comments.length})</span>}
        </h3>
        {user && (
          <button
            onClick={signOut}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Sign out
          </button>
        )}
      </div>

      {/* Auth gate or comment form */}
      {!user ? (
        <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 text-center">
          <p className="text-sm text-gray-500 mb-4">Sign in with Google to join the discussion.</p>
          <button
            onClick={signInWithGoogle}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all text-sm font-medium text-gray-700"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex items-start gap-3">
            {user.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="" className="w-9 h-9 rounded-full shrink-0" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center text-sm font-bold text-violet-600 shrink-0">
                {(user.user_metadata?.full_name || 'U')[0]}
              </div>
            )}
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none resize-none text-sm text-gray-700 placeholder:text-gray-400 transition-all"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-400">
                  Commenting as <strong className="text-gray-600">{user.user_metadata?.full_name || user.email}</strong>
                </span>
                <button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className="px-4 py-1.5 rounded-full bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {submitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Comment list */}
      {loading ? (
        <div className="text-center py-6 text-sm text-gray-400">Loading comments...</div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">No comments yet. Be the first to share your thoughts.</p>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-50">
              {c.profiles?.avatar_url ? (
                <img src={c.profiles.avatar_url} alt="" className="w-8 h-8 rounded-full shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-600 shrink-0">
                  {(c.profiles?.display_name || 'A')[0]}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-700">
                    {c.profiles?.display_name || 'Anonymous'}
                  </span>
                  <time className="text-xs text-gray-400">{formatDate(c.created_at)}</time>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
}
