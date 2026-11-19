import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { agreementNote, agreementErrors } from "@/lib/offerReadiness";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { buildDriverOfferView } from "@/lib/driverOfferRemuneration";
import { sendAssignmentNotifications } from "@/lib/assignmentNotifications";
import { buildAutomaticAssignment, jobPeriod } from "@/lib/automaticAssignment";
import { formatEuro } from "@/lib/kostenUebersicht";

interface AdminAssignmentDialogProps {
  open: boolean;
  onClose: () => void;
  jobId: string;
  onAssignmentComplete: () => void;
}

type Driver = { id: string; vorname: string; nachname: string; email: string; status: string };

export function AdminAssignmentDialog({ open, onClose, jobId, onAssignmentComplete }: AdminAssignmentDialogProps) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [jobData, setJobData] = useState<any>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;
    setSelectedDriverId("");
    setStartDate("");
    setEndDate("");
    setJobData(null);
    void loadDrivers();
    void loadJobData();
  }, [open, jobId]);

  const loadJobData = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("admin-data-fetch", { body: { dataType: "jobs" } });
      if (error) throw error;
      const job = data?.data?.find((item: any) => item.id === jobId);
      if (!job) throw new Error("Auftrag nicht gefunden");
      setJobData(job);
      const period = jobPeriod(job);
      setStartDate(period.startDate);
      setEndDate(period.endDate);
    } catch (error: any) {
      toast({ title: "Auftrag konnte nicht geladen werden", description: error?.message, variant: "destructive" });
    }
  };

  const loadDrivers = async () => {
    setIsLoadingDrivers(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-data-fetch", { body: { dataType: "fahrer" } });
      if (error) throw error;
      const approved = ((data?.data as Driver[]) ?? []).filter((driver) => driver.status === "active" || driver.status === "approved");
      setDrivers(approved);
    } catch (error: any) {
      toast({ title: "Fahrer konnten nicht geladen werden", description: error?.message, variant: "destructive" });
    } finally {
      setIsLoadingDrivers(false);
    }
  };

  const automatic = buildAutomaticAssignment(jobData, startDate, endDate);
  const previewAssignment = automatic.agreement ? {
    rate_type: automatic.rateType,
    rate_value: automatic.rateValue,
    start_date: `${startDate}T00:00:00.000Z`,
    end_date: `${endDate}T00:00:00.000Z`,
    admin_note: agreementNote("", automatic.agreement),
  } : null;
  const offerView = previewAssignment && jobData ? buildDriverOfferView(jobData, previewAssignment) : null;
  const offerErrors = [...new Set([
    ...automatic.errors,
    ...(previewAssignment && jobData ? agreementErrors(jobData, previewAssignment) : []),
    ...(offerView?.missing ?? []),
  ])];
  const netLine = offerView?.lines.find(([label]) => label.startsWith("Verbleibende Nettovergütung"))?.[1];

  const functionError = async (error: any, fallback: string) => {
    if (error instanceof FunctionsHttpError) {
      const details = await error.context.json().catch(() => null);
      return details?.error || details?.message || fallback;
    }
    return error?.message || fallback;
  };

  const handleAssignAndSend = async () => {
    if (!selectedDriverId || !previewAssignment || !automatic.agreement || offerErrors.length > 0) {
      toast({
        title: "Zuweisung nicht möglich",
        description: !selectedDriverId ? "Bitte einen Fahrer auswählen." : offerErrors.join(" "),
        variant: "destructive",
      });
      return;
    }

    setIsAssigning(true);
    try {
      const { data: assignResult, error: assignError } = await supabase.functions.invoke("admin-assign-driver", {
        body: {
          jobId,
          driverId: selectedDriverId,
          rateType: automatic.rateType,
          rateValue: automatic.rateValue,
          startDate: previewAssignment.start_date,
          endDate: previewAssignment.end_date,
          timesEntered: false,
          note: previewAssignment.admin_note,
        },
      });
      if (assignError || !assignResult?.success) {
        throw new Error(await functionError(assignError, assignResult?.error || "Zuweisung fehlgeschlagen"));
      }

      const assignmentId = assignResult.assignmentId;
      const notifications = await sendAssignmentNotifications({
        confirmAdminAssignment: async () => {
          const { error } = await supabase.rpc("admin_confirm_assignment", { _assignment_id: assignmentId });
          if (error) throw error;
        },
        sendCustomerConfirmation: async () => {
          const { data, error } = await supabase.functions.invoke("send-customer-assignment-notice", { body: { assignment_id: assignmentId } });
          if (error) throw new Error(await functionError(error, "Kunden-Einsatzbestätigung nicht versendet"));
          if (data?.success !== true) throw new Error(data?.error || "Kunden-Einsatzbestätigung nicht bestätigt");
        },
        sendDriverOffer: async () => {
          const { data, error } = await supabase.functions.invoke("send-driver-confirmation", { body: { assignment_id: assignmentId, mode: "inline" } });
          if (error) throw new Error(await functionError(error, "Fahrerangebot nicht versendet"));
          if (data?.ok !== true || data?.skipped) throw new Error(data?.message || "Kein neuer Fahrer-Versand bestätigt");
        },
      });

      if (notifications.customerConfirmation === "sent" && notifications.driverOffer === "sent") {
        toast({ title: "Fahrer verbindlich zugewiesen", description: "Einsatzbestätigung an den Kunden und Fahrerangebot versendet." });
      } else {
        toast({ title: "Zuweisung gespeichert – Versand prüfen", description: notifications.errors.join(" · "), variant: "destructive" });
      }
      onAssignmentComplete();
      onClose();
    } catch (error: any) {
      const message = String(error?.message || "");
      toast({
        title: message.includes("Dieser Fahrer ist diesem Auftrag bereits zugewiesen") ? "Fahrer bereits zugewiesen" : "Zuweisungsfehler",
        description: message || "Fehler bei der Zuweisung.",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Fahrer zuweisen</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div>
            <Label htmlFor="assignment-driver">Fahrer</Label>
            {isLoadingDrivers ? (
              <p className="py-3 text-sm text-muted-foreground">Fahrer werden geladen …</p>
            ) : (
              <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
                <SelectTrigger id="assignment-driver" className="mt-1">
                  <SelectValue placeholder={drivers.length ? "Freigeschalteten Fahrer wählen …" : "Keine freigeschalteten Fahrer vorhanden"} />
                </SelectTrigger>
                <SelectContent>
                  {drivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.vorname} {driver.nachname} ({driver.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="assignment-start">Einsatzbeginn</Label>
              <Input id="assignment-start" className="mt-1" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
            </div>
            <div>
              <Label htmlFor="assignment-end">Einsatzende</Label>
              <Input id="assignment-end" className="mt-1" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
            </div>
          </div>

          <div className="rounded-lg border bg-muted/40 p-4" aria-live="polite" data-testid="driver-net-preview">
            <p className="text-sm font-medium">Fahrer-Nettohonorar nach Provision</p>
            <p className="mt-1 text-2xl font-bold">{automatic.driverNetCents !== null && netLine ? netLine : "Noch nicht berechenbar"}</p>
            {automatic.unitNetCents !== null && automatic.unitLabel && (
              <p className="mt-1 text-sm text-muted-foreground">{formatEuro(automatic.unitNetCents / 100)} {automatic.unitLabel}</p>
            )}
            {automatic.billing && <p className="mt-3 text-sm">{automatic.billing}</p>}
            <p className="mt-2 text-xs text-muted-foreground">Reguläre Arbeitstage Montag bis Freitag werden automatisch aus den Kalenderdaten übernommen. Nur ausdrücklich gebuchte Abweichungen werden zusätzlich berücksichtigt.</p>
          </div>

          {offerErrors.length > 0 && (
            <div role="alert" className="rounded-md border border-destructive/40 p-3 text-sm text-destructive">
              <p className="font-semibold">Bitte vor der Zuweisung klären:</p>
              <ul className="mt-1 list-disc pl-5">{offerErrors.map((issue) => <li key={issue}>{issue}</li>)}</ul>
            </div>
          )}

          <p className="text-xs text-muted-foreground">Das verbindliche Angebot wird erst durch diese Zuweisung erstellt. Der Einsatzort wird aus den vorhandenen Auftragsdaten übernommen.</p>

          <div className="flex gap-2 pt-1">
            <Button onClick={onClose} variant="outline" className="flex-1">Abbrechen</Button>
            <Button
              onClick={handleAssignAndSend}
              disabled={isAssigning || !selectedDriverId || !previewAssignment || offerErrors.length > 0 || drivers.length === 0}
              className="flex-1"
            >
              {isAssigning ? "Zuweisen …" : "Zuweisen & Bestätigung senden"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
