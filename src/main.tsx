import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { CookieConsent } from '@/components/CookieConsent';
import { initPerfDebug, setupGTMDebugLogger } from '@/utils/perfDebug';
import './index.css'

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
