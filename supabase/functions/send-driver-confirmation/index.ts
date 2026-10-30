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
import { normalizeCommissionPct } from "../_shared/driver-contract-terms.ts";
import { computeBindingExpiry, generateToken } from "../_shared/binding-acceptance.ts";
import { formatAssignmentPeriod, deadlineStartIso } from "../_shared/berlin-time.ts";
import { createOfferSnapshot, renderOfferLines } from '../_shared/binding-offer.ts';

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
    const job: any = Array.isArray(_jr) ? _jr[0] : _jr;

    if (!driver || !driver.email || !driver.vorname || !driver.nachname) {
      console.error('📧 Driver data incomplete');
      return createErrorResponse("Fahrerdaten unvollständig", 400, corsHeaders);
    }

    console.log(`📧 Sending email to driver: ${driver.email}`);

    // Prepare email data
    const jobTitle = job?.fahrzeugtyp || 'Fahrauftrag';
    const location = job?.einsatzort || 'wird noch bekannt gegeben';
    const dateRange = formatAssignmentPeriod(assignment.start_date, assignment.end_date, (assignment as any).times_entered) || job?.zeitraum || 'nach Absprache';
    const offerSnapshot = createOfferSnapshot(job, assignment);
    
    const emailSubject = `Auftragsangebot – ${jobTitle} – ${location} am ${dateRange}`;

    // ===== Persönlicher Link zur verbindlichen Fahrerannahme =====
    const commissionPct = normalizeCommissionPct((assignment as any).commission_pct);
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
      // Never replace or reissue any previously sent binding offer.
      const { data: previousOffer, error: previousError } = await supabase.from('assignment_invites')
        .select('id').eq('assignment_id', assignment_id).eq('purpose', 'binding').limit(1);
      if (previousError) return createErrorResponse('Bestehendes Angebot konnte nicht geprüft werden', 500, corsHeaders);
      if (previousOffer?.length) return new Response(JSON.stringify({ ok: true, skipped: true, message: 'Bestehendes verbindliches Angebot bleibt unverändert; kein erneuter Versand' }), {
        status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
      const expiresAt = computeBindingExpiry(new Date(), deadlineStartIso(assignment.start_date, (assignment as any).times_entered));
      if (expiresAt.getTime() > Date.now()) {
        const token = generateToken();
        const { error: invErr } = await supabase.from('assignment_invites').insert({
          job_id: assignment.job_id, driver_id: assignment.driver_id, assignment_id,
          purpose: 'binding', status: 'pending', token, token_expires_at: expiresAt.toISOString(),
          offer_snapshot: offerSnapshot,
        });
        if (invErr) {
          console.error('📧 binding invite insert failed:', invErr);
          return createErrorResponse("Annahmelink konnte nicht erstellt werden", 500, corsHeaders);
        }
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

    const sectionStart = (bg: string) =>
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${bg}" style="background-color:${bg};border:1px solid #e5e7eb;border-left:4px solid #bb2c29;border-collapse:separate;border-radius:6px;margin:0 0 16px 0;"><tr><td style="padding:16px 18px;">`;
    const sectionEnd = `</td></tr></table>`;
    const h3 = (txt: string, color = '#0d2340') =>
      `<h3 class="body-text" style="margin:0 0 10px 0;font-size:16px;color:${color};font-weight:700;">${txt}</h3>`;

    const innerHtml = `
      <h2 class="body-text" style="margin:0 0 8px 0;font-size:22px;line-height:1.2;color:#0d2340;font-weight:700;letter-spacing:.3px;">VERBINDLICHES AUFTRAGSANGEBOT</h2>
      <p class="body-text" style="margin:0 0 18px 0;font-size:14px;color:#6b7280;">Fahrerexpress | kraftfahrer-mieten.com</p>

      <p class="body-text" style="margin:0 0 8px 0;font-size:15px;color:#374151;">Hallo ${driver.vorname} ${driver.nachname},</p>
      <p class="body-text" style="margin:0 0 20px 0;font-size:15px;line-height:1.6;color:#374151;">Sie wurden für den nachfolgend beschriebenen Einsatz ausgewählt. Bitte prüfen und bestätigen Sie das verbindliche Auftragsangebot.</p>

      ${bindingButtonHtml}

      ${sectionStart('#f8fafc')}
        ${h3('AUFTRAGSDATEN UND FAHRERABRECHNUNG')}
        ${renderOfferLines(offerSnapshot.job_lines ?? [])}
      ${sectionEnd}

      ${sectionStart('#ffffff')}
        ${h3('VEREINBARUNGEN (Fahrerexpress)')}
        <p class="body-text" style="margin:8px 0;font-size:13px;line-height:1.6;color:#374151;"><strong>1) Vermittlungsanteil:</strong> Für diesen Auftrag gilt ein Provisionssatz von ${commissionPct} %. Berechnungsgrundlage, Zahlungsbedingungen und Leistungsbericht ergeben sich aus den Vertragsbedingungen auf der persönlichen Bestätigungsseite (Button oben). An- und Abfahrtskosten sind provisionsfrei.</p>
        <p class="body-text" style="margin:8px 0;font-size:13px;line-height:1.6;color:#374151;"><strong>2) Abrechnung/Zahlung:</strong> Der Fahrer stellt seine Rechnung nach Einsatzende an Fahrerexpress, sofern nicht für einen längerfristigen Auftrag ausdrücklich eine wöchentliche Abrechnung vereinbart wurde – bereits nach Abzug des vereinbarten Vermittlungsanteils. Der Vermittlungsanteil wird also nicht nachträglich einbehalten, sondern vor Rechnungsstellung vom Netto-Auftragswert der reinen Fahrerdienstleistung abgezogen. Fahrerexpress stellt dem Auftraggeber eine Gesamtrechnung.</p>
        <p class="body-text" style="margin:8px 0;font-size:13px;line-height:1.6;color:#374151;"><strong>3) Folgeaufträge:</strong> Für Folgeaufträge mit demselben Auftraggeber, die auf die Vermittlung durch Fahrerexpress zurückgehen, ist die Provision für einen Zeitraum von 12 Monaten nach Ende des vermittelten Einsatzes ebenfalls fällig – unabhängig davon, ob die Beauftragung direkt oder über Fahrerexpress erfolgt (§ 6 Nr. 2 Vermittlungsvertrag).</p>
        <p class="body-text" style="margin:8px 0;font-size:13px;line-height:1.6;color:#374151;"><strong>4) Informationspflicht:</strong> Direkt vereinbarte Folgeaufträge sind Fahrerexpress unaufgefordert mitzuteilen.</p>
                <p class="body-text" style="margin:8px 0;font-size:13px;line-height:1.6;color:#374151;"><strong>5) Rechtsverhältnis:</strong> Einsatz als selbstständiger Unternehmer (keine Arbeitnehmerüberlassung).</p>
        <p class="body-text" style="margin:8px 0;font-size:13px;line-height:1.6;color:#374151;"><strong>6) Verbindliche Annahme:</strong> Der Auftrag wird durch Ihre ausdrückliche Annahme über den persönlichen Bestätigungslink verbindlich vereinbart.</p>
        <p class="body-text" style="margin:8px 0;font-size:13px;line-height:1.6;color:#374151;"><strong>7) Mitteilungspflicht:</strong> Der Fahrer verpflichtet sich, Fahrerexpress unverzüglich zu informieren, wenn absehbar ist, dass er den Einsatz nicht, nicht rechtzeitig oder nicht vollständig durchführen kann.</p>
      ${sectionEnd}

      ${sectionStart('#f8fafc')}
        ${h3('Nichterscheinen / kurzfristige Absage (No-Show)', '#bb2c29')}
        <p class="body-text" style="margin:8px 0;font-size:13px;line-height:1.6;color:#374151;">Bei Nichterscheinen oder Absage weniger als 24 Stunden vor Einsatzbeginn schuldet der Fahrer, sofern er das Nichterscheinen oder die kurzfristige Absage zu vertreten hat, Fahrerexpress einen pauschalierten Schadensersatz in Höhe von 150,00 €, sofern er nicht nachweist, dass kein oder ein wesentlich geringerer Schaden entstanden ist. Weitergehende Schäden sind nur nach § 7a des Vermittlungsvertrags ersatzfähig; die Pauschale wird darauf angerechnet.</p>
      ${sectionEnd}


      <p class="body-text" style="margin:18px 0 8px 0;font-size:14px;color:#374151;">Bitte prüfen Sie die Angaben. Abweichungen bitte umgehend melden.</p>
      <p class="body-text" style="margin:0 0 4px 0;font-size:14px;color:#0d2340;font-weight:600;">Viele Grüße<br/>Fahrerexpress | kraftfahrer-mieten.com</p>
      <p class="body-text" style="margin:14px 0 0 0;font-size:12px;color:#6b7280;">Auftragsangebot erstellt am: ${new Date().toLocaleDateString('de-DE')}</p>
    `;

    const emailContent = wrapDriverEmailHtml(innerHtml, {
      subject: emailSubject,
      previewText: `Einsatzbestätigung – ${jobTitle} – ${location}`,
      showUnsubscribe: false,
    });

    // Send email using Resend
    const emailResult = await resend.emails.send({
      from: 'Fahrerexpress-Agentur <info@kraftfahrer-mieten.com>',
      to: [driver.email],
      bcc: ['info@kraftfahrer-mieten.com'],
      subject: emailSubject,
      html: emailContent,
    });

    if (emailResult.error || !emailResult.data?.id) {
      console.error('📧 Email sending failed:', emailResult.error);
      await supabase.from('email_log').insert({ assignment_id, job_id: assignment.job_id,
        recipient: driver.email, template: 'driver_confirmation', subject: emailSubject,
        status: 'error', error_message: emailResult.error?.message || 'Keine Versand-ID erhalten', delivery_mode: 'inline' });
      return createErrorResponse("Ein interner Fehler ist aufgetreten. Bitte versuchen Sie es erneut.", 500, corsHeaders);
    }

    console.log('📧 Email sent successfully:', emailResult.data?.id);

    // Log the email
    await supabase.from('email_log').insert({
      assignment_id: assignment_id,
      job_id: assignment.job_id,
      recipient: driver.email,
      status: 'sent',
      sent_at: new Date().toISOString(),
      subject: emailSubject,
      template: 'driver_confirmation',
      delivery_mode: 'inline',
      message_id: emailResult.data?.id
    });

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
      email_id: emailResult.data?.id,
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
