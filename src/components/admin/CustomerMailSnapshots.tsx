import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface MailRow {
  source: "snapshot" | "log_ohne_inhalt";
  id: string;
  template: string;
  recipient: string;
  subject: string | null;
  status: string;
  sent_at: string | null;
  provider_message_id: string | null;
  html: string | null;
  text_body: string | null;
  content_sha256: string | null;
}

const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("de-DE", { timeZone: "Europe/Berlin" }) : "—";

/** Nur für Administratoren: tatsächlich versandte Kundenmails eines Auftrags (unveränderliche Versandkopien). */
export function CustomerMailSnapshots({ jobId }: { jobId: string }) {
  const [rows, setRows] = useState<MailRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.rpc as any)("admin_job_customer_mails", { _job_id: jobId });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setRows((data ?? []) as MailRow[]);
  };

  return (
    <div className="bg-white p-3 rounded border">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-gray-700">✉️ Versandte Kundenmails</span>
        <Button size="sm" variant="outline" onClick={load} disabled={loading}>
          {loading ? "Lädt…" : rows ? "Aktualisieren" : "Anzeigen"}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive mt-2">Fehler: {error}</p>}
      {rows && rows.length === 0 && <p className="text-sm text-gray-500 mt-2">Keine Kundenmails protokolliert.</p>}
      {rows && rows.map((r) => (
        <div key={r.source + r.id} className="mt-2 border-t pt-2 text-sm text-gray-900">
          <p><strong>{r.subject || "(ohne Betreff)"}</strong> · {r.template} · {r.status}</p>
          <p className="text-xs text-gray-600">An {r.recipient} · {fmt(r.sent_at)} · Versandkennung {r.provider_message_id || "—"}</p>
          {r.source === "log_ohne_inhalt" ? (
            <p className="text-xs text-amber-800 mt-1">
              Originalinhalt nicht verfügbar: Diese Mail wurde vor Einführung der Versandkopie versendet. Es ist nur der Versand protokolliert; der Inhalt wird nicht rekonstruiert.
            </p>
          ) : (
            <>
              <p className="text-xs text-gray-600">Unveränderliche Versandkopie · SHA-256 {r.content_sha256?.slice(0, 16)}…</p>
              <Button size="sm" variant="ghost" className="px-0" onClick={() => setOpen(open === r.id ? null : r.id)}>
                {open === r.id ? "Inhalt ausblenden" : "Originalinhalt anzeigen"}
              </Button>
              {open === r.id && (r.html ? (
                <iframe title={`Versandkopie ${r.id}`} sandbox="" srcDoc={r.html} className="w-full h-[600px] border rounded" />
              ) : (
                <pre className="whitespace-pre-wrap text-xs">{r.text_body}</pre>
              ))}
            </>
          )}
        </div>
      ))}
    </div>
  );
}
