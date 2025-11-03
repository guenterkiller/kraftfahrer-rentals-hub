import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

interface BlockDriverRequest {
  driverId: string;
  isBlocked: boolean;
  reason?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { driverId, isBlocked, reason }: BlockDriverRequest = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`🔄 ${isBlocked ? 'Blocking' : 'Unblocking'} driver ${driverId}`);

    const updateData: any = {
      is_blocked: isBlocked,
      updated_at: new Date().toISOString()
    };

    if (isBlocked) {
      updateData.blocked_at = new Date().toISOString();
      updateData.blocked_reason = reason || 'Keine Begründung angegeben';
    } else {
      updateData.blocked_at = null;
      updateData.blocked_reason = null;
    }

    const { error: updateError } = await supabase
      .from('fahrer_profile')
      .update(updateData)
      .eq('id', driverId);

    if (updateError) {
      console.error('❌ Failed to update driver block status:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to update driver status' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`✅ Driver ${isBlocked ? 'blocked' : 'unblocked'} successfully`);

    // Send email notification to driver in background
    if (isBlocked) {
      EdgeRuntime.waitUntil(sendBlockNotification(driverId, reason || 'Keine Begründung angegeben', supabase));
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Fahrer wurde ${isBlocked ? 'gesperrt' : 'entsperrt'}` 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('❌ Error in toggle-driver-block function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

async function sendBlockNotification(
  driverId: string, 
  reason: string, 
  supabase: any
): Promise<void> {
  try {
    // Fetch driver data
    const { data: driver, error: driverError } = await supabase
      .from('fahrer_profile')
      .select('vorname, nachname, email')
      .eq('id', driverId)
      .single();

    if (driverError || !driver) {
      console.error('❌ Failed to fetch driver data:', driverError);
      return;
    }

    const mailFrom = Deno.env.get('MAIL_FROM') || 'fahrerexpress <noreply@poolaufbau.com>';
    const contactEmail = 'info@poolaufbau.com';
    const contactPhone = '01577 1442285';

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #d32f2f;">Vorübergehende Sperrung Ihres Fahrerprofils</h2>
        
        <p>Sehr geehrte/r ${driver.vorname} ${driver.nachname},</p>
        
        <p>Ihr Fahrerprofil bei fahrerexpress wurde vorübergehend gesperrt.</p>
        
        <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0;">
          <strong>Grund der Sperrung:</strong><br>
          ${reason}
        </div>
        
        <h3 style="color: #333; margin-top: 30px;">Ihre Rechte</h3>
        <ul style="line-height: 1.8;">
          <li><strong>Widerspruchsrecht:</strong> Sie haben das Recht, gegen diese Sperrung Widerspruch einzulegen</li>
          <li><strong>Stellungnahme:</strong> Sie können zu diesem Vorgang Stellung nehmen</li>
          <li><strong>Auskunft:</strong> Sie können jederzeit Auskunft über die zu Ihrer Person gespeicherten Daten verlangen (DSGVO Art. 15)</li>
        </ul>
        
        <h3 style="color: #333; margin-top: 30px;">Kontakt</h3>
        <p>Bitte wenden Sie sich bei Fragen oder zur Klärung an:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
          <strong>fahrerexpress (Günter Killer)</strong><br>
          E-Mail: <a href="mailto:${contactEmail}">${contactEmail}</a><br>
          Telefon: ${contactPhone}<br>
          Adresse: Walther-von-Cronberg-Platz 12, 60594 Frankfurt
        </div>
        
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
          Diese E-Mail wurde automatisch generiert. Die Sperrung erfolgte gemäß unserer AGB und 
          den vertraglichen Vereinbarungen. Sie erhalten diese Information gemäß Art. 14 DSGVO.
        </p>
      </div>
    `;

    await resend.emails.send({
      from: mailFrom,
      to: [driver.email],
      subject: 'Wichtig: Sperrung Ihres Fahrerprofils bei fahrerexpress',
      html: emailHtml,
    });

    console.log(`✉️ Block notification sent to ${driver.email}`);

    // Log email in database
    await supabase.from('email_log').insert({
      template: 'driver_block_notification',
      recipient: driver.email,
      subject: 'Wichtig: Sperrung Ihres Fahrerprofils bei fahrerexpress',
      status: 'sent',
      sent_at: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('❌ Error sending block notification:', error);
    // Don't throw - we don't want to fail the block operation if email fails
  }
}

serve(handler);
