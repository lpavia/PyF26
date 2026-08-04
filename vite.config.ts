import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const BASE = '/PyF26/'

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    VitePWA({
      // The service worker activates as soon as it is installed; the page is
      // never force-reloaded, so an update that lands mid-game only takes
      // effect the next time the app is opened.
      registerType: 'autoUpdate',
      injectRegister: 'script-defer',
      manifest: {
        id: BASE,
        name: 'Punto y Fama',
        short_name: 'Punto y Fama',
        description: 'Adivina el número secreto de 4 dígitos',
        lang: 'es',
        dir: 'ltr',
        start_url: BASE,
        scope: BASE,
        display: 'standalone',
        // Matches html/body and the App wrapper so the splash screen and the
        // standalone window chrome stay the same indigo as the game itself.
        background_color: '#1e1b4b',
        theme_color: '#1e1b4b',
        categories: ['games', 'puzzle', 'entertainment'],
        icons: [
          {
            // Relative to the manifest URL, so it resolves correctly under the
            // /PyF26/ base without hard-coding it here.
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
        // og.png only ever gets fetched by link-preview crawlers.
        globIgnores: ['**/og.png'],
        navigateFallback: `${BASE}index.html`,
        cleanupOutdatedCaches: true,
        // Take control on the first visit so the game is playable offline
        // straight away. Safe here because the app is a single bundle with no
        // lazily-loaded chunks and makes no network requests of its own.
        clientsClaim: true,
      },
      devOptions: {
        // Lets `npm run dev` serve a real service worker for PWA debugging.
        enabled: false,
        type: 'module',
      },
    }),
  ],
})
