import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AdminAssignmentDialogProps {
  open: boolean;
  onClose: () => void;
  jobId: string;
  onAssignmentComplete: () => void;
}

export function AdminAssignmentDialog({ 
  open, 
  onClose, 
  jobId, 
  onAssignmentComplete 
}: AdminAssignmentDialogProps) {
  const [drivers, setDrivers] = useState<Array<{ id: string; vorname: string; nachname: string; email: string; status: string }>>([]);
  const [showOnlyApproved, setShowOnlyApproved] = useState(true);
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [rateType, setRateType] = useState<"hourly" | "daily">("hourly");
  const [rateValue, setRateValue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [note, setNote] = useState("");
  const [attachPdf, setAttachPdf] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(false);
  const [addressIncomplete, setAddressIncomplete] = useState(false);
  const [address, setAddress] = useState({
    street: "",
    houseNumber: "",
    postalCode: "",
    city: ""
  });
  const { toast } = useToast();

  // Load drivers and check address when dialog opens
  useEffect(() => {
    if (open) {
      loadDrivers();
      checkAddressComplete();
    }
  }, [open, jobId]);

  const checkAddressComplete = async () => {
    try {
      // Check if address is complete using direct query
      const { data: jobData, error } = await supabase
        .from('job_requests')
        .select('customer_street, customer_house_number, customer_postal_code, customer_city')
        .eq('id', jobId)
        .maybeSingle();
      
      if (error) throw error;
      
      const isComplete = jobData && 
        jobData.customer_street && jobData.customer_street.trim() !== '' &&
        jobData.customer_house_number && jobData.customer_house_number.trim() !== '' &&
        jobData.customer_postal_code && /^\d{5}$/.test(jobData.customer_postal_code) &&
        jobData.customer_city && jobData.customer_city.trim() !== '';
      
      setAddressIncomplete(!isComplete);
      
      // Load existing address data (even if incomplete)
      if (jobData) {
        setAddress({
          street: jobData.customer_street || "",
          houseNumber: jobData.customer_house_number || "",
          postalCode: jobData.customer_postal_code || "",
          city: jobData.customer_city || ""
        });
      }
    } catch (error) {
      console.error('Error checking address:', error);
    }
  };

  const loadDrivers = async () => {
    setIsLoadingDrivers(true);
    try {
      // Get admin session
      const adminSession = localStorage.getItem('adminSession');
      if (!adminSession) {
        throw new Error('Keine Admin-Session gefunden');
      }
      
      const session = JSON.parse(adminSession);
      
      // Use the same edge function as the rest of the admin system
      const { data, error } = await supabase.functions.invoke('admin-data-fetch', {
        body: {
          email: session.email,
          dataType: 'fahrer'
        }
      });
      
      if (error) {
        console.error("❌ Error loading drivers:", error);
        toast({
          title: "Fehler beim Laden der Fahrer",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      
      console.log("✅ Drivers loaded successfully:", data?.data?.length || 0);
      setDrivers((data?.data as any[]) || []);
      
    } catch (error) {
      console.error("❌ Unexpected error loading drivers:", error);
      toast({
        title: "Unerwarteter Fehler",
        description: "Fahrer konnten nicht geladen werden.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingDrivers(false);
    }
  };

  // Filter drivers based on toggle
  const filteredDrivers = showOnlyApproved 
    ? drivers.filter(d => d.status === 'active' || d.status === 'approved')
    : drivers;

  const ensureAddress = async (jobId: string) => {
    const { error } = await supabase.from('job_requests').update({
      customer_street: address.street,
      customer_house_number: address.houseNumber,
      customer_postal_code: address.postalCode,
      customer_city: address.city,
    }).eq('id', jobId);
    if (error) throw error;
  };

  const addressComplete = address.street && address.houseNumber && /^\d{5}$/.test(address.postalCode) && address.city;

  const handleAssign = async () => {
    if (!selectedDriverId || !rateValue) {
      toast({
        title: "Eingabefehler",
        description: "Bitte wählen Sie einen Fahrer und geben Sie einen Stundensatz ein.",
        variant: "destructive"
      });
      return;
    }

    if (addressIncomplete && !addressComplete) {
      toast({
        title: "Adresse unvollständig",
        description: "Bitte füllen Sie die vollständige Anschrift aus.",
        variant: "destructive"
      });
      return;
    }

    setIsAssigning(true);
    
    try {
      // Ensure address is complete if needed
      if (addressIncomplete) {
        await ensureAddress(jobId);
      }

      // Zuweisen
      const { data, error } = await supabase.rpc('admin_assign_driver', {
        _job_id: jobId,
        _driver_id: selectedDriverId,
        _rate_type: rateType,
        _rate_value: parseFloat(rateValue),
        _start_date: startDate || null,
        _end_date: endDate || null,
        _note: note || null
      });

      if (error) {
        throw error;
      }

      const assignmentId = data as string;
      console.log('✅ Assignment created with ID:', assignmentId);

      // Sofort E-Mail + PDF auslösen:
      try {
        const res = await fetch(`https://hxnabnsoffzevqhruvar.supabase.co/functions/v1/send-driver-confirmation`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4bmFibnNvZmZ6ZXZxaHJ1dmFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MTI1OTMsImV4cCI6MjA2ODQ4ODU5M30.WI-nu1xYjcjz67ijVTyTGC6GPW77TOsFdy1cpPW4dzc`
          },
          body: JSON.stringify({ 
            assignment_id: assignmentId,
            mode: attachPdf ? 'both' : 'inline'
          }),
        });
        
        if (!res.ok) {
          const { error: errTxt } = await res.json().catch(() => ({ error: 'Unbekannter Fehler' }));
          toast({
            title: "E-Mail-Versand fehlgeschlagen",
            description: `${errTxt}`,
            variant: "destructive"
          });
        } else {
          const deliveryMode = attachPdf ? 'both' : 'inline';
          toast({
            title: "Zuweisung erfolgreich",
            description: `Fahrer zugewiesen und Einsatzbestätigung versendet (${deliveryMode === 'both' ? 'mit PDF-Anhang' : 'mit PDF-Link'}).`
          });
        }
      } catch (emailErr: any) {
        console.error('Email sending error:', emailErr);
        toast({
          title: "E-Mail-Versand fehlgeschlagen", 
          description: "Fahrer zugewiesen, aber E-Mail konnte nicht versendet werden",
          variant: "destructive"
        });
      }

      // Reset form
      setSelectedDriverId("");
      setRateType("hourly");
      setRateValue("");
      setStartDate("");
      setEndDate("");
      setNote("");
      setAttachPdf(false);
      setAddress({ street: "", houseNumber: "", postalCode: "", city: "" });
      setAddressIncomplete(false);
      
      onAssignmentComplete();
      onClose();
      
      setAttachPdf(false);
      
    } catch (error) {
      console.error('Assignment error:', error);
      
      // Handle unique constraint violation (double assignment)
      if (error.code === '23505' && error.message?.includes('ux_job_assignments_job_active')) {
        toast({
          title: "Doppelzuweisung verhindert",
          description: "Für diesen Auftrag ist bereits ein aktiver Fahrer zugewiesen. Erst stornieren oder ersetzen.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Zuweisungsfehler",
          description: error.message || "Fehler bei der Zuweisung.",
          variant: "destructive"
        });
      }
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Fahrer zuweisen</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Address Section - Show if incomplete */}
          {addressIncomplete && (
            <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
              <h3 className="font-medium text-orange-800 mb-3">Anschrift vervollständigen</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="address-street" className="text-sm">Straße *</Label>
                  <Input
                    id="address-street"
                    value={address.street}
                    onChange={(e) => setAddress({...address, street: e.target.value})}
                    placeholder="Musterstraße"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="address-number" className="text-sm">Hausnummer *</Label>
                  <Input
                    id="address-number"
                    value={address.houseNumber}
                    onChange={(e) => setAddress({...address, houseNumber: e.target.value})}
                    placeholder="123"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="address-zip" className="text-sm">PLZ *</Label>
                  <Input
                    id="address-zip"
                    value={address.postalCode}
                    onChange={(e) => setAddress({...address, postalCode: e.target.value})}
                    placeholder="12345"
                    pattern="[0-9]{5}"
                    maxLength={5}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="address-city" className="text-sm">Ort *</Label>
                  <Input
                    id="address-city"
                    value={address.city}
                    onChange={(e) => setAddress({...address, city: e.target.value})}
                    placeholder="Musterstadt"
                    className="mt-1"
                  />
                </div>
              </div>
              {!addressComplete && (
                <p className="text-sm text-orange-600 mt-2">
                  Alle Adressfelder müssen ausgefüllt sein. PLZ muss 5-stellig sein.
                </p>
              )}
            </div>
          )}

          {/* Driver Filter Toggle */}
          <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
            <Switch
              id="show-approved"
              checked={showOnlyApproved}
              onCheckedChange={setShowOnlyApproved}
            />
            <Label htmlFor="show-approved" className="text-sm">
              Nur freigeschaltete Fahrer anzeigen ({filteredDrivers.length} von {drivers.length})
            </Label>
          </div>

          <div>
            <Label>Fahrer auswählen</Label>
            {isLoadingDrivers ? (
              <div className="p-3 text-center text-muted-foreground">
                Lade Fahrer...
              </div>
            ) : filteredDrivers.length === 0 ? (
              <div className="space-y-3">
                <div className="p-3 text-center text-muted-foreground border rounded">
                  {drivers.length === 0 
                    ? "Keine Fahrer gefunden. Bitte zuerst Fahrer anlegen."
                    : "Keine freigeschalteten Fahrer. Filter ausschalten oder Fahrer genehmigen."
                  }
                </div>
                {drivers.length > 0 && showOnlyApproved && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowOnlyApproved(false)}
                    className="w-full"
                  >
                    Alle Fahrer anzeigen
                  </Button>
                )}
              </div>
            ) : (
              <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
                <SelectTrigger>
                  <SelectValue placeholder="Fahrer wählen..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredDrivers.map(driver => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.vorname} {driver.nachname} ({driver.email}) - {driver.status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Abrechnungsart</Label>
              <Select value={rateType} onValueChange={(value: "hourly" | "daily") => setRateType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Stundensatz</SelectItem>
                  <SelectItem value="daily">Tagessatz</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Satz (€)</Label>
              <Input
                type="number"
                value={rateValue}
                onChange={(e) => setRateValue(e.target.value)}
                placeholder="25.00"
                step="0.50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Startdatum (optional)</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            
            <div>
              <Label>Enddatum (optional)</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Notiz (optional)</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Zusätzliche Informationen..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="attach-pdf"
              checked={attachPdf}
              onCheckedChange={setAttachPdf}
            />
            <Label htmlFor="attach-pdf">PDF als Anhang senden (sonst nur Link)</Label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Abbrechen
            </Button>
            <Button 
              onClick={handleAssign} 
              disabled={isAssigning || !selectedDriverId || !rateValue || filteredDrivers.length === 0 || (addressIncomplete && !addressComplete)}
              className="flex-1"
            >
              {isAssigning ? "Zuweisen..." : "Zuweisen"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}