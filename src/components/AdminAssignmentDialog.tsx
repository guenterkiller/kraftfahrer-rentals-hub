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
import { buildDriverOfferView, commissionPctForTarif } from "@/lib/driverOfferRemuneration";
import { sendAssignmentNotifications } from "@/lib/assignmentNotifications";
import { formatEuro, wochenendarbeitGebucht } from "@/lib/kostenUebersicht";
import { listSurchargeDays } from "@/lib/germanHolidays";

interface AdminAssignmentDialogProps {
  open: boolean;
  onClose: () => void;
  jobId: string;
  onAssignmentComplete: () => void;
}

type Driver = { id: string; vorname: string; nachname: string; email: string; status: string };
type AutomaticTerms = {
  rateType: "daily" | "weekly";
  rateValue: number;
  units: number;
  pct: 20 | 25;
  unitNetCents: number | null;
  unitLabel: string | null;
  billing: string;
  errors: string[];
};

const isoDate = (value: string) => value.includes("-") ? value : value.split(".").reverse().map((part) => part.padStart(2, "0")).join("-");
const validDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

function existingPeriod(job: any) {
  const dates = String(job?.zeitraum ?? "").match(/\d{4}-\d{2}-\d{2}|\d{1,2}\.\d{1,2}\.\d{4}/g) ?? [];
  const startDate = dates[0] ? isoDate(dates[0]) : "";
  return { startDate, endDate: dates[1] ? isoDate(dates[1]) : startDate };
}

function calendarDays(startDate: string, endDate: string) {
  return Math.round((Date.parse(endDate) - Date.parse(startDate)) / 86400000) + 1;
}

function regularWeekdays(startDate: string, endDate: string) {
  let count = 0;
  for (let time = Date.parse(startDate); time <= Date.parse(endDate); time += 86400000) {
    const weekday = new Date(time).getUTCDay();
    if (weekday >= 1 && weekday <= 5) count++;
  }
  return count;
}

