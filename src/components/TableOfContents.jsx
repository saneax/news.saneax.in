import { useState, useEffect, useRef } from 'react'

export default function TableOfContents({ containerRef }) {
  const [headings, setHeadings] = useState([])
  const [activeId, setActiveId] = useState('')
  const [open, setOpen] = useState(false)
  const navRef = useRef(null)

  // Extract headings from the article body after render
  useEffect(() => {
    if (!containerRef?.current) return
    const articleBody = containerRef.current.querySelector('.article-body')
    if (!articleBody) return

    const elements = articleBody.querySelectorAll('h2, h3')
    const items = []
    elements.forEach((el, i) => {
      // Generate an ID if missing
      if (!el.id) {
        el.id = `heading-${i}-${el.textContent.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`
      }
      items.push({
        id: el.id,
        text: el.textContent.trim(),
        level: el.tagName === 'H2' ? 2 : 3,
      })
    })
    setHeadings(items)
  }, [containerRef])

  // Track active heading on scroll
  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-80px 0px -70% 0px' }
    )

    headings.forEach(h => {
      const el = document.getElementById(h.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [headings])

  if (headings.length < 2) return null

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveId(id)
    }
  }

  return (
    <div className="mb-8 rounded-2xl bg-violet-50/50 border border-violet-100 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left"
      >
        <span className="text-sm font-bold text-violet-700">
          📑 Table of Contents
        </span>
        <svg
          className={`w-4 h-4 text-violet-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <nav className="px-5 pb-4">
          <ul className="space-y-1">
            {headings.map(h => (
              <li key={h.id}>
                <button
                  onClick={() => scrollTo(h.id)}
                  className={`block text-left w-full text-sm py-1 transition-colors ${
                    h.level === 3 ? 'pl-4' : ''
                  } ${
                    activeId === h.id
                      ? 'text-violet-700 font-semibold'
                      : 'text-gray-500 hover:text-violet-600'
                  }`}
                >
                  {h.text}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  )
}
