import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CreateJobDialogProps {
  open: boolean;
  onClose: () => void;
  onJobCreated: (jobId: string) => void;
}

export function CreateJobDialog({ open, onClose, onJobCreated }: CreateJobDialogProps) {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  // Customer data
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [company, setCompany] = useState("");
  const [customerStreet, setCustomerStreet] = useState("");
  const [customerHouseNumber, setCustomerHouseNumber] = useState("");
  const [customerPostalCode, setCustomerPostalCode] = useState("");
  const [customerCity, setCustomerCity] = useState("");

  // Job data
  const [einsatzort, setEinsatzort] = useState("");
  const [zeitraum, setZeitraum] = useState("");
  const [fahrzeugtyp, setFahrzeugtyp] = useState("");
  const [fuehrerscheinklasse, setFuehrerscheinklasse] = useState("C+E");
  const [besonderheiten, setBesonderheiten] = useState("");
  const [nachricht, setNachricht] = useState("");

  const resetForm = () => {
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setCompany("");
    setCustomerStreet("");
    setCustomerHouseNumber("");
    setCustomerPostalCode("");
    setCustomerCity("");
    setEinsatzort("");
    setZeitraum("");
    setFahrzeugtyp("");
    setFuehrerscheinklasse("C+E");
    setBesonderheiten("");
    setNachricht("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCreateJob = async () => {
    // Basic validation
    if (!customerName || !customerEmail || !customerPhone || !einsatzort || 
        !zeitraum || !fahrzeugtyp || !nachricht) {
      toast({
        title: "Fehlende Angaben",
        description: "Bitte füllen Sie alle Pflichtfelder aus.",
        variant: "destructive"
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      toast({
        title: "Ungültige E-Mail",
        description: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
        variant: "destructive"
      });
      return;
    }

    // PLZ validation if provided
    if (customerPostalCode && !/^\d{5}$/.test(customerPostalCode)) {
      toast({
        title: "Ungültige PLZ",
        description: "PLZ muss 5-stellig sein.",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);

    try {
      // Get admin session
      const adminSession = localStorage.getItem('adminSession');
      if (!adminSession) {
        throw new Error('Keine Admin-Session gefunden');
      }

      const session = JSON.parse(adminSession);
      
      // Create job via edge function
      const { data, error } = await supabase.functions.invoke('admin-create-job', {
        body: {
          email: session.email,
          customerName,
          customerEmail,
          customerPhone,
          company: company || undefined,
          customerStreet: customerStreet || undefined,
          customerHouseNumber: customerHouseNumber || undefined,
          customerPostalCode: customerPostalCode || undefined,
          customerCity: customerCity || undefined,
          einsatzort,
          zeitraum,
          fahrzeugtyp,
          fuehrerscheinklasse,
          besonderheiten: besonderheiten || undefined,
          nachricht
        }
      });

      if (error) {
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Fehler beim Erstellen des Auftrags');
      }

      toast({
        title: "Auftrag erstellt",
        description: `Auftrag für ${customerName} wurde erfolgreich angelegt.`
      });

      resetForm();
      onJobCreated(data.jobId);
      onClose();

    } catch (error: any) {
      console.error('Error creating job:', error);
      toast({
        title: "Fehler beim Erstellen",
        description: error.message || "Auftrag konnte nicht erstellt werden.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="create-job-description">
        <DialogHeader>
          <DialogTitle>Neuen Auftrag anlegen</DialogTitle>
          <p id="create-job-description" className="sr-only">Formular zur Erstellung eines neuen Fahrerauftrags mit Kunden- und Auftragsdaten</p>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Customer Data Section */}
          <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-3">Kunde / Auftraggeber</h3>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <Label htmlFor="customer-name" className="text-sm">Name / Firma *</Label>
                <Input
                  id="customer-name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Max Mustermann / Firma GmbH"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="company" className="text-sm">Zusätzliche Firmeninfo</Label>
                <Input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Abteilung, Zusatzinfo..."
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <Label htmlFor="customer-email" className="text-sm">E-Mail *</Label>
                <Input
                  id="customer-email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="kontakt@firma.de"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="customer-phone" className="text-sm">Telefon *</Label>
                <Input
                  id="customer-phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+49 123 456789"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <Label htmlFor="customer-street" className="text-sm">Straße</Label>
                <Input
                  id="customer-street"
                  value={customerStreet}
                  onChange={(e) => setCustomerStreet(e.target.value)}
                  placeholder="Musterstraße"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="customer-house" className="text-sm">Hausnummer</Label>
                <Input
                  id="customer-house"
                  value={customerHouseNumber}
                  onChange={(e) => setCustomerHouseNumber(e.target.value)}
                  placeholder="123"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="customer-postal" className="text-sm">PLZ</Label>
                <Input
                  id="customer-postal"
                  value={customerPostalCode}
                  onChange={(e) => setCustomerPostalCode(e.target.value)}
                  placeholder="12345"
                  pattern="[0-9]{5}"
                  maxLength={5}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="customer-city" className="text-sm">Ort</Label>
                <Input
                  id="customer-city"
                  value={customerCity}
                  onChange={(e) => setCustomerCity(e.target.value)}
                  placeholder="Musterstadt"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Job Data Section */}
          <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
            <h3 className="font-medium text-green-800 mb-3">Auftragsdaten</h3>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <Label htmlFor="einsatzort" className="text-sm">Einsatzort *</Label>
                <Input
                  id="einsatzort"
                  value={einsatzort}
                  onChange={(e) => setEinsatzort(e.target.value)}
                  placeholder="Frankfurt am Main"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="zeitraum" className="text-sm">Zeitraum *</Label>
                <Input
                  id="zeitraum"
                  value={zeitraum}
                  onChange={(e) => setZeitraum(e.target.value)}
                  placeholder="2 Wochen ab 01.10.2024"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <Label htmlFor="fahrzeugtyp" className="text-sm">Fahrzeugtyp *</Label>
                <Select value={fahrzeugtyp} onValueChange={setFahrzeugtyp}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kategorie wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Baumaschinenführer">Baumaschinenführer (459 €/Tag)</SelectItem>
                    <SelectItem value="LKW CE Fahrer">LKW CE Fahrer (349 €/Tag)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="fuehrerscheinklasse" className="text-sm">Führerscheinklasse *</Label>
                <Select value={fuehrerscheinklasse} onValueChange={setFuehrerscheinklasse}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="C+E">C+E</SelectItem>
                    <SelectItem value="C1">C1</SelectItem>
                    <SelectItem value="C1+E">C1+E</SelectItem>
                    <SelectItem value="B">B (Kleinfahrzeuge)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mb-3">
              <Label htmlFor="besonderheiten" className="text-sm">Besonderheiten</Label>
              <Textarea
                id="besonderheiten"
                value={besonderheiten}
                onChange={(e) => setBesonderheiten(e.target.value)}
                placeholder="Besondere Anforderungen, Zertifikate, etc."
                rows={2}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="nachricht" className="text-sm">Detaillierte Beschreibung *</Label>
              <Textarea
                id="nachricht"
                value={nachricht}
                onChange={(e) => setNachricht(e.target.value)}
                placeholder="Detaillierte Beschreibung des Auftrags, Arbeitszeiten, spezielle Anforderungen..."
                rows={4}
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleClose} variant="outline" className="flex-1" aria-label="Abbrechen und Dialog schließen">
              Abbrechen
            </Button>
            <Button 
              onClick={handleCreateJob} 
              disabled={isCreating}
              className="flex-1"
              aria-label="Auftrag erstellen"
            >
              {isCreating ? "Erstelle..." : "Auftrag erstellen"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}