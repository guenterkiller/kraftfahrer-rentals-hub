import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  const FUNCTION_VERSION = "v3.0-jwt-auth";
  console.log(`📧 send-driver-confirmation ${FUNCTION_VERSION} called: ${req.method}`);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), { 
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  try {
    // 1) Extract and validate JWT from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid Authorization header');
      return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // 2) Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase configuration');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      });
    }

    const supa = createClient(supabaseUrl, supabaseServiceKey);

    // 3) Verify the JWT and get user
    const { data: { user }, error: authError } = await supa.auth.getUser(token);
    if (authError || !user) {
      console.error('Invalid token');
      return new Response(JSON.stringify({ ok: false, error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // 4) Verify admin role
    const { data: roleData, error: roleError } = await supa
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !roleData) {
      console.error('User is not an admin');
      return new Response(JSON.stringify({ ok: false, error: 'Forbidden - Admin access required' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    console.log('✅ Admin verified:', user.email);

    // 5) Parse request body
    const bodyData = await req.json();
    const { assignment_id } = bodyData;
    
    if (!assignment_id) {
      console.log('📧 ERROR: assignment_id missing from payload');
      return new Response(JSON.stringify({ ok: false, error: "assignment_id required" }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Get assignment data with complete job and driver information
    const { data: assignment, error: assignmentError } = await supa
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
      return new Response(JSON.stringify({ ok: false, error: "assignment not found" }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const driver = assignment.fahrer_profile;
    const job = assignment.job_requests;

    if (!driver || !driver.email || !driver.vorname || !driver.nachname) {
      console.error('📧 Driver data incomplete');
      return new Response(JSON.stringify({ ok: false, error: "Fahrerdaten unvollständig" }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
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
    const contactPerson = job?.customer_name || 'wird ergänzt';
    const contactPhone = job?.customer_phone || 'wird ergänzt';
    const contactEmail = job?.customer_email || 'wird ergänzt';
    const companyName = job?.company || job?.customer_name || 'wird ergänzt';
    
    const emailSubject = `Einsatzbestätigung – ${jobTitle} – ${location} am ${dateRange}`;

    // Create email content (same template as before)
    const emailContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Einsatzbestätigung</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.4; color: #000; margin: 0; padding: 20px; background-color: #ffffff;">
    <div style="max-width: 700px; margin: 0 auto;">
        
        <!-- Blue Header -->
        <div style="background-color: #4472c4; color: white; padding: 30px; text-align: center; margin-bottom: 20px;">
            <h1 style="margin: 0; font-size: 36px; font-weight: bold; letter-spacing: 1px;">EINSATZBESTÄTIGUNG</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Fahrerexpress | kraftfahrer-mieten.com</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 0 20px;">
            <p style="margin: 0 0 10px 0; font-size: 14px;">Hallo ${driver.vorname} ${driver.nachname},</p>
            <p style="margin: 0 0 20px 0; font-size: 14px;">hiermit bestätigen wir Ihren Einsatz als selbstständiger Fahrer.</p>
            
            <!-- AUFTRAGGEBER Section -->
            <div style="background-color: #f2f2f2; border-left: 4px solid #4472c4; padding: 15px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px 0; color: #000; font-size: 16px; font-weight: bold;">AUFTRAGGEBER</h3>
                <div style="color: #000; font-size: 14px;">
                    <p style="margin: 3px 0;"><strong>• Unternehmen/Name:</strong> ${companyName}</p>
                    <p style="margin: 3px 0;"><strong>• Ansprechpartner:</strong> ${contactPerson}</p>
                    <p style="margin: 3px 0;"><strong>• Anschrift:</strong> ${job?.customer_street && job?.customer_house_number && job?.customer_postal_code && job?.customer_city ? 
                        `${job.customer_street} ${job.customer_house_number}, ${job.customer_postal_code} ${job.customer_city}` : 'wird ergänzt'}</p>
                    <p style="margin: 3px 0;"><strong>• Telefon:</strong> ${contactPhone}</p>
                    <p style="margin: 3px 0;"><strong>• E-Mail:</strong> ${contactEmail}</p>
                </div>
            </div>
            
            <!-- EINSATZ Section -->
            <div style="background-color: #f2f2f2; border-left: 4px solid #4472c4; padding: 15px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px 0; color: #000; font-size: 16px; font-weight: bold;">EINSATZ</h3>
                <div style="color: #000; font-size: 14px;">
                    <p style="margin: 3px 0;"><strong>• Datum/Zeitraum:</strong> ${dateRange}</p>
                    <p style="margin: 3px 0;"><strong>• Einsatzort / Treffpunkt:</strong> ${location}</p>
                    <p style="margin: 3px 0;"><strong>• Fahrzeug/Typ:</strong> ${vehicleType}</p>
                    <p style="margin: 3px 0;"><strong>• Besonderheiten:</strong> ${job?.besonderheiten || '—'}</p>
                </div>
            </div>
            
            <!-- KONDITIONEN Section -->
            <div style="background-color: #f2f2f2; border-left: 4px solid #4472c4; padding: 15px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px 0; color: #000; font-size: 16px; font-weight: bold;">KONDITIONEN</h3>
                <div style="color: #000; font-size: 14px;">
                    <p style="margin: 3px 0;"><strong>• Abrechnung:</strong> ${assignment.rate_type === 'hourly' ? 'Stundensatz' : assignment.rate_type === 'daily' ? 'Tagessatz' : 'Nach Vereinbarung'}</p>
                    <p style="margin: 3px 0;"><strong>• Satz:</strong> ${rateFormatted} zzgl. gesetzlicher USt</p>
                </div>
            </div>
            
            <!-- VEREINBARUNGEN Section - Yellow background -->
            <div style="background-color: #fff2cc; border-left: 4px solid #d6b656; padding: 15px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px 0; color: #000; font-size: 16px; font-weight: bold;">VEREINBARUNGEN (Fahrerexpress)</h3>
                <div style="color: #000; font-size: 13px;">
                    <p style="margin: 8px 0;"><strong>1) Vermittlungsprovision:</strong> 15 % des Nettohonorars – ausschließlich für den vermittelten Einsatz; fällig nur bei tatsächlichem Einsatz.</p>
                    <p style="margin: 8px 0;"><strong>1a) Provisionsbasis:</strong> Die Provision bemisst sich auf das gesamte vom Fahrer dem Auftraggeber berechnete Nettohonorar, einschließlich im Zusammenhang mit dem Einsatz abgerechneter Nebenkosten (z. B. Fahrt-/Kilometerkosten, Übernachtung, Spesen, Mehrstunden), soweit der Fahrer diese dem Auftraggeber in Rechnung stellt.</p>
                    <p style="margin: 8px 0;"><strong>2) Abrechnung/Zahlung:</strong> Der Fahrer rechnet direkt mit dem Auftraggeber ab (Zahlungsziel: 14 Tage, ohne Abzug). Die Provision wird dem Fahrer von Fahrerexpress gesondert in Rechnung gestellt.</p>
                    <p style="margin: 8px 0;"><strong>3) Folgeaufträge:</strong> Auch direkt vereinbarte Folgeeinsätze mit diesem Auftraggeber sind provisionspflichtig, solange keine Festanstellung vorliegt.</p>
                    <p style="margin: 8px 0;"><strong>4) Informationspflicht:</strong> Direkt vereinbarte Folgeaufträge sind Fahrerexpress unaufgefordert mitzuteilen.</p>
                    <p style="margin: 8px 0;"><strong>5) Vertragsstrafe:</strong> Bei Verstoß gegen Ziff. 3) oder 4) fällt eine Vertragsstrafe von 2.500 € je Verstoß an; die Geltendmachung eines weitergehenden Schadens bleibt vorbehalten.</p>
                    <p style="margin: 8px 0;"><strong>6) Rechtsverhältnis:</strong> Einsatz als selbstständiger Unternehmer (keine Arbeitnehmerüberlassung). Der Fahrer stellt sicher, dass erforderliche Qualifikationen/Berechtigungen/Versicherungen vorliegen.</p>
                </div>
            </div>
            
            <!-- NO-SHOW Section -->
            <div style="margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px 0; color: #cc0000; font-size: 16px; font-weight: bold;">Nichterscheinen / kurzfristige Absage (No-Show)</h3>
                <div style="color: #000; font-size: 13px;">
                    <p style="margin: 8px 0;">Erscheint der Fahrer ohne triftigen Grund nicht zum vereinbarten Einsatzbeginn oder sagt er ≤ 24 Stunden vorher ab, gilt dies als No-Show.</p>
                    <p style="margin: 8px 0;">In diesem Fall schuldet der Fahrer dem Auftraggeber einen pauschalierten Schadensersatz i. H. v. 150 € (alternativ zulässig: 30 % des vereinbarten Tages-/Einsatzsatzes, max. 250 €).</p>
                    <p style="margin: 8px 0;">Dem Fahrer bleibt der Nachweis vorbehalten, dass kein oder ein geringerer Schaden entstanden ist; dem Auftraggeber bleibt der Nachweis eines höheren Schadens unbenommen.</p>
                    <p style="margin: 8px 0;"><strong>Höhere Gewalt</strong> (z. B. akute Krankheit mit Attest, Unfall) ist ausgenommen; die Verhinderung ist unverzüglich mitzuteilen.</p>
                    <p style="margin: 8px 0;">Fahrerexpress bemüht sich im No-Show-Fall unverzüglich um Ersatz.</p>
                </div>
            </div>
            
            <!-- Footer Message -->
            <div style="margin-top: 30px; padding-top: 15px;">
                <p style="margin: 0 0 15px 0; font-size: 14px; color: #000;">Bitte prüfen Sie die Angaben. Abweichungen bitte umgehend melden.</p>
                
                <p style="margin: 15px 0 5px 0; font-size: 14px; color: #000;">Viele Grüße<br>
                <strong>Fahrerexpress | kraftfahrer-mieten.com</strong></p>
                
                <p style="margin: 15px 0 5px 0; font-size: 14px; color: #000;">
                    E-Mail: <a href="mailto:info@kraftfahrer-mieten.com" style="color: #4472c4; text-decoration: none;">info@kraftfahrer-mieten.com</a> | Tel: +49-1577-1442285
                </p>
            </div>
        </div>
        
        <!-- Bottom signature -->
        <div style="text-align: center; margin-top: 30px; padding: 15px; font-size: 12px; color: #666; border-top: 1px solid #ccc;">
            <p style="margin: 0;"><strong>Fahrerexpress-Agentur – Günter Killer</strong></p>
            <p style="margin: 0;">E-Mail: <a href="mailto:info@kraftfahrer-mieten.com" style="color: #4472c4; text-decoration: none;">info@kraftfahrer-mieten.com</a> | Web: <a href="https://kraftfahrer-mieten.com" style="color: #4472c4; text-decoration: none;">kraftfahrer-mieten.com</a></p>
            <p style="margin: 10px 0 0 0;">Bestätigung erstellt am: ${new Date().toLocaleDateString('de-DE')}</p>
        </div>
    </div>
</body>
</html>
    `;

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
      return new Response(JSON.stringify({ ok: false, error: `Mail error: ${emailResult.error.message}` }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    console.log('📧 Email sent successfully:', emailResult.data?.id);

    // Log the email
    await supa.from('email_log').insert({
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
    await supa.from('admin_actions').insert({
      action: 'send_driver_confirmation',
      job_id: assignment.job_id,
      assignment_id: assignment_id,
      admin_email: user.email,
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
    return new Response(JSON.stringify({ ok: false, error: 'Internal server error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});
