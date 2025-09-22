import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";

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
      return new Response(JSON.stringify({ 
        error: 'Job is no longer available',
        currentStatus: job.status 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Log the driver response
    const responseNote = action === 'accept' 
      ? `Driver ${driver.vorname} ${driver.nachname} accepted job (${billingModel || job.billing_model} billing)`
      : `Driver ${driver.vorname} ${driver.nachname} declined job`;

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

      // Create job assignment using admin function
      const { data: assignment, error: assignError } = await supabase
        .rpc('admin_assign_driver', {
          _job_id: jobId,
          _driver_id: driverId,
          _rate_type: 'daily',
          _rate_value: finalBillingModel === 'agency' ? 399 : 349, // Different rates for different models
          _note: `Driver accepted via email (${finalBillingModel} billing model)`
        });

      if (assignError) {
        console.error('Error creating assignment:', assignError);
        return new Response(JSON.stringify({ error: 'Failed to create assignment' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Send confirmation email to driver
      // TODO: Implement confirmation email with billing model details

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
            </style>
          </head>
          <body>
            <div class="success">
              <h2>✅ Auftrag erfolgreich angenommen!</h2>
              <p>Vielen Dank, ${driver.vorname}! Sie haben den Auftrag erfolgreich angenommen.</p>
            </div>
            
            <div class="info">
              <h3>Abrechnungsmodell: ${finalBillingModel === 'agency' ? 'Agenturabrechnung' : 'Direktabrechnung'}</h3>
              <p>
                ${finalBillingModel === 'agency' 
                  ? 'Sie arbeiten als Subunternehmer für Fahrerexpress und stellen Ihre Rechnung an uns.'
                  : 'Sie rechnen direkt mit dem Auftraggeber ab und zahlen eine Vermittlungsprovision an Fahrerexpress.'
                }
              </p>
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