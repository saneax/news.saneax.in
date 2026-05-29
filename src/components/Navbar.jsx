import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="text-2xl">📰</span>
            <div className="leading-tight">
              <h1 className="text-lg font-extrabold bg-gradient-to-r from-violet-700 to-orange-500 bg-clip-text text-transparent">
                saneax news
              </h1>
              <p className="text-[10px] text-gray-400 font-medium tracking-wide uppercase -mt-0.5">Arjun Mehra, Editor</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {!isHome && (
              <Link
                to="/"
                className="text-sm font-medium text-gray-500 hover:text-violet-600 transition-colors"
              >
                ← Back
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
