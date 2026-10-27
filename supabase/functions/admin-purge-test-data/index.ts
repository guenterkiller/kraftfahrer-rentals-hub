// Bereinigung eindeutig gekennzeichneter Testdaten (nur Administratoren, keine E-Mails).
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3.23.8';
import { verifyAdminAuth } from '../_shared/admin-auth.ts';

const schema = z.object({
  mode: z.enum(['preview', 'purge', 'archive']),
  kind: z.enum(['driver', 'job']),
  id: z.string().uuid(),
  confirmEmail: z.string().max(320).optional(),
  confirmText: z.string().max(100).optional(),
}).strict();

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ ok: false, error: 'Nur POST erlaubt' }, 405);

  const auth = await verifyAdminAuth(req);
  if (!auth.success) return new Response(await auth.response.text(), {
    status: auth.response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
  const { supabase, user } = auth;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ ok: false, error: 'Ungültige Anfrage', details: parsed.error.flatten().fieldErrors }, 400);
  const { mode, kind, id, confirmEmail, confirmText } = parsed.data;

  // deno-lint-ignore no-explicit-any
  const logFailure = async (step: string, detail: string, extra: Record<string, unknown> = {}) => {
    const { error } = await supabase.from('admin_actions').insert({
      action: 'test_purge_failed', admin_email: user.email,
      note: JSON.stringify({ kind, id, step, detail, ...extra }).slice(0, 4000),
    });
    if (error) console.error('admin_actions insert failed:', error);
  };

  const { data: preview, error: prevErr } = await supabase.rpc('admin_test_purge_preview', { _kind: kind, _id: id });
  if (prevErr) return json({ ok: false, step: 'pruefung', error: prevErr.message }, 500);
  if (!preview?.found) return json({ ok: false, step: 'pruefung', error: 'Datensatz nicht gefunden' }, 404);
  if (mode === 'preview') return json({ ok: true, preview });

  if (mode === 'archive') {
    if (kind !== 'job') return json({ ok: false, error: 'Nur Kundenaufträge können archiviert werden' }, 400);
    const { error } = await supabase.rpc('admin_test_archive_job', { _id: id, _confirm_email: confirmEmail ?? null, _admin_email: user.email });
    if (error) { await logFailure('archivierung', error.message); return json({ ok: false, step: 'archivierung', error: error.message }, 409); }
    return json({ ok: true, archived: true });
  }

  // purge
  if (preview.blocked) return json({ ok: false, step: 'pruefung', error: preview.blocked }, 409);
  if (confirmText !== 'TESTDATEN LÖSCHEN') return json({ ok: false, step: 'pruefung', error: 'Sicherheitsbestätigung fehlt oder ist falsch' }, 400);
  if (!confirmEmail || confirmEmail.trim().toLowerCase() !== String(preview.email).trim().toLowerCase()) {
    return json({ ok: false, step: 'pruefung', error: 'Bestätigungs-E-Mail stimmt nicht überein' }, 400);
  }

  // Schritt 1: Dateien – bei jedem Fehler Abbruch vor der Datenbanklöschung
  const files: Array<{ bucket: string; path: string }> = preview.files ?? [];
  const byBucket = new Map<string, string[]>();
  for (const f of files) byBucket.set(f.bucket, [...(byBucket.get(f.bucket) ?? []), f.path]);
  let filesDeleted = 0;
  for (const [bucket, paths] of byBucket) {
    const { data, error } = await supabase.storage.from(bucket).remove(paths);
    const removed = new Set((data ?? []).map((o: { name: string }) => o.name));
    filesDeleted += removed.size;
    const missing = paths.filter((p) => !removed.has(p));
    if (error || missing.length) {
      const detail = error?.message ?? `Nicht gelöscht: ${missing.join(', ')}`;
      await logFailure('dateien', detail, { filesDeleted });
      return json({ ok: false, step: 'dateien', partial: filesDeleted > 0, filesDeleted, error: `Dateien konnten nicht vollständig gelöscht werden (${detail}). Datenbankeinträge sind unverändert; Vorgang kann wiederholt werden.` }, 500);
    }
  }

  // Schritt 2: Datenbank – atomar (alles oder nichts)
  const { data: result, error: purgeErr } = await supabase.rpc('admin_test_purge', {
    _kind: kind, _id: id, _confirm_email: confirmEmail, _confirm_text: confirmText, _admin_email: user.email,
  });
  if (purgeErr || !result?.ok) {
    const detail = purgeErr?.message ?? 'Keine Bestätigung der Datenbank';
    await logFailure('datenbank', detail, { filesDeleted });
    return json({ ok: false, step: 'datenbank', partial: filesDeleted > 0, filesDeleted, error: `Datenbankeinträge wurden nicht gelöscht (${detail}).${filesDeleted ? ' Teilweise bereinigt: Dateien bereits entfernt. Bitte Vorgang wiederholen.' : ''}` }, 500);
  }
  return json({ ok: true, purged: true, filesDeleted, counts: result.counts });
});
