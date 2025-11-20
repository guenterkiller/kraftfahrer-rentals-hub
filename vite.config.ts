import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { copyFileSync, existsSync } from "fs";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
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
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'ui-vendor';
            }
            if (id.includes('recharts')) {
              return 'charts-vendor';
            }
            if (id.includes('react-router-dom')) {
              return 'router-vendor';
            }
            if (id.includes('react-hook-form') || id.includes('@hookform/resolvers') || id.includes('zod')) {
              return 'form-vendor';
            }
            if (id.includes('date-fns')) {
              return 'date-vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'radix-vendor';
            }
            if (id.includes('@supabase')) {
              return 'supabase-vendor';
            }
            if (id.includes('leaflet') || id.includes('react-leaflet')) {
              return 'map-vendor';
            }
            // Other node_modules
            return 'vendor';
          }
          
          // Split pages into separate chunks
          if (id.includes('/pages/')) {
            const pageName = id.split('/pages/')[1].split('.')[0];
            return `page-${pageName}`;
          }
          
          // Split large components
          if (id.includes('/components/')) {
            if (id.includes('Admin') || id.includes('CRM')) {
              return 'admin-components';
            }
            if (id.includes('Form') || id.includes('Dialog')) {
              return 'form-components';
            }
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true
  },
}));
