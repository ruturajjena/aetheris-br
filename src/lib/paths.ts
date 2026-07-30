/**
 * Resolves a public-directory path against the app's base URL.
 *
 * Files under `public/` are served at the site root, but GitHub Pages serves
 * this project from `/aetheris-br/`, not `/`. Vite only rewrites paths it
 * processes itself (index.html, imported assets) — a plain string like
 * `/media/hero.mp4` passed to a React prop is invisible to that rewrite, so
 * every runtime reference to a public asset must go through this helper.
 */
export const asset = (path: string) =>
  `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`
