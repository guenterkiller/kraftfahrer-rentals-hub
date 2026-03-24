import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { CookieConsent } from '@/components/CookieConsent';
import { initPerfDebug, setupGTMDebugLogger } from '@/utils/perfDebug';
import './index.css'

const hostname = window.location.hostname;
const search = window.location.search;

const isLovablePreview =
  hostname.includes('lovable.app') ||
  hostname.includes('lovableproject.com') ||
  hostname.includes('lovable.dev') ||
  search.includes('__lovable_token');

const isProductionSwDomain =
  hostname === 'kraftfahrer-mieten.com' ||
  hostname === 'www.kraftfahrer-mieten.com' ||
  hostname === 'fahrerexpress.de' ||
  hostname === 'www.fahrerexpress.de';

async function cleanupPreviewServiceWorkers() {
  if (!('serviceWorker' in navigator)) return;

  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((registration) => registration.unregister()));

  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter((name) => name.includes('workbox') || name.includes('vite-pwa') || name.includes('js-chunks-cache'))
        .map((name) => caches.delete(name))
    );
  }

  console.log('[SW-Guard] Lovable Preview erkannt – Service Worker bereinigt');
}

if (isLovablePreview) {
  void cleanupPreviewServiceWorkers();
} else if (isProductionSwDomain && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js', { scope: '/' });
  });
}

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
