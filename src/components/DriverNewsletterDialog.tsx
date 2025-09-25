import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail } from "lucide-react";

interface DriverNewsletterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DriverNewsletterDialog({ open, onOpenChange }: DriverNewsletterDialogProps) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte Betreff und Nachricht eingeben",
        variant: "destructive"
      });
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-driver-newsletter', {
        body: { subject, message }
      });

      if (error) throw error;

      console.log('Newsletter response:', data);

      // Zeige detaillierte Ergebnisse
      const successMessage = data.errorCount > 0 
        ? `Rundschreiben an ${data.sentCount} von ${data.totalDrivers} Fahrern erfolgreich versendet (${data.errorCount} fehlgeschlagen)`
        : `Rundschreiben erfolgreich an alle ${data.sentCount} Fahrer versendet`;

      toast({
        title: "Rundschreiben versendet",
        description: successMessage
      });

      setSubject("");
      setMessage("");
      onOpenChange(false);
    } catch (error: any) {
      console.error('Newsletter send error:', error);
      toast({
        title: "Fehler beim Versenden",
        description: error.message || "Unbekannter Fehler",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Rundschreiben an alle Fahrer
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="subject">Betreff</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Betreff der Nachricht"
            />
          </div>
          
          <div>
            <Label htmlFor="message">Nachricht</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ihre Nachricht an alle registrierten Fahrer..."
              rows={8}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSend} disabled={sending}>
              {sending ? "Wird versendet..." : "Rundschreiben senden"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}