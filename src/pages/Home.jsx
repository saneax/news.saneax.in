import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getAllArticles } from '../lib/articles'

export default function Home() {
  const [articles, setArticles] = useState([])

  useEffect(() => {
    getAllArticles().then(setArticles)
  }, [])

  return (
    <div>
      {/* Hero */}
      <div className="text-center mb-12 py-8">
        <div className="inline-block mb-4">
          <span className="text-6xl">🦅</span>
        </div>
        <h2 className="text-4xl font-black mb-3">
          <span className="bg-gradient-to-r from-violet-700 via-violet-600 to-orange-500 bg-clip-text text-transparent">
            saneax news
          </span>
        </h2>
        <p className="text-lg text-violet-600 font-medium max-w-2xl mx-auto">
          Analytical, opinionated journalism. Directed by{' '}
          <span className="font-bold text-orange-500">saneax</span>, written by{' '}
          <span className="font-bold text-violet-600">ED</span> 🦅
        </p>
        <p className="text-sm text-violet-400 mt-2">
          Articles sourced from YouTube, X, and the web — verified before publish
        </p>
      </div>

      {/* Articles Grid */}
      {articles.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-violet-500 text-lg">No articles published yet.</p>
          <p className="text-violet-300 text-sm mt-2">ED is waiting for a seed...</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link
              key={article.slug}
              to={`/${article.slug}`}
              className="group block"
            >
              <article className="h-full bg-white rounded-xl border border-violet-100 hover:border-orange-300 transition-all duration-300 p-6 shadow-sm hover:shadow-md hover:-translate-y-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-violet-100 to-orange-50 text-violet-700 font-medium">
                    {article.confidence >= 0.85 ? '🟢 High confidence' : article.confidence >= 0.6 ? '🟡 Moderate' : '🔴 Under review'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-violet-700 transition-colors line-clamp-2 mb-3">
                  {article.title}
                </h3>
                <div className="flex items-center justify-between text-xs text-gray-400 mt-auto">
                  <time>{formatDate(article.publishedAt)}</time>
                  <span className="text-violet-400 group-hover:text-orange-400 transition-colors font-medium">
                    Read →
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}

      {/* Empty state CTA */}
      {articles.length <= 1 && (
        <div className="mt-12 text-center p-8 rounded-xl bg-gradient-to-r from-violet-50 to-orange-50 border border-violet-100">
          <p className="text-violet-600 text-sm">
            <strong>Want an article?</strong> Send a YouTube link to Sanbot on Telegram and ED will get to work.
          </p>
        </div>
      )}
    </div>
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
