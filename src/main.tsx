import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { CookieConsent } from '@/components/CookieConsent';
import { initGA } from '@/lib/gtag';
import './index.css'

function Root() {
  return (
    <StrictMode>
      <App />
      <CookieConsent />
    </StrictMode>
  );
}

createRoot(document.getElementById("root")!).render(<Root />);
