import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { cpSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

// Copy src/content → dist/content after build so the content API
// (/content/index.json + /content/{slug}.md + /content/images/*) is served
// directly from the static build output. Needed for Cloudflare Pages, which
// (unlike the Docker/nginx setup) has no separate step to mount the content dir.
function copyContent() {
  return {
    name: 'copy-content',
    apply: 'build',
    closeBundle() {
      const src = resolve(__dirname, 'src/content')
      const dest = resolve(__dirname, 'dist/content')
      if (existsSync(src)) {
        cpSync(src, dest, { recursive: true })
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), copyContent()],
  build: {
    outDir: 'dist',
  },
})
