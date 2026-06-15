import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, TestTube, Truck, AlertTriangle, Eye, Lock } from "lucide-react";

type TemplateId = 'free' | 'fahrerinformationen_v1';

const TEMPLATE_OPTIONS: { id: TemplateId; label: string; description: string }[] = [
  {
    id: 'free',
    label: 'Freie Rundmail (Text unten)',
    description: 'Betreff und Nachricht aus den Feldern werden versendet.',
  },
  {
    id: 'fahrerinformationen_v1',
    label: 'Freigegebene Fahrerinformationen (fest)',
    description: 'Inhalt ist im Code fest hinterlegt. Das Textfeld wird ignoriert.',
  },
];

interface DriverNewsletterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DriverNewsletterDialog({ open, onOpenChange }: DriverNewsletterDialogProps) {
  const [templateId, setTemplateId] = useState<TemplateId>('fahrerinformationen_v1');
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewSubject, setPreviewSubject] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  // Signatur der zuletzt geprüften Vorschau – Versand erst freigegeben, wenn
  // aktuelle Eingaben mit dieser Signatur übereinstimmen.
  const [previewSignature, setPreviewSignature] = useState<string | null>(null);
  const { toast } = useToast();

  const isFixedTemplate = templateId !== 'free';

  const currentSignature = JSON.stringify({
    templateId,
    subject: isFixedTemplate ? '__fixed__' : subject.trim(),
    message: isFixedTemplate ? '__fixed__' : message.trim(),
  });
  const previewMatchesCurrent = previewSignature === currentSignature && previewHtml !== null;

  const resetPreview = () => {
    setPreviewHtml(null);
    setPreviewSubject(null);
    setPreviewSignature(null);
  };

  const handleLoadPreview = async () => {
    if (!isFixedTemplate && (!subject.trim() || !message.trim())) {
      toast({
        title: 'Vorschau nicht möglich',
        description: 'Für die freie Rundmail werden Betreff und Nachricht benötigt.',
        variant: 'destructive',
      });
      return;
    }
    setPreviewLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-driver-newsletter', {
        body: {
          templateId,
          subject: isFixedTemplate ? undefined : subject,
          message: isFixedTemplate ? undefined : message,
          dryRun: true,
        },
      });
      if (error) throw error;
      if (!data?.html) throw new Error('Keine Vorschau zurückgeliefert');
      setPreviewHtml(data.html);
      setPreviewSubject(data.subject ?? null);
      setPreviewSignature(currentSignature);
    } catch (e: any) {
      console.error('Preview error:', e);
      toast({
        title: 'Vorschau fehlgeschlagen',
        description: e.message || 'Unbekannter Fehler',
        variant: 'destructive',
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSendTest = async () => {
    if (!isFixedTemplate && (!subject.trim() || !message.trim())) {
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
      const { data, error } = await supabase.functions.invoke('send-driver-newsletter', {
        body: {
          templateId,
          subject: isFixedTemplate ? undefined : subject,
          message: isFixedTemplate ? undefined : message,
          testEmail: testEmail.trim(),
        }
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
    if (!isFixedTemplate && (!subject.trim() || !message.trim())) {
      toast({
        title: "Fehler",
        description: "Bitte Betreff und Nachricht eingeben",
        variant: "destructive"
      });
      return;
    }
    if (!previewMatchesCurrent) {
      toast({
        title: 'Vorschau erforderlich',
        description: 'Bitte zuerst die finale Vorschau laden und prüfen.',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-driver-newsletter', {
        body: {
          templateId,
          subject: isFixedTemplate ? undefined : subject,
          message: isFixedTemplate ? undefined : message,
        }
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
      resetPreview();
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
          {/* Template-Auswahl */}
          <div className="space-y-2">
            <Label>Vorlage</Label>
            <div className="grid gap-2">
              {TEMPLATE_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-start gap-3 rounded-md border p-3 cursor-pointer transition-colors ${
                    templateId === opt.id ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' : 'border-border'
                  }`}
                >
                  <input
                    type="radio"
                    name="driver-newsletter-template"
                    value={opt.id}
                    checked={templateId === opt.id}
                    onChange={() => { setTemplateId(opt.id); resetPreview(); }}
                    className="mt-1"
                  />
                  <div className="text-sm">
                    <div className="font-semibold flex items-center gap-1">
                      {opt.id !== 'free' && <Lock className="h-3.5 w-3.5" />} {opt.label}
                    </div>
                    <div className="text-muted-foreground">{opt.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="driver-subject">Betreff</Label>
            <Input
              id="driver-subject"
              value={subject}
              onChange={(e) => { setSubject(e.target.value); resetPreview(); }}
              placeholder={isFixedTemplate ? 'Betreff wird aus fester Vorlage übernommen' : 'Betreff der Nachricht'}
              disabled={isFixedTemplate}
            />
          </div>
          
          <div>
            <Label htmlFor="driver-message">Nachricht</Label>
            <Textarea
              id="driver-message"
              value={message}
              onChange={(e) => { setMessage(e.target.value); resetPreview(); }}
              placeholder={isFixedTemplate ? 'Bei fester Vorlage wird dieses Feld ignoriert.' : 'Ihre Nachricht an alle registrierten Fahrer...'}
              rows={8}
              disabled={isFixedTemplate}
            />
            {isFixedTemplate && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Lock className="h-3 w-3" /> Inhalt ist fest im Code hinterlegt und kann hier nicht überschrieben werden.
              </p>
            )}
          </div>

          {/* Vorschau */}
          <div className="space-y-2 border-t pt-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-sm">
                <Eye className="h-4 w-4" /> Finale Versand-Vorschau
              </Label>
              <Button type="button" size="sm" variant="outline" onClick={handleLoadPreview} disabled={previewLoading}>
                {previewLoading ? 'Lade…' : previewMatchesCurrent ? 'Vorschau neu laden' : 'Vorschau laden'}
              </Button>
            </div>
            {previewHtml && previewMatchesCurrent ? (
              <div className="border rounded-md overflow-hidden">
                <div className="bg-muted px-3 py-2 text-xs">
                  <strong>Betreff:</strong> {previewSubject || '(leer)'}
                </div>
                <iframe
                  title="E-Mail Vorschau"
                  srcDoc={previewHtml}
                  className="w-full bg-white"
                  style={{ height: 360 }}
                />
              </div>
            ) : (
              <div className="text-xs text-muted-foreground border border-dashed rounded-md p-3">
                {previewHtml && !previewMatchesCurrent
                  ? 'Eingaben wurden geändert – bitte Vorschau erneut laden.'
                  : 'Bitte zuerst die Vorschau laden. Der Versandbutton ist solange gesperrt.'}
              </div>
            )}
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
                disabled={sendingTest || (!isFixedTemplate && (!subject.trim() || !message.trim()))}
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
            <Button
              onClick={handleSend}
              disabled={sending || !previewMatchesCurrent}
              className="bg-emerald-600 hover:bg-emerald-700"
              title={!previewMatchesCurrent ? 'Bitte zuerst Vorschau laden' : undefined}
            >
              {sending ? "Wird versendet..." : "An alle Fahrer senden"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}