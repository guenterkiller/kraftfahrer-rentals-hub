import { useState, useEffect } from 'react';
import { X, Smartphone, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/usePWAInstall';

interface PWAInstallPromptProps {
  /** Trigger nach Formularabsendung */
  showAfterSuccess?: boolean;
}

/**
 * PWA Install-Hinweis
 * - Erscheint nur nach erfolgreicher Formularabsendung
 * - Maximal 1× pro Nutzer (LocalStorage)
 * - DSGVO-neutral: kein Tracking, keine Push-Benachrichtigungen
 */
export function PWAInstallPrompt({ showAfterSuccess = false }: PWAInstallPromptProps) {
  const { canInstall, isIOS, promptInstall, dismissPrompt } = usePWAInstall();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Nur anzeigen wenn:
    // 1. Installation möglich ist
    // 2. Trigger nach Erfolg aktiviert wurde
    if (canInstall && showAfterSuccess) {
      // Kleine Verzögerung für bessere UX nach Toast
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [canInstall, showAfterSuccess]);

  const handleInstall = async () => {
    const result = await promptInstall();
    if (result.outcome === 'accepted' || result.outcome === 'dismissed') {
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    dismissPrompt();
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-background border border-border rounded-xl shadow-2xl p-5 z-50 animate-in slide-in-from-bottom-5 duration-300"
      role="dialog"
      aria-labelledby="pwa-install-title"
      aria-describedby="pwa-install-description"
    >
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Schließen"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
          <Smartphone className="h-6 w-6 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 id="pwa-install-title" className="font-semibold text-foreground mb-1">
            Für den nächsten Fahrerausfall vormerken
          </h3>
          <p id="pwa-install-description" className="text-sm text-muted-foreground mb-4">
            Speichern Sie Fahrerexpress auf Ihrem Startbildschirm – so erreichen Sie uns im Notfall mit einem Klick.
          </p>

          {isIOS ? (
            // iOS-spezifische Anleitung
            <div className="bg-muted/50 rounded-lg p-3 text-sm">
              <p className="flex items-center gap-2 text-muted-foreground">
                <Share className="h-4 w-4" />
                Tippen Sie auf <strong>Teilen</strong> und dann <strong>„Zum Home-Bildschirm"</strong>
              </p>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={handleInstall}
                size="sm"
                className="flex-1"
              >
                Jetzt speichern
              </Button>
              <Button
                onClick={handleDismiss}
                variant="ghost"
                size="sm"
              >
                Später
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
