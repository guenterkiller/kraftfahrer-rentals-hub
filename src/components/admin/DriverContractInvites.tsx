import { useEffect, useState } from "react";
import { RefreshCw, Search, UserRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { DriverAddressDriver } from "@/components/DriverAddressDialog";
import { contractInviteState, matchesContractDriver, type ContractInviteState } from "@/lib/driverContractInvites";

const inviteQuery = () => supabase.from("driver_contract_invites").select(
  "id, driver_id, created_at, contract_version, status, expires_at, used_at, driver:fahrer_profile!driver_contract_invites_driver_id_fkey(id, vorname, nachname, email, telefon, strasse, hausnummer, plz, ort, land, fuehrerscheinklassen)",
);
type Invite = NonNullable<Awaited<ReturnType<typeof inviteQuery>>["data"]>[number];

const labels: Record<ContractInviteState, string> = {
  pending: "Offen", expired: "Abgelaufen", used: "Verwendet", superseded: "Durch neuen Link ersetzt",
  outdated: "Vertragsfassung veraltet", unknown: "Unbekannter Status",
};
const formatDate = (value: string) => new Date(value).toLocaleString("de-DE", {
  timeZone: "Europe/Berlin", dateStyle: "medium", timeStyle: "short",
});

export function DriverContractInvites({ onViewProfile, refreshKey }: {
  onViewProfile: (driver: DriverAddressDriver) => void;
  refreshKey?: unknown;
}) {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(false);
      try {
        const rows: Invite[] = [];
        const pageSize = 500;
        for (let start = 0; ; start += pageSize) {
          const { data, error: queryError } = await inviteQuery()
            .order("created_at", { ascending: false }).order("id", { ascending: false })
            .range(start, start + pageSize - 1);
          if (cancelled) return;
          if (queryError) throw queryError;
          rows.push(...(data ?? []));
          if (!data || data.length < pageSize) break;
        }
        setInvites(rows);
        setNow(Date.now());
      } catch {
        if (!cancelled) { setInvites([]); setError(true); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [reload, refreshKey]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const visible = invites.filter((invite) => matchesContractDriver(invite.driver, search));

  return (
    <section aria-labelledby="contract-invites-title" className="mt-6 space-y-4 border-t border-border pt-6 md:mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="contract-invites-title" className="text-lg font-semibold">Fahrervertragseinladungen</h2>
        <Button variant="outline" size="sm" disabled={loading} onClick={() => setReload((value) => value + 1)}>
          <RefreshCw aria-hidden="true" className="h-4 w-4" />Aktualisieren
        </Button>
      </div>
      <div className="max-w-md space-y-2">
        <Label htmlFor="contract-invites-search">Name oder E-Mail suchen</Label>
        <div className="relative">
          <Search aria-hidden="true" className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input id="contract-invites-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" />
        </div>
      </div>
      {loading ? <p role="status" className="text-sm text-muted-foreground">Vertragseinladungen werden geladen…</p>
        : error ? <p role="alert" className="text-sm text-destructive">Vertragseinladungen konnten nicht geladen werden. Bitte erneut aktualisieren.</p>
        : !visible.length ? <p role="status" className="text-sm text-muted-foreground">{invites.length ? "Keine passenden Vertragseinladungen gefunden." : "Keine Vertragseinladungen vorhanden."}</p>
        : <>
          <p role="status" className="text-sm text-muted-foreground">{visible.length} von {invites.length} Einladungen</p>
          <div className="hidden grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1.2fr)_auto] gap-4 border-b border-border pb-2 text-sm font-medium lg:grid" aria-hidden="true">
            <span>Fahrer / E-Mail-Adresse</span><span>Erstellt am</span><span>Vertragsversion</span><span>Einladungsstatus</span><span>Fahrerprofil</span>
          </div>
          <ul className="divide-y divide-border">
            {visible.map((invite) => {
              const state = contractInviteState(invite, now);
              return <li key={invite.id} className="grid min-w-0 gap-3 py-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1.2fr)_auto] lg:items-start lg:gap-4">
                <div className="min-w-0 space-y-1">
                  <div className="break-words font-medium">{invite.driver ? `${invite.driver.vorname} ${invite.driver.nachname}` : "Fahrerprofil nicht verfügbar"}</div>
                  <div className="break-all text-sm text-muted-foreground">{invite.driver?.email ?? "E-Mail-Adresse nicht verfügbar"}</div>
                </div>
                <div className="text-sm"><span className="text-muted-foreground lg:hidden">Erstellt am: </span><time dateTime={invite.created_at}>{formatDate(invite.created_at)}</time></div>
                <div className="break-words text-sm"><span className="text-muted-foreground lg:hidden">Vertragsversion: </span>{invite.contract_version}</div>
                <div><Badge variant={state === "pending" ? "secondary" : "outline"} className="max-w-full whitespace-normal">{labels[state]}</Badge></div>
                <Button variant="outline" size="sm" disabled={!invite.driver} className="w-fit max-w-full whitespace-normal" onClick={() => { if (invite.driver) onViewProfile(invite.driver); }}>
                  <UserRound aria-hidden="true" className="h-4 w-4" />Fahrerprofil ansehen
                </Button>
              </li>;
            })}
          </ul>
        </>}
    </section>
  );
}