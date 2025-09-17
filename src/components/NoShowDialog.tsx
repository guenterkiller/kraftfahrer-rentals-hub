import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { X, Calculator } from "lucide-react";

interface NoShowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: {
    id: string;
    rate_type: string;
    rate_value: number;
    start_date?: string;
    job_requests: {
      customer_name: string;
      fahrzeugtyp: string;
    };
    fahrer_profile: {
      vorname: string;
      nachname: string;
    };
  };
  onSuccess: () => void;
}

export const NoShowDialog: React.FC<NoShowDialogProps> = ({
  open,
  onOpenChange,
  assignment,
  onSuccess
}) => {
  const [reason, setReason] = useState("");
  const [calculatedFee, setCalculatedFee] = useState<{ fee_cents: number; tier: string } | null>(null);
  const [overrideFee, setOverrideFee] = useState("");
  const [sendNotification, setSendNotification] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && assignment) {
      calculateFee();
      setReason("");
      setOverrideFee("");
      setSendNotification(true);
    }
  }, [open, assignment]);

  const calculateFee = async () => {
    if (!assignment) return;
    
    setIsCalculating(true);
    try {
      const { data, error } = await supabase.rpc('calc_no_show_fee_cents', {
        _rate_type: assignment.rate_type,
        _rate_value: assignment.rate_value,
        _starts_at: assignment.start_date || new Date().toISOString()
      });

      if (error) {
        console.error('Error calculating fee:', error);
        setCalculatedFee({ fee_cents: 15000, tier: 'fallback' }); // 150€ fallback
      } else if (data && data.length > 0) {
        setCalculatedFee(data[0]);
      }
    } catch (error) {
      console.error('Unexpected error calculating fee:', error);
      setCalculatedFee({ fee_cents: 15000, tier: 'fallback' });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSubmit = async () => {
    if (!assignment || !calculatedFee) return;

    setIsLoading(true);
    try {
      // Mark No-Show in database
      const overrideFeeValue = overrideFee && parseFloat(overrideFee) > 0 ? parseFloat(overrideFee) : null;
      
      const { data, error } = await supabase.rpc('admin_mark_no_show', {
        _assignment_id: assignment.id,
        _reason: reason || 'Fahrer nicht erschienen',
        _override_fee_eur: overrideFeeValue
      });

      if (error) {
        console.error('❌ Error marking No-Show:', error);
        toast({
          title: "Fehler beim Markieren",
          description: `Fehler: ${error.message || 'Unbekannter Fehler'}`,
          variant: "destructive"
        });
        return;
      }

      console.log('✅ No-Show marked successfully');
      
      // Send notification if requested
      if (sendNotification) {
        const { data: emailData, error: emailError } = await supabase.functions.invoke('send-no-show-notice', {
          body: { assignment_id: assignment.id }
        });

        if (emailError) {
          console.error('❌ Error sending No-Show notice:', emailError);
          toast({
            title: "No-Show markiert, aber E-Mail fehlgeschlagen",
            description: `No-Show wurde vermerkt, aber E-Mail konnte nicht gesendet werden: ${emailError.message}`,
            variant: "destructive"
          });
        } else {
          console.log('✅ No-Show notice sent successfully');
          toast({
            title: "No-Show erfolgreich vermerkt",
            description: "No-Show wurde vermerkt und Auftraggeber informiert.",
          });
        }
      } else {
        toast({
          title: "No-Show erfolgreich vermerkt",
          description: "No-Show wurde vermerkt (ohne E-Mail-Benachrichtigung).",
        });
      }
      
      onSuccess();
      onOpenChange(false);

    } catch (error) {
      console.error('❌ Unexpected error in handleSubmit:', error);
      toast({
        title: "Unerwarteter Fehler",
        description: `Ein Fehler ist aufgetreten: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTierLabel = (tier: string) => {
    const labels: Record<string, string> = {
      '<6h': 'Kurzfristige Absage (unter 6h)',
      '6-24h': 'Absage 6-24 Stunden vorher',
      '24-48h': 'Absage 24-48 Stunden vorher',
      '>=48h': 'Rechtzeitige Absage (über 48h)',
      'override': 'Individuell festgelegt',
      'fallback': 'Standardpauschale'
    };
    return labels[tier] || tier;
  };

  const finalFeeEur = overrideFee && parseFloat(overrideFee) > 0 
    ? parseFloat(overrideFee) 
    : calculatedFee ? calculatedFee.fee_cents / 100 : 150;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <X className="h-5 w-5 text-red-600" />
            No-Show markieren
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="font-medium">{assignment?.fahrer_profile?.vorname} {assignment?.fahrer_profile?.nachname}</p>
            <p className="text-sm text-muted-foreground">
              {assignment?.job_requests?.customer_name} - {assignment?.job_requests?.fahrzeugtyp}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Grund (optional)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="z.B. Fahrer nicht zum Termin erschienen"
              rows={2}
            />
          </div>

          <div className="bg-gray-50 border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              <span className="font-medium">Schadensersatz-Berechnung</span>
            </div>
            
            {isCalculating ? (
              <p className="text-sm text-muted-foreground">Berechne...</p>
            ) : calculatedFee ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Berechneter Betrag:</span>
                  <span className="font-medium">{(calculatedFee.fee_cents / 100).toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Kategorie:</span>
                  <span className="text-sm text-muted-foreground">{getTierLabel(calculatedFee.tier)}</span>
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="override-fee">Betrag überschreiben (optional)</Label>
              <Input
                id="override-fee"
                type="number"
                step="0.01"
                min="0"
                value={overrideFee}
                onChange={(e) => setOverrideFee(e.target.value)}
                placeholder="z.B. 500.00"
              />
              <p className="text-xs text-muted-foreground">
                Endgültiger Betrag: <strong>{finalFeeEur.toFixed(2)} €</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="send-notification"
              checked={sendNotification}
              onCheckedChange={(checked) => setSendNotification(checked as boolean)}
            />
            <Label htmlFor="send-notification" className="text-sm">
              E-Mail-Benachrichtigung an Auftraggeber senden
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || isCalculating}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? "Verarbeite..." : `No-Show markieren (${finalFeeEur.toFixed(2)} €)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};