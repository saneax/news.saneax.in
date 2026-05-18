// Article loader — fetches from live content API at runtime
// No rebuild needed to publish new articles!

const CONTENT_BASE = import.meta.env.VITE_CONTENT_URL || '/content'

let indexCache = null
const bodyCache = {}

export async function getAllArticles() {
  if (indexCache && indexCache.ts > Date.now() - 5000) {
    return indexCache.data
  }
  try {
    const res = await fetch(`${CONTENT_BASE}/index.json?t=${Date.now()}`)
    const index = await res.json()
    indexCache = { data: index, ts: Date.now() }
    return [...index].sort((a, b) =>
      new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0)
    )
  } catch (e) {
    console.error('Failed to load article index', e)
    return indexCache?.data || []
  }
}

export async function getArticle(slug) {
  if (bodyCache[slug]) return bodyCache[slug]

  // Fetch metadata
  let meta = null
  if (indexCache?.data) {
    meta = indexCache.data.find(a => a.slug === slug)
  }
  if (!meta) {
    const articles = await getAllArticles()
    meta = articles.find(a => a.slug === slug)
  }
  if (!meta) return null

  // Fetch body
  try {
    const res = await fetch(`${CONTENT_BASE}/${slug}.md?t=${Date.now()}`)
    const raw = await res.text()
    const body = stripFrontmatter(raw)

    const article = { ...meta, body }
    bodyCache[slug] = article
    return article
  } catch (e) {
    console.error(`Failed to load article body for ${slug}`, e)
    return { ...meta, body: '' }
  }
}

function stripFrontmatter(raw) {
  if (!raw) return ''
  return raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n*/, '')
}
