import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { 
  verifyAdminAuth, 
  createCorsHeaders, 
  handleCorsPreflightRequest,
  createErrorResponse,
  logAdminAction 
} from "../_shared/admin-auth.ts";
import { wrapDriverEmailHtml } from "../_shared/email-templates/driver-html-shell.ts";
import { computeBindingExpiry, generateToken } from "../_shared/binding-acceptance.ts";
import { formatAssignmentPeriod, deadlineStartIso } from "../_shared/berlin-time.ts";
import { agreementErrors } from '../_shared/offer-readiness.ts';
import { buildDriverOfferView } from '../_shared/driver-offer-remuneration.ts';
import { createOfferSnapshot } from '../_shared/binding-offer.ts';
import { escapeOffer } from '../_shared/binding-offer.ts';
import { shortOfferLines, renderShortOffer, shortOfferNet } from './short-offer.ts';
import { interpretSendResult } from '../_shared/mail-delivery.ts';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  const corsHeaders = createCorsHeaders();
  const FUNCTION_VERSION = "v3.0-shared-auth";
  
  console.log(`📧 send-driver-confirmation ${FUNCTION_VERSION} called: ${req.method}`);
  
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest(corsHeaders);
  }

  if (req.method !== "POST") {
    return createErrorResponse("Method not allowed", 405, corsHeaders);
  }

  try {
    // Verify admin authentication using shared helper
    const authResult = await verifyAdminAuth(req);
    if (!authResult.success) {
      return authResult.response;
    }
    const { user, supabase } = authResult;

    // Parse request body
    const bodyData = await req.json();
    const { assignment_id } = bodyData;
    
    if (!assignment_id) {
      console.log('📧 ERROR: assignment_id missing from payload');
      return createErrorResponse("assignment_id required", 400, corsHeaders);
    }

    // Get assignment data with complete job and driver information
    const { data: assignment, error: assignmentError } = await supabase
      .from("job_assignments")
      .select(`
        id, job_id, driver_id, status,
        rate_type, rate_value, start_date, end_date, admin_note, commission_pct, times_entered,
        job_requests:job_id (
          id, status, customer_name, company, customer_phone, customer_email,
          einsatzort, fahrzeugtyp, besonderheiten, nachricht, fuehrerscheinklasse, maschinenbedienung,
          zeitraum, tarif_type, tarif_label, tarif_netto, tarif_unit, tarif_mehrstunde_netto,
          tarif_needs_review, kosten_uebersicht, unterkunft_option, unterkunft_obergrenze,
          customer_street, customer_house_number, customer_postal_code, customer_city
        ),
        fahrer_profile:driver_id (
          id, vorname, nachname, email, telefon
        )
      `)
      .eq("id", assignment_id)
      .maybeSingle();

    if (assignmentError || !assignment) {
      console.error('📧 Assignment not found:', assignmentError);
      return createErrorResponse("assignment not found", 404, corsHeaders);
    }

    const _fp: any = (assignment as any).fahrer_profile;
    const _jr: any = (assignment as any).job_requests;
    const driver: any = Array.isArray(_fp) ? _fp[0] : _fp;
    let job: any = Array.isArray(_jr) ? _jr[0] : _jr;

    if (!driver || !driver.email || !driver.vorname || !driver.nachname) {
      console.error('📧 Driver data incomplete');
      return createErrorResponse("Fahrerdaten unvollständig", 400, corsHeaders);
    }

    console.log(`📧 Sending email to driver: ${driver.email}`);

    // Prepare email data
    let offerSnapshot = createOfferSnapshot(job, assignment);
    let offerAssignment = assignment;
    let inviteCreatedAt = new Date().toISOString();
    let sendKey = '';

    // ===== Persönlicher Link zur verbindlichen Fahrerannahme =====
    let bindingButtonHtml = '';
    const { data: existingBinding, error: bindingError } = await supabase
      .from('job_driver_acceptances')
      .select('id, accepted_at')
      .eq('assignment_id', assignment_id)
      .eq('flow', 'binding')
      .maybeSingle();
    if (bindingError) return createErrorResponse('Annahmenachweis konnte nicht geprüft werden', 500, corsHeaders);
    if (existingBinding) {
      return new Response(JSON.stringify({ ok: true, skipped: true, message: 'Bestehende Annahme bleibt unverändert; kein erneuter Versand' }), {
        status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    } else if (['assigned', 'confirmed'].includes(assignment.status)) {
      // A failed delivery reuses the immutable offer, token and deadline.
      const { data: previousOffer, error: previousError } = await supabase.from('assignment_invites')
        .select('id, token, token_expires_at, status, created_at, offer_snapshot')
        .eq('assignment_id', assignment_id).eq('purpose', 'binding').order('created_at', { ascending: false }).limit(1);
      if (previousError) return createErrorResponse('Bestehendes Angebot konnte nicht geprüft werden', 500, corsHeaders);
      const previous = previousOffer?.[0];
      let token: string;
      let expiresAt: Date;
      if (previous) {
        if (previous.status !== 'pending') return new Response(JSON.stringify({ ok: true, skipped: true, message: 'Angebot bereits beantwortet oder beendet; keine E-Mail versendet' }), {
          status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
        expiresAt = new Date(previous.token_expires_at);
        if (!Number.isFinite(expiresAt.getTime()) || expiresAt.getTime() <= Date.now()) return createErrorResponse('Annahmelink abgelaufen; kein neuer Link und kein Versand', 400, corsHeaders);
        const { data: successfulMail, error: mailCheckError } = await supabase.from('email_log')
          .select('id').eq('assignment_id', assignment_id).eq('template', 'driver_confirmation')
          .eq('status', 'sent').not('message_id', 'is', null).gte('created_at', previous.created_at).limit(1);
        if (mailCheckError) return createErrorResponse('Versandstatus konnte nicht geprüft werden; bitte erneut versuchen', 500, corsHeaders);
        if (successfulMail?.length) return new Response(JSON.stringify({ ok: true, skipped: true, message: 'Angebot bereits erfolgreich versendet; keine weitere E-Mail versendet' }), {
          status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
        if (!previous.offer_snapshot?.job || !previous.offer_snapshot?.assignment || !previous.token) return createErrorResponse('Gespeicherte Angebotsdaten unvollständig; kein neuer Link und kein Versand', 400, corsHeaders);
        offerSnapshot = previous.offer_snapshot;
        job = offerSnapshot.job;
        offerAssignment = offerSnapshot.assignment as typeof assignment;
        inviteCreatedAt = previous.created_at;
        token = previous.token;
      } else {
        expiresAt = computeBindingExpiry(new Date(), deadlineStartIso(assignment.start_date, (assignment as any).times_entered));
        token = generateToken();
      }
      const issues = [...new Set([
        ...agreementErrors(offerSnapshot.job, offerSnapshot.assignment),
        ...buildDriverOfferView(offerSnapshot.job, offerSnapshot.assignment).missing,
      ])];
      if (offerSnapshot.binding_allowed !== true || !shortOfferNet(offerSnapshot.job_lines ?? [], true)) issues.push('Gespeicherte endgültige Netto-Gesamtvergütung fehlt.');
      if (issues.length) return createErrorResponse('Versand gesperrt: ' + issues.join(' ') + (previous ? ' Das alte Angebot bleibt unverändert; eine bewusste neue Zuteilung ist erforderlich.' : ''), 422, corsHeaders);
      if (expiresAt.getTime() > Date.now()) {
        if (!previous) {
        const { error: invErr } = await supabase.from('assignment_invites').insert({
          job_id: assignment.job_id, driver_id: assignment.driver_id, assignment_id,
          purpose: 'binding', status: 'pending', token, token_expires_at: expiresAt.toISOString(),
          offer_snapshot: offerSnapshot,
        });
        if (invErr) {
          console.error('📧 binding invite insert failed:', invErr);
          return createErrorResponse("Annahmelink konnte nicht erstellt werden", 500, corsHeaders);
        }
        }
        sendKey = `binding-offer/${token}`;
        // Alle Annahmelinks verweisen ausschließlich auf die Live-Domain
        const linkBase = 'https://www.kraftfahrer-mieten.com';
        const url = `${linkBase}/fahrer-antwort-bestaetigen?action=accept&token=${encodeURIComponent(token)}`;
        const until = expiresAt.toLocaleString('de-DE', { timeZone: 'Europe/Berlin', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        bindingButtonHtml = `
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 8px 0;"><tr><td bgcolor="#16a34a" style="border-radius:6px;">
            <a href="${url}" style="display:inline-block;padding:13px 22px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:6px;">Auftrag verbindlich annehmen</a>
          </td></tr></table>
          <p class="body-text" style="margin:0 0 18px 0;font-size:12px;line-height:1.5;color:#6b7280;">Persönlicher Link, gültig bis ${until} Uhr. Die verbindliche Annahme erfolgt erst auf der Bestätigungsseite nach Prüfung der Auftragsdaten und Vertragsbedingungen.</p>`;
      } else return createErrorResponse('Angebotsfrist bereits abgelaufen; kein Versand', 400, corsHeaders);
    } else return createErrorResponse('Zuteilung ist nicht für ein neues Angebot verfügbar', 400, corsHeaders);

    const jobTitle = job?.fahrzeugtyp || 'Fahrauftrag';
    const location = job?.einsatzort || 'wird noch bekannt gegeben';
    const dateRange = formatAssignmentPeriod(offerAssignment.start_date, offerAssignment.end_date, offerAssignment.times_entered) || job?.zeitraum || 'nach Absprache';
    const emailSubject = `Auftragsangebot – ${jobTitle} – ${location} am ${dateRange}`;

    const sectionStart = (bg: string) =>
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${bg}" style="background-color:${bg};border:1px solid #e5e7eb;border-left:4px solid #bb2c29;border-collapse:separate;border-radius:6px;margin:0 0 16px 0;"><tr><td style="padding:16px 18px;">`;
    const sectionEnd = `</td></tr></table>`;
    const h3 = (txt: string, color = '#0d2340') =>
      `<h3 class="body-text" style="margin:0 0 10px 0;font-size:16px;color:${color};font-weight:700;">${txt}</h3>`;

    const bindingAllowed = true;
    const innerHtml = `
      <h2 class="body-text" style="margin:0 0 8px 0;font-size:22px;line-height:1.2;color:#0d2340;font-weight:700;">VERBINDLICHES AUFTRAGSANGEBOT</h2>
      <p class="body-text" style="margin:0 0 16px 0;font-size:15px;color:#374151;">Hallo ${escapeOffer(driver.vorname)} ${escapeOffer(driver.nachname)},<br/>Sie wurden für folgenden Einsatz ausgewählt:</p>
      ${sectionStart('#f8fafc')}
        ${renderShortOffer(shortOfferLines(offerSnapshot.job_lines ?? [], bindingAllowed, dateRange))}
      ${sectionEnd}
      ${bindingButtonHtml}
      ${bindingAllowed ? `<p class="body-text" style="margin:0 0 12px 0;font-size:13px;color:#374151;">Vertragsbedingungen: Die vollständigen Vertragsbedingungen werden Ihnen über den Button auf Ihrer persönlichen Bestätigungsseite vor der verbindlichen Annahme angezeigt.</p>` : ''}
      <p class="body-text" style="margin:0 0 4px 0;font-size:14px;color:#0d2340;font-weight:600;">Viele Grüße<br/>Fahrerexpress | kraftfahrer-mieten.com</p>
      <p class="body-text" style="margin:14px 0 0 0;font-size:12px;color:#6b7280;">Auftragsangebot erstellt am: ${new Date(inviteCreatedAt).toLocaleDateString('de-DE')}</p>
    `;

    const emailContent = wrapDriverEmailHtml(innerHtml, {
      subject: emailSubject,
      previewText: `Einsatzbestätigung – ${jobTitle} – ${location}`,
      showUnsubscribe: false,
    });

    // Send email using Resend
    let delivery: ReturnType<typeof interpretSendResult>;
    try {
    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) throw new Error('E-Mail-Dienst nicht konfiguriert');
    const headers = new Headers({ Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' });
    headers.set('Idempotency-Key', sendKey);
    const payload = {
      from: 'Fahrerexpress-Agentur <info@kraftfahrer-mieten.com>',
      to: [driver.email],
      bcc: ['info@kraftfahrer-mieten.com'],
      subject: emailSubject,
      html: emailContent,
    };
    const emailResult = await resend.fetchRequest<{ id: string }>('/emails', { method: 'POST', headers, body: JSON.stringify(payload) });
    delivery = interpretSendResult(emailResult);
    } catch (error) {
      delivery = { ok: false, error: error instanceof Error ? error.message : String(error) };
    }
    if (!delivery.ok) {
      console.error('📧 Email sending failed:', delivery.error);
      await supabase.from('email_log').insert({ assignment_id, job_id: assignment.job_id,
        recipient: driver.email, template: 'driver_confirmation', subject: emailSubject,
        status: 'error', error_message: delivery.error, delivery_mode: 'inline' });
      return createErrorResponse("Fahrerangebot nicht versendet: " + delivery.error + ". Bitte E-Mail erneut senden; derselbe Annahmelink bleibt erhalten.", 500, corsHeaders);
    }

    console.log('📧 Email sent successfully:', delivery.messageId);

    // Log the email
    const { error: logError } = await supabase.from('email_log').insert({
      assignment_id: assignment_id,
      job_id: assignment.job_id,
      recipient: driver.email,
      status: 'sent',
      sent_at: new Date().toISOString(),
      subject: emailSubject,
      template: 'driver_confirmation',
      delivery_mode: 'inline',
      message_id: delivery.messageId
    });
    if (logError) return createErrorResponse('E-Mail-Dienst hat den Versand angenommen, aber die Protokollierung ist fehlgeschlagen. Nicht als ungesendet behandeln; bitte Versandprotokoll prüfen.', 500, corsHeaders);

    // Log admin action
    await logAdminAction(supabase, 'send_driver_confirmation', user.email, {
      jobId: assignment.job_id,
      assignmentId: assignment_id,
      note: `Confirmation sent to ${driver.email}`
    });

    console.log(`📧 Function ${FUNCTION_VERSION} completed successfully`);

    return new Response(JSON.stringify({ 
      ok: true, 
      message: "E-Mail erfolgreich versendet",
      email_id: delivery.messageId,
      delivery_mode: 'inline'
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('📧 Unexpected error:', error);
    return createErrorResponse('Internal server error', 500, corsHeaders);
  }
});
