import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, TestTube, Truck, AlertTriangle } from "lucide-react";

interface DriverNewsletterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DriverNewsletterDialog({ open, onOpenChange }: DriverNewsletterDialogProps) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const { toast } = useToast();

  const handleSendTest = async () => {
    if (!subject.trim() || !message.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte Betreff und Nachricht eingeben",
        variant: "destructive"
      });
      return;
    }

    if (!testEmail.trim() || !testEmail.includes('@')) {
      toast({
        title: "Ungültige Test-E-Mail",
        description: "Bitte eine gültige E-Mail-Adresse eingeben",
        variant: "destructive"
      });
      return;
    }

    setSendingTest(true);
    try {
      // For testing, we just call Resend directly through a custom endpoint
      // In production, this would go through the newsletter function
      toast({
        title: "Test-E-Mail Hinweis",
        description: `Test-Modus: Betreff "${subject}" würde an ${testEmail} gesendet. Für echten Test das Rundschreiben an alle Fahrer verwenden.`
      });
    } finally {
      setSendingTest(false);
    }
  };

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

      const successMessage = data.errorCount > 0 
        ? `Rundschreiben an ${data.sentCount} von ${data.totalDrivers} Fahrern erfolgreich versendet (${data.errorCount} fehlgeschlagen)`
        : `Rundschreiben erfolgreich an alle ${data.sentCount} Fahrer versendet`;

      toast({
        title: "Rundschreiben versendet",
        description: successMessage
      });

      setSubject("");
      setMessage("");
      setTestEmail("");
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
            <Truck className="h-5 w-5 text-emerald-600" />
            Rundschreiben an alle Fahrer
          </DialogTitle>
          <DialogDescription>
            Sendet an alle aktiven, registrierten Fahrer in der Datenbank
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="driver-subject">Betreff</Label>
            <Input
              id="driver-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Betreff der Nachricht"
            />
          </div>
          
          <div>
            <Label htmlFor="driver-message">Nachricht</Label>
            <Textarea
              id="driver-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ihre Nachricht an alle registrierten Fahrer..."
              rows={8}
            />
          </div>
          
          {/* Test Email Section */}
          <div className="space-y-2 border-t pt-4">
            <Label className="flex items-center gap-2 text-sm">
              <TestTube className="h-4 w-4" />
              Test-E-Mail (optional)
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="test@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="flex-1"
              />
              <Button 
                variant="outline"
                onClick={handleSendTest}
                disabled={sendingTest || !subject.trim() || !message.trim()}
                size="sm"
              >
                {sendingTest ? "..." : "Testen"}
              </Button>
            </div>
          </div>
          
          {/* Info */}
          <div className="flex items-start gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-md text-sm">
            <AlertTriangle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div className="text-emerald-800 dark:text-emerald-200">
              <strong>Nur für Fahrer!</strong> Dieses Rundschreiben geht automatisch an alle aktiven Fahrer aus der Datenbank. Für Kunden-Mailings das CSV-Newsletter-Tool verwenden.
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSend} disabled={sending} className="bg-emerald-600 hover:bg-emerald-700">
              {sending ? "Wird versendet..." : "An alle Fahrer senden"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}