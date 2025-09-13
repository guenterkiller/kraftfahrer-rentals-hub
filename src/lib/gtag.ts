declare global { interface Window { dataLayer?: any[]; gtag?: (...args:any[])=>void } }
export function initGA(measurementId: string) {
  if (!measurementId) return;
  if (window.gtag) return; // schon geladen
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(){ window.dataLayer!.push(arguments); };
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(s);
  window.gtag('js', new Date());
  window.gtag('config', measurementId, { anonymize_ip: true });
}