import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Upload, Send, FileSpreadsheet, X, Users, TestTube, AlertTriangle, Info } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CustomerNewsletterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CustomerContact {
  nummer: string;
  firma: string;
  name: string;
  strasse: string;
  stadt: string;
  telefon: string;
  ustId: string;
  email: string;
}

export function CustomerNewsletterDialog({ open, onOpenChange }: CustomerNewsletterDialogProps) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [customers, setCustomers] = useState<CustomerContact[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string): CustomerContact[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    
    // Parse header - flexible matching
    const headerLine = lines[0];
    const separator = headerLine.includes(';') ? ';' : ',';
    const headers = headerLine.split(separator).map(h => h.trim().toLowerCase());
    
    // Find column indices
    const findIndex = (keywords: string[]) => 
      headers.findIndex(h => keywords.some(k => h.includes(k)));
    
    const nummerIdx = findIndex(['nummer', 'number', 'nr']);
    const firmaIdx = findIndex(['firma', 'company', 'unternehmen']);
    // Extended contact name mapping: name, kontakt, kontaktname, ansprechpartner, empfänger
    const nameIdx = findIndex(['name', 'kontakt', 'kontaktname', 'ansprechpartner', 'empfänger', 'empfaenger']);
    const strasseIdx = findIndex(['strasse', 'straße', 'street', 'adresse']);
    const stadtIdx = findIndex(['stadt', 'city', 'ort', 'plz']);
    const telefonIdx = findIndex(['telefon', 'phone', 'tel']);
    const ustIdIdx = findIndex(['ust', 'vat', 'steuer']);
    const emailIdx = findIndex(['email', 'e-mail', 'mail']);
    
    if (emailIdx === -1) {
      toast({
        title: "Fehler",
        description: "CSV muss eine E-Mail-Spalte enthalten",
        variant: "destructive"
      });
      return [];
    }
    
    const contacts: CustomerContact[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(separator).map(v => v.trim().replace(/^["']|["']$/g, ''));
      
      const email = emailIdx >= 0 ? values[emailIdx] || '' : '';
      if (!email || !email.includes('@')) continue;
      
      // Get contact name - fallback to firma if name is empty
      const rawName = nameIdx >= 0 ? values[nameIdx]?.trim() || '' : '';
      const rawFirma = firmaIdx >= 0 ? values[firmaIdx]?.trim() || '' : '';
      const contactName = rawName || rawFirma;
      
      contacts.push({
        nummer: nummerIdx >= 0 ? values[nummerIdx] || '' : '',
        firma: rawFirma,
        name: contactName,
        strasse: strasseIdx >= 0 ? values[strasseIdx] || '' : '',
        stadt: stadtIdx >= 0 ? values[stadtIdx] || '' : '',
        telefon: telefonIdx >= 0 ? values[telefonIdx] || '' : '',
        ustId: ustIdIdx >= 0 ? values[ustIdIdx] || '' : '',
        email: email
      });
    }
    
    return contacts;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      toast({
        title: "Falsches Format",
        description: "Bitte eine CSV-Datei hochladen",
        variant: "destructive"
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      
      if (parsed.length === 0) {
        toast({
          title: "Keine Kontakte gefunden",
          description: "CSV enthält keine gültigen E-Mail-Adressen",
          variant: "destructive"
        });
        return;
      }
      
      setCustomers(parsed);
      setFileName(file.name);
      toast({
        title: "CSV geladen",
        description: `${parsed.length} Kontakte mit gültiger E-Mail gefunden`
      });
    };
    reader.readAsText(file, 'UTF-8');
  };

  const removeCustomer = (index: number) => {
    setCustomers(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setCustomers([]);
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendTest = async () => {
    if (!subject.trim() || !message.trim()) {
      toast({
        title: "Fehlende Daten",
        description: "Bitte Betreff und Nachricht ausfüllen",
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
      const { data, error } = await supabase.functions.invoke('send-customer-newsletter', {
        body: {
          subject: `[TEST] ${subject}`,
          message,
          customers: [{
            email: testEmail,
            name: 'Test-Empfänger',
            firma: 'Testfirma'
          }]
        }
      });

      if (error) throw error;

      toast({
        title: "Test-E-Mail versendet",
        description: `Test-E-Mail wurde an ${testEmail} gesendet`
      });
    } catch (error: any) {
      console.error("Test email error:", error);
      toast({
        title: "Fehler beim Versenden",
        description: error.message || "Test-E-Mail konnte nicht gesendet werden",
        variant: "destructive"
      });
    } finally {
      setSendingTest(false);
    }
  };

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      toast({
        title: "Fehlende Daten",
        description: "Bitte Betreff und Nachricht ausfüllen",
        variant: "destructive"
      });
      return;
    }
    
    if (customers.length === 0) {
      toast({
        title: "Keine Empfänger",
        description: "Bitte erst eine CSV-Datei hochladen",
        variant: "destructive"
      });
      return;
    }

    setSending(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-customer-newsletter', {
        body: {
          subject,
          message,
          customers: customers.map(c => ({
            email: c.email,
            name: c.name || c.firma || 'Kunde',
            firma: c.firma
          }))
        }
      });

      if (error) throw error;

      const resultParts = [];
      resultParts.push(`${data.sent} gesendet`);
      if (data.skipped > 0) resultParts.push(`${data.skipped} übersprungen (Opt-Out)`);
      if (data.failed > 0) resultParts.push(`${data.failed} fehlgeschlagen`);

      toast({
        title: "Newsletter versendet",
        description: resultParts.join(', '),
      });
      
      // Reset form
      setSubject("");
      setMessage("");
      setCustomers([]);
      setFileName(null);
      setTestEmail("");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Newsletter error:", error);
      toast({
        title: "Fehler beim Versenden",
        description: error.message || "E-Mails konnten nicht gesendet werden",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Kunden-Newsletter versenden
          </DialogTitle>
          <DialogDescription>
            Laden Sie eine CSV-Datei hoch und senden Sie E-Mails an alle Kunden
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* CSV Upload */}
          <div className="space-y-2">
            <Label>CSV-Datei hochladen</Label>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                {fileName || "CSV auswählen"}
              </Button>
              {customers.length > 0 && (
                <Button variant="ghost" size="icon" onClick={clearAll}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          {/* Customer Preview */}
          {customers.length > 0 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {customers.length} Empfänger
              </Label>
              <ScrollArea className="h-32 border rounded-md p-2">
                <div className="space-y-1">
                  {customers.map((c, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm py-1 px-2 bg-muted/50 rounded">
                      <span className="truncate">
                        {c.firma && <span className="font-medium">{c.firma}</span>}
                        {c.firma && c.name && ' – '}
                        {c.name && <span>{c.name}</span>}
                        {!c.firma && !c.name && <span>{c.email}</span>}
                        <span className="text-muted-foreground ml-2">({c.email})</span>
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0"
                        onClick={() => removeCustomer(idx)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
          
          {/* Email Content */}
          <div className="space-y-3">
            <Label htmlFor="subject" className="text-base font-semibold">
              Betreff (E-Mail-Titel)
            </Label>
            <Input
              id="subject"
              placeholder="z.B. Neues Angebot von Fahrerexpress"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="text-base h-12"
            />
          </div>
          
          <div className="space-y-3 flex-1 min-h-0">
            <Label htmlFor="message" className="text-base font-semibold">
              Nachricht (nur Inhalt)
            </Label>
            <Textarea
              id="message"
              placeholder="wir möchten Sie über unser neues Angebot informieren...&#10;&#10;Bei Fragen stehen wir gerne zur Verfügung."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[180px] resize-none text-base leading-relaxed"
            />
            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-1 text-amber-900 dark:text-amber-100">
                  <p className="font-bold text-base">ℹ️ Bitte geben Sie hier nur den Nachrichtentext ein.</p>
                  <p className="text-sm">Anrede, Signatur und Abmelde-Link werden automatisch ergänzt.</p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-2">Platzhalter: {'{name}'} = Kontaktname, {'{firma}'} = Firmenname</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Test Email Section */}
          <div className="space-y-2 border-t pt-4">
            <Label className="flex items-center gap-2 text-sm">
              <TestTube className="h-4 w-4" />
              Test-E-Mail senden (optional)
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
                {sendingTest ? "Sendet..." : "Testen"}
              </Button>
            </div>
          </div>
          
          {/* Warning */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md text-sm">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-amber-800 dark:text-amber-200">
              <strong>Nur Kunden-CSV!</strong> Fahrer niemals aus CSV versenden. Für Fahrer das separate "Fahrer-Rundschreiben" nutzen.
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button 
              onClick={handleSend} 
              disabled={sending || customers.length === 0 || !subject.trim() || !message.trim()}
            >
              {sending ? (
                "Wird gesendet..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  An {customers.length} Kunden senden
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
