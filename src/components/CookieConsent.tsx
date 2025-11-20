import { useEffect, useState } from 'react';
import { loadConsent, saveConsent, defaultConsent, type ConsentState } from '@/lib/consent';

function useConsentState() {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [shouldOpen, setShouldOpen] = useState(false);
  
  useEffect(() => {
    const open = localStorage.getItem('consent:open') === '1';
    if (open) localStorage.removeItem('consent:open');
    const c = loadConsent() ?? defaultConsent();
    setConsent(c);
    setShouldOpen(open);
  }, []);
  
  return { consent, setConsent, shouldOpen };
}

export function CookieConsent() {
  const { consent, setConsent, shouldOpen } = useConsentState();
  const [visible, setVisible] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (!consent) return;
    setAnalytics(consent.categories.analytics);
    setMarketing(consent.categories.marketing);
    setVisible(!consent.given || shouldOpen);
  }, [consent, shouldOpen]);

  if (!consent) return null;

  const acceptAll = () => submit(true, true);
  const rejectAll = () => submit(false, false);
  const save = () => submit(analytics, marketing);

  function submit(ana: boolean, mkt: boolean) {
    const next: ConsentState = {
      ...consent,
      given: true,
      updatedAt: new Date().toISOString(),
      categories: { essential: true, analytics: ana, marketing: mkt }
    };
    setConsent(next);
    saveConsent(next);
    setVisible(false);
    // optional: init scripts
    if (ana) enableAnalytics(); else disableAnalytics();
    if (mkt) enableMarketing(); else disableMarketing();
  }

  return (
    <>
      {/* kleines Reopen-Widget, z. B. im Footer verlinken */}
      <style>{`.consent-banner{position:fixed;left:0;right:0;bottom:0;background:#0b1220;color:#fff;padding:16px;z-index:9999}
      .consent-box{max-width:960px;margin:0 auto;display:flex;gap:16px;align-items:flex-start}
      .consent-actions{margin-left:auto;display:flex;gap:8px;flex-wrap:wrap}
      .btn{border:1px solid #94a3b8;background:#0ea5e9;color:#fff;padding:.6rem 1rem;border-radius:8px;cursor:pointer}
      .btn.secondary{background:#1f2937}
      .switch{display:flex;gap:8px;align-items:center}
      .card{background:#111827;border:1px solid #334155;padding:12px;border-radius:10px}
      .link{color:#93c5fd;text-decoration:underline}`}</style>

      {visible && (
        <div className="consent-banner" role="dialog" aria-live="polite">
          <div className="consent-box">
            <div className="card" style={{flex:1}}>
              <strong>Cookies & Datenschutz</strong>
              <p style={{margin:'6px 0 8px'}}>
                Wir verwenden notwendige Cookies für den Betrieb. Analyse/Marketing setzen wir nur mit Ihrer Einwilligung.
                Sie können Ihre Auswahl jederzeit ändern: <a className="link" href="/cookies.html">Cookie-Einstellungen</a> · <a className="link" href="/datenschutz.html">Datenschutz</a>
              </p>
              <div className="switch"><input type="checkbox" checked disabled /> <span>Essentiell (immer aktiv)</span></div>
              <div className="switch"><input id="ana" type="checkbox" checked={analytics} onChange={e=>setAnalytics(e.target.checked)} /> <label htmlFor="ana">Analyse</label></div>
              <div className="switch"><input id="mkt" type="checkbox" checked={marketing} onChange={e=>setMarketing(e.target.checked)} /> <label htmlFor="mkt">Marketing</label></div>
            </div>
            <div className="consent-actions">
              <button className="btn secondary" onClick={rejectAll}>Alle ablehnen</button>
              <button className="btn secondary" onClick={save}>Auswahl speichern</button>
              <button className="btn" onClick={acceptAll}>Alle akzeptieren</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** Placeholder – hänge hier deine tatsächliche Initialisierung an */
function enableAnalytics(){ window.dispatchEvent(new CustomEvent('consent:analytics:on')); }
function disableAnalytics(){ window.dispatchEvent(new CustomEvent('consent:analytics:off')); }
function enableMarketing(){ window.dispatchEvent(new CustomEvent('consent:marketing:on')); }
function disableMarketing(){ window.dispatchEvent(new CustomEvent('consent:marketing:off')); }