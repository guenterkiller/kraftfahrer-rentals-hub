import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AdminAssignmentDialogProps {
  open: boolean;
  onClose: () => void;
  jobId: string;
  drivers: Array<{ id: string; vorname: string; nachname: string; email: string; status: string }>;
  onAssignmentComplete: () => void;
}

export function AdminAssignmentDialog({ 
  open, 
  onClose, 
  jobId, 
  drivers, 
  onAssignmentComplete 
}: AdminAssignmentDialogProps) {
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [rateType, setRateType] = useState<"hourly" | "daily">("hourly");
  const [rateValue, setRateValue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [note, setNote] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const { toast } = useToast();

  const activeDrivers = drivers.filter(d => d.status === 'active' || d.status === 'approved');
  
  console.log("🎯 AdminAssignmentDialog: Available drivers:", drivers.length);
  console.log("🎯 AdminAssignmentDialog: Active drivers:", activeDrivers.length);
  console.log("🎯 AdminAssignmentDialog: Driver statuses:", drivers.map(d => ({ name: d.vorname + " " + d.nachname, status: d.status })));

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

      // Log admin action
      const adminSession = localStorage.getItem('adminSession');
      if (adminSession) {
        const session = JSON.parse(adminSession);
        await supabase.from('admin_actions').insert({
          action: 'assign_driver',
          job_id: jobId,
          assignment_id: data,
          admin_email: session.email,
          note: note || null
        });
      }

      toast({
        title: "Fahrer erfolgreich zugewiesen",
        description: "Der Fahrer wurde dem Job zugewiesen."
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
      toast({
        title: "Zuweisungsfehler",
        description: error.message || "Fehler bei der Zuweisung.",
        variant: "destructive"
      });
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
          <div>
            <Label>Fahrer auswählen</Label>
            <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
              <SelectTrigger>
                <SelectValue placeholder="Fahrer wählen..." />
              </SelectTrigger>
              <SelectContent>
                {activeDrivers.length === 0 ? (
                  <SelectItem value="" disabled>
                    Keine aktiven Fahrer verfügbar. Bitte zuerst Fahrer genehmigen.
                  </SelectItem>
                ) : (
                  activeDrivers.map(driver => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.vorname} {driver.nachname} ({driver.email})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
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
              disabled={isAssigning || !selectedDriverId || !rateValue}
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