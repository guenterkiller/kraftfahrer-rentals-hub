import { Download, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/usePWAInstall';

/**
 * PWA Install-Button
 * - Zeigt nur wenn beforeinstallprompt verfügbar
 * - Versteckt wenn bereits installiert (standalone)
 * - Kein Auto-Popup, nur manueller Klick
 */
export function PWAInstallButton() {
  const { canInstall, isInstalled, isIOS, promptInstall } = usePWAInstall();

  // Nicht anzeigen wenn bereits installiert
  if (isInstalled) return null;
  
  // Nicht anzeigen wenn kein Install-Event vorhanden
  if (!canInstall) return null;

  const handleInstall = async () => {
    await promptInstall();
  };

  // iOS: Anleitung statt Button (beforeinstallprompt nicht unterstützt)
  if (isIOS) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
        <Share className="h-4 w-4 flex-shrink-0" />
        <span>
          <strong>App speichern:</strong> Teilen → „Zum Home-Bildschirm"
        </span>
      </div>
    );
  }

  return (
    <Button
      onClick={handleInstall}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <Download className="h-4 w-4" />
      App installieren
    </Button>
  );
}
