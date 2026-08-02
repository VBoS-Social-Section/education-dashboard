import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/education-dashboard/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'data/*.csv', 'data/years.json', 'annual-reports/*.pdf'],
      manifest: {
        name: 'Vanuatu Education Dashboard',
        short_name: 'Education',
        description: 'Enrolment, schools and teachers from MoET annual reports',
        theme_color: '#0d9488',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: './',
        icons: [
          { src: 'favicon.png', sizes: '88x88', type: 'image/png', purpose: 'any' },
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        globIgnores: ['**/pwa-192.png', '**/pwa-512.png'], // Large icons fetched on demand for install
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            // NetworkFirst (not CacheFirst): dashboard data changes with each report update.
            // Always try the network so visitors see fresh data; fall back to cache only when offline.
            urlPattern: /\/data\/.*\.(csv|json)$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'dashboard-data',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  publicDir: 'public',
})
