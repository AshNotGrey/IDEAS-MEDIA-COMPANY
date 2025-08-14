import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'IDEAS MEDIA COMPANY',
        short_name: 'IDEAS',
        description: 'IDEAS MEDIA COMPANY platform',
        theme_color: '#A24CF3',
        background_color: '#FFFFFF',
        display: 'standalone',
        start_url: '/',
        lang: 'en',
        icons: [
          { src: '/images/idealphotography-logo-main.jpg', sizes: '192x192', type: 'image/jpeg' },
          { src: '/images/idealphotography-logo-main.jpg', sizes: '512x512', type: 'image/jpeg' }
        ]
      },
      workbox: {
        navigateFallback: '/offline.html',
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,gif,webp,woff2}'],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.method === 'GET' && request.destination === 'document',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
            }
          },
          {
            urlPattern: ({ request }) => request.method === 'GET' && ['script', 'style', 'font'].includes(request.destination),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'assets',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 },
            }
          },
          {
            urlPattern: ({ url }) => url.origin === self.location.origin && url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 10 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: ({ url }) => url.hostname === 'res.cloudinary.com' || url.hostname === 'images.unsplash.com',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'images',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      },
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js'
    })
  ],
})
