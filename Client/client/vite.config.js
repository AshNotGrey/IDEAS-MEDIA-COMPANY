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
      includeAssets: [
        'idealphotography-favicon.png',
        'idealphotography-apple-touch-icon.png',
        'robots.txt',
        'icons/idealphotography-logo-72x72.png',
        'icons/idealphotography-logo-96x96.png',
        'icons/idealphotography-logo-128x128.png',
        'icons/idealphotography-logo-144x144.png',
        'icons/idealphotography-logo-152x152.png',
        'icons/idealphotography-logo-192x192.png',
        'icons/idealphotography-logo-384x384.png',
        'icons/idealphotography-logo-512x512.png'
      ],
      manifest: {
        name: 'IDEAS MEDIA COMPANY',
        short_name: 'IDEAS',
        description: 'IDEAS MEDIA COMPANY cross-platform application - Professional photography equipment rentals, makeover services, photoshoot services, event coverage, mini mart, and more',
        theme_color: '#A24CF3',
        background_color: '#FFFFFF',
        display: 'standalone',
        start_url: '/',
        lang: 'en',
        id: '/',
        orientation: 'portrait',
        scope: '/',
        icons: [
          {
            src: '/icons/idealphotography-logo-72x72.png',
            sizes: '72x72',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/idealphotography-logo-96x96.png',
            sizes: '96x96',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/idealphotography-logo-128x128.png',
            sizes: '128x128',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/idealphotography-logo-144x144.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/idealphotography-logo-152x152.png',
            sizes: '152x152',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/idealphotography-logo-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/idealphotography-logo-384x384.png',
            sizes: '384x384',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/idealphotography-logo-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        screenshots: [
          {
            src: '/screenshots/idealphotography-desktop-wide.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'IDEAS MEDIA COMPANY Desktop View'
          },
          {
            src: '/screenshots/idealphotography-mobile-portrait.png',
            sizes: '390x844',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'IDEAS MEDIA COMPANY Mobile View'
          }
        ],
        categories: ['photography', 'rentals', 'makeover', 'photoshoot', 'event', 'mini mart'],
        shortcuts: [
          {
            name: 'Equipment Rentals',
            short_name: 'Equipment',
            description: 'Rent equipment',
            url: '/equipment',
            icons: [
              {
                src: '/icons/idealphotography-logo-96x96.png',
                sizes: '96x96'
              }
            ]
          },
          {
            name: 'Book Photoshoot',
            short_name: 'Photoshoot',
            description: 'Book a photoshoot',
            url: '/photoshoot',
            icons: [
              {
                src: '/icons/idealphotography-logo-96x96.png',
                sizes: '96x96'
              }
            ]
          },
          {
            name: 'Book Makeover',
            short_name: 'Makeover',
            description: 'Book a makeover',
            url: '/makeover',
            icons: [
              {
                src: '/icons/idealphotography-logo-96x96.png',
                sizes: '96x96'
              }
            ]
          }
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
  build: {
    // Optimize chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-apollo': ['@apollo/client', 'graphql'],
          'vendor-ui': ['@material-tailwind/react', 'framer-motion', 'gsap'],
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'vendor-utils': ['clsx', 'classnames', 'prop-types'],
          
          // Feature chunks
          'auth': [
            './src/components/auth/signIn.jsx',
            './src/components/auth/signUp.jsx',
            './src/components/auth/forgotPassword.jsx',
            './src/components/auth/resetPassword.jsx',
            './src/components/auth/emailVerification.jsx',
            './src/components/auth/idVerification.jsx'
          ],
          'dashboard': [
            './src/pages/Dashboard.jsx',
            './src/pages/Settings.jsx',
            './src/pages/History.jsx',
            './src/pages/Notifications.jsx'
          ],
          'booking': [
            './src/pages/EquipmentRentals.jsx',
            './src/pages/MakeoverBookings.jsx',
            './src/pages/PhotoshootBookings.jsx',
            './src/pages/EventCoverage.jsx'
          ],
          'shopping': [
            './src/pages/MiniMart.jsx',
            './src/pages/Cart.jsx',
            './src/pages/Checkout.jsx',
            './src/pages/Wishlist.jsx'
          ]
        }
      }
    },
    // Enable source maps for production debugging
    sourcemap: false,
    // Optimize assets
    assetsInlineLimit: 4096, // 4kb
    // Minimize CSS
    cssMinify: true,
    // Target modern browsers for better optimization
    target: ['es2020', 'chrome80', 'firefox78', 'safari14'],
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true
      }
    }
  },
  // Performance optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@apollo/client',
      'graphql',
      '@material-tailwind/react',
      'framer-motion',
      'gsap'
    ]
  },
  server: {
    // Improve dev server performance
    fs: {
      cachedChecks: false
    }
  }
})
