import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

interface DriverConfirmationRequest {
  assignment_id: string;
  stage?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('🚚 Driver confirmation request received');

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
    const { assignment_id, stage }: DriverConfirmationRequest = await req.json();
    console.log('📋 Processing driver confirmation for assignment:', assignment_id, 'stage:', stage);

    // Fetch assignment with job and driver details
    const { data: assignment, error: assignmentError } = await supabase
      .from('job_assignments')
      .select(`
        *,
        job_requests!inner(*),
        fahrer_profile!inner(*)
      `)
      .eq('id', assignment_id)
      .single();

    if (assignmentError || !assignment) {
      console.error('❌ Assignment not found:', assignmentError);
      return new Response(JSON.stringify({ 
        error: 'Assignment not found' 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const job = assignment.job_requests;
    const driver = assignment.fahrer_profile;

    // Validate required address fields for proper legal confirmation
    const addressValidation = validateCustomerAddress(job);
    if (!addressValidation.isValid) {
      console.error('❌ Incomplete customer address:', addressValidation.missingFields);
      return new Response(JSON.stringify({ 
        error: 'Vollständige Anschrift des Auftraggebers erforderlich',
        details: `Fehlende Felder: ${addressValidation.missingFields.join(', ')}`,
        missingFields: addressValidation.missingFields
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get admin email for BCC
    const { data: adminSettings } = await supabase
      .from('admin_settings')
      .select('admin_email')
      .single();

    const adminEmail = adminSettings?.admin_email || 'info@kraftfahrer-mieten.com';

    console.log('📧 Generating driver confirmation email for:', driver.email);

    // Format start date for subject
    const formatDateForSubject = (dateStr: string | null) => {
      if (!dateStr) return 'nach Absprache';
      try {
        return new Date(dateStr).toLocaleDateString('de-DE');
      } catch {
        return 'nach Absprache';
      }
    };

    const datumStart = formatDateForSubject(assignment.start_date);
    const subject = `Einsatzbestätigung – ${job.company || job.customer_name} – ${job.einsatzort} am ${datumStart}`;

    // Generate PDF content
    const pdfHtml = generateDriverPDFContent({
      job,
      driver,
      assignment,
      confirmationDate: new Date().toLocaleDateString('de-DE')
    });

    // Generate email content
    const emailHtml = generateDriverEmailContent({
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
        assignment_id: assignment_id,
        recipient: driver.email,
        subject: subject,
        template: 'driver_confirmation',
        status: 'pending'
      })
      .select()
      .single();

    if (logError) {
      console.error('❌ Failed to create email log:', logError);
    }

    try {
      // Generate PDF
      const pdfBuffer = await generatePDF(pdfHtml);
      const pdfFilename = `driver-confirmation-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.pdf`;

      // Upload PDF to storage
      const pdfPath = `assignments/${assignment_id}/${pdfFilename}`;
      const { error: uploadError } = await supabase.storage
        .from('confirmations')
        .upload(pdfPath, pdfBuffer, {
          contentType: 'application/pdf',
          upsert: true
        });

      if (uploadError) {
        console.error('❌ PDF upload failed:', uploadError);
      }

      // Send email with PDF attachment
      const emailResponse = await resend.emails.send({
        from: 'Fahrerexpress-Agentur <info@kraftfahrer-mieten.com>',
        to: [driver.email],
        bcc: [adminEmail],
        subject: subject,
        html: emailHtml,
        attachments: [
          {
            filename: pdfFilename,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ]
      });

      if (emailResponse.error) {
        throw new Error(`Email sending failed: ${emailResponse.error.message}`);
      }

      console.log('✅ Driver confirmation email sent successfully:', emailResponse.data?.id);

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

      console.log('✅ Driver confirmation completed successfully');

      return new Response(JSON.stringify({ 
        success: true,
        emailId: emailResponse.data?.id,
        pdf_url: pdfPath,
        message: 'Driver confirmation sent successfully'
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
        error: 'Failed to send driver confirmation email',
        details: emailError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error in send-driver-confirmation:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

function validateCustomerAddress(job: any) {
  const requiredFields = [];
  
  // Check for company name or customer name
  if (!job.company || job.company === 'Bitte wählen') {
    if (!job.customer_name) {
      requiredFields.push('Unternehmen/Name');
    }
  }
  
  // Check for basic contact information that we know exists
  if (!job.customer_email) {
    requiredFields.push('E-Mail');
  }
  
  if (!job.customer_phone) {
    requiredFields.push('Telefon');
  }
  
  // For now, skip detailed address validation since we don't have separate address fields in the schema
  // The job description should contain location information
  
  return {
    isValid: requiredFields.length === 0,
    missingFields: requiredFields
  };
}

function generateDriverEmailContent({ job, driver, assignment, confirmationDate }) {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'nach Absprache';
    try {
      return new Date(dateStr).toLocaleDateString('de-DE');
    } catch {
      return 'nach Absprache';
    }
  };

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const datumStart = formatDate(assignment.start_date);
  const datumEnde = formatDate(assignment.end_date);
  const uhrzeitStart = formatTime(assignment.start_date);
  const uhrzeitEnde = formatTime(assignment.end_date);

  const firmaOderName = job.company && job.company !== 'Bitte wählen' ? job.company : job.customer_name;
  const rateDisplay = assignment.rate_type === 'daily' ? 'Tagessatz' : 
                      assignment.rate_type === 'hourly' ? 'Stundensatz' : 
                      'nach Absprache';

  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Einsatzbestätigung</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .section { margin-bottom: 20px; }
    .highlight { background-color: #f0f9ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; }
    .important { background-color: #fef3c7; border: 1px solid #f59e0b; padding: 20px; margin: 20px 0; }
    .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Einsatzbestätigung</h1>
    <p>Fahrerexpress | kraftfahrer-mieten.com</p>
  </div>
  
  <div class="content">
    <div class="section">
      <p>Hallo ${driver.vorname} ${driver.nachname},</p>
      
      <p>hiermit bestätigen wir Ihren Einsatz als selbstständiger Fahrer.</p>
    </div>

    <div class="highlight">
      <h3>AUFTRAGGEBER</h3>
      <p>• <strong>Unternehmen/Name:</strong> ${firmaOderName}<br>
      • <strong>Ansprechpartner:</strong> ${job.customer_name}<br>
      • <strong>Anschrift:</strong> <em>Vollständige Anschrift wird ergänzt</em><br>
      • <strong>Telefon:</strong> ${job.customer_phone}<br>
      • <strong>E-Mail:</strong> ${job.customer_email}</p>
    </div>

    <div class="highlight">
      <h3>EINSATZ</h3>
      <p>• <strong>Datum/Zeitraum:</strong> ${datumStart} ${uhrzeitStart}${datumEnde !== datumStart ? ` – ${datumEnde} ${uhrzeitEnde}` : ''}<br>
      • <strong>Einsatzort / Treffpunkt:</strong> ${job.einsatzort}<br>
      • <strong>Fahrzeug/Typ:</strong> ${job.fahrzeugtyp}<br>
      ${job.besonderheiten ? `• <strong>Besonderheiten:</strong> ${job.besonderheiten}<br>` : ''}</p>
    </div>

    <div class="highlight">
      <h3>KONDITIONEN</h3>
      <p>• <strong>Abrechnung:</strong> ${rateDisplay}<br>
      • <strong>Satz:</strong> ${assignment.rate_value ? `${assignment.rate_value} €` : 'nach Absprache'}<br>
      ${assignment.admin_note ? `• <strong>Sonstiges:</strong> ${assignment.admin_note}<br>` : ''}</p>
    </div>

    <div class="important">
      <h3>VEREINBARUNGEN (Fahrerexpress)</h3>
      <p><strong>1) Vermittlungsprovision:</strong> 15 % des Nettohonorars – ausschließlich für den vermittelten Einsatz; fällig nur bei tatsächlichem Einsatz.</p>
      <p><strong>2) Abrechnung/Zahlung:</strong> Der Fahrer rechnet direkt mit dem Auftraggeber ab (Zahlungsziel: 14 Tage). Die Provision wird dem Fahrer von Fahrerexpress gesondert in Rechnung gestellt.</p>
      <p><strong>3) Folgeaufträge:</strong> Auch direkt vereinbarte Folgeeinsätze mit diesem Auftraggeber sind provisionspflichtig, solange keine Festanstellung vorliegt.</p>
      <p><strong>4) Informationspflicht:</strong> Direkt vereinbarte Folgeaufträge sind Fahrerexpress unaufgefordert mitzuteilen.</p>
      <p><strong>5) Vertragsstrafe:</strong> Bei Verstoß gegen 3) oder 4) fällt eine Vertragsstrafe von 2.500 € je Verstoß an.</p>
      <p><strong>6) Rechtsverhältnis:</strong> Einsatz als selbstständiger Unternehmer (keine Arbeitnehmerüberlassung). Der Fahrer stellt sicher, dass erforderliche Qualifikationen/Berechtigungen/Versicherungen vorliegen.</p>
    </div>

    <div class="section">
      <p><strong>Bitte prüfen Sie die Angaben. Abweichungen bitte umgehend melden.</strong></p>
      
      <p>Viele Grüße<br><strong>Fahrerexpress | kraftfahrer-mieten.com</strong><br>
      E-Mail: info@kraftfahrer-mieten.com | Tel: +49-1577-1442285</p>
    </div>
  </div>

  <div class="footer">
    <p>Fahrerexpress-Agentur – Günter Killer<br>
    E-Mail: info@kraftfahrer-mieten.com | Web: kraftfahrer-mieten.com<br>
    Bestätigung erstellt am: ${confirmationDate}</p>
  </div>
</body>
</html>`;
}

function generateDriverPDFContent({ job, driver, assignment, confirmationDate }) {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'nach Absprache';
    try {
      return new Date(dateStr).toLocaleDateString('de-DE');
    } catch {
      return 'nach Absprache';
    }
  };

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const datumStart = formatDate(assignment.start_date);
  const datumEnde = formatDate(assignment.end_date);
  const uhrzeitStart = formatTime(assignment.start_date);
  const uhrzeitEnde = formatTime(assignment.end_date);

  const firmaOderName = job.company && job.company !== 'Bitte wählen' ? job.company : job.customer_name;
  const rateDisplay = assignment.rate_type === 'daily' ? 'Tagessatz' : 
                      assignment.rate_type === 'hourly' ? 'Stundensatz' : 
                      'nach Absprache';

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
    .important { background-color: #fef3c7; border: 1px solid #f59e0b; padding: 15px; margin: 20px 0; }
    .important h3 { color: #92400e; margin-top: 0; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 9px; color: #64748b; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Einsatzbestätigung</h1>
    <p style="font-size: 14px; margin: 10px 0 0 0;"><strong>Fahrerexpress | kraftfahrer-mieten.com</strong></p>
    <p style="margin: 5px 0;">Bestätigung vom: ${confirmationDate}</p>
  </div>

  <div class="section">
    <p>Hallo ${driver.vorname} ${driver.nachname},</p>
    <p>hiermit bestätigen wir Ihren Einsatz als selbstständiger Fahrer.</p>
  </div>

  <div class="section">
    <h3>AUFTRAGGEBER</h3>
    <p>• <strong>Unternehmen/Name:</strong> ${firmaOderName}<br>
    • <strong>Ansprechpartner:</strong> ${job.customer_name}<br>
    • <strong>Anschrift:</strong> <em>Vollständige Anschrift wird ergänzt</em><br>
    • <strong>Telefon:</strong> ${job.customer_phone}<br>
    • <strong>E-Mail:</strong> ${job.customer_email}</p>
  </div>

  <div class="section">
    <h3>EINSATZ</h3>
    <p>• <strong>Datum/Zeitraum:</strong> ${datumStart} ${uhrzeitStart}${datumEnde !== datumStart ? ` – ${datumEnde} ${uhrzeitEnde}` : ''}<br>
    • <strong>Einsatzort / Treffpunkt:</strong> ${job.einsatzort}<br>
    • <strong>Fahrzeug/Typ:</strong> ${job.fahrzeugtyp}<br>
    ${job.besonderheiten ? `• <strong>Besonderheiten:</strong> ${job.besonderheiten}<br>` : ''}</p>
  </div>

  <div class="section">
    <h3>KONDITIONEN</h3>
    <p>• <strong>Abrechnung:</strong> ${rateDisplay}<br>
    • <strong>Satz:</strong> ${assignment.rate_value ? `${assignment.rate_value} €` : 'nach Absprache'}<br>
    ${assignment.admin_note ? `• <strong>Sonstiges:</strong> ${assignment.admin_note}<br>` : ''}</p>
  </div>

  <div class="important">
    <h3>VEREINBARUNGEN (Fahrerexpress)</h3>
    <p><strong>1) Vermittlungsprovision:</strong> 15 % des Nettohonorars – ausschließlich für den vermittelten Einsatz; fällig nur bei tatsächlichem Einsatz.</p>
    <p><strong>2) Abrechnung/Zahlung:</strong> Der Fahrer rechnet direkt mit dem Auftraggeber ab (Zahlungsziel: 14 Tage). Die Provision wird dem Fahrer von Fahrerexpress gesondert in Rechnung gestellt.</p>
    <p><strong>3) Folgeaufträge:</strong> Auch direkt vereinbarte Folgeeinsätze mit diesem Auftraggeber sind provisionspflichtig, solange keine Festanstellung vorliegt.</p>
    <p><strong>4) Informationspflicht:</strong> Direkt vereinbarte Folgeaufträge sind Fahrerexpress unaufgefordert mitzuteilen.</p>
    <p><strong>5) Vertragsstrafe:</strong> Bei Verstoß gegen 3) oder 4) fällt eine Vertragsstrafe von 2.500 € je Verstoß an.</p>
    <p><strong>6) Rechtsverhältnis:</strong> Einsatz als selbstständiger Unternehmer (keine Arbeitnehmerüberlassung). Der Fahrer stellt sicher, dass erforderliche Qualifikationen/Berechtigungen/Versicherungen vorliegen.</p>
  </div>

  <div class="section">
    <p><strong>Bitte prüfen Sie die Angaben. Abweichungen bitte umgehend melden.</strong></p>
    <p>Viele Grüße<br><strong>Fahrerexpress | kraftfahrer-mieten.com</strong><br>
    E-Mail: info@kraftfahrer-mieten.com | Tel: +49-1577-1442285</p>
  </div>

  <div class="footer">
    <p>Fahrerexpress-Agentur – Günter Killer<br>
    E-Mail: info@kraftfahrer-mieten.com | Web: kraftfahrer-mieten.com<br>
    Bestätigung erstellt am: ${confirmationDate}</p>
  </div>
</body>
</html>`;
}

async function generatePDF(htmlContent: string): Promise<Uint8Array> {
  // For production, use a proper PDF generation library like puppeteer
  // For now, we'll encode the HTML content as a simple fallback
  const encoder = new TextEncoder();
  return encoder.encode(htmlContent);
}

serve(handler);