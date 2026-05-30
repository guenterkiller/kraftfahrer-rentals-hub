import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Attachment {
  id: string;
  filename: string;
  filepath: string;
  mime_type: string | null;
  size_bytes: number | null;
}

interface Props {
  jobId: string;
}

export function JobAttachmentsList({ jobId }: Props) {
  const [items, setItems] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("job_attachments")
        .select("id, filename, filepath, mime_type, size_bytes")
        .eq("job_id", jobId)
        .order("created_at", { ascending: true });
      if (!cancelled) {
        setItems((data as Attachment[]) || []);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  const openSigned = async (filepath: string) => {
    const { data, error } = await supabase.storage
      .from("job-attachments")
      .createSignedUrl(filepath, 300);
    if (error || !data?.signedUrl) {
      alert("Signed URL fehlgeschlagen: " + (error?.message || "unbekannt"));
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  if (loading) return null;
  if (items.length === 0) return null;

  return (
    <div className="text-xs bg-slate-50 border border-slate-200 rounded p-2">
      <div className="font-medium text-slate-700 mb-1">📎 Anhänge ({items.length})</div>
      <ul className="space-y-1">
        {items.map((a) => (
          <li key={a.id} className="flex items-center justify-between gap-2">
            <span className="truncate">{a.filename}</span>
            <button
              type="button"
              onClick={() => openSigned(a.filepath)}
              className="text-blue-600 hover:underline shrink-0"
            >
              Öffnen
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}