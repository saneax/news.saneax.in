export default function Footer() {
  return (
    <footer className="border-t border-violet-100 bg-white/50 backdrop-blur-sm mt-12">
      <div className="container mx-auto px-4 max-w-5xl py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-violet-500">
          <div className="flex items-center gap-2">
            <span>📰</span>
            <span>news.saneax.in — Edited by Arjun Mehra</span>
          </div>
          <div className="flex gap-4">
            <span>Sharp analysis. Independent voice.</span>
            <span className="text-orange-400">•</span>
            <span>Good over evil.</span>
          </div>
        </div>
        <div className="text-center mt-4 text-xs text-violet-300">
          Published by saneax.
        </div>
      </div>
    </footer>
  )
}
