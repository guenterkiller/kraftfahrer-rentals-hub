import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";
import { Resend } from "npm:resend@2.0.0";

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize Resend
const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ApproveDriverRequest {
  driverId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 approve-driver-and-send-jobs function called');
    
    // Parse request body to get email and driverId
    const { email, driverId }: { email?: string; driverId?: string } = await req.json();
    
    console.log('📧 Request from email:', email);
    console.log('👤 Driver ID to approve:', driverId);
    
    // Check admin email authorization
    const ADMIN_EMAIL = 'guenter.killer@t-online.de';
    if (!email || email !== ADMIN_EMAIL) {
      console.error('❌ Unauthorized email:', email);
      return new Response(JSON.stringify({ error: 'Unauthorized - Invalid admin email' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!driverId) {
      console.error('❌ Missing driver ID');
      return new Response(JSON.stringify({ error: 'Driver ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Admin email verified:', email);

    // 1. Get driver details
    const { data: driver, error: driverError } = await supabase
      .from('fahrer_profile')
      .select('*')
      .eq('id', driverId)
      .single();

    if (driverError || !driver) {
      console.error('❌ Driver not found:', driverError);
      return new Response(JSON.stringify({ error: 'Driver not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('👤 Driver found:', driver.vorname, driver.nachname);

    // 2. Update driver status to 'active'
    const { error: updateError } = await supabase
      .from('fahrer_profile')
      .update({ status: 'active' })
      .eq('id', driverId);

    if (updateError) {
      console.error('❌ Failed to update driver status:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to update driver status' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Driver status updated to active');

    // 3. Get recent open jobs (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: jobs, error: jobsError } = await supabase
      .from('job_requests')
      .select('*')
      .eq('status', 'open')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(50);

    if (jobsError) {
      console.error('❌ Failed to fetch jobs:', jobsError);
      // Continue with email even if jobs can't be fetched
    }

    console.log('📋 Found jobs:', jobs?.length || 0);

    // 4. Prepare email content
    const mailFrom = Deno.env.get('MAIL_FROM') || 'Kraftfahrer-Mieten <onboarding@resend.dev>';
    const mailReplyTo = Deno.env.get('MAIL_REPLY_TO') || 'info@kraftfahrer-mieten.com';

    let emailContent = `Hallo ${driver.vorname} ${driver.nachname},

Sie sind jetzt freigeschaltet und können Fahrergesuche erhalten!

`;

    if (jobs && jobs.length > 0) {
      emailContent += `Hier sind die aktuellen Fahrergesuche der letzten 30 Tage:

`;

      jobs.forEach((job, index) => {
        const startDate = new Date(job.created_at).toLocaleDateString('de-DE');
        emailContent += `${index + 1}. ${job.nachricht || 'Fahrergesuch'} — ${job.einsatzort || 'Ort nicht angegeben'} — ${startDate} — ${job.zeitraum || 'Zeitraum nicht angegeben'} — ${job.fahrzeugtyp || 'Fahrzeugtyp nicht angegeben'} — ${job.fuehrerscheinklasse || 'Klasse nicht angegeben'}
`;
        if (job.besonderheiten) {
          emailContent += `   Besonderheiten: ${job.besonderheiten}
`;
        }
        emailContent += `
`;
      });

      emailContent += `
Antworten Sie direkt auf diese E-Mail oder rufen Sie uns an, um Interesse zu bekunden.`;
    } else {
      emailContent += `Derzeit sind keine offenen Fahrergesuche verfügbar. Wir melden uns, sobald neue Anfragen eingehen.`;
    }

    emailContent += `

Mit freundlichen Grüßen
Ihr Fahrerexpress-Team

---
Fahrerexpress-Agentur
Günter Killer`;

    // 5. Send email
    let emailSuccess = false;
    let emailError = null;

    try {
      const emailResponse = await resend.emails.send({
        from: mailFrom,
        to: [driver.email],
        reply_to: mailReplyTo,
        subject: 'Aktuelle Fahrergesuche – Fahrerexpress',
        text: emailContent,
      });

      console.log('✅ Email sent successfully:', emailResponse.id);
      emailSuccess = true;
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      emailError = error instanceof Error ? error.message : 'Unknown email error';
    }

    // 6. Log email attempt
    try {
      await supabase.from('mail_log').insert({
        recipient: driver.email,
        template: 'driver_approval_with_jobs',
        success: emailSuccess,
        error_message: emailError
      });
    } catch (logError) {
      console.error('❌ Failed to log email:', logError);
      // Don't fail the request if logging fails
    }

    console.log('✅ Process completed successfully');

    return new Response(JSON.stringify({
      ok: true,
      sentJobs: jobs?.length || 0,
      emailSent: emailSuccess
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

serve(handler);