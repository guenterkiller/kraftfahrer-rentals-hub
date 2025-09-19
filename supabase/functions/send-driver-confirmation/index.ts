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
  console.log(`📧 send-driver-confirmation called: ${req.method} ${req.url}`);
  
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
    if (!assignment_id) {
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

    // Get assignment data
    const { data: assignment, error: assignmentError } = await supa
      .from("job_assignments")
      .select(`
        id, job_id, driver_id, status,
        rate_type, rate_value, start_date, end_date, admin_note,
        job_requests:job_id (
          id, status, customer_name, company, customer_phone, customer_email,
          einsatzort, fahrzeugtyp, besonderheiten, zeitraum
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
      console.error('📧 Driver data incomplete:', driver);
      return new Response(JSON.stringify({ ok: false, error: "Fahrerdaten unvollständig" }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    console.log(`📧 Sending email to driver: ${driver.email}`);

    // Create simple email content
    const emailContent = `
      <h1>Einsatzbestätigung</h1>
      <p>Hallo ${driver.vorname} ${driver.nachname},</p>
      <p>hiermit bestätigen wir Ihren Einsatz als selbstständiger Fahrer.</p>
      
      <h3>Einsatzdetails:</h3>
      <ul>
        <li><strong>Fahrzeugtyp:</strong> ${job?.fahrzeugtyp || 'Nicht angegeben'}</li>
        <li><strong>Einsatzort:</strong> ${job?.einsatzort || 'Siehe Nachricht'}</li>
        <li><strong>Zeitraum:</strong> ${job?.zeitraum || 'Nach Absprache'}</li>
        <li><strong>Vergütung:</strong> ${assignment.rate_value || 'nach Absprache'} €/${assignment.rate_type === 'hourly' ? 'Std' : 'Tag'}</li>
      </ul>

      <p>Bei Fragen stehen wir Ihnen gerne zur Verfügung.</p>
      
      <p>Mit freundlichen Grüßen<br>
      Ihr Kraftfahrer-Mieten Team</p>
    `;

    // Send email using Resend
    const emailResult = await resend.emails.send({
      from: 'Kraftfahrer-Mieten <info@kraftfahrer-mieten.com>',
      to: [driver.email],
      bcc: ['guenter.killer@t-online.de'],
      subject: 'Einsatzbestätigung - Ihr Fahrauftrag',
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
      subject: 'Einsatzbestätigung - Ihr Fahrauftrag',
      template: 'driver_confirmation',
      delivery_mode: 'inline',
      message_id: emailResult.data?.id
    });

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