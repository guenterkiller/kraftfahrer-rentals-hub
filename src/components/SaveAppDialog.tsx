import { useState } from 'react';
import { Download, Smartphone, QrCode, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { QRCodeSVG } from 'qrcode.react';

const BOOKING_URL = 'https://www.kraftfahrer-mieten.com/fahrer-buchen';
const ICON_URL = 'https://www.kraftfahrer-mieten.com/pwa-icon-512.png';

interface SaveAppDialogProps {
  trigger?: React.ReactNode;
}

/**
 * Wiederverwendbarer Dialog zum Speichern der App
 * Kann im Footer, Header oder anderswo genutzt werden
 */
export function SaveAppDialog({ trigger }: SaveAppDialogProps) {
  const {
    promptInstall,
    hasPromptEvent,
    isInstalled,
  } = usePWAInstall();
  const [open, setOpen] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // Nicht anzeigen wenn bereits installiert
  if (isInstalled) return null;

  // Native App installieren
  const handleInstallClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (hasPromptEvent) {
      console.log('[PWA] Using native install prompt');
      await promptInstall();
      setOpen(false);
      return;
    }

    toast({
      title: 'Direkt-Installation nicht verfügbar',
      description: 'Nutzen Sie stattdessen die Desktop-Verknüpfung oder den QR-Code.',
    });
  };

  // Desktop-Verknüpfung herunterladen
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
      description: 'Öffnen Sie die Datei, um direkt zur Buchungsseite zu gelangen.',
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <button className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-1.5">
            <Smartphone className="h-4 w-4" />
            Fahrerexpress speichern
          </button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            Fahrerexpress speichern
          </DialogTitle>
          <DialogDescription>
            Speichern Sie Fahrerexpress für schnellen Zugriff bei der nächsten Buchung.
          </DialogDescription>
        </DialogHeader>

        {!showQR ? (
          <div className="space-y-3 py-4">
            {/* Native Install */}
            <Button
              type="button"
              onClick={handleInstallClick}
              variant="default"
              className="w-full justify-start gap-3"
            >
              <Download className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Als App installieren</div>
                <div className="text-xs opacity-80">Direkt vom Browser</div>
              </div>
            </Button>

            {/* Desktop-Verknüpfung */}
            <Button
              type="button"
              onClick={handleDownloadShortcut}
              variant="outline"
              className="w-full justify-start gap-3"
            >
              <Link2 className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Desktop-Verknüpfung</div>
                <div className="text-xs text-muted-foreground">Datei herunterladen</div>
              </div>
            </Button>

            {/* QR-Code Button */}
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowQR(true);
              }}
              variant="outline"
              className="w-full justify-start gap-3"
            >
              <QrCode className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">QR-Code fürs Handy</div>
                <div className="text-xs text-muted-foreground">Mit dem Smartphone scannen</div>
              </div>
            </Button>
          </div>
        ) : (
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

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowQR(false);
              }}
            >
              ← Zurück zu den Optionen
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
