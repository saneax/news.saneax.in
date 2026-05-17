import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-orange-100 shadow-sm">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <span className="text-3xl">🦅</span>
            <div>
              <h1 className="text-xl font-extrabold bg-gradient-to-r from-violet-700 to-orange-500 bg-clip-text text-transparent">
                saneax news
              </h1>
              <p className="text-xs text-violet-400 -mt-1 font-medium">by ED</p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            {!isHome && (
              <Link
                to="/"
                className="text-sm font-medium text-violet-600 hover:text-orange-500 transition-colors"
              >
                ← All Articles
              </Link>
            )}
            <span className="text-xs px-3 py-1 rounded-full bg-violet-100 text-violet-700 font-medium">
              🦅 ED in the newsroom
            </span>
          </div>
        </div>
      </div>
    </nav>
  )
}
