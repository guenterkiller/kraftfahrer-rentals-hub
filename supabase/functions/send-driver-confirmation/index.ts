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
      ? new Date(assignment.start_date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : 'bald';
    const emailSubject = `📢 Einsatz bestätigt: ${jobTitle} am ${startDateFormatted}`;

    // Create modern email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h1 style="color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Einsatzbestätigung</h1>
        
        <p>Hallo ${driver.vorname} ${driver.nachname},</p>
        <p>wir bestätigen Ihren Einsatz als selbstständiger Fahrer.</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1e40af;">📋 Einsatzdetails</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="margin: 8px 0;"><strong>• Auftrag:</strong> ${jobTitle}</li>
            <li style="margin: 8px 0;"><strong>• Fahrzeugtyp:</strong> ${vehicleType}</li>
            <li style="margin: 8px 0;"><strong>• Einsatzort:</strong> ${location}</li>
            <li style="margin: 8px 0;"><strong>• Zeitraum:</strong> ${dateRange}</li>
            <li style="margin: 8px 0;"><strong>• Vergütung:</strong> ${rateFormatted}</li>
          </ul>
        </div>

        ${contactPerson || contactPhone ? `
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #92400e;">👤 Ansprechpartner</h4>
          <p style="margin: 5px 0;">• ${contactPerson || '—'}${contactPhone ? ` – ${contactPhone}` : ''}</p>
        </div>
        ` : ''}

        ${notes ? `
        <div style="background-color: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #065f46;">📝 Hinweise</h4>
          <p style="margin: 5px 0; white-space: pre-line;">${notes}</p>
        </div>
        ` : ''}

        <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="margin: 0 0 10px 0;">Bitte bestätigen Sie Ihre Einsatzbereitschaft im Portal:</p>
          <a href="${confirmUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Einsatz bestätigen</a>
        </div>

        <p style="margin-top: 30px;">Viele Grüße<br>
        <strong>Ihr Kraftfahrer-Mieten Team</strong></p>
      </div>
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