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
  const FUNCTION_VERSION = "v2.0-new-template";
  console.log(`📧 send-driver-confirmation ${FUNCTION_VERSION} called: ${req.method} ${req.url}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('📧 Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    console.log(`📧 Method not allowed: ${req.method}`);
    return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), { 
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  try {
    // Parse request body
    const bodyData = await req.json();
    console.log('📧 Request body parsed successfully');

    // Validate admin email
    const ADMIN_EMAIL = "guenter.killer@t-online.de";
    if (bodyData.email !== ADMIN_EMAIL) {
      console.log('Unauthorized access attempt by:', bodyData.email);
      return new Response(
        JSON.stringify({ error: 'Zugriff verweigert' }),
        { 
          status: 403, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Check required fields
    const { assignment_id } = bodyData;
    console.log(`📧 Received assignment_id: ${assignment_id}`);
    
    if (!assignment_id) {
      console.log('📧 ERROR: assignment_id missing from payload');
      return new Response(JSON.stringify({ ok: false, error: "assignment_id required" }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase configuration');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    const supa = createClient(supabaseUrl, supabaseServiceKey);
    console.log('📧 Starting main processing logic');

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
      console.error('📧 Query result:', assignment);
      return new Response(JSON.stringify({ ok: false, error: "assignment not found" }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    console.log('📧 Assignment data loaded:', {
      assignment_id: assignment.id,
      job_title: assignment.job_requests?.fahrzeugtyp,
      location: assignment.job_requests?.einsatzort,
      start_date: assignment.start_date,
      end_date: assignment.end_date,
      rate: `${assignment.rate_value} ${assignment.rate_type}`
    });

    const driver = assignment.fahrer_profile;
    const job = assignment.job_requests;

    if (!driver || !driver.email || !driver.vorname || !driver.nachname) {
      console.error('📧 Driver data incomplete:', driver);
      return new Response(JSON.stringify({ ok: false, error: "Fahrerdaten unvollständig" }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    console.log(`📧 Sending email to driver: ${driver.email}`);

    // Helper function to format rate
    function formatRate(rateType: string | null, rateValue: number | null, currency = 'EUR'): string | null {
      if (!rateType || rateValue == null) return null;
      const v = Number(rateValue).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const unit = rateType === 'hourly' ? 'Std'
                 : rateType === 'daily'  ? 'Tag'
                 : rateType === 'weekly' ? 'Woche'
                 : 'pauschal';
      return `${v} ${currency}/${unit}`;
    }

    // Helper function to format date range
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
    const location = job?.einsatzort || '—';
    const dateRange = formatDateRange(assignment.start_date, assignment.end_date) || job?.zeitraum || '—';
    const rateFormatted = formatRate(assignment.rate_type, assignment.rate_value) || 'nach Absprache';
    const vehicleType = job?.fahrzeugtyp || '—';
    const notes = job?.besonderheiten?.trim() || null;
    const contactPerson = job?.customer_name || null;
    const contactPhone = job?.customer_phone || null;
    const confirmUrl = `https://kraftfahrer-mieten.com/driver/assignments/${assignment_id}/confirm`;
    
    // Create dynamic subject with date
    const startDateFormatted = assignment.start_date 
      ? new Date(assignment.start_date).toLocaleDateString('de-DE', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric',
          timeZone: 'Europe/Berlin'
        })
      : null;
      
    const emailSubject = startDateFormatted 
      ? `Einsatzbestätigung: ${jobTitle} am ${startDateFormatted}`
      : `Einsatzbestätigung: ${jobTitle}`;
      
    console.log(`📧 Generated subject: "${emailSubject}"`);

    // Create modern email content
    const emailContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Einsatzbestätigung</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <p>Hallo ${driver.vorname} ${driver.nachname},</p>

    <p>wir best&auml;tigen Ihren Einsatz als selbstst&auml;ndiger Fahrer.</p>

    <h3 style="margin:0 0 6px 0;">Einsatzdetails</h3>
    <ul style="margin:8px 0 16px 16px; padding:0;">
      <li><strong>Auftrag:</strong> ${jobTitle}</li>
      <li><strong>Fahrzeugtyp:</strong> ${vehicleType}</li>
      <li><strong>Einsatzort:</strong> ${location}</li>
      <li><strong>Zeitraum:</strong> ${dateRange}</li>
      <li><strong>Vergütung:</strong> ${rateFormatted}</li>
    </ul>

    <h3 style="margin:0 0 6px 0;">Ansprechpartner</h3>
    <p style="margin:8px 0 16px 0;">
      ${contactPerson || '—'}${contactPhone ? ` – ${contactPhone}` : ''}
    </p>

    ${notes ? `
    <h3 style="margin:0 0 6px 0;">Hinweise</h3>
    <p style="margin:8px 0 16px 0;">${notes}</p>
    ` : ''}

    <p style="margin:16px 0;">
      Bitte best&auml;tigen Sie Ihre Einsatzbereitschaft im Portal:<br>
      <a href="${confirmUrl}" style="color:#0b5fff;">Einsatz jetzt best&auml;tigen</a>
    </p>

    <p>Bei R&uuml;ckfragen sind wir gern f&uuml;r Sie da.<br>
    Mit freundlichen Gr&uuml;&szlig;en<br>
    <strong>Fahrerexpress-Agentur – Kraftfahrer-Mieten</strong></p>
</body>
</html>
    `;

    // Send email using Resend
    const emailResult = await resend.emails.send({
      from: 'Kraftfahrer-Mieten <info@kraftfahrer-mieten.com>',
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

    console.log(`📧 Email logged successfully with subject: "${emailSubject}"`);
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
    return new Response(JSON.stringify({ ok: false, error: "unexpected error" }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});