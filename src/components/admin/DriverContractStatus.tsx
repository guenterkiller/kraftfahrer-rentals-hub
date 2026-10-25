import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { MEDIATION_CONTRACT_VERSION } from "@/lib/driverMediationContract";

type Decision = { driver_id: string; decision: "accept" | "reject"; contract_version: string; decided_at: string };
type Invite = { driver_id: string; status: string; expires_at: string; contract_version: string };

let cache: Promise<{ decisions: Decision[]; invites: Invite[] }> | null = null;
const loadStatus = () =>
  (cache ??= Promise.all([
    supabase.from("driver_contract_decisions" as any).select("driver_id, decision, contract_version, decided_at"),
    supabase.from("driver_contract_invites" as any).select("driver_id, status, expires_at, contract_version"),
  ]).then(([d, i]) => ({ decisions: (d.data ?? []) as any, invites: (i.data ?? []) as any })));

/** Vertragsstatus je Fahrer + Link erzeugen (ohne E-Mail-Versand). */
export function DriverContractStatus({ driverId }: { driverId: string }) {
  const [label, setLabel] = useState("Vertrag: …");
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    loadStatus().then(({ decisions, invites }) => {
      const d = decisions.filter((x) => x.driver_id === driverId).sort((a, b) => Date.parse(b.decided_at) - Date.parse(a.decided_at))[0];
      if (d) return setLabel(`Vertrag ${d.decision === "accept" ? "angenommen" : "abgelehnt"} am ${new Date(d.decided_at).toLocaleDateString("de-DE", { timeZone: "Europe/Berlin" })} · Fassung ${d.contract_version}`);
      const open = invites.find((x) => x.driver_id === driverId && x.status === "pending" && new Date(x.expires_at) > new Date());
      setLabel(open ? `Vertrag offen (Link bis ${new Date(open.expires_at).toLocaleDateString("de-DE", { timeZone: "Europe/Berlin" })})` : "Vertrag offen");
    });
  }, [driverId]);

  const create = async () => {
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("driver-contract", { body: { action: "create_invite", driverId } });
    setBusy(false);
    if (error || !data?.url) return setLabel("Link konnte nicht erzeugt werden");
    cache = null;
    setUrl(data.url);
  };

  return (
    <div className="text-xs text-muted-foreground space-y-1">
      <div>{label}{label.startsWith("Vertrag angenommen") || label.startsWith("Vertrag abgelehnt") ? "" : ` · Fassung ${MEDIATION_CONTRACT_VERSION}`}</div>
      {!label.startsWith("Vertrag angenommen") && !label.startsWith("Vertrag abgelehnt") && (
        <Button size="sm" variant="outline" className="h-7 text-xs" disabled={busy} onClick={create}>
          Vertragslink erzeugen (keine Mail)
        </Button>
      )}
      {url && <input readOnly value={url} onFocus={(e) => e.currentTarget.select()} className="w-full rounded border border-border bg-background px-1 py-0.5" aria-label="Persönlicher Vertragslink" />}
    </div>
  );
}
