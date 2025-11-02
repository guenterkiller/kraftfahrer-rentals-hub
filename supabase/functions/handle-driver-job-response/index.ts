import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
};

interface DriverResponseRequest {
  jobId: string;
  driverId: string;
  action: 'accept' | 'decline';
  billingModel?: 'direct' | 'agency';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const adminEmail = Deno.env.get('ADMIN_EMAIL') || 'guenter.killer@t-online.de';

    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ error: 'Missing environment variables' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Handle GET requests (URL params from email links)
    let requestData: DriverResponseRequest;
    
    if (req.method === 'GET') {
      const url = new URL(req.url);
      requestData = {
        jobId: url.searchParams.get('job') || '',
        driverId: url.searchParams.get('driver') || '',
        action: url.searchParams.get('action') as 'accept' | 'decline',
        billingModel: url.searchParams.get('billing') as 'direct' | 'agency'
      };
    } else {
      requestData = await req.json();
    }

    const { jobId, driverId, action, billingModel } = requestData;

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
      // Return friendly HTML page for GET requests (email links)
      if (req.method === 'GET') {
        const statusText = job.status === 'assigned' 
          ? 'bereits vergeben' 
          : job.status === 'completed' 
          ? 'bereits abgeschlossen' 
          : 'nicht mehr verfügbar';
        
        // Get assignment details if job is assigned
        let assignmentInfo = '';
        if (job.status === 'assigned' || job.status === 'confirmed') {
          const { data: assignment } = await supabase
            .from('job_assignments')
            .select(`
              *,
              driver:fahrer_profile!job_assignments_driver_id_fkey(vorname, nachname, email, telefon)
            `)
            .eq('job_id', jobId)
            .in('status', ['assigned', 'confirmed'])
            .order('assigned_at', { ascending: false })
            .limit(1)
            .single();
          
          if (assignment && assignment.driver) {
            const assignedDriver = assignment.driver as any;
            const assignedDate = new Date(assignment.assigned_at).toLocaleString('de-DE', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
            
            assignmentInfo = `
              <div class="assignment-details">
                <h3>Auftrag vergeben an:</h3>
                <p><strong>Fahrer:</strong> ${assignedDriver.vorname} ${assignedDriver.nachname}</p>
                <p><strong>Vergeben am:</strong> ${assignedDate} Uhr</p>
                <p><strong>Status:</strong> ${assignment.status === 'confirmed' ? 'Bestätigt' : 'Zugewiesen'}</p>
              </div>
            `;
          }
        }
        
        const html = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Auftrag nicht mehr verfügbar</title>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
              .info { background: #fff3cd; border: 1px solid #ffc107; padding: 20px; border-radius: 8px; }
              h2 { color: #856404; margin: 0 0 15px 0; }
              p { color: #856404; margin: 10px 0; }
              .assignment-details { 
                background: #e7f3ff; 
                border: 1px solid #3b82f6; 
                padding: 15px; 
                border-radius: 8px; 
                margin: 20px 0; 
              }
              .assignment-details h3 { 
                color: #1e40af; 
                margin: 0 0 10px 0; 
                font-size: 16px; 
              }
              .assignment-details p { 
                color: #1e40af; 
                margin: 5px 0; 
              }
              .contact { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ffc107; }
            </style>
          </head>
          <body>
            <div class="info">
              <h2>ℹ️ Auftrag nicht mehr verfügbar</h2>
              <p>Dieser Auftrag ist leider ${statusText}.</p>
              ${assignmentInfo}
              <p>Ein anderer Fahrer hat den Auftrag bereits angenommen oder der Auftrag wurde zwischenzeitlich geschlossen.</p>
              <div class="contact">
                <p><strong>Keine Sorge!</strong> Wir haben weitere Aufträge für Sie.</p>
                <p>Bei Fragen erreichen Sie uns unter:</p>
                <p>
                  📞 <strong>Telefon:</strong> +49-1577-1442285<br>
                  ✉️ <strong>E-Mail:</strong> info@kraftfahrer-mieten.com
                </p>
              </div>
            </div>
          </body>
          </html>
        `;
        
        return new Response(html, {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'text/html' }
        });
      }
      
      // For API calls, return JSON
      return new Response(JSON.stringify({ 
        error: 'Job is no longer available',
        currentStatus: job.status 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Log the driver response in database
    await supabase
      .from('jobalarm_antworten')
      .insert({
        job_id: jobId,
        fahrer_email: driver.email,
        antwort: action
      });

    if (action === 'accept') {
      // Validate billing model
      const finalBillingModel = billingModel || job.billing_model;
      
      if (!['direct', 'agency'].includes(finalBillingModel)) {
        return new Response(JSON.stringify({ error: 'Invalid billing model' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Send notification email to admin (NO automatic assignment)
      if (resendApiKey) {
        const resend = new Resend(resendApiKey);
        
        const adminEmailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #d4fdf7; border: 1px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #065f46; margin: 0 0 15px 0;">✅ Fahrer interessiert an Auftrag</h2>
              <p style="color: #065f46; margin: 0;">
                <strong>${driver.vorname} ${driver.nachname}</strong> hat Interesse am Auftrag bekundet.
              </p>
              <p style="color: #065f46; margin: 10px 0 0 0; font-size: 14px;">
                ⚠️ <strong>Bitte prüfen und manuell zuweisen!</strong> Der Auftrag wurde noch NICHT automatisch vergeben.
              </p>
            </div>
            
            <div style="background: #fff; border: 1px solid #e5e5e5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Fahrerdetails:</h3>
              <p><strong>Name:</strong> ${driver.vorname} ${driver.nachname}</p>
              <p><strong>E-Mail:</strong> ${driver.email}</p>
              <p><strong>Telefon:</strong> ${driver.telefon}</p>
              <p><strong>Adresse:</strong> ${driver.plz} ${driver.ort}</p>
              <p><strong>Führerscheinklassen:</strong> ${driver.fuehrerscheinklassen?.join(', ') || 'Keine Angabe'}</p>
              <p><strong>Spezialisierungen:</strong> ${driver.spezialisierungen?.join(', ') || 'Keine Angabe'}</p>
              
              <h3>Auftragsdetails:</h3>
              <p><strong>Job-ID:</strong> ${jobId}</p>
              <p><strong>Kunde:</strong> ${job.customer_name}</p>
              <p><strong>Einsatzort:</strong> ${job.einsatzort}</p>
              <p><strong>Zeitraum:</strong> ${job.zeitraum}</p>
              <p><strong>Fahrzeugtyp:</strong> ${job.fahrzeugtyp}</p>
              <p><strong>Gewünschtes Abrechnungsmodell:</strong> ${finalBillingModel === 'agency' ? 'Agentur (399€/Tag)' : 'Direktabrechnung (349€/Tag)'}</p>
            </div>
            
            <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #92400e; margin: 0;">
                <strong>Nächster Schritt:</strong> Bitte im Admin-Dashboard den Fahrer manuell dem Auftrag zuweisen, wenn gewünscht.
              </p>
            </div>
            
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
              Diese E-Mail wurde automatisch versendet, als der Fahrer auf "Auftrag annehmen" geklickt hat.
            </p>
          </div>
        `;

        try {
          await resend.emails.send({
            from: 'Fahrerexpress System <info@kraftfahrer-mieten.com>',
            to: [adminEmail],
            subject: `✅ Interesse bekundet: ${driver.vorname} ${driver.nachname} - ${job.customer_name}`,
            html: adminEmailHtml
          });
          console.log(`✅ Admin notification sent to ${adminEmail}`);
        } catch (emailError) {
          console.error('❌ Failed to send admin notification:', emailError);
        }
      }

      // Return HTML response for GET requests (email links)
      if (req.method === 'GET') {
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
              .driver-info { background: #fff; border: 1px solid #e5e5e5; padding: 15px; border-radius: 8px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="success">
              <h2>✅ Interesse erfolgreich bekundet!</h2>
              <p>Vielen Dank, ${driver.vorname}! Wir haben Ihr Interesse an diesem Auftrag registriert.</p>
            </div>
            
            <div class="driver-info">
              <h3>Ihre Daten:</h3>
              <p><strong>Name:</strong> ${driver.vorname} ${driver.nachname}</p>
              <p><strong>E-Mail:</strong> ${driver.email}</p>
              <p><strong>Telefon:</strong> ${driver.telefon}</p>
            </div>
            
            <div class="info">
              <h3>Gewähltes Abrechnungsmodell: ${finalBillingModel === 'agency' ? 'Agenturabrechnung (399€/Tag)' : 'Direktabrechnung (349€/Tag)'}</h3>
              <p>
                ${finalBillingModel === 'agency' 
                  ? 'Sie würden als Subunternehmer für Fahrerexpress arbeiten und Ihre Rechnung an uns stellen.'
                  : 'Sie würden direkt mit dem Auftraggeber abrechnen und eine Vermittlungsprovision an Fahrerexpress zahlen.'
                }
              </p>
            </div>
            
            <div class="info" style="background: #fef3c7; border-color: #f59e0b;">
              <p style="color: #92400e;"><strong>Nächste Schritte:</strong></p>
              <p style="color: #92400e;">Der Administrator wurde über Ihr Interesse informiert und wird den Auftrag prüfen. Da mehrere Fahrer auf diesen Auftrag antworten können, entscheidet der Administrator über die finale Vergabe.</p>
              <p style="color: #92400e;">Sie werden zeitnah kontaktiert, sobald eine Entscheidung getroffen wurde.</p>
            </div>
            
            <p>Bei Fragen erreichen Sie uns unter: <strong>info@kraftfahrer-mieten.com</strong> oder <strong>+49-1577-1442285</strong></p>
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
        message: 'Interest registered successfully. Admin will review and assign.',
        billingModel: finalBillingModel
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else {
      // Handle decline
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
    console.error('Error in handle-driver-job-response:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

serve(handler);