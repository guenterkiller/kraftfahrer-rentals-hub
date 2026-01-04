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
      // KEIN manifest: {} - wir nutzen ausschließlich public/manifest.webmanifest
      manifest: false,
      // Nutze das manuelle Manifest
      injectManifest: {
        injectionPoint: undefined
      },
      includeAssets: ['favicon.png', 'favicon-truck.png', 'lovable-uploads/favicon-truck-512-full.png', 'manifest.webmanifest'],
      workbox: {
        // Nur JS/CSS/Fonts precachen - NICHT HTML (NetworkFirst für aktuelle Inhalte)
        globPatterns: ['**/*.{js,css,ico,woff,woff2}'],
        // lovable-uploads enthält große Bilder - nicht precachen
        // manifest.webmanifest wird manuell in public/ gepflegt
        globIgnores: ['**/lovable-uploads/**', '**/assets/*.png', '**/manifest.json'],
        // Navigation (HTML) immer NetworkFirst für aktuelle Inhalte
        navigateFallback: null,
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
        manualChunks(id) {
          // React-Core: Immer benötigt
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-vendor';
          }
          // Router: Initial benötigt
          if (id.includes('node_modules/react-router')) {
            return 'router-vendor';
          }
          // Formulare: NUR bei Bedarf (Below-the-fold)
          if (id.includes('node_modules/react-hook-form') || id.includes('node_modules/@hookform')) {
            return 'form-vendor';
          }
          // Date-fns: Bei Bedarf
          if (id.includes('node_modules/date-fns')) {
            return 'date-vendor';
          }
          // Lucide Icons: Tree-shaken, separater Chunk
          if (id.includes('node_modules/lucide-react')) {
            return 'icons-vendor';
          }
          // Radix UI: Separater Chunk für UI-Komponenten
          if (id.includes('node_modules/@radix-ui')) {
            return 'ui-vendor';
          }
          // Tanstack Query: Separater Chunk
          if (id.includes('node_modules/@tanstack')) {
            return 'query-vendor';
          }
          // Recharts/D3: NICHT separieren - Rollup handled das besser automatisch
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    // esbuild statt terser - schneller und weniger Probleme
    minify: 'esbuild',
    // Sourcemaps nur in dev
    sourcemap: false,
    // CSS Code-Splitting
    cssCodeSplit: true,
  },
}));
