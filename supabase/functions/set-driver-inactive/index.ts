import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';
import { DriverInactiveNotice } from '../_shared/email-templates/driver-inactive-notice.tsx';
import { verifyAdminAuth, createCorsHeaders, handleCorsPreflightRequest } from '../_shared/admin-auth.ts';

const corsHeaders = createCorsHeaders();
const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const REASON_LABELS: Record<string, string> = {
  docs_missing: 'Unterlagen fehlen',
  license_missing: 'Führerschein / Fahrerkarte fehlt oder ist nicht gültig',
  trade_cert_missing: 'Gewerbenachweis fehlt',
  no_response: 'Wir haben Sie nicht erreicht / keine Rückmeldung erhalten',
  declines_jobs: 'Aktuell werden keine Aufträge angenommen',
  other: 'Sonstiger Grund',
};

interface Body {
  driverId: string;
  action: 'deactivate' | 'reactivate';
  reasonCode?: string;
  reasonText?: string;
  notify?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return handleCorsPreflightRequest(corsHeaders);

  try {
    const auth = await verifyAdminAuth(req);
    if (!auth.success) return auth.response;
    const supabase = auth.supabase;

    const body: Body = await req.json();
    const { driverId, action } = body;
    if (!driverId || !['deactivate', 'reactivate'].includes(action)) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { data: driver, error: dErr } = await supabase
      .from('fahrer_profile')
      .select('id, vorname, nachname, email')
      .eq('id', driverId)
      .single();
    if (dErr || !driver) {
      return new Response(JSON.stringify({ error: 'Driver not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'reactivate') {
      const { error } = await supabase
        .from('fahrer_profile')
        .update({
          is_inactive: false,
          inactive_since: null,
          inactive_reason: null,
          inactive_reason_code: null,
          inactive_notified_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', driverId);
      if (error) throw error;

      return new Response(JSON.stringify({ success: true, action: 'reactivated' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // deactivate
    const reasonCode = body.reasonCode && REASON_LABELS[body.reasonCode] ? body.reasonCode : 'other';
    const reasonText = (body.reasonText || '').trim();
    const reasonForMail = reasonText.length > 0
      ? `${REASON_LABELS[reasonCode]} – ${reasonText}`
      : REASON_LABELS[reasonCode];

    const now = new Date().toISOString();
    const { error: updErr } = await supabase
      .from('fahrer_profile')
      .update({
        is_inactive: true,
        inactive_since: now,
        inactive_reason: reasonText || REASON_LABELS[reasonCode],
        inactive_reason_code: reasonCode,
        updated_at: now,
      })
      .eq('id', driverId);
    if (updErr) throw updErr;

    let mailStatus: string = 'skipped';
    if (body.notify !== false && driver.email) {
      try {
        const html = await renderAsync(
          React.createElement(DriverInactiveNotice, {
            driverName: `${driver.vorname} ${driver.nachname}`.trim(),
            reason: reasonForMail,
          })
        );

        const result = await resend.emails.send({
          from: 'Fahrerexpress-Agentur <info@kraftfahrer-mieten.com>',
          to: [driver.email],
          subject: 'Ihr Fahrerstatus wurde vorübergehend auf nicht aktiv gesetzt',
          html,
        });

        if ((result as any)?.error) {
          console.error('inactive mail error', (result as any).error);
          mailStatus = 'error';
        } else {
          mailStatus = 'sent';
          await supabase
            .from('fahrer_profile')
            .update({ inactive_notified_at: new Date().toISOString() })
            .eq('id', driverId);
        }
      } catch (e) {
        console.error('mail exception', e);
        mailStatus = 'error';
      }
    }

    return new Response(JSON.stringify({ success: true, action: 'deactivated', mailStatus }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    console.error('set-driver-inactive error', e);
    return new Response(JSON.stringify({ error: e?.message || 'Internal error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

serve(handler);