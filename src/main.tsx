import React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { CookieConsent } from '@/components/CookieConsent';
import { initGA } from '@/lib/gtag';
import './index.css'

function Root() {
  React.useEffect(() => {
    const on = () => initGA(import.meta.env.VITE_GA_ID || '');
    const off = () => { /* hier könnte man GA Cookies löschen, falls genutzt */ };
    window.addEventListener('consent:analytics:on', on);
    window.addEventListener('consent:analytics:off', off);
    return () => {
      window.removeEventListener('consent:analytics:on', on);
      window.removeEventListener('consent:analytics:off', off);
    };
  }, []);

  return <>
    <App />
    <CookieConsent />
  </>;
}

createRoot(document.getElementById("root")!).render(<Root />);
