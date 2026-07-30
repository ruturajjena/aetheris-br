import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command }) => ({
  // Production is served from https://<user>.github.io/aetheris-br/ — a
  // project page, not a root domain, so built asset URLs need this prefix.
  // The dev server stays at `/` so `npm run dev` is unaffected.
  base: command === 'build' ? '/aetheris-br/' : '/',
  plugins: [react(), tailwindcss()],
  server: {
    port: Number(process.env.PORT) || 5173,
    strictPort: !!process.env.PORT,
  },
  build: {
    target: 'es2020',
    assetsInlineLimit: 2048,
  },
}))
