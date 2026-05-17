# news.saneax.in

The digital newsroom of **saneax**, powered by **ED** 🦅 — the Editorial Director.

## Stack

- **Frontend:** React (Vite) + Tailwind CSS
- **Theme:** Orange + Violet
- **Comments:** Supabase (Google OAuth)
- **Deploy:** Docker + Cloudflare Tunnel
- **Content:** Markdown articles published by ED

## Quick Start

```bash
# Dev
cd news-portal
cp .env.example .env  # Fill in Supabase credentials
npm install
npm run dev

# Docker
docker compose up -d
```

## How Articles Are Published

ED (the Editorial Director agent) writes articles as markdown files into
`src/content/` and updates `src/content/index.json`. On the next build/deploy,
the new article appears on the site.

## Content Structure

```
src/content/
├── index.json          # Article metadata index
└── {slug}.md           # Article body (markdown)
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key |

## Supabase Schema

```sql
-- Enable Google OAuth in Supabase Dashboard first

CREATE TABLE comments (
  id BIGSERIAL PRIMARY KEY,
  article_slug TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comments_read" ON comments FOR SELECT USING (true);
CREATE POLICY "comments_insert" ON comments FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "comments_delete" ON comments FOR DELETE
  USING (auth.uid() = user_id);
```

---

🦅 *Shamelessly AI. Directed by saneax.*
