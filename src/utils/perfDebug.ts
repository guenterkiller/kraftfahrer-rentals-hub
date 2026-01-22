/**
 * Performance Debug Utility
 * Aktiviert nur bei ?perfdebug=1 in der URL
 * Liefert harte Beweise für Hero-Bild und GTM-Verzögerung
 */

const CORRECT_HERO = '/uploads/lkw-autobahn-professionell.webp';
const FORBIDDEN_PATTERNS = [
  '/hero/hero-mobile',
  '/hero/hero-desktop',
  '/hero/hero-',
];

export function initPerfDebug(): void {
  // Guard für SSR/Build-Zeit
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    // Nur aktivieren wenn ?perfdebug=1
    const params = new URLSearchParams(window.location.search);
    if (params.get('perfdebug') !== '1') {
      return;
    }

    console.log('%c[PERF DEBUG] Modus aktiviert', 'color: #00ff00; font-weight: bold;');

    // Warte auf window.load für vollständige Resource-Liste
    if (document.readyState === 'complete') {
      runResourceAnalysis();
    } else {
      window.addEventListener('load', () => {
        // Kurz warten damit alle Resources erfasst sind
        setTimeout(runResourceAnalysis, 500);
      });
    }
  } catch (e) {
    // Silent fail - Debug ist optional
  }
}

function runResourceAnalysis(): void {
  console.log('%c[PERF DEBUG] Resource-Analyse startet...', 'color: #00aaff;');
  
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  
  // 1. Hero-Bild Analyse
  analyzeHeroImage(resources);
  
  // 2. Verbotene Hero-Dateien prüfen
  checkForbiddenHeroFiles(resources);
  
  // 3. GTM-Analyse
  analyzeGTM(resources);
  
  console.log('%c[PERF DEBUG] Analyse abgeschlossen', 'color: #00ff00; font-weight: bold;');
}

function analyzeHeroImage(resources: PerformanceResourceTiming[]): void {
  const heroResources = resources.filter(r => r.name.includes(CORRECT_HERO));
  
  console.log('%c[HERO ANALYSE]', 'color: #ffaa00; font-weight: bold;');
  
  if (heroResources.length === 0) {
    console.error('[HERO] ❌ KEIN korrektes Hero-Bild gefunden!');
    console.error('[HERO] Erwartet:', CORRECT_HERO);
    return;
  }
  
  if (heroResources.length > 1) {
    console.warn('[HERO] ⚠️ Mehrere Hero-Requests gefunden:', heroResources.length);
  }
  
  heroResources.forEach((r, i) => {
    console.log(`[HERO ${i + 1}] ✅ Korrekte Datei geladen:`);
    console.table({
      'URL': r.name,
      'Transfer Size (Bytes)': r.transferSize,
      'Encoded Body Size (Bytes)': r.encodedBodySize,
      'Decoded Body Size (Bytes)': r.decodedBodySize,
      'Start Time (ms)': Math.round(r.startTime),
      'Duration (ms)': Math.round(r.duration),
      'Response End (ms)': Math.round(r.responseEnd),
    });
    
    // Zusätzliche Info für Screenshot
    console.log(`[HERO] 📊 Zusammenfassung: ${(r.transferSize / 1024).toFixed(1)} KB transferiert, geladen in ${Math.round(r.duration)}ms`);
  });
}

function checkForbiddenHeroFiles(resources: PerformanceResourceTiming[]): void {
  console.log('%c[FORBIDDEN CHECK]', 'color: #ff6600; font-weight: bold;');
  
  let foundForbidden = false;
  
  resources.forEach(r => {
    for (const pattern of FORBIDDEN_PATTERNS) {
      if (r.name.includes(pattern)) {
        console.error(`[FORBIDDEN] ❌ VERBOTENE HERO-DATEI GELADEN: ${r.name}`);
        console.error('[FORBIDDEN] Diese Datei sollte nicht existieren/geladen werden!');
        foundForbidden = true;
      }
    }
  });
  
  if (!foundForbidden) {
    console.log('[FORBIDDEN] ✅ Keine verbotenen Hero-Dateien gefunden');
  }
}

function analyzeGTM(resources: PerformanceResourceTiming[]): void {
  console.log('%c[GTM ANALYSE]', 'color: #aa00ff; font-weight: bold;');
  
  const gtmResources = resources.filter(r => 
    r.name.includes('gtm.js') || 
    r.name.includes('googletagmanager.com')
  );
  
  if (gtmResources.length === 0) {
    console.log('[GTM] ℹ️ GTM noch nicht geladen (verzögert - wartet auf Interaktion/Idle)');
    console.log('[GTM] Scrolle oder klicke, um GTM zu triggern, dann lade diese Analyse erneut');
    return;
  }
  
  gtmResources.forEach((r, i) => {
    console.log(`[GTM ${i + 1}] Geladen:`);
    console.table({
      'URL': r.name.substring(0, 80) + '...',
      'Start Time (ms seit Navigation)': Math.round(r.startTime),
      'Duration (ms)': Math.round(r.duration),
      'Transfer Size (Bytes)': r.transferSize,
    });
    
    // Bewertung
    if (r.startTime > 1000) {
      console.log(`[GTM] ✅ Verzögert geladen (${Math.round(r.startTime)}ms nach Navigation)`);
    } else {
      console.warn(`[GTM] ⚠️ Früh geladen (${Math.round(r.startTime)}ms) - Delay prüfen!`);
    }
  });
}

// GTM Load Event Logger - wird von index.html aufgerufen
declare global {
  interface Window {
    __perfDebugGTMLoaded?: (trigger: string, timestamp: number) => void;
  }
}

export function setupGTMDebugLogger(): void {
  // Guard für SSR/Build-Zeit
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('perfdebug') !== '1') {
      return;
    }
    
    window.__perfDebugGTMLoaded = (trigger: string, timestamp: number) => {
      console.log('%c[GTM TRIGGER EVENT]', 'color: #ff00ff; font-weight: bold;');
      console.table({
        'Trigger': trigger,
        'Zeit seit Navigation (ms)': Math.round(timestamp),
        'Zeit seit Navigation (s)': (timestamp / 1000).toFixed(2),
      });
    };
  } catch (e) {
    // Silent fail - Debug ist optional
  }
}
