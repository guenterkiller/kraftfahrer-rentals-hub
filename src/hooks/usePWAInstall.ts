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

/**
 * PWA Install Hook - DSGVO-konform
 * - Kein Tracking
 * - Speichert Entscheidung nur lokal
 * - Zeigt Prompt maximal 1× an
 */
export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [wasDismissed, setWasDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed or installed
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed === 'true') {
      setWasDismissed(true);
      return;
    }

    // Check if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // iOS Safari check (no beforeinstallprompt event)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // For iOS, we can show manual instructions
    if (isIOS && isSafari && !dismissed) {
      setCanInstall(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) {
      // iOS Safari - show manual instructions
      return { outcome: 'ios-manual' as const };
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'dismissed') {
        localStorage.setItem(STORAGE_KEY, 'true');
        setWasDismissed(true);
      }
      
      setDeferredPrompt(null);
      setCanInstall(false);
      
      return choiceResult;
    } catch (error) {
      console.error('PWA install error:', error);
      return { outcome: 'error' as const };
    }
  }, [deferredPrompt]);

  const dismissPrompt = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setWasDismissed(true);
    setCanInstall(false);
  }, []);

  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

  return {
    canInstall: canInstall && !wasDismissed && !isInstalled,
    isInstalled,
    wasDismissed,
    isIOS,
    promptInstall,
    dismissPrompt,
  };
}
