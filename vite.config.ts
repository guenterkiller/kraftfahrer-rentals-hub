import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";
import { copyFileSync, existsSync } from "fs";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'favicon-truck.png', 'lovable-uploads/favicon-truck-512-full.png'],
      manifest: {
        name: 'Fahrerexpress - LKW-Fahrer mieten',
        short_name: 'Fahrerexpress',
        description: 'Bundesweite Vermittlung selbstständiger LKW-Fahrer und Baumaschinenführer. Im Notfall sofort erreichbar.',
        theme_color: '#C73E1D',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        lang: 'de',
        categories: ['business', 'productivity'],
        icons: [
          {
            src: '/lovable-uploads/favicon-truck-512-full.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/lovable-uploads/favicon-truck-512-full.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/favicon-truck.png',
            sizes: '64x64',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        // Nur JS/CSS/Fonts precachen - NICHT HTML (NetworkFirst für aktuelle Inhalte)
        globPatterns: ['**/*.{js,css,ico,woff,woff2}'],
        // lovable-uploads enthält große Bilder - nicht precachen
        globIgnores: ['**/lovable-uploads/**', '**/assets/*.png'],
        // Navigation (HTML) immer NetworkFirst für aktuelle Inhalte
        navigateFallback: null, // Kein Fallback - immer Netzwerk für Navigation
        runtimeCaching: [
          {
            // HTML/Navigation: NetworkFirst - immer aktuelle Inhalte
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages-cache',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 1 Tag
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 Jahr
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      // PWA auch in Entwicklung für Tests aktiviert
      devOptions: {
        enabled: true
      }
    }),
    {
      name: 'copy-htaccess',
      writeBundle() {
        const srcPath = path.resolve(__dirname, 'public/htaccess-ionos');
        const destPath = path.resolve(__dirname, 'dist/.htaccess');
        
        if (existsSync(srcPath)) {
          copyFileSync(srcPath, destPath);
          console.log('✓ .htaccess für IONOS kopiert');
        }
      }
    }
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ['react', 'react-dom']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['lucide-react'],
          'charts-vendor': ['recharts'],
          'router-vendor': ['react-router-dom'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers'],
          'date-vendor': ['date-fns'],
          'misc-vendor': ['clsx', 'class-variance-authority', 'tailwind-merge']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
}));
