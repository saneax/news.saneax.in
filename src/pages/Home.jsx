import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getAllArticles } from '../lib/articles'

export default function Home() {
  const [articles, setArticles] = useState([])

  useEffect(() => {
    getAllArticles().then(setArticles)
  }, [])

  // Split: featured (first with image) + rest
  const featured = articles.find(a => a.featuredImage)
  const rest = articles.filter(a => a.slug !== featured?.slug)
  const withImages = rest.filter(a => a.featuredImage)
  const withoutImages = rest.filter(a => !a.featuredImage)

  return (
    <div>
      {/* Featured Hero */}
      {featured && (
        <Link to={`/${featured.slug}`} className="group block mb-12">
          <div className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-[21/9]">
            <img
              src={featured.featuredImage}
              alt={featured.title}
              className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-500 text-white font-semibold uppercase tracking-wider">
                  Featured
                </span>
                {featured.readingTime && (
                  <span className="text-xs text-white/70">{featured.readingTime} min read</span>
                )}
              </div>
              <h2 className="text-2xl md:text-4xl font-black text-white leading-tight mb-2 group-hover:text-orange-200 transition-colors">
                {featured.title}
              </h2>
              {featured.subtitle && (
                <p className="text-sm md:text-base text-white/80 line-clamp-2 max-w-3xl">
                  {featured.subtitle}
                </p>
              )}
              <div className="flex items-center gap-3 mt-3 text-xs text-white/60">
                <time>{formatDate(featured.publishedAt)}</time>
                <span>•</span>
                <span>By <strong className="text-white/80">Arjun Mehra</strong></span>
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Articles with images — magazine grid */}
      {withImages.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-violet-200 to-transparent" />
            <h3 className="text-sm font-bold text-violet-500 uppercase tracking-widest">Latest</h3>
            <div className="h-px flex-1 bg-gradient-to-l from-violet-200 to-transparent" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {withImages.map((article) => (
              <Link
                key={article.slug}
                to={`/${article.slug}`}
                className="group block"
              >
                <article className="h-full bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-orange-200">
                  <div className="aspect-[16/10] overflow-hidden bg-gray-100">
                    <img
                      src={article.featuredImage}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      {article.readingTime && (
                        <span className="text-xs text-gray-400">{article.readingTime} min</span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-violet-700 transition-colors line-clamp-2 mb-2">
                      {article.title}
                    </h3>
                    {article.subtitle && (
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {article.subtitle}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                      <time className="text-xs text-gray-400">{formatDate(article.publishedAt)}</time>
                      <span className="text-xs font-medium text-violet-500 group-hover:text-orange-500 transition-colors">
                        Read →
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Articles without images — compact list */}
      {withoutImages.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent" />
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">More from Arjun</h3>
            <div className="h-px flex-1 bg-gradient-to-l from-gray-200 to-transparent" />
          </div>
          <div className="divide-y divide-gray-100">
            {withoutImages.map((article) => (
              <Link
                key={article.slug}
                to={`/${article.slug}`}
                className="group flex items-start justify-between py-4 gap-4"
              >
                <div>
                  <h3 className="text-base font-semibold text-gray-800 group-hover:text-violet-700 transition-colors">
                    {article.title}
                  </h3>
                  {article.subtitle && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">{article.subtitle}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <time className="text-xs text-gray-400">{formatDate(article.publishedAt)}</time>
                    {article.readingTime && (
                      <span className="text-xs text-gray-400">• {article.readingTime} min</span>
                    )}
                  </div>
                </div>
                <span className="text-sm font-medium text-violet-400 group-hover:text-orange-500 transition-colors shrink-0 mt-1">
                  →
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* No articles */}
      {articles.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-violet-500 text-lg">No articles published yet.</p>
          <p className="text-violet-300 text-sm mt-2">Check back soon.</p>
        </div>
      )}

      {/* CTA */}
      {articles.length > 0 && (
        <div className="text-center py-8 px-6 rounded-2xl bg-gradient-to-br from-violet-50 via-white to-orange-50 border border-violet-100">
          <p className="text-violet-600 text-sm">
            <strong>Have a story tip?</strong> Send it to Sanbot and Arjun will investigate.
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
    month: 'short',
    day: 'numeric',
  })
}
