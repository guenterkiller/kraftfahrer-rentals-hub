import { useState } from 'react';
import { Download, Smartphone, X, QrCode, Link2 } from 'lucide-react';
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
import { QRCodeSVG } from 'qrcode.react';

const BOOKING_URL = 'https://www.kraftfahrer-mieten.com/fahrer-buchen';
const ICON_URL = 'https://www.kraftfahrer-mieten.com/pwa-icon-512.png';

/**
 * PWA Install Success Box
 * Wird nach erfolgreicher Formular-Absendung angezeigt
 * Bietet 3 Wege zum Speichern:
 * 1. Native PWA Installation (wenn verfügbar)
 * 2. Desktop-Verknüpfung Download (.url Datei)
 * 3. QR-Code fürs Handy
 */
export function PWAInstallSuccessBox() {
  const {
    promptInstall,
    hasPromptEvent,
    isInstalled,
    isIOS,
  } = usePWAInstall();
  const [showQRModal, setShowQRModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Nicht anzeigen wenn bereits installiert oder vom User geschlossen
  if (isInstalled || dismissed) return null;

  // Native App installieren
  const handleInstallClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (hasPromptEvent) {
      console.log('[PWA] Using native install prompt');
      await promptInstall();
      return;
    }

    // Kein natives Prompt verfügbar → kurzer Hinweis
    console.log('[PWA] No prompt event available');
    toast({
      title: 'Direkt-Installation nicht verfügbar',
      description: 'Nutzen Sie stattdessen die Desktop-Verknüpfung oder den QR-Code.',
    });
  };

  // Desktop-Verknüpfung als .url Datei herunterladen
  const handleDownloadShortcut = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const urlFileContent = `[InternetShortcut]
URL=${BOOKING_URL}
IconFile=${ICON_URL}
IconIndex=0`;

    const blob = new Blob([urlFileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'fahrerexpress.url';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: 'Verknüpfung heruntergeladen',
      description: 'Die Datei wurde gespeichert. Öffnen Sie sie, um direkt zur Buchungsseite zu gelangen.',
    });

    console.log('[PWA] Desktop shortcut downloaded');
  };

  // QR-Code Modal öffnen
  const handleShowQR = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQRModal(true);
  };

  return (
    <>
      <Card className="mt-6 border-primary/30 bg-primary/5 relative">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDismissed(true);
          }}
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
            Speichern Sie Fahrerexpress als App oder legen Sie eine Verknüpfung an – 
            damit Sie uns beim nächsten Fahrerbedarf sofort wiederfinden.
          </p>
          
          <div className="flex flex-wrap gap-2">
            {/* Button A: Native App Installation */}
            <Button
              type="button"
              onClick={handleInstallClick}
              variant="default"
              size="sm"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Als App installieren
            </Button>
            
            {/* Button B: Desktop-Verknüpfung */}
            <Button
              type="button"
              onClick={handleDownloadShortcut}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Link2 className="h-4 w-4" />
              Desktop-Verknüpfung
            </Button>
            
            {/* Button C: QR-Code */}
            <Button
              type="button"
              onClick={handleShowQR}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <QrCode className="h-4 w-4" />
              QR-Code fürs Handy
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* QR-Code Modal */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR-Code für Mobilgeräte
            </DialogTitle>
            <DialogDescription>
              Scannen Sie den Code mit Ihrem Handy, um Fahrerexpress zu öffnen und zu speichern.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center py-6 space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <QRCodeSVG 
                value={BOOKING_URL} 
                size={200}
                level="H"
                includeMargin={false}
              />
            </div>
            
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              Nach dem Scannen: Im Browser-Menü „<strong>Zum Startbildschirm</strong>" 
              oder „<strong>App installieren</strong>" wählen.
            </p>
          </div>

          <div className="flex justify-end">
            <Button 
              type="button"
              variant="outline" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowQRModal(false);
              }}
            >
              Schließen
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
