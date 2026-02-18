import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { CookieConsent } from '@/components/CookieConsent';
import { initPerfDebug, setupGTMDebugLogger } from '@/utils/perfDebug';
import './index.css'

// ============================================
// PREVIEW GUARD: SW + Cache Cleanup in Lovable Preview
// Verhindert CORS-Fehler durch auth-bridge Fetches
// ============================================
const isLovablePreview =
  window.location.hostname.includes('lovable.app') ||
  window.location.hostname.includes('lovableproject.com') ||
  window.location.hostname.includes('lovable.dev') ||
  window.location.search.includes('__lovable_token');

if (isLovablePreview && 'serviceWorker' in navigator) {
  // Alle bestehenden SW deregistrieren + Caches leeren
  navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(r => {
      r.unregister();
      console.log('[SW-Guard] Service Worker deregistriert:', r.scope);
    });
  });
  caches.keys().then(names => {
    names.forEach(name => {
      caches.delete(name);
      console.log('[SW-Guard] Cache gelöscht:', name);
    });
  });
  console.log('[SW-Guard] Lovable Preview erkannt – SW deaktiviert');
}

// Performance Debug initialisieren (nur bei ?perfdebug=1)
setupGTMDebugLogger();
initPerfDebug();

function Root() {
  return (
    <StrictMode>
      <App />
      <CookieConsent />
    </StrictMode>
  );
}

createRoot(document.getElementById("root")!).render(<Root />);
