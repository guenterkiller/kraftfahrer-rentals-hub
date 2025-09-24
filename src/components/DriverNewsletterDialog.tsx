import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Mail, Users, Send } from "lucide-react";

interface DriverNewsletterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DriverNewsletterDialog = ({ open, onOpenChange }: DriverNewsletterDialogProps) => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sendToAll, setSendToAll] = useState(true);
  const [sendToActiveOnly, setSendToActiveOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [driverCount, setDriverCount] = useState<number | null>(null);
  const { toast } = useToast();

  // Load driver count when dialog opens
  React.useEffect(() => {
    if (open) {
      loadDriverCount();
    }
  }, [open, sendToActiveOnly]);

  const loadDriverCount = async () => {
    try {
      const adminSession = localStorage.getItem('adminSession');
      if (!adminSession) return;
      
      const session = JSON.parse(adminSession);
      
      const { data: response, error } = await supabase.functions.invoke('admin-data-fetch', {
        body: { email: session.email, dataType: 'fahrer' }
      });

      if (error || !response?.success) {
        console.error("Error loading driver count:", error);
        return;
      }

      const drivers = response.data || [];
      const count = sendToActiveOnly 
        ? drivers.filter((d: any) => d.status === 'active').length
        : drivers.length;
      
      setDriverCount(count);
    } catch (error) {
      console.error("Error loading driver count:", error);
    }
  };

  const handleSendNewsletter = async () => {
    if (!subject.trim() || !message.trim()) {
      toast({
        title: "Fehlende Angaben",
        description: "Bitte Betreff und Nachricht eingeben.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const adminSession = localStorage.getItem('adminSession');
      if (!adminSession) {
        throw new Error('Admin session not found');
      }
      
      const session = JSON.parse(adminSession);
      
      const { data, error } = await supabase.functions.invoke('send-driver-newsletter', {
        body: {
          email: session.email,
          subject: subject.trim(),
          message: message.trim(),
          sendToActiveOnly: sendToActiveOnly
        }
      });

      if (error) throw error;

      toast({
        title: "Rundschreiben gesendet",
        description: `Das Rundschreiben wurde an ${data.recipientCount} Fahrer gesendet.`
      });

      // Reset form
      setSubject("");
      setMessage("");
      setSendToAll(true);
      setSendToActiveOnly(false);
      onOpenChange(false);

    } catch (error: any) {
      console.error('Error sending newsletter:', error);
      toast({
        title: "Fehler beim Versenden",
        description: error.message || "Das Rundschreiben konnte nicht gesendet werden.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Rundschreiben an Fahrer
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Empfänger Auswahl */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Empfänger</Label>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="sendToActiveOnly" 
                checked={sendToActiveOnly}
                onCheckedChange={(checked) => setSendToActiveOnly(checked as boolean)}
              />
              <Label htmlFor="sendToActiveOnly">
                Nur an aktive Fahrer senden
              </Label>
            </div>

            {driverCount !== null && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <Badge variant="secondary">
                  {driverCount} {sendToActiveOnly ? 'aktive' : 'registrierte'} Fahrer
                </Badge>
              </div>
            )}
          </div>

          {/* Betreff */}
          <div className="space-y-2">
            <Label htmlFor="subject">Betreff</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="z.B. Neue Aufträge verfügbar - Jetzt bewerben!"
              maxLength={100}
            />
            <div className="text-sm text-muted-foreground">
              {subject.length}/100 Zeichen
            </div>
          </div>

          {/* Nachricht */}
          <div className="space-y-2">
            <Label htmlFor="message">Nachricht</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Liebe Fahrerinnen und Fahrer,

wir haben neue spannende Aufträge für Sie!

• Neue LKW-Fahrer Positionen in Hamburg und Umgebung
• Fahrmischer-Aufträge in München
• Kran-Fahrer für Bauprojekte in Frankfurt

Bewerben Sie sich jetzt über unser System oder kontaktieren Sie uns direkt.

Mit freundlichen Grüßen
Ihr Fahrerexpress-Team`}
              rows={12}
              maxLength={2000}
            />
            <div className="text-sm text-muted-foreground">
              {message.length}/2000 Zeichen
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Abbrechen
            </Button>
            <Button 
              onClick={handleSendNewsletter}
              disabled={loading || !subject.trim() || !message.trim()}
              className="flex items-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
              {loading ? 'Wird gesendet...' : 'Rundschreiben senden'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};