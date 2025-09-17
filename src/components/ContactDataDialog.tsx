import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ContactDataDialogProps {
  open: boolean;
  onClose: () => void;
  jobId: string;
  onDataUpdated: () => void;
}

export function ContactDataDialog({ 
  open, 
  onClose, 
  jobId, 
  onDataUpdated 
}: ContactDataDialogProps) {
  const [cName, setCName] = useState("");
  const [contact, setContact] = useState("");
  const [street, setStreet] = useState("");
  const [house, setHouse] = useState("");
  const [postal, setPostal] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  
  const { toast } = useToast();

  // Load job data when dialog opens
  useEffect(() => {
    if (open && jobId) {
      loadJobData();
    }
  }, [open, jobId]);

  const loadJobData = async () => {
    try {
      const { data: job, error } = await supabase
        .from('job_requests')
        .select('*')
        .eq('id', jobId)
        .maybeSingle();
      
      if (error) throw error;
      
      if (job) {
        setCName(job.customer_name || job.company || "");
        setContact(job.customer_name || "");
        setStreet(job.customer_street || "");
        setHouse(job.customer_house_number || "");
        setPostal(job.customer_postal_code || "");
        setCity(job.customer_city || "");
        setPhone(job.customer_phone || "");
        setEmail(job.customer_email || "");
      }
    } catch (error) {
      console.error('Error loading job data:', error);
    }
  };

  // Validation logic
  const postalOk = /^\d{5}$/.test(postal);
  const hasContactWay = (phone?.trim()?.length || 0) > 0 || (email?.trim()?.length || 0) > 0;
  const addressComplete = street && house && postalOk && city;
  const allDataComplete = addressComplete && cName && contact && hasContactWay;

  const handleSave = async () => {
    if (!allDataComplete) {
      toast({
        title: "Daten unvollständig",
        description: "Bitte alle Pflichtfelder ausfüllen: Firma/Name, Ansprechpartner, vollständige Adresse und mindestens Telefon oder E-Mail.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    
    try {
      const { error } = await supabase.rpc('admin_update_job_contact', {
        _job_id: jobId,
        _firma_oder_name: cName,
        _ansprechpartner: contact,
        _street: street,
        _house: house,
        _postal: postal,
        _city: city,
        _phone: phone,
        _email: email,
      });
      
      if (error) throw error;
      
      setLastSaved(new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }));
      toast({
        title: "Daten gespeichert",
        description: "Auftraggeber-Daten wurden erfolgreich aktualisiert.",
      });
      
      onDataUpdated();
      onClose();
      
    } catch (error: any) {
      console.error('Error saving contact data:', error);
      toast({
        title: "Fehler beim Speichern",
        description: error.message || "Daten konnten nicht gespeichert werden.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Auftraggeber-Daten ergänzen</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-blue-800">Kontaktdaten (alle Felder erforderlich)</h3>
              {lastSaved && (
                <span className="text-sm text-green-600">Gespeichert • zuletzt um {lastSaved}</span>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <Label htmlFor="cname" className="text-sm">Firma/Name *</Label>
                <Input
                  id="cname"
                  value={cName}
                  onChange={(e) => setCName(e.target.value)}
                  placeholder="Firma oder Vollname"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="contact" className="text-sm">Ansprechpartner *</Label>
                <Input
                  id="contact"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Name der Kontaktperson"
                  className="mt-1"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <Label htmlFor="street" className="text-sm">Straße *</Label>
                <Input
                  id="street"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Musterstraße"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="house" className="text-sm">Hausnummer *</Label>
                <Input
                  id="house"
                  value={house}
                  onChange={(e) => setHouse(e.target.value)}
                  placeholder="123"
                  className="mt-1"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <Label htmlFor="postal" className="text-sm">PLZ *</Label>
                <Input
                  id="postal"
                  value={postal}
                  onChange={(e) => setPostal(e.target.value)}
                  placeholder="12345"
                  pattern="[0-9]{5}"
                  maxLength={5}
                  className={`mt-1 ${!postalOk && postal ? 'border-red-300' : ''}`}
                />
                {postal && !postalOk && (
                  <p className="text-xs text-red-600 mt-1">PLZ muss 5-stellig sein</p>
                )}
              </div>
              <div>
                <Label htmlFor="city" className="text-sm">Ort *</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Musterstadt"
                  className="mt-1"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="phone" className="text-sm">Telefon</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+49 123 456789"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-sm">E-Mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kontakt@firma.de"
                  className="mt-1"
                />
              </div>
            </div>
            
            {!hasContactWay && (
              <p className="text-sm text-orange-600 mt-2">
                Mindestens Telefon oder E-Mail muss angegeben werden.
              </p>
            )}
            
            {!allDataComplete && (
              <p className="text-sm text-blue-600 mt-2">
                Alle markierten Felder (*) müssen ausgefüllt werden. PLZ muss 5-stellig sein.
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Abbrechen
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving || !allDataComplete}
              className="flex-1"
            >
              {isSaving ? "Speichern..." : "Daten speichern"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}