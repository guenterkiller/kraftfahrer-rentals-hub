import { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { usePWAInstall } from '@/hooks/usePWAInstall';

/**
 * PWA Install Success Box
 * Wird nach erfolgreicher Formular-Absendung angezeigt
 * - Nutzt beforeinstallprompt wenn verfügbar
 * - Zeigt Fallback-Modal mit manueller Anleitung wenn nicht
 */
export function PWAInstallSuccessBox() {
  const {
    promptInstall,
    hasPromptEvent,
    isInstalled,
    isIOS,
  } = usePWAInstall();
  const [showFallbackModal, setShowFallbackModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Nicht anzeigen wenn bereits installiert oder vom User geschlossen
  if (isInstalled || dismissed) return null;

  const handleInstallClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (hasPromptEvent) {
      // Chrome/Edge: Nutze das native beforeinstallprompt Event
      console.log('[PWA] Using native install prompt');
      await promptInstall();
      return;
    }

    // Kein natives Prompt verfügbar → nur Hinweis (kein Popup automatisch)
    console.log('[PWA] No prompt event, showing hint only');
    toast({
      title: 'App-Installation über das Browser-Menü',
      description: isIOS
        ? 'Safari: Teilen → „Zum Home-Bildschirm“.'
        : 'Öffnen Sie das Browser-Menü (⋮) und wählen Sie „App installieren“ / „Zum Startbildschirm hinzufügen“.',
    });
  };

  const handleHowToClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowFallbackModal(true);
  };

  return (
    <>
      <Card className="mt-6 border-primary/30 bg-primary/5 relative">
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted transition-colors"
          aria-label="Hinweis schließen"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            Für das nächste Mal schneller buchen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Speichern Sie Fahrerexpress als App auf Ihrem Gerät, damit Sie uns bei der nächsten Fahrer-Anfrage sofort wiederfinden.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={handleInstallClick}
              variant="default"
              size="sm"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              App installieren
            </Button>
            <Button
              type="button"
              onClick={handleHowToClick}
              variant="outline"
              size="sm"
            >
              Anleitung anzeigen
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Fallback Modal für manuelle Installation */}
      <Dialog open={showFallbackModal} onOpenChange={setShowFallbackModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              App manuell installieren
            </DialogTitle>
            <DialogDescription>
              So speichern Sie Fahrerexpress als App auf Ihrem Gerät:
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {isIOS ? (
              <>
                <div className="space-y-2">
                  <h4 className="font-medium">Safari (iPhone/iPad):</h4>
                  <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                    <li>Tippen Sie auf das <strong>Teilen-Symbol</strong> (Quadrat mit Pfeil nach oben)</li>
                    <li>Scrollen Sie nach unten und wählen Sie <strong>„Zum Home-Bildschirm"</strong></li>
                    <li>Tippen Sie auf <strong>„Hinzufügen"</strong></li>
                  </ol>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <h4 className="font-medium">Chrome (Desktop):</h4>
                  <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                    <li>Klicken Sie auf das <strong>Menü-Symbol</strong> (⋮) rechts oben</li>
                    <li>Wählen Sie <strong>„App installieren"</strong> oder <strong>„Installieren..."</strong></li>
                    <li>Alternativ: Klicken Sie auf das <strong>Install-Symbol</strong> in der Adressleiste (rechts)</li>
                  </ol>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Chrome (Android):</h4>
                  <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                    <li>Tippen Sie auf das <strong>Menü-Symbol</strong> (⋮)</li>
                    <li>Wählen Sie <strong>„App installieren"</strong> oder <strong>„Zum Startbildschirm hinzufügen"</strong></li>
                  </ol>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Edge:</h4>
                  <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                    <li>Klicken Sie auf das <strong>Menü-Symbol</strong> (···)</li>
                    <li>Wählen Sie <strong>„Apps"</strong> → <strong>„Diese Site als App installieren"</strong></li>
                  </ol>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setShowFallbackModal(false)}>
              Verstanden
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
