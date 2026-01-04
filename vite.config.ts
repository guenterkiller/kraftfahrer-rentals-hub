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
      manifest: false,
      injectManifest: {
        injectionPoint: undefined
      },
      includeAssets: ['favicon.png', 'favicon-truck.png', 'lovable-uploads/favicon-truck-512-full.png', 'manifest.webmanifest'],
      workbox: {
        globPatterns: ['**/*.{js,css,ico,woff,woff2}'],
        globIgnores: ['**/lovable-uploads/**', '**/assets/*.png', '**/manifest.json'],
        navigateFallback: null,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages-cache',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24
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
        // Vereinfachtes Chunking: nur 2 Bundles
        manualChunks(id) {
          // Alle node_modules in einen Vendor-Chunk
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    minify: 'esbuild',
    sourcemap: false,
  },
}));
