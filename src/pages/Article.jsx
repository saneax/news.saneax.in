import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { getArticle } from '../lib/articles'
import CommentSection from '../components/CommentSection'

export default function Article() {
  const { slug } = useParams()
  const [article, setArticle] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    getArticle(slug).then(data => {
      if (data) {
        setArticle(data)
        document.title = `${data.title} — saneax news`
      } else {
        setNotFound(true)
      }
    })
  }, [slug])

  if (notFound) {
    return (
      <div className="text-center py-20">
        <span className="text-6xl">🔍</span>
        <h2 className="text-2xl font-bold text-violet-700 mt-4">Article not found</h2>
        <p className="text-violet-400 mt-2">ED hasn't written this one yet.</p>
        <Link
          to="/"
          className="inline-block mt-6 px-6 py-2 rounded-full bg-violet-600 text-white font-medium hover:bg-violet-700 transition-colors"
        >
          ← Back to articles
        </Link>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="text-center py-20">
        <div className="animate-pulse text-4xl">🦅</div>
        <p className="text-violet-400 mt-4">Loading article...</p>
      </div>
    )
  }

  return (
    <article className="max-w-3xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${
            article.confidence >= 0.85
              ? 'bg-green-100 text-green-700'
              : article.confidence >= 0.6
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-red-100 text-red-700'
          }`}>
            Confidence: {(article.confidence * 100).toFixed(0)}%
          </span>
          {article.seedVideo && (
            <a
              href={article.seedVideo}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1 rounded-full bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors"
            >
              📺 Seed Video
            </a>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-violet-900 leading-tight mb-4">
          {article.title}
        </h1>

        <div className="flex items-center gap-4 text-sm text-violet-400 border-b border-violet-100 pb-4">
          <time>{formatDate(article.publishedAt)}</time>
          <span>•</span>
          <span>By <strong className="text-violet-600">ED</strong> 🦅</span>
          <span>•</span>
          <span>Directed by <strong className="text-orange-500">saneax</strong></span>
        </div>
      </header>

      {/* Article body */}
      <div className="article-body mb-12">
        <ReactMarkdown>{article.body}</ReactMarkdown>
      </div>

      {/* Sources */}
      {article.sources && article.sources.length > 0 && (
        <div className="mb-12 p-6 rounded-xl bg-violet-50 border border-violet-100">
          <h3 className="text-sm font-bold text-violet-700 uppercase tracking-wide mb-3">
            📚 Sources
          </h3>
          <ul className="space-y-2">
            {article.sources.map((src, i) => (
              <li key={i}>
                <a
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-violet-600 hover:text-orange-500 transition-colors break-all"
                >
                  {src}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Comments */}
      <CommentSection articleSlug={slug} />

      {/* Back */}
      <div className="mt-12 text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-violet-100 text-violet-700 font-medium hover:bg-violet-200 transition-colors"
        >
          ← Back to all articles
        </Link>
      </div>
    </article>
  )
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
