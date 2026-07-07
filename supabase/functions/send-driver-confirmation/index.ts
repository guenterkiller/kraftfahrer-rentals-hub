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
        rate_type, rate_value, start_date, end_date, admin_note,
        job_requests:job_id (
          id, status, customer_name, company, customer_phone, customer_email,
          einsatzort, fahrzeugtyp, besonderheiten, zeitraum,
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

    // Helper functions
    function formatRate(rateType: string | null, rateValue: number | null, currency = 'EUR'): string | null {
      if (!rateType || rateValue == null) return null;
      const v = Number(rateValue).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const unit = rateType === 'hourly' ? 'Std'
                 : rateType === 'daily'  ? 'Tag'
                 : rateType === 'weekly' ? 'Woche'
                 : 'pauschal';
      return `${v} ${currency}/${unit}`;
    }

    function formatDateRange(startDate: string | null, endDate: string | null): string {
      if (!startDate && !endDate) return '—';
      
      const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('de-DE', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      };

      if (startDate && endDate) {
        return `${formatDate(startDate)} – ${formatDate(endDate)}`;
      } else if (startDate) {
        return `ab ${formatDate(startDate)}`;
      } else {
        return '—';
      }
    }

    // Prepare email data
    const jobTitle = job?.fahrzeugtyp || 'Fahrauftrag';
    const location = job?.einsatzort || 'wird noch bekannt gegeben';
    const dateRange = formatDateRange(assignment.start_date, assignment.end_date) || job?.zeitraum || 'nach Absprache';
    const rateFormatted = formatRate(assignment.rate_type, assignment.rate_value) || 'nach Absprache';
    const vehicleType = job?.fahrzeugtyp || 'wird bekannt gegeben';
    
    // Detect Fernfahrer-Tarif from besonderheiten
    const isFernfahrerTarif = (job?.besonderheiten || '').toLowerCase().includes('fernverkehr') || 
                               (job?.besonderheiten || '').toLowerCase().includes('fernfahrer');
    const contactPerson = job?.customer_name || 'wird ergänzt';
    const contactPhone = job?.customer_phone || 'wird ergänzt';
    const contactEmail = job?.customer_email || 'wird ergänzt';
    const companyName = job?.company || job?.customer_name || 'wird ergänzt';
    
    const emailSubject = `Einsatzbestätigung – ${jobTitle} – ${location} am ${dateRange}`;

    const sectionStart = (bg: string) =>
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${bg}" style="background-color:${bg};border:1px solid #e5e7eb;border-left:4px solid #bb2c29;border-collapse:separate;border-radius:6px;margin:0 0 16px 0;"><tr><td style="padding:16px 18px;">`;
    const sectionEnd = `</td></tr></table>`;
    const h3 = (txt: string, color = '#0d2340') =>
      `<h3 class="body-text" style="margin:0 0 10px 0;font-size:16px;color:${color};font-weight:700;">${txt}</h3>`;
    const row = (label: string, value: string) =>
      `<p class="body-text" style="margin:4px 0;font-size:14px;line-height:1.55;color:#374151;"><strong>${label}:</strong> ${value}</p>`;

    const innerHtml = `
      <h2 class="body-text" style="margin:0 0 8px 0;font-size:22px;line-height:1.2;color:#0d2340;font-weight:700;letter-spacing:.3px;">EINSATZBESTÄTIGUNG</h2>
      <p class="body-text" style="margin:0 0 18px 0;font-size:14px;color:#6b7280;">Fahrerexpress | kraftfahrer-mieten.com</p>

      <p class="body-text" style="margin:0 0 8px 0;font-size:15px;color:#374151;">Hallo ${driver.vorname} ${driver.nachname},</p>
      <p class="body-text" style="margin:0 0 20px 0;font-size:15px;line-height:1.6;color:#374151;">hiermit bestätigen wir Ihren Einsatz als selbstständiger Fahrer.</p>

      ${sectionStart('#f8fafc')}
        ${h3('AUFTRAGGEBER')}
        ${row('Unternehmen/Name', companyName)}
        ${row('Ansprechpartner', contactPerson)}
        ${row('Anschrift', job?.customer_street && job?.customer_house_number && job?.customer_postal_code && job?.customer_city ?
          `${job.customer_street} ${job.customer_house_number}, ${job.customer_postal_code} ${job.customer_city}` : 'wird ergänzt')}
        ${row('Telefon', contactPhone)}
        ${row('E-Mail', contactEmail)}
      ${sectionEnd}

      ${sectionStart('#ffffff')}
        ${h3('EINSATZ')}
        ${row('Datum/Zeitraum', dateRange)}
        ${row('Einsatzort / Treffpunkt', location)}
        ${row('Fahrzeug/Typ', vehicleType)}
        ${row('Besonderheiten', job?.besonderheiten || '—')}
      ${sectionEnd}

      ${sectionStart('#f8fafc')}
        ${h3('KONDITIONEN')}
        ${row('Tarif', isFernfahrerTarif ? 'Fernfahrer-Pauschale (450 € netto / Einsatztag)' : (assignment.rate_type === 'hourly' ? 'Stundensatz' : assignment.rate_type === 'daily' ? 'Tagessatz' : 'Nach Vereinbarung'))}
        ${isFernfahrerTarif
          ? `${row('Abrechnung', 'Pauschale pro Einsatztag')}<p class="body-text" style="margin:8px 0 0 0;font-size:13px;color:#6b7280;">Fernfahrer-Pauschale: 450 € pro Fernverkehrs-Einsatztag. Zusätzlich An- und Abfahrt.</p>`
          : row('Satz', `${rateFormatted} zzgl. gesetzlicher USt`)}
      ${sectionEnd}

      ${sectionStart('#ffffff')}
        ${h3('VEREINBARUNGEN (Fahrerexpress)')}
        <p class="body-text" style="margin:8px 0;font-size:13px;line-height:1.6;color:#374151;"><strong>1) Vermittlungsanteil:</strong> Der Vermittlungsanteil ergibt sich aus dem konkreten Auftragsangebot vor Einsatzbeginn. Standardeinsätze in der Regel 20 %, Sonder-/Projekt-/Pauschal- oder kurzfristige Einsätze bis zu 25 % des mit dem Auftraggeber vereinbarten Netto-Einsatzpreises der reinen Fahrerdienstleistung (ohne An- und Abfahrt, Fahrtkosten, Diesel, Maut, Parkgebühren, Bahn- und Hotelkosten). Die vollständigen Fahrer-Vermittlungsbedingungen wurden Ihnen mit der Registrierungsbestätigung per E-Mail übermittelt.</p>
        <p class="body-text" style="margin:8px 0;font-size:13px;line-height:1.6;color:#374151;"><strong>2) Abrechnung/Zahlung:</strong> Der Fahrer stellt seine Rechnung nach Einsatzende an Fahrerexpress – bereits nach Abzug des vereinbarten Vermittlungsanteils. Der Vermittlungsanteil wird also nicht nachträglich einbehalten, sondern vor Rechnungsstellung vom Netto-Auftragswert der reinen Fahrerdienstleistung abgezogen. Auslagen werden gesondert behandelt und nicht vom Vermittlungsanteil gekürzt. Fahrerexpress stellt dem Auftraggeber eine Gesamtrechnung.</p>
        <p class="body-text" style="margin:8px 0;font-size:13px;line-height:1.6;color:#374151;"><strong>3) Folgeaufträge:</strong> Auch direkt vereinbarte Folgeeinsätze mit diesem Auftraggeber sind provisionspflichtig, solange keine Festanstellung vorliegt.</p>
        <p class="body-text" style="margin:8px 0;font-size:13px;line-height:1.6;color:#374151;"><strong>4) Informationspflicht:</strong> Direkt vereinbarte Folgeaufträge sind Fahrerexpress unaufgefordert mitzuteilen.</p>
        <p class="body-text" style="margin:8px 0;font-size:13px;line-height:1.6;color:#374151;"><strong>5) Pauschalierter Schadensersatz:</strong> Bei Verstoß gegen die Ziffern 3 oder 4 schuldet der Fahrer Fahrerexpress einen pauschalierten Schadensersatz in Höhe von 2.500 € je Verstoß, sofern kein geringerer Schaden nachgewiesen wird.</p>
        <p class="body-text" style="margin:8px 0;font-size:13px;line-height:1.6;color:#374151;"><strong>6) Rechtsverhältnis:</strong> Einsatz als selbstständiger Unternehmer (keine Arbeitnehmerüberlassung).</p>
      ${sectionEnd}

      ${sectionStart('#f8fafc')}
        ${h3('Nichterscheinen / kurzfristige Absage (No-Show)', '#bb2c29')}
        <p class="body-text" style="margin:8px 0;font-size:13px;line-height:1.6;color:#374151;">Bei Nichterscheinen oder Absage ≤ 24 Stunden vor Einsatzbeginn schuldet der Fahrer Fahrerexpress einen pauschalierten Schadensersatz in Höhe von 150 €, es sei denn, höhere Gewalt liegt vor.</p>
        <p class="body-text" style="margin:8px 0;font-size:13px;line-height:1.6;color:#374151;">Etwaige Ansprüche des Auftraggebers bleiben hiervon unberührt.</p>
      ${sectionEnd}

      <p class="body-text" style="margin:18px 0 8px 0;font-size:14px;color:#374151;">Bitte prüfen Sie die Angaben. Abweichungen bitte umgehend melden.</p>
      <p class="body-text" style="margin:0 0 4px 0;font-size:14px;color:#0d2340;font-weight:600;">Viele Grüße<br/>Fahrerexpress | kraftfahrer-mieten.com</p>
      <p class="body-text" style="margin:14px 0 0 0;font-size:12px;color:#6b7280;">Bestätigung erstellt am: ${new Date().toLocaleDateString('de-DE')}</p>
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
      bcc: ['guenter.killer@t-online.de'],
      subject: emailSubject,
      html: emailContent,
    });

    if (emailResult.error) {
      console.error('📧 Email sending failed:', emailResult.error);
      return createErrorResponse("Ein interner Fehler ist aufgetreten. Bitte versuchen Sie es erneut.", 500, corsHeaders);
    }

    console.log('📧 Email sent successfully:', emailResult.data?.id);

    // Log the email
    await supabase.from('email_log').insert({
      assignment_id: assignment_id,
      job_id: assignment.job_id,
      recipient: driver.email,
      status: 'sent',
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
