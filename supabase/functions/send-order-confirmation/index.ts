import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

interface OrderConfirmationRequest {
  assignmentId: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('🎯 Order confirmation request received');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Parse request
    const { assignmentId }: OrderConfirmationRequest = await req.json();
    console.log('📋 Processing assignment:', assignmentId);

    // Check feature flag
    const { data: flagData } = await supabase
      .from('feature_flags')
      .select('enabled')
      .eq('flag_name', 'ORDER_CONFIRMATION_ENABLED')
      .single();

    if (!flagData?.enabled) {
      console.log('🚫 Order confirmation disabled by feature flag');
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Order confirmation disabled' 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Fetch assignment with job and driver details
    const { data: assignment, error: assignmentError } = await supabase
      .from('job_assignments')
      .select(`
        *,
        job_requests!inner(*),
        fahrer_profile!inner(*)
      `)
      .eq('id', assignmentId)
      .eq('status', 'accepted')
      .single();

    if (assignmentError || !assignment) {
      console.error('❌ Assignment not found or not accepted:', assignmentError);
      return new Response(JSON.stringify({ 
        error: 'Assignment not found or not in accepted status' 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const job = assignment.job_requests;
    const driver = assignment.fahrer_profile;

    console.log('📧 Generating confirmation for job:', job.id);

    // Generate PDF content
    const pdfHtml = generatePDFContent({
      job,
      driver,
      assignment,
      confirmationDate: new Date().toLocaleDateString('de-DE')
    });

    // Generate email content
    const emailHtml = generateEmailContent({
      job,
      driver,
      assignment,
      confirmationDate: new Date().toLocaleDateString('de-DE')
    });

    // Create email log entry
    const { data: emailLogEntry, error: logError } = await supabase
      .from('email_log')
      .insert({
        job_id: job.id,
        assignment_id: assignmentId,
        recipient: job.customer_email,
        subject: `Auftragsbestätigung - ${job.fahrzeugtyp} Einsatz ${job.einsatzort}`,
        template: 'order_confirmation',
        status: 'pending'
      })
      .select()
      .single();

    if (logError) {
      console.error('❌ Failed to create email log:', logError);
    }

    try {
      // Send email with PDF attachment
      const emailResponse = await resend.emails.send({
        from: 'Fahrerexpress-Agentur <info@kraftfahrer-mieten.com>',
        to: [job.customer_email],
        bcc: ['info@kraftfahrer-mieten.com'],
        subject: `Auftragsbestätigung - ${job.fahrzeugtyp} Einsatz ${job.einsatzort}`,
        html: emailHtml,
        attachments: [
          {
            filename: `Auftragsbestaetigung_${job.id.slice(0, 8)}_${new Date().toISOString().slice(0, 10)}.pdf`,
            content: await generatePDF(pdfHtml),
            contentType: 'application/pdf'
          }
        ]
      });

      if (emailResponse.error) {
        throw new Error(`Email sending failed: ${emailResponse.error.message}`);
      }

      console.log('✅ Email sent successfully:', emailResponse.data?.id);

      // Update email log with success
      if (emailLogEntry) {
        await supabase
          .from('email_log')
          .update({
            status: 'sent',
            message_id: emailResponse.data?.id,
            sent_at: new Date().toISOString()
          })
          .eq('id', emailLogEntry.id);
      }

      // Update assignment status to confirmed
      await supabase
        .from('job_assignments')
        .update({
          status: 'confirmed',
          confirmed_at: new Date().toISOString()
        })
        .eq('id', assignmentId);

      // Update job status to confirmed
      await supabase
        .from('job_requests')
        .update({ status: 'confirmed' })
        .eq('id', job.id);

      console.log('✅ Order confirmation completed successfully');

      return new Response(JSON.stringify({ 
        success: true,
        emailId: emailResponse.data?.id,
        message: 'Order confirmation sent successfully'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError);

      // Update email log with error
      if (emailLogEntry) {
        await supabase
          .from('email_log')
          .update({
            status: 'error',
            error_message: emailError.message
          })
          .eq('id', emailLogEntry.id);
      }

      return new Response(JSON.stringify({ 
        error: 'Failed to send confirmation email',
        details: emailError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error in send-order-confirmation:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

function generateEmailContent({ job, driver, assignment, confirmationDate }) {
  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Auftragsbestätigung</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .section { margin-bottom: 20px; }
    .highlight { background-color: #f0f9ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; }
    .terms { background-color: #fefce8; border: 1px solid #eab308; padding: 20px; margin: 20px 0; }
    .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { background-color: #f1f5f9; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Auftragsbestätigung</h1>
    <p>Fahrerexpress-Agentur – Günter Killer</p>
  </div>
  
  <div class="content">
    <div class="section">
      <p>Sehr geehrte Damen und Herren von <strong>${job.company || job.customer_name}</strong>,</p>
      
      <p>hiermit bestätigen wir Ihnen verbindlich die Vermittlung eines qualifizierten Fahrers für Ihren Auftrag:</p>
    </div>

    <div class="highlight">
      <h3>📋 Auftragsdetails</h3>
      <table>
        <tr><th>Auftrag-ID:</th><td>${job.id.slice(0, 8).toUpperCase()}</td></tr>
        <tr><th>Fahrzeugtyp:</th><td>${job.fahrzeugtyp}</td></tr>
        <tr><th>Einsatzort:</th><td>${job.einsatzort}</td></tr>
        <tr><th>Zeitraum:</th><td>${job.zeitraum}</td></tr>
        <tr><th>Führerscheinklasse:</th><td>${job.fuehrerscheinklasse}</td></tr>
        ${job.besonderheiten ? `<tr><th>Besonderheiten:</th><td>${job.besonderheiten}</td></tr>` : ''}
      </table>
    </div>

    <div class="highlight">
      <h3>👤 Vermittelter Fahrer</h3>
      <table>
        <tr><th>Name:</th><td>${driver.vorname} ${driver.nachname}</td></tr>
        <tr><th>Telefon:</th><td>${driver.telefon}</td></tr>
        <tr><th>E-Mail:</th><td>${driver.email}</td></tr>
        <tr><th>Stundensatz:</th><td>${assignment.rate_value} €/${assignment.rate_type === 'hourly' ? 'Stunde' : assignment.rate_type === 'daily' ? 'Tag' : 'Woche'}</td></tr>
        ${driver.erfahrung_jahre ? `<tr><th>Erfahrung:</th><td>${driver.erfahrung_jahre} Jahre</td></tr>` : ''}
        ${driver.spezialisierungen?.length ? `<tr><th>Spezialisierungen:</th><td>${driver.spezialisierungen.join(', ')}</td></tr>` : ''}
      </table>
    </div>

    <div class="terms">
      <h3>⚖️ Vermittlungs- und Provisionsbedingungen</h3>
      <p><em>(gültig für alle über kraftfahrer-mieten.com vermittelten Aufträge)</em></p>
      
      <h4>1. Provisionspflicht</h4>
      <p>Der Fahrer verpflichtet sich, für sämtliche über die Plattform kraftfahrer-mieten.com zustande gekommenen Aufträge eine Provision in Höhe von <strong>15 % des Nettohonorars</strong> an den Betreiber (Fahrerexpress-Agentur – Günter Killer) zu entrichten.<br>
      Die Provision wird ausschließlich bei tatsächlichem Einsatz fällig und nach Einsatzabschluss per Rechnung gestellt – entweder pro Auftrag oder gesammelt am Monatsende.</p>
      
      <h4>2. Folgeaufträge</h4>
      <p>Die Provisionspflicht gilt auch für alle Folgeaufträge, die zwischen dem vermittelten Auftraggeber und dem Fahrer zustande kommen, unabhängig davon, ob diese direkt oder über die Plattform vereinbart werden.</p>
      
      <h4>3. Dauer der Verpflichtung</h4>
      <p>Die Provisionspflicht besteht für die gesamte Dauer der Zusammenarbeit zwischen Auftraggeber und Fahrer und endet ausschließlich, wenn der Auftraggeber den Fahrer in ein festes Arbeitsverhältnis übernimmt.</p>
      
      <h4>4. Informationspflicht des Fahrers</h4>
      <p>Der Fahrer ist verpflichtet, sämtliche Direktanfragen des vermittelten Auftraggebers sowie alle Folgeaufträge unverzüglich dem Plattformbetreiber mitzuteilen.</p>
      
      <h4>5. Vertragsstrafe</h4>
      <p>Unterlässt der Fahrer die Mitteilung oder führt er Aufträge am Betreiber vorbei aus, verpflichtet er sich zur Zahlung einer Vertragsstrafe von <strong>2.500,00 € je Verstoß</strong>. Die Geltendmachung weitergehender Schadensersatzansprüche bleibt unberührt.</p>
      
      <h4>6. Verbindlichkeit für Auftraggeber</h4>
      <p>Der Auftraggeber erkennt an, dass sämtliche Aufträge mit über die Plattform vermittelten Fahrern provisionspflichtig sind und verpflichtet sich, den Fahrer entsprechend zu instruieren und dem Betreiber auf Anfrage Abrechnungs- und Einsatznachweise zur Verfügung zu stellen.</p>
    </div>

    <div class="section">
      <p>Der Fahrer wurde über den Auftrag informiert und hat die Annahme bestätigt. Sie können den Fahrer direkt kontaktieren und die weitere Absprache treffen.</p>
      
      <p>Bei Fragen oder Problemen stehen wir Ihnen jederzeit zur Verfügung.</p>
      
      <p>Mit freundlichen Grüßen,<br><strong>Fahrerexpress-Agentur – Günter Killer</strong></p>
    </div>
  </div>

  <div class="footer">
    <p><strong>Fahrerexpress-Agentur – Günter Killer</strong><br>
    Walther-von-Cronberg-Platz 12, 60594 Frankfurt am Main<br>
    E-Mail: info@kraftfahrer-mieten.com | Web: kraftfahrer-mieten.com<br>
    Bestätigung erstellt am: ${confirmationDate}</p>
  </div>
</body>
</html>`;
}

function generatePDFContent({ job, driver, assignment, confirmationDate }) {
  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; font-size: 11px; line-height: 1.4; color: #333; margin: 0; padding: 20px; }
    .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { color: #2563eb; margin: 0; font-size: 24px; }
    .section { margin-bottom: 25px; }
    .section h3 { color: #2563eb; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 15px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
    th, td { padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { background-color: #f8fafc; font-weight: bold; width: 30%; }
    .terms { background-color: #fefce8; border: 1px solid #eab308; padding: 15px; margin: 20px 0; }
    .terms h4 { color: #92400e; margin-top: 15px; margin-bottom: 8px; }
    .terms h4:first-of-type { margin-top: 0; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 9px; color: #64748b; }
    .signature-section { margin-top: 40px; }
    .signature-box { border: 1px solid #d1d5db; padding: 40px 20px; margin: 20px 0; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Auftragsbestätigung</h1>
    <p style="font-size: 14px; margin: 10px 0 0 0;"><strong>Fahrerexpress-Agentur – Günter Killer</strong></p>
    <p style="margin: 5px 0;">Bestätigung vom: ${confirmationDate}</p>
  </div>

  <div class="section">
    <h3>📋 Auftragsdetails</h3>
    <table>
      <tr><th>Auftrag-ID:</th><td>${job.id.slice(0, 8).toUpperCase()}</td></tr>
      <tr><th>Auftraggeber:</th><td>${job.company || job.customer_name}</td></tr>
      <tr><th>Kontakt:</th><td>${job.customer_email} | ${job.customer_phone}</td></tr>
      <tr><th>Fahrzeugtyp:</th><td>${job.fahrzeugtyp}</td></tr>
      <tr><th>Einsatzort:</th><td>${job.einsatzort}</td></tr>
      <tr><th>Zeitraum:</th><td>${job.zeitraum}</td></tr>
      <tr><th>Führerscheinklasse:</th><td>${job.fuehrerscheinklasse}</td></tr>
      ${job.besonderheiten ? `<tr><th>Besonderheiten:</th><td>${job.besonderheiten}</td></tr>` : ''}
    </table>
  </div>

  <div class="section">
    <h3>👤 Vermittelter Fahrer</h3>
    <table>
      <tr><th>Name:</th><td>${driver.vorname} ${driver.nachname}</td></tr>
      <tr><th>Telefon:</th><td>${driver.telefon}</td></tr>
      <tr><th>E-Mail:</th><td>${driver.email}</td></tr>
      <tr><th>Konditionen:</th><td>${assignment.rate_value} €/${assignment.rate_type === 'hourly' ? 'Stunde' : assignment.rate_type === 'daily' ? 'Tag' : 'Woche'}</td></tr>
      ${driver.erfahrung_jahre ? `<tr><th>Erfahrung:</th><td>${driver.erfahrung_jahre} Jahre</td></tr>` : ''}
      ${driver.spezialisierungen?.length ? `<tr><th>Spezialisierungen:</th><td>${driver.spezialisierungen.join(', ')}</td></tr>` : ''}
    </table>
  </div>

  <div class="terms">
    <h3 style="color: #92400e; margin-top: 0;">⚖️ Vermittlungs- und Provisionsbedingungen</h3>
    <p style="font-style: italic; margin-bottom: 15px;">(gültig für alle über kraftfahrer-mieten.com vermittelten Aufträge)</p>
    
    <h4>1. Provisionspflicht</h4>
    <p>Der Fahrer verpflichtet sich, für sämtliche über die Plattform kraftfahrer-mieten.com zustande gekommenen Aufträge eine Provision in Höhe von <strong>15 % des Nettohonorars</strong> an den Betreiber (Fahrerexpress-Agentur – Günter Killer) zu entrichten. Die Provision wird ausschließlich bei tatsächlichem Einsatz fällig und nach Einsatzabschluss per Rechnung gestellt – entweder pro Auftrag oder gesammelt am Monatsende.</p>
    
    <h4>2. Folgeaufträge</h4>
    <p>Die Provisionspflicht gilt auch für alle Folgeaufträge, die zwischen dem vermittelten Auftraggeber und dem Fahrer zustande kommen, unabhängig davon, ob diese direkt oder über die Plattform vereinbart werden.</p>
    
    <h4>3. Dauer der Verpflichtung</h4>
    <p>Die Provisionspflicht besteht für die gesamte Dauer der Zusammenarbeit zwischen Auftraggeber und Fahrer und endet ausschließlich, wenn der Auftraggeber den Fahrer in ein festes Arbeitsverhältnis übernimmt.</p>
    
    <h4>4. Informationspflicht des Fahrers</h4>
    <p>Der Fahrer ist verpflichtet, sämtliche Direktanfragen des vermittelten Auftraggebers sowie alle Folgeaufträge unverzüglich dem Plattformbetreiber mitzuteilen.</p>
    
    <h4>5. Vertragsstrafe</h4>
    <p>Unterlässt der Fahrer die Mitteilung oder führt er Aufträge am Betreiber vorbei aus, verpflichtet er sich zur Zahlung einer Vertragsstrafe von <strong>2.500,00 € je Verstoß</strong>. Die Geltendmachung weitergehender Schadensersatzansprüche bleibt unberührt.</p>
    
    <h4>6. Verbindlichkeit für Auftraggeber</h4>
    <p>Der Auftraggeber erkennt an, dass sämtliche Aufträge mit über die Plattform vermittelten Fahrern provisionspflichtig sind und verpflichtet sich, den Fahrer entsprechend zu instruieren und dem Betreiber auf Anfrage Abrechnungs- und Einsatznachweise zur Verfügung zu stellen.</p>
  </div>

  <div class="signature-section">
    <p><strong>Bestätigung der Annahme:</strong></p>
    <p>Der Fahrer ${driver.vorname} ${driver.nachname} hat den oben beschriebenen Auftrag am ${new Date().toLocaleDateString('de-DE')} verbindlich angenommen und bestätigt die Kenntnisnahme der Vermittlungs- und Provisionsbedingungen.</p>
    
    <div style="display: flex; justify-content: space-between; margin-top: 40px;">
      <div class="signature-box" style="width: 45%;">
        <p style="margin: 0;"><strong>Fahrerexpress-Agentur</strong></p>
        <p style="margin: 5px 0 0 0; font-size: 9px;">Günter Killer</p>
      </div>
      <div class="signature-box" style="width: 45%;">
        <p style="margin: 0;"><strong>Auftraggeber</strong></p>
        <p style="margin: 5px 0 0 0; font-size: 9px;">${job.company || job.customer_name}</p>
      </div>
    </div>
  </div>

  <div class="footer">
    <p><strong>Fahrerexpress-Agentur – Günter Killer</strong><br>
    Walther-von-Cronberg-Platz 12, 60594 Frankfurt am Main<br>
    E-Mail: info@kraftfahrer-mieten.com | Web: kraftfahrer-mieten.com<br>
    <br>
    Diese Auftragsbestätigung wurde automatisch am ${confirmationDate} generiert.</p>
  </div>
</body>
</html>`;
}

async function generatePDF(htmlContent: string): Promise<string> {
  // Simple PDF generation using basic HTML-to-PDF approach
  // For production, consider using a proper PDF library like Puppeteer
  const encoder = new TextEncoder();
  const data = encoder.encode(htmlContent);
  return btoa(String.fromCharCode(...data));
}

serve(handler);