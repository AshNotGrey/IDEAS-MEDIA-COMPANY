import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: 'auto',
            includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
            manifest: {
                name: 'IDEAS MEDIA COMPANY - Admin',
                short_name: 'IDEAS Admin',
                description: 'Administrative PWA for IDEAS MEDIA COMPANY',
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
                        options: { cacheName: 'admin-pages', expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 } }
                    },
                    {
                        urlPattern: ({ request }) => request.method === 'GET' && ['script', 'style', 'font'].includes(request.destination),
                        handler: 'StaleWhileRevalidate',
                        options: { cacheName: 'admin-assets', expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 } }
                    }
                ]
            },
            strategies: 'injectManifest',
            srcDir: 'src',
            filename: 'sw.js'
        })
    ],
    build: {
        // Optimize chunk splitting for admin app
        rollupOptions: {
            output: {
                manualChunks: {
                    // Vendor chunks
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                    'vendor-apollo': ['@apollo/client', 'graphql'],
                    'vendor-ui': ['lucide-react', 'react-toastify'],
                    'vendor-forms': ['react-hook-form'],
                    'vendor-utils': ['clsx', 'prop-types'],
                    
                    // Feature chunks
                    'auth': [
                        './src/components/auth/AdminLogin.jsx',
                        './src/components/auth/ProtectedRoute.jsx'
                    ],
                    'dashboard': [
                        './src/components/Dashboard.jsx',
                        './src/components/dashboard/StatsCard.jsx',
                        './src/components/dashboard/QuickActions.jsx',
                        './src/components/dashboard/RecentActivity.jsx'
                    ],
                    'management': [
                        './src/pages/Users.jsx',
                        './src/pages/Services.jsx',
                        './src/pages/MediaLibrary.jsx',
                        './src/pages/EmailTemplates.jsx',
                        './src/pages/Settings.jsx'
                    ],
                    'analytics': [
                        './src/pages/Analytics.jsx',
                        './src/components/analytics/RevenueChart.jsx',
                        './src/components/analytics/BookingTrends.jsx',
                        './src/components/analytics/UserGrowth.jsx',
                        './src/components/analytics/ServicePerformance.jsx'
                    ]
                }
            }
        },
        sourcemap: false,
        assetsInlineLimit: 4096,
        cssMinify: true,
        target: ['es2020', 'chrome80', 'firefox78', 'safari14'],
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true
            }
        }
    },
    optimizeDeps: {
        include: [
            'react',
            'react-dom',
            'react-router-dom',
            '@apollo/client',
            'graphql',
            'lucide-react',
            'react-toastify'
        ]
    },
    server: {
        port: 5176,
        fs: {
            cachedChecks: false
        }
    }
})