import { useState, useEffect } from 'react'
import { supabase, isSupabaseReady } from '../lib/supabase'

export default function CommentSection({ articleSlug }) {
  const [comments, setComments] = useState([])
  const [body, setBody] = useState('')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)

  // Gracefully disable if Supabase is not configured
  if (!isSupabaseReady) {
    return null
  }

  // Check existing session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Load comments
  useEffect(() => {
    loadComments()
  }, [articleSlug])

  async function loadComments() {
    const { data } = await supabase
      .from('comments')
      .select('id, body, created_at, user_id')
      .eq('article_slug', articleSlug)
      .order('created_at', { ascending: true })

    if (data) {
      // Get user profiles for display names
      const userIds = [...new Set(data.map(c => c.user_id))]
      const profiles = {}
      for (const uid of userIds) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, avatar_url')
          .eq('id', uid)
          .single()
        profiles[uid] = profile || {}
      }

      setComments(data.map(c => ({
        ...c,
        displayName: profiles[c.user_id]?.display_name || 'Anonymous',
        avatarUrl: profiles[c.user_id]?.avatar_url || null,
      })))
    }
  }

  async function handleLogin() {
    setAuthLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.href,
      },
    })
    if (error) {
      alert('Login failed: ' + error.message)
    }
    setAuthLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!body.trim()) return

    setLoading(true)
    const { error } = await supabase
      .from('comments')
      .insert({
        article_slug: articleSlug,
        user_id: user.id,
        body: body.trim(),
      })

    if (error) {
      alert('Failed to post comment: ' + error.message)
    } else {
      setBody('')
      await loadComments()
    }
    setLoading(false)
  }

  return (
    <div className="border-t border-violet-100 pt-8">
      <h3 className="text-lg font-bold text-violet-800 mb-6">
        💬 Comments ({comments.length})
      </h3>

      {/* Comment form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            {user.user_metadata?.avatar_url && (
              <img
                src={user.user_metadata.avatar_url}
                alt=""
                className="w-8 h-8 rounded-full"
              />
            )}
            <span className="text-sm font-medium text-violet-700">
              {user.user_metadata?.full_name || user.email}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs text-violet-400 hover:text-red-500 transition-colors"
            >
              (sign out)
            </button>
          </div>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Add your comment..."
            rows={3}
            className="w-full p-3 rounded-lg border border-violet-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 outline-none transition-all resize-none text-sm"
          />
          <button
            type="submit"
            disabled={loading || !body.trim()}
            className="mt-2 px-6 py-2 rounded-full bg-gradient-to-r from-violet-600 to-violet-700 text-white font-medium text-sm hover:from-violet-700 hover:to-violet-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      ) : (
        <div className="mb-8 p-4 rounded-lg bg-gradient-to-r from-violet-50 to-orange-50 border border-violet-100 text-center">
          <p className="text-sm text-violet-600 mb-3">
            Sign in to join the discussion
          </p>
          <button
            onClick={handleLogin}
            disabled={authLoading}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-violet-300 text-violet-700 font-medium text-sm hover:bg-violet-50 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>
        </div>
      )}

      {/* Comments list */}
      {comments.length === 0 ? (
        <p className="text-center text-violet-300 text-sm py-8">
          No comments yet. Be the first to share your thoughts.
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <div key={comment.id} className="flex gap-3 p-4 rounded-lg bg-white border border-violet-50 hover:border-violet-100 transition-colors">
              <div className="flex-shrink-0">
                {comment.avatarUrl ? (
                  <img src={comment.avatarUrl} alt="" className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-orange-400 flex items-center justify-center text-white text-xs font-bold">
                    {comment.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-violet-800">
                    {comment.displayName}
                  </span>
                  <time className="text-xs text-gray-400">
                    {new Date(comment.created_at).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </time>
                </div>
                <p className="text-sm text-gray-600">{comment.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
