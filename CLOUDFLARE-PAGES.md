# Cloudflare Pages Deployment — news.saneax.in

This repo is Cloudflare Pages–ready. The React/Vite app builds to `dist/`, and a
Vite build hook copies `src/content/` into `dist/content/` so the runtime content
API (`/content/index.json`, `/content/{slug}.md`, `/content/images/*`) is served
straight from the static output — no nginx volume mount required.

## Pages project settings (set these in the Cloudflare dashboard)

| Setting              | Value                 |
|----------------------|-----------------------|
| Framework preset     | None (or `Vite`)      |
| Build command        | `npm run build`       |
| Build output directory | `dist`              |
| Root directory       | `/` (repo root)       |

`wrangler.jsonc` already pins `pages_build_output_dir: "dist"`.

## Environment variables (set in Pages → Settings → Variables, for Production and Preview)

These are build-time `VITE_*` vars (baked into the bundle at build), so they must
exist in the Pages build environment, not just at runtime:

| Variable                  | Where to get it                                  |
|---------------------------|--------------------------------------------------|
| `VITE_SUPABASE_URL`       | Supabase project URL (from the current `.env` / Supabase dashboard) |
| `VITE_SUPABASE_ANON_KEY`  | Supabase anon/public key (from the current `.env` / Supabase dashboard) |

> Do NOT commit these values. Copy them from the running deployment's `.env`
> (or the Supabase dashboard) directly into the Pages dashboard.

## SPA routing

`public/_redirects` contains the SPA fallback so React Router deep links resolve:

```
/*    /index.html   200
```

Vite copies `public/_redirects` into `dist/` on build; Pages reads it automatically.

## Migration notes (owner action required)

- Create the Pages project and connect this Git repo (or use `wrangler pages deploy dist`).
- The existing Docker + `cloudflared` tunnel setup (`docker-compose.yml`) stays untouched
  by this change and keeps working. Cut over DNS for `news.saneax.in` to Pages only after
  the Pages deploy is verified, then retire the tunnel.
- The tunnel token lives only in the (git-ignored) `.env` — keep it out of commits.
