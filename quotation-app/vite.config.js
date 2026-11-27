import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

// One site, two pages:
//   /          customer showcase (index.html + site/)
//   /studio/   owner quotation app (studio/index.html + src/), passcode-protected
// The owner app is a single-page app, so in dev every /studio/* path is served its index.html
// (on Vercel the same is done by vercel.json).
const studioFallback = {
  name: 'studio-spa-fallback',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (req.url && /^\/studio(\/(?!src\/|@|node_modules)[^.]*)?$/.test(req.url.split('?')[0])) req.url = '/studio/index.html'
      next()
    })
  },
}

export default defineConfig({
  plugins: [react(), studioFallback],
  build: {
    rollupOptions: {
      input: {
        site: resolve(import.meta.dirname, 'index.html'),
        studio: resolve(import.meta.dirname, 'studio/index.html'),
      },
    },
  },
})
