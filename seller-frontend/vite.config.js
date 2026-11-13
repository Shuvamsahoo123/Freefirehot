import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      includeAssets: ['images/logo.jpg'],
      manifest: {
        id: '/',
        name: 'FreeFire Hotel Seller',
        short_name: 'FF Hotel',
        description: 'Manage FreeFire Hotel orders, menu, payments, and bookings.',
        theme_color: '#1C1C1E',
        background_color: '#1C1C1E',
        display: 'standalone',
        scope: '/',
        start_url: '/login',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,jpg,jpeg,woff2}'],
        globIgnores: ['**/images/_originals/**'],
      },
    }),
  ],
  server: {
    port: 3001,
    open: false,
    proxy: {
      '/api/seller': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
    },
  },
})

