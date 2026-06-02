import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SERVICE_ROLE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

export default function Admin() {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all | visible | hidden
  const [articleFilter, setArticleFilter] = useState('all')
  const [error, setError] = useState('')
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')

  // Simple admin auth — service role key acts as password
  const tryAuth = (e) => {
    e.preventDefault()
    if (password === SERVICE_ROLE_KEY) {
      setAuthed(true)
      sessionStorage.setItem('admin_auth', '1')
    } else {
      setError('Invalid key')
    }
  }

  useEffect(() => {
    if (sessionStorage.getItem('admin_auth') === '1') setAuthed(true)
  }, [])

  const loadComments = useCallback(async () => {
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      setError('Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY.')
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/comments?select=id,article_slug,content,created_at,is_hidden,hidden_reason,profiles(display_name,email)&order=created_at.desc&limit=200`,
        {
          headers: {
            apikey: SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          },
        }
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setComments(data)
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (authed) loadComments()
  }, [authed, loadComments])

  const toggleHide = async (id, currentlyHidden) => {
    const body = currentlyHidden
      ? { is_hidden: false, hidden_reason: null, hidden_at: null }
      : { is_hidden: true, hidden_reason: 'Admin moderated', hidden_at: new Date().toISOString() }

    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/comments?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setComments(prev => prev.map(c => c.id === id ? { ...c, ...body } : c))
    } catch (e) {
      setError(e.message)
    }
  }

  const deleteComment = async (id) => {
    if (!confirm('Permanently delete this comment?')) return
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/comments?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setComments(prev => prev.filter(c => c.id !== id))
    } catch (e) {
      setError(e.message)
    }
  }

  // Auth gate
  if (!authed) {
    return (
      <div className="max-w-sm mx-auto py-20">
        <h2 className="text-xl font-bold text-gray-800 mb-4">🔒 Admin Access</h2>
        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
        <form onSubmit={tryAuth}>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Service role key"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm mb-3"
          />
          <button type="submit" className="w-full py-2.5 rounded-full bg-violet-600 text-white text-sm font-medium hover:bg-violet-700">
            Enter
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-3 text-center">Contact admin for access key</p>
      </div>
    )
  }

  // Filtering
  const articles = [...new Set(comments.map(c => c.article_slug))]
  let filtered = comments
  if (filter === 'visible') filtered = filtered.filter(c => !c.is_hidden)
  if (filter === 'hidden') filtered = filtered.filter(c => c.is_hidden)
  if (articleFilter !== 'all') filtered = filtered.filter(c => c.article_slug === articleFilter)

  const hiddenCount = comments.filter(c => c.is_hidden).length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          🛡️ Comment Moderation
        </h2>
        <Link to="/" className="text-sm text-violet-600 hover:text-violet-700">← Back to site</Link>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
          {error}
          <button onClick={() => setError('')} className="ml-2 underline">dismiss</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-center">
          <p className="text-2xl font-bold text-gray-800">{comments.length}</p>
          <p className="text-xs text-gray-400">Total</p>
        </div>
        <div className="p-4 rounded-xl bg-green-50 border border-green-100 text-center">
          <p className="text-2xl font-bold text-green-600">{comments.length - hiddenCount}</p>
          <p className="text-xs text-gray-400">Visible</p>
        </div>
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-center">
          <p className="text-2xl font-bold text-red-500">{hiddenCount}</p>
          <p className="text-xs text-gray-400">Hidden</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {['all', 'visible', 'hidden'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === f
                ? 'bg-violet-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <select
          value={articleFilter}
          onChange={e => setArticleFilter(e.target.value)}
          className="px-3 py-1.5 rounded-full text-xs border border-gray-200 bg-white"
        >
          <option value="all">All articles</option>
          {articles.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <button
          onClick={loadComments}
          className="px-3 py-1.5 rounded-full text-xs bg-gray-100 text-gray-600 hover:bg-gray-200"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Comment list */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No comments found.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => (
            <div
              key={c.id}
              className={`p-4 rounded-xl border ${
                c.is_hidden
                  ? 'bg-red-50/50 border-red-100'
                  : 'bg-white border-gray-100'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-700">
                      {c.profiles?.display_name || 'Unknown'}
                    </span>
                    <span className="text-xs text-gray-400">{c.profiles?.email || ''}</span>
                    <span className="text-xs text-gray-400">
                      {formatDate(c.created_at)}
                    </span>
                    {c.is_hidden && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">
                        Hidden{c.hidden_reason ? `: ${c.hidden_reason}` : ''}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{c.content}</p>
                  <p className="text-xs text-gray-300 mt-1">
                    Article: <Link to={`/${c.article_slug}`} className="text-violet-500 hover:underline">{c.article_slug}</Link>
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => toggleHide(c.id, c.is_hidden)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      c.is_hidden
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                    }`}
                  >
                    {c.is_hidden ? 'Unhide' : 'Hide'}
                  </button>
                  <button
                    onClick={() => deleteComment(c.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
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
  return new Date(iso).toLocaleDateString('en-IN', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}
