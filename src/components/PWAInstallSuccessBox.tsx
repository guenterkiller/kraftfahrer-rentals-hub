import { useState } from 'react';
import { Star, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Einfacher Hinweis zum Speichern als Browser-Favorit
 * Keine PWA-Installation, kein JavaScript, maximale Verständlichkeit
 */
export function PWAInstallSuccessBox() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <Card className="mt-6 border-primary/30 bg-primary/5 relative">
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted transition-colors"
        aria-label="Hinweis schließen"
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </button>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          Für das nächste Mal schneller wiederfinden
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Speichern Sie diese Seite einfach als Favorit (Lesezeichen) in Ihrem Browser,
          damit Sie uns beim nächsten Fahrerbedarf sofort wiederfinden.
        </p>
        
        <p className="text-xs text-muted-foreground">
          <strong>Desktop:</strong> Stern ⭐ in der Browserleiste &nbsp;|&nbsp; 
          <strong>Smartphone:</strong> „Zum Startbildschirm hinzufügen"
        </p>
      </CardContent>
    </Card>
  );
}
