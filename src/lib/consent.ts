export type ConsentCategories = {
  essential: boolean;   // immer true
  analytics: boolean;
  marketing: boolean;
};

export type ConsentState = {
  given: boolean;
  updatedAt: string;              // ISO
  categories: ConsentCategories;
  version: number;                // bumpen bei Änderungen am Text
};

const KEY = 'fx:consent:v1';

export function loadConsent(): ConsentState | null {
  try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { return null; }
}
export function saveConsent(c: ConsentState) {
  localStorage.setItem(KEY, JSON.stringify(c));
}

export function defaultConsent(): ConsentState {
  const dnt = typeof navigator !== 'undefined' && (navigator.doNotTrack === '1' || (window as any).doNotTrack === '1');
  return {
    given: false,
    updatedAt: new Date().toISOString(),
    version: 1,
    categories: { essential: true, analytics: dnt ? false : false, marketing: dnt ? false : false }
  };
}