/** Nur vorhandene Tarif- und Kalenderdaten; keine neue Preis- oder Zuschlagslogik. */
function automaticTerms(job: any, startDate: string, endDate: string): AutomaticTerms {
  const errors: string[] = [];
  const pct = commissionPctForTarif(job?.tarif_type);
  const tariffRate = Number(job?.tarif_netto);
  if (!job) errors.push("Auftragsdaten werden geladen.");
  if (!validDate(startDate) || !validDate(endDate)) errors.push("Bitte gültigen Einsatzbeginn und Einsatzende wählen.");
  else if (endDate < startDate) errors.push("Das Einsatzende darf nicht vor dem Einsatzbeginn liegen.");
  if (pct === null) errors.push("Die gespeicherte Tarifart hat keine festgelegte Provisionsregel.");
  if (!Number.isFinite(tariffRate) || tariffRate <= 0) errors.push("Der gespeicherte Auftragstarif fehlt oder ist ungültig.");
  if (job?.tarif_needs_review) errors.push("Die Tarifzuordnung ist noch zu prüfen.");

  let rateType: "daily" | "weekly" = "daily";
  let rateValue = tariffRate;
  let units = 0;
  let billing = "";
  if (errors.length === 0) {
    const days = calendarDays(startDate, endDate);
    const weekdays = regularWeekdays(startDate, endDate);
    const flatRate = job.tarif_type === "fernfahrer" || job.tarif_type === "event";
    const weekendBooked = wochenendarbeitGebucht(job.besonderheiten) ||
      String(job.besonderheiten ?? "").split(",").some((entry) => entry.trim() === "Wochenendarbeit") ||
      (Array.isArray(job.weekend_days) && job.weekend_days.length > 0);
    const weekdayHoliday = listSurchargeDays(startDate, endDate).some((entry) => {
      const weekday = new Date(`${entry.date}T00:00:00Z`).getUTCDay();
      return entry.kind === "feiertag" && weekday >= 1 && weekday <= 5;
    });
    if (!flatRate && (weekendBooked || weekdayHoliday)) {
      errors.push("Gebuchte Wochenend- oder Feiertagsabweichungen bleiben im bisherigen Prüfweg; die vereinfachte Zuweisung berechnet nur reguläre Montag-bis-Freitag-Tage ohne Zuschläge.");
    } else if (job.tarif_type === "lkw_ce_woche") {
      const monday = new Date(`${startDate}T00:00:00Z`).getUTCDay() === 1;
      const fullWeeks = monday && (days + 2) % 7 === 0 ? (days + 2) / 7 : 0;
      if (fullWeeks > 0) {
        rateType = "weekly";
        units = fullWeeks;
        billing = `${units} ${units === 1 ? "Woche" : "Wochen"} je Montag–Freitag`;
      } else {
        const restRate = tariffRate / 5;
        if (Math.abs(restRate * 100 - Math.round(restRate * 100)) > 0.000001) {
          errors.push("Der gespeicherte Wochentarif erlaubt keine eindeutige Resttagberechnung.");
        } else {
          rateValue = restRate;
          units = weekdays;
          billing = `${units} reguläre ${units === 1 ? "Einsatztag" : "Einsatztage"} (Montag–Freitag)`;
        }
      }
    } else {
      units = flatRate ? days : weekdays;
      billing = flatRate ? `${units} Einsatztage gemäß vorhandener Pauschale` : `${units} reguläre Einsatztage (Montag–Freitag)`;
    }
    if (units <= 0) errors.push("Im gewählten Zeitraum liegt kein berechenbarer regulärer Einsatztag.");
  }

  const unitRateCents = job?.tarif_type === "lkw_ce_woche" && Number.isFinite(tariffRate)
    ? Math.round(tariffRate * 100) : Number.isFinite(rateValue) ? Math.round(rateValue * 100) : null;
  const unitNetCents = unitRateCents !== null && pct !== null ? unitRateCents - Math.round(unitRateCents * pct / 100) : null;
  return {
    rateType, rateValue, units, pct: pct ?? 20, unitNetCents,
    unitLabel: job?.tarif_type === "lkw_ce_woche" ? "netto je Mo–Fr-Woche" : "netto je Einsatztag",
    billing, errors,
  };
}

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
      const period = existingPeriod(job);
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
      setDrivers(((data?.data as Driver[]) ?? []).filter((driver) => driver.status === "active" || driver.status === "approved"));
    } catch (error: any) {
      toast({ title: "Fahrer konnten nicht geladen werden", description: error?.message, variant: "destructive" });
    } finally {
      setIsLoadingDrivers(false);
    }
  };

  const automatic = automaticTerms(jobData, startDate, endDate);
  const previewAssignment = automatic.errors.length === 0 ? {
    rate_type: automatic.rateType,
    rate_value: automatic.rateValue,
    start_date: `${startDate}T00:00:00.000Z`,
    end_date: `${endDate}T00:00:00.000Z`,
    admin_note: agreementNote("", {
      rate: automatic.rateValue, unit: automatic.rateType, units: automatic.units,
      place: String(jobData?.einsatzort ?? "").trim(), remunerationConfirmed: true, placeConfirmed: true,
    }),
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
    if (!selectedDriverId || !previewAssignment || offerErrors.length > 0) {
      toast({ title: "Zuweisung nicht möglich", description: !selectedDriverId ? "Bitte einen Fahrer auswählen." : offerErrors.join(" "), variant: "destructive" });
      return;
    }

    setIsAssigning(true);
    try {
      const { data: assignResult, error: assignError } = await supabase.functions.invoke("admin-assign-driver", {
        body: {
          jobId, driverId: selectedDriverId, rateType: automatic.rateType, rateValue: automatic.rateValue,
          commissionPct: automatic.pct, startDate: previewAssignment.start_date, endDate: previewAssignment.end_date,
          timesEntered: false, note: previewAssignment.admin_note,
        },
      });
      if (assignError || !assignResult?.success) throw new Error(await functionError(assignError, assignResult?.error || "Zuweisung fehlgeschlagen"));

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
        description: message || "Fehler bei der Zuweisung.", variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Fahrer zuweisen</DialogTitle></DialogHeader>
        <div className="space-y-5">
          <div>
            <Label htmlFor="assignment-driver">Fahrer</Label>
            {isLoadingDrivers ? <p className="py-3 text-sm text-muted-foreground">Fahrer werden geladen …</p> : (
              <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
                <SelectTrigger id="assignment-driver" className="mt-1"><SelectValue placeholder={drivers.length ? "Freigeschalteten Fahrer wählen …" : "Keine freigeschalteten Fahrer vorhanden"} /></SelectTrigger>
                <SelectContent>{drivers.map((driver) => <SelectItem key={driver.id} value={driver.id}>{driver.vorname} {driver.nachname} ({driver.email})</SelectItem>)}</SelectContent>
              </Select>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label htmlFor="assignment-start">Einsatzbeginn</Label><Input id="assignment-start" className="mt-1" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></div>
            <div><Label htmlFor="assignment-end">Einsatzende</Label><Input id="assignment-end" className="mt-1" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} /></div>
          </div>

          <div className="rounded-lg border bg-muted/40 p-4" aria-live="polite" data-testid="driver-net-preview">
            <p className="text-sm font-medium">Fahrer-Nettohonorar nach Provision</p>
            <p className="mt-1 text-2xl font-bold">{netLine && offerView?.mode === "binding" ? netLine : "Noch nicht berechenbar"}</p>
            {automatic.unitNetCents !== null && automatic.unitLabel && <p className="mt-1 text-sm text-muted-foreground">{formatEuro(automatic.unitNetCents / 100)} {automatic.unitLabel}</p>}
            {automatic.billing && <p className="mt-3 text-sm">{automatic.billing}</p>}
            <p className="mt-2 text-xs text-muted-foreground">Reguläre Arbeitstage Montag bis Freitag werden automatisch aus dem vorhandenen Einsatzzeitraum übernommen.</p>
          </div>

          {offerErrors.length > 0 && <div role="alert" className="rounded-md border border-destructive/40 p-3 text-sm text-destructive"><p className="font-semibold">Bitte vor der Zuweisung klären:</p><ul className="mt-1 list-disc pl-5">{offerErrors.map((issue) => <li key={issue}>{issue}</li>)}</ul></div>}
          <p className="text-xs text-muted-foreground">Das verbindliche Angebot wird erst durch diese Zuweisung erstellt. Der Einsatzort wird aus den vorhandenen Auftragsdaten übernommen.</p>
          <div className="flex gap-2 pt-1">
            <Button onClick={onClose} variant="outline" className="flex-1">Abbrechen</Button>
            <Button onClick={handleAssignAndSend} disabled={isAssigning || !selectedDriverId || !previewAssignment || offerErrors.length > 0 || drivers.length === 0} className="flex-1">{isAssigning ? "Zuweisen …" : "Zuweisen & Bestätigung senden"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
