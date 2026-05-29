import { useParams, Link } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { getArticle } from '../lib/articles'
import CommentSection from '../components/CommentSection'

export default function Article() {
  const { slug } = useParams()
  const [article, setArticle] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [readingProgress, setReadingProgress] = useState(0)
  const articleRef = useRef(null)

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

  // Reading progress bar
  useEffect(() => {
    if (!article) return
    const handleScroll = () => {
      const el = articleRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const total = el.scrollHeight - window.innerHeight
      const read = Math.max(0, -rect.top)
      setReadingProgress(Math.min(100, (read / total) * 100))
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [article])

  if (notFound) {
    return (
      <div className="text-center py-24">
        <span className="text-6xl">🔍</span>
        <h2 className="text-2xl font-bold text-violet-700 mt-4">Article not found</h2>
        <p className="text-violet-400 mt-2">This article hasn't been published yet.</p>
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
      <div className="text-center py-24">
        <div className="animate-pulse text-4xl">📰</div>
        <p className="text-violet-400 mt-4">Loading article...</p>
      </div>
    )
  }

  return (
    <>
      {/* Reading progress bar */}
      <div className="fixed top-16 left-0 right-0 z-40 h-0.5 bg-gray-100">
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-orange-500 transition-all duration-150"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <article ref={articleRef} className="max-w-3xl mx-auto">
        {/* Hero image */}
        {article.featuredImage && (
          <div className="relative rounded-2xl overflow-hidden mb-8 aspect-[21/9] bg-gray-100">
            <img
              src={article.featuredImage}
              alt={article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        )}

        {/* Header */}
        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {article.readingTime && (
              <span className="text-xs px-3 py-1 rounded-full bg-violet-50 text-violet-600 font-medium">
                {article.readingTime} min read
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 leading-tight mb-4">
            {article.title}
          </h1>

          {article.subtitle && (
            <p className="text-lg text-gray-500 leading-relaxed mb-4">
              {article.subtitle}
            </p>
          )}

          <div className="flex items-center gap-3 text-sm text-gray-400 border-b border-gray-100 pb-6">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold">
                AM
              </span>
              <span className="font-medium text-gray-600">Arjun Mehra</span>
            </div>
            <span>•</span>
            <time>{formatDate(article.publishedAt)}</time>
            <span>•</span>
            <span>Published by <strong className="text-orange-500">saneax</strong></span>
          </div>
        </header>

        {/* Article body */}
        <div className="article-body mb-12">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{article.body}</ReactMarkdown>
        </div>

        {/* Sources */}
        {article.sources && article.sources.length > 0 && (
          <div className="mb-12 p-6 rounded-2xl bg-gray-50 border border-gray-100">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">
              📚 Sources & References
            </h3>
            <ol className="space-y-2 list-decimal list-inside">
              {article.sources.map((src, i) => (
                <li key={i}>
                  <a
                    href={src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-violet-600 hover:text-orange-500 transition-colors break-all"
                  >
                    {cleanUrl(src)}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Comments */}
        <CommentSection articleSlug={slug} />

        {/* Back */}
        <div className="mt-12 text-center pb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gray-100 text-gray-700 font-medium hover:bg-violet-100 hover:text-violet-700 transition-colors"
          >
            ← All Articles
          </Link>
        </div>
      </article>
    </>
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

function cleanUrl(url) {
  try {
    const u = new URL(url)
    return u.hostname + (u.pathname === '/' ? '' : u.pathname)
  } catch {
    return url
  }
}
