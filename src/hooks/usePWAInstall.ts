import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const STORAGE_KEY = 'pwa-install-dismissed';

const getIsEmbedded = () => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
};

/**
 * PWA Install Hook - Zuverlässig & DSGVO-konform
 * - Fängt beforeinstallprompt ab
 * - Speichert Entscheidung lokal
 * - Kein Auto-Popup
 */
export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  const isEmbedded = typeof window !== 'undefined' ? getIsEmbedded() : false;
  const isSecureContext = typeof window !== 'undefined' ? window.isSecureContext : false;

  useEffect(() => {
    // Check if already installed (standalone mode)
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    
    if (isStandalone) {
      setIsInstalled(true);
      console.log('[PWA] Already installed (standalone mode)');
      return;
    }

    // Check if dismissed before
    const wasDismissed = localStorage.getItem(STORAGE_KEY) === 'true';
    
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      console.log('[PWA] beforeinstallprompt event fired');
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Nur anzeigen wenn nicht dismissed
      if (!wasDismissed) {
        setCanInstall(true);
      }
    };

    const handleAppInstalled = () => {
      console.log('[PWA] App installed');
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // iOS Safari: Kann manuell installiert werden
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isIOS && isSafari && !wasDismissed) {
      setCanInstall(true);
      console.log('[PWA] iOS Safari detected - manual install possible');
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) {
      console.log('[PWA] No deferred prompt available');
      return { outcome: 'unavailable' as const };
    }

    try {
      console.log('[PWA] Triggering install prompt');
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      console.log('[PWA] User choice:', choiceResult.outcome);
      
      if (choiceResult.outcome === 'dismissed') {
        localStorage.setItem(STORAGE_KEY, 'true');
      }
      
      setDeferredPrompt(null);
      setCanInstall(false);
      
      return choiceResult;
    } catch (error) {
      console.error('[PWA] Install error:', error);
      return { outcome: 'error' as const };
    }
  }, [deferredPrompt]);

  const dismissPrompt = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setCanInstall(false);
  }, []);

  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

  return {
    canInstall,
    isInstalled,
    isIOS,
    isEmbedded,
    isSecureContext,
    promptInstall,
    dismissPrompt,
    // Debug: Ob Event abgefangen wurde
    hasPromptEvent: !!deferredPrompt,
  };
}

