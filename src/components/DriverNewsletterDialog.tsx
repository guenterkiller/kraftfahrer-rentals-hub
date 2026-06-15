import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TestTube, Truck, AlertTriangle, FileText } from "lucide-react";

interface DriverNewsletterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type TemplateMode = "free" | "fahrerinformationen_v1";

export function DriverNewsletterDialog({ open, onOpenChange }: DriverNewsletterDialogProps) {
  const [templateMode, setTemplateMode] = useState<TemplateMode>("free");
  const [subject, setSubject] = use  useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const { toast } = useToast();

  const isFreeMode = templateMode === "free";

  const handleSendTest = async () => {
    if (is allowed) {
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
      const body: Record<string, string> = { testEmail: testEmail.trim() };
      if (isFreeMode) {
        body.subject = subject;
        body.message = message;
      } else {
        body.templateId = "fahrerinformationen_v1";
      }

      const { data, error } = await supabase.functions.invoke('send-driver-newsletter', {
        body
      });
      if (error) throw error;
      console.log('Test newsletter response:', data);
      toast({
        title: "Test-E-Mail versendet",
        description: `Testmail wurde an ${testEmail} gesendet. Bitte Posteingang prüfen.`
      });
    } catch (error: any) {
      console.error('Test newsletter send error:', error);
      toast({
        title: "Fehler beim Test-Versand",
        description: error.message || "Unbekannter Fehler",
        variant: "destructive"
      });
    } finally {
      setSendingTest(false);
    }
  };

  const handleSend = async () => {
    if (isFreeMode && (!subject.trim() || !message.trim())) {
      toast({
        title: "Fehler",
        description: "Bitte Betreff und Nachricht eingeben",
        variant: "destructive"
      });
      return;
    }

    setSending(true);
    try {
      const body: Record<string, string> = {};
      if (isFreeMode) {
        body.subject = subject;
        body.message = message;
      } else {
        body.templateId = "fahrerinformationen_v1";
      }

      const { data, error } = await supabase.functions.invoke('send-driver-newsletter', {
        body
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
          {/* Template selection */}
          <div>
            <Label className="mb-2 block">Vorlage wählen</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={isFreeMode ? "default" : "outline"}
                size="sm"
                onClick={() => setTemplateMode("free")}
                className={isFreeMode ? "bg-emerald-600 hover:bg-emerald-700" : ""}
              >
                <FileText className="h-4 w-4 mr-1" />
                Freier Text
              </Button>
              <Button
                type="button"
                variant={!isFreeMode ? "default" : "outline"}
                size="sm"
                onClick={() => setTemplateMode("fahrerinformationen_v1")}
                className={!isFreeMode ? "bg-emerald-600 hover:bg-emerald-700" : ""}
              >
                <FileText className="h-4 w-4 mr-1" />
                Feste Vorlage: Fahrerinformationen v1
              </Button>
            </div>
          </div>

          {/* Subject and Message - only active in free mode */}
          <div className={!isFreeMode ? "opacity-50 pointer-events-none" : ""}>
            <div>
              <Label htmlFor="driver-subject">Betreff</Label>
              <Input
                id="driver-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Betreff der Nachricht"
                disabled={!isFreeMode}
              />
            </div>
          </div>

          <div className={!isFreeMode ? "opacity-50 pointer-events-none" : ""}>
            <div>
              <Label htmlFor="driver-message">Nachricht</Label>
              <Textarea
                id="driver-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ihre Nachricht an alle registrierten Fahrer..."
                rows={8}
                disabled={!isFreeMode}
              />
            </div>
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
                disabled={sendingTest || (isFreeMode && (!subject.trim() || !message.trim()))}
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
            <Button onClick={handleSend} disabled={sending || (isFreeMode && (!subject.trim() || !message.trim()))} className="bg-emerald-600 hover:bg-emerald-700">
              {sending ? "Wird versendet..." : "An alle Fahrer senden"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
