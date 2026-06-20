/**
 * vite.config.js — Phase 5: Production-hardened PWA config
 *
 * Full PWA manifest with correct icon paths, proper SW strategy,
 * and Vercel/Netlify compatible build output.
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',

      // Include all public assets in SW precache
      includeAssets: [
        'icons/**/*',
        'assets/images/mascot/**/*',
        'assets/images/**/*',
      ],

      // ── Web App Manifest ───────────────────────────────────────────
      manifest: {
        name:             'Dapur Comel',
        short_name:       'Dapur Comel',
        description:      'Permainan masak-masak interaktif untuk kanak-kanak 3 tahun ke atas. Masak bersama Oyen Si Kucing!',
        theme_color:      '#FF8C5A',
        background_color: '#FFF8EC',
        display:          'fullscreen',
        orientation:      'portrait-primary',
        start_url:        '/?source=pwa',
        scope:            '/',
        lang:             'ms',
        dir:              'ltr',
        categories:       ['education', 'games', 'kids'],
        prefer_related_applications: false,

        icons: [
          {
            src:     'icons/icon-192x192.png',
            sizes:   '192x192',
            type:    'image/png',
            purpose: 'any',
          },
          {
            src:     'icons/icon-512x512.png',
            sizes:   '512x512',
            type:    'image/png',
            purpose: 'any',
          },
          {
            // Maskable: safe zone is centre 80% — icons shows on adaptive launchers
            src:     'icons/icon-512x512-maskable.png',
            sizes:   '512x512',
            type:    'image/png',
            purpose: 'maskable',
          },
          {
            src:     'icons/apple-touch-icon.png',
            sizes:   '180x180',
            type:    'image/png',
            purpose: 'any',
          },
        ],

        // App shortcuts (Android long-press on icon)
        shortcuts: [
          {
            name:       'Jom Masak!',
            short_name: 'Masak',
            description:'Mula permainan segera',
            url:        '/?source=shortcut',
            icons:      [{ src: 'icons/icon-192x192.png', sizes: '192x192' }],
          },
        ],
      },

      // ── Workbox SW Strategy ────────────────────────────────────────
      workbox: {
        // Precache all build output
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2,jpg,jpeg}'],

        // Cleanup old SW caches on update
        cleanupOutdatedCaches: true,
        skipWaiting:           true,
        clientsClaim:          true,

        // Runtime caching rules
        runtimeCaching: [
          {
            // All same-origin requests: CacheFirst (fully offline)
            urlPattern: ({ url }) => url.hostname === 'localhost' ||
              (typeof self !== 'undefined' && url.hostname === self.location.hostname),
            handler: 'CacheFirst',
            options: {
              cacheName:  'dapur-comel-runtime-v1',
              expiration: {
                maxEntries:     300,
                maxAgeSeconds:  60 * 60 * 24 * 30,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Google Fonts: StaleWhileRevalidate
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com/,
            handler:    'StaleWhileRevalidate',
            options: {
              cacheName:  'dapur-comel-fonts-v1',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],

        // SPA fallback for all navigation requests
        navigateFallback:        '/index.html',
        navigateFallbackAllowlist: [/^(?!\/__).*/],
      },

      devOptions: {
        enabled: false,
        type:    'module',
      },
    }),
  ],

  // ── Build config ───────────────────────────────────────────────────
  build: {
    outDir:        'dist',
    sourcemap:     false,    // disable in production
    minify:        'esbuild',
    target:        'es2020',

    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
        },
      },
    },

    // Warn on chunks > 500KB
    chunkSizeWarningLimit: 500,
  },

  resolve: {
    alias: { '@': '/src' },
  },

  // ── Preview server (npm run preview) ──────────────────────────────
  preview: {
    port: 4173,
    host: true,   // expose on LAN for device testing
  },

  // ── Dev server ─────────────────────────────────────────────────────
  server: {
    port: 5173,
    host: true,
  },
})
