import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";
import { Resend } from "npm:resend@2.0.0";
import React from 'npm:react@18.3.1';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import { AdminJobAcceptanceNotification } from '../_shared/email-templates/admin-job-acceptance-notification.tsx';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
};

interface DriverAcceptJobRequest {
  jobId: string;
  driverId: string;
  action: 'accept' | 'decline';
  termsAccepted?: boolean;
  ip?: string;
  userAgent?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ error: 'Missing environment variables' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Handle GET requests (URL params from email links)
    let requestData: DriverAcceptJobRequest;
    
    if (req.method === 'GET') {
      const url = new URL(req.url);
      requestData = {
        jobId: url.searchParams.get('job') || '',
        driverId: url.searchParams.get('driver') || '',
        action: url.searchParams.get('action') as 'accept' | 'decline',
        ip: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown'
      };
    } else {
      requestData = await req.json();
    }

    const { jobId, driverId, action, termsAccepted, ip, userAgent } = requestData;

    // Validate required fields
    if (!jobId || !driverId || !action) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get job details
    const { data: job, error: jobError } = await supabase
      .from('job_requests')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return new Response(JSON.stringify({ error: 'Job not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get driver details
    const { data: driver, error: driverError } = await supabase
      .from('fahrer_profile')
      .select('*')
      .eq('id', driverId)
      .single();

    if (driverError || !driver) {
      return new Response(JSON.stringify({ error: 'Driver not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if job is still available
    if (job.status !== 'open') {
      return new Response(JSON.stringify({ 
        error: 'Job is no longer available',
        currentStatus: job.status 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'accept') {
      // Bei agency billing model muss Terms-Zustimmung vorhanden sein
      if (job.billing_model === 'agency' && !termsAccepted && req.method === 'POST') {
        return new Response(JSON.stringify({ 
          error: 'Terms acceptance required for agency billing model',
          requiresTerms: true,
          billingModel: job.billing_model
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Record acceptance in audit table
      const { error: acceptanceError } = await supabase
        .from('job_driver_acceptances')
        .insert({
          job_id: jobId,
          driver_id: driverId,
          billing_model: job.billing_model,
          ip: ip,
          user_agent: userAgent,
          terms_version: 'v1'
        });

      if (acceptanceError && !acceptanceError.message?.includes('duplicate key')) {
        console.error('Error recording acceptance:', acceptanceError);
        return new Response(JSON.stringify({ error: 'Failed to record acceptance' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Create job assignment
      const { data: assignment, error: assignError } = await supabase
        .rpc('admin_assign_driver', {
          _job_id: jobId,
          _driver_id: driverId,
          _rate_type: 'daily',
          _rate_value: job.billing_model === 'agency' ? 399 : 349,
          _note: `Driver accepted via ${req.method} (${job.billing_model} billing model, terms accepted: ${termsAccepted || 'via link'})`
        });

      if (assignError) {
        console.error('Error creating assignment:', assignError);
        return new Response(JSON.stringify({ error: 'Failed to create assignment' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Bei agency: Customer invoice draft erstellen
      if (job.billing_model === 'agency') {
        const { error: invoiceError } = await supabase
          .from('job_requests')
          .update({
            customer_invoice_status: 'draft',
            updated_at: new Date().toISOString()
          })
          .eq('id', jobId);

        if (invoiceError) {
          console.error('Error creating customer invoice draft:', invoiceError);
        }
      }

      // Send confirmation email based on billing model
      if (resendApiKey) {
        const resend = new Resend(resendApiKey);
        const MAIL_FROM = Deno.env.get("MAIL_FROM") ?? "info@kraftfahrer-mieten.com";
        
        const billingText = job.billing_model === 'agency' 
          ? {
              subject: "Dienst-/Werkvertrag angenommen - Subunternehmer-Einsatz",
              content: `
                <h2>✅ Dienst-/Werkvertrag erfolgreich angenommen!</h2>
                <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #1e40af;">Agenturabrechnung - Subunternehmer-Modell</h3>
                  <p><strong>Sie haben den Einsatz als selbstständiger Subunternehmer angenommen.</strong></p>
                  <p>Sie stellen Ihre Rechnung an Fahrerexpress, abzüglich der vereinbarten Provision/Marge. Es handelt sich um eine Dienst-/Werkleistung, keine Arbeitnehmerüberlassung und kein Arbeitsverhältnis.</p>
                </div>
              `
            }
          : {
              subject: "Vermittlungsauftrag angenommen - Direktabrechnung",
              content: `
                <h2>✅ Vermittlungsauftrag erfolgreich angenommen!</h2>
                <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #15803d;">Vermittlung (Direktabrechnung)</h3>
                  <p><strong>Sie rechnen direkt mit dem Auftraggeber ab.</strong></p>
                  <p>Fahrerexpress stellt Ihnen die vereinbarte Vermittlungsprovision in Rechnung.</p>
                </div>
              `
            };

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            ${billingText.content}
            
            <div style="background: #fff; border: 1px solid #e5e5e5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Auftragsdetails:</h3>
              <p><strong>Kunde:</strong> ${job.customer_name}</p>
              <p><strong>Einsatzort:</strong> ${job.einsatzort}</p>
              <p><strong>Zeitraum:</strong> ${job.zeitraum}</p>
              <p><strong>Fahrzeugtyp:</strong> ${job.fahrzeugtyp}</p>
              <p><strong>Nachricht:</strong> ${job.nachricht}</p>
            </div>

            <p>Sie erhalten in Kürze weitere Details und Kontaktinformationen.</p>
            <p>Bei Fragen erreichen Sie uns unter: <strong>info@kraftfahrer-mieten.com</strong></p>
          </div>
        `;

        try {
          await resend.emails.send({
            from: MAIL_FROM,
            to: [driver.email],
            subject: billingText.subject,
            html: emailHtml
          });
          console.log('✅ Driver confirmation email sent');
        } catch (emailError) {
          console.error('❌ Driver email sending failed:', emailError);
        }

        // Send admin notification
        try {
          const adminHtml = await renderAsync(
            React.createElement(AdminJobAcceptanceNotification, {
              driverName: `${driver.vorname} ${driver.nachname}`,
              driverEmail: driver.email,
              jobDetails: {
                customerName: job.customer_name,
                einsatzort: job.einsatzort,
                zeitraum: job.zeitraum,
                fahrzeugtyp: job.fahrzeugtyp,
                nachricht: job.nachricht,
              },
              billingModel: job.billing_model,
              acceptedAt: new Date().toLocaleString('de-DE'),
            })
          );

          const adminEmail = 'info@kraftfahrer-mieten.com';
          const adminSubject = `✅ Auftragsannahme: ${driver.vorname} ${driver.nachname} → ${job.customer_name}`;

          await resend.emails.send({
            from: MAIL_FROM,
            to: [adminEmail],
            subject: adminSubject,
            html: adminHtml
          });

          console.log('✅ Admin notification email sent');

          // Log admin notification
          await supabase.from('email_log').insert({
            recipient: adminEmail,
            subject: adminSubject,
            template: 'admin_job_acceptance_notification',
            status: 'sent',
            job_id: jobId,
            sent_at: new Date().toISOString(),
            delivery_mode: 'inline'
          });
        } catch (adminEmailError) {
          console.error('❌ Admin notification failed:', adminEmailError);
          // Log failed admin notification
          await supabase.from('email_log').insert({
            recipient: 'info@kraftfahrer-mieten.com',
            subject: `✅ Auftragsannahme: ${driver.vorname} ${driver.nachname}`,
            template: 'admin_job_acceptance_notification',
            status: 'failed',
            job_id: jobId,
            error_message: adminEmailError instanceof Error ? adminEmailError.message : String(adminEmailError),
            delivery_mode: 'inline'
          });
        }
      }

      // Return HTML response for GET requests (email links)
      if (req.method === 'GET') {
        const billingDisplay = job.billing_model === 'agency' 
          ? 'Agenturabrechnung - Subunternehmer-Modell'
          : 'Vermittlung - Direktabrechnung';
          
        const billingDescription = job.billing_model === 'agency'
          ? 'Sie erbringen die Leistung als selbstständiger Subunternehmer von Fahrerexpress. Es handelt sich um eine Dienst-/Werkleistung, keine Arbeitnehmerüberlassung.'
          : 'Sie rechnen direkt mit dem Auftraggeber ab. Fahrerexpress stellt Ihnen die vereinbarte Vermittlungsprovision in Rechnung.';
        
        const html = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Auftrag angenommen</title>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
              .success { background: #d4fdf7; border: 1px solid #10b981; padding: 20px; border-radius: 8px; }
              .info { background: #f0f9ff; border: 1px solid #3b82f6; padding: 15px; border-radius: 8px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="success">
              <h2>✅ Auftrag erfolgreich angenommen!</h2>
              <p>Vielen Dank, ${driver.vorname}! Sie haben den Auftrag erfolgreich angenommen.</p>
            </div>
            
            <div class="info">
              <h3>Abrechnungsmodell: ${billingDisplay}</h3>
              <p>${billingDescription}</p>
            </div>
            
            <p>Sie erhalten in Kürze weitere Details und Kontaktinformationen per E-Mail.</p>
            <p>Bei Fragen erreichen Sie uns unter: <strong>info@kraftfahrer-mieten.com</strong></p>
          </body>
          </html>
        `;
        
        return new Response(html, {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'text/html' }
        });
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Job accepted successfully',
        assignmentId: assignment,
        billingModel: job.billing_model
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else {
      // Handle decline
      await supabase
        .from('jobalarm_antworten')
        .insert({
          job_id: jobId,
          fahrer_email: driver.email,
          antwort: 'decline'
        });

      if (req.method === 'GET') {
        const html = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Auftrag abgelehnt</title>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
              .decline { background: #fef2f2; border: 1px solid #ef4444; padding: 20px; border-radius: 8px; }
            </style>
          </head>
          <body>
            <div class="decline">
              <h2>❌ Auftrag abgelehnt</h2>
              <p>Sie haben den Auftrag abgelehnt. Vielen Dank für Ihre Rückmeldung!</p>
            </div>
            <p>Der Auftrag wird anderen verfügbaren Fahrern angeboten.</p>
          </body>
          </html>
        `;
        
        return new Response(html, {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'text/html' }
        });
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Job declined successfully' 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Error in driver-accept-job:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

serve(handler);