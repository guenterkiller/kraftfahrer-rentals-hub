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
  
  // Customer contact data state
  const [jobData, setJobData] = useState<any>(null);
  const [cName, setCName] = useState("");
  const [contact, setContact] = useState("");
  const [street, setStreet] = useState("");
  const [house, setHouse] = useState("");
  const [postal, setPostal] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  
  const { toast } = useToast();

  // Load drivers and job data when dialog opens
  useEffect(() => {
    if (open) {
      loadDrivers();
      loadJobData();
    }
  }, [open, jobId]);

  const loadJobData = async () => {
    try {
      // Check admin session first
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Nicht eingeloggt",
          description: "Bitte melden Sie sich erneut an.",
          variant: "destructive"
        });
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      console.log('🔐 Auth user:', user?.email);

      const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin_user');
      console.log('🔐 is_admin_user():', isAdmin, adminError);

      if (!isAdmin) {
        toast({
          title: "Keine Admin-Berechtigung",
          description: "Zugriff verweigert.",
          variant: "destructive"
        });
        return;
      }

      // Use SECURITY DEFINER function to get job data
      const { data: job, error } = await supabase.rpc('admin_get_job', { _job_id: jobId });

      if (error) {
        console.error('❌ Fehler beim Laden der Job-Daten:', error);
        toast({
          title: "Fehler beim Laden der Job-Daten",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      if (job) {
        console.log('📋 Job data loaded via RPC:', job);
        setJobData(job);
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
      console.error('❌ Unerwarteter Fehler beim Laden der Job-Daten:', error);
      toast({
        title: "Unerwarteter Fehler",
        description: `${error}`,
        variant: "destructive"
      });
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

  // Validation logic
  const postalOk = /^\d{5}$/.test(postal);
  const hasContactWay = (phone?.trim()?.length || 0) > 0 || (email?.trim()?.length || 0) > 0;
  const customerAddressComplete = street && house && postalOk && city;
  const needsFix = !(customerAddressComplete && cName && contact && hasContactWay);

  const saveContactIfNeeded = async () => {
    if (!needsFix) return;
    
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
      
    } catch (error: any) {
      console.error('Error saving contact data:', error);
      throw error;
    }
  };

  const handleAssignAndSend = async () => {
    if (!selectedDriverId || !rateValue) {
      toast({
        title: "Eingabefehler",
        description: "Bitte wählen Sie einen Fahrer und geben Sie einen Stundensatz ein.",
        variant: "destructive"
      });
      return;
    }

    setIsAssigning(true);
    
    try {
      // Session & Admin-Check VOR jedem Admin-Flow
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "❌ Nicht eingeloggt",
          description: "Bitte loggen Sie sich erneut ein.",
          variant: "destructive"
        });
        return;
      }

      const { data: isAdmin, error: adminCheckError } = await supabase.rpc('is_admin_user');
      if (adminCheckError || !isAdmin) {
        toast({
          title: "❌ Kein Admin-Recht",
          description: "Sie haben keine Berechtigung für diese Aktion.",
          variant: "destructive"
        });
        return;
      }

      // 1) DEBUG: Log input values
      console.log('🔍 PRE-Zuweisen', { 
        jobId, 
        selectedDriverId, 
        rateType, 
        rateValue,
        jobIdType: typeof jobId,
        driverIdType: typeof selectedDriverId
      });

      // 2) DEBUG: Test parameter passing with echo function
      const { data: echoData, error: echoError } = await supabase.rpc('debug_echo_ids', {
        _job_id: jobId,
        _driver_id: selectedDriverId
      });
      
      if (echoError) {
        console.error('❌ Echo test failed:', echoError);
      } else {
        console.log('📡 Echo test result:', echoData);
      }

      // 3) PREFLIGHT: Check if job exists and is accessible
      const { data: job, error: jobError } = await supabase
        .from('job_requests')
        .select('id, customer_postal_code, customer_street, customer_house_number, customer_city, status')
        .eq('id', jobId)
        .maybeSingle();

      if (jobError) {
        console.error('❌ Preflight job check failed:', jobError);
        throw new Error(`Preflight job error: ${jobError.message}`);
      }
      
      if (!job) {
        console.error('❌ Preflight: Job not found:', jobId);
        toast({
          title: "Preflight Fehler",
          description: "Job nicht gefunden in der Datenbank",
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Preflight: Job found:', job);

      // 4) PREFLIGHT: Check address completeness
      const postalOk = /^\d{5}$/.test(job.customer_postal_code || '');
      if (!postalOk || !job.customer_street || !job.customer_house_number || !job.customer_city) {
        console.error('❌ Preflight: Address incomplete:', {
          postal: job.customer_postal_code,
          street: job.customer_street,
          house: job.customer_house_number,
          city: job.customer_city
        });
        toast({
          title: "Preflight Fehler",
          description: "Adresse unvollständig - bitte erst vervollständigen",
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Preflight: Address complete');

      // 5) PREFLIGHT: Check if driver exists
      const { data: driver, error: driverError } = await supabase
        .from('fahrer_profile')
        .select('id, vorname, nachname, status')
        .eq('id', selectedDriverId)
        .maybeSingle();

      if (driverError || !driver) {
        console.error('❌ Preflight: Driver not found:', selectedDriverId, driverError);
        toast({
          title: "Preflight Fehler", 
          description: "Fahrer nicht gefunden in der Datenbank",
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Preflight: Driver found:', driver);

      // 6) Save address data if needed (using RPC admin_update_job_contact)
      if (needsFix) {
        await supabase.rpc('admin_update_job_contact', {
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
        console.log('✅ Contact data updated');
      }

      // 7) NOW call the assignment RPC
      console.log('🚀 Calling admin_assign_driver...');
      const { data: assignmentId, error: assignErr } = await supabase.rpc('admin_assign_driver', {
        _job_id: jobId,
        _driver_id: selectedDriverId,
        _rate_type: rateType,
        _rate_value: parseFloat(rateValue),
        _start_date: startDate || null,
        _end_date: endDate || null,
        _note: note || null
      });

      if (assignErr || !assignmentId) {
        console.error('❌ Assignment error:', assignErr);
        
        // Spezielle Behandlung für "bereits zugewiesenen Job"
        if (assignErr?.message?.includes('already has an active assignment')) {
          toast({
            title: "⚠️ Job bereits zugewiesen",
            description: "Dieser Job hat bereits eine aktive Zuweisung. Bitte stornieren Sie die bestehende Zuweisung zuerst.",
            variant: "destructive"
          });
          return;
        }
        
        toast({
          title: "Assignment Fehler",
          description: assignErr?.message || 'Assignment fehlgeschlagen - keine ID erhalten',
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Assignment created with ID:', assignmentId);

      // 5) Send confirmation email using supabase.functions.invoke
      const { error: mailErr } = await supabase.functions.invoke('send-driver-confirmation', {
        body: { 
          assignment_id: assignmentId,
          mode: attachPdf ? 'both' : 'inline'
        }
      });

      if (mailErr) {
        console.error('Email sending error:', mailErr);
        toast({
          title: "E-Mail-Versand fehlgeschlagen", 
          description: "Fahrer zugewiesen, aber E-Mail konnte nicht versendet werden: " + mailErr.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Zugewiesen & Bestätigung gesendet",
          description: "Fahrer wurde erfolgreich zugewiesen und Einsatzbestätigung versendet.",
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
      
      onAssignmentComplete();
      onClose();
      
    } catch (error: any) {
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

  const handleSaveDataOnly = async () => {
    try {
      await saveContactIfNeeded();
    } catch (error: any) {
      toast({
        title: "Fehler beim Speichern",
        description: error.message || "Daten konnten nicht gespeichert werden.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Fahrer zuweisen</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Customer Data Section - Show if incomplete */}
          {needsFix && (
            <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-orange-800">Auftraggeber-Daten (Pflicht)</h3>
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
              
              <div className="flex justify-end mt-3">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleSaveDataOnly}
                  disabled={needsFix}
                >
                  Daten speichern
                </Button>
              </div>
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
              onClick={handleAssignAndSend} 
              disabled={isAssigning || !selectedDriverId || !rateValue || filteredDrivers.length === 0}
              className="flex-1"
            >
              {isAssigning ? "Zuweisen..." : "Zuweisen & Bestätigung senden"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}