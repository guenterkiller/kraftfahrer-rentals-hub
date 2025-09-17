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
  const [isAssigning, setIsAssigning] = useState(false);
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(false);
  const { toast } = useToast();

  // Load drivers when dialog opens
  useEffect(() => {
    if (open) {
      loadDrivers();
    }
  }, [open]);

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

  const handleAssign = async () => {
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

      // Sofort E-Mail + PDF versenden
      const { data: mailData, error: mailErr } = await supabase.functions.invoke(
        "send-driver-confirmation",
        { body: { assignment_id: assignmentId, stage: "assigned" } }
      );
      
      if (mailErr) {
        console.error('❌ E-Mail error:', mailErr);
        
        // Check if it's an address validation error
        if (mailErr.message && mailErr.message.includes('Vollständige Anschrift')) {
          toast({
            title: "Adressdaten unvollständig",
            description: "Bitte ergänzen Sie die vollständige Anschrift des Auftraggebers (Straße + Nr., PLZ + Ort) vor der Zuweisung.",
            variant: "destructive"
          });
          return; // Don't throw, just show message and keep dialog open
        }
        
        throw mailErr;
      }

      console.log('✅ E-Mail sent successfully');

      toast({
        title: "Zuweisung gespeichert & E-Mail versendet",
        description: "Der Fahrer wurde zugewiesen und die E-Mail wurde versendet."
      });

      onAssignmentComplete();
      onClose();
      
      // Reset form
      setSelectedDriverId("");
      setRateValue("");
      setStartDate("");
      setEndDate("");
      setNote("");
      
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

          <div className="flex gap-2 pt-4">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Abbrechen
            </Button>
            <Button 
              onClick={handleAssign} 
              disabled={isAssigning || !selectedDriverId || !rateValue || filteredDrivers.length === 0}
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