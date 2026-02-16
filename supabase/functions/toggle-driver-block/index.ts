import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';
import { DriverBlockNotice } from '../_shared/email-templates/driver-block-notice.tsx';
import { AdminBlockNotice } from '../_shared/email-templates/admin-block-notice.tsx';

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

// Check if the reason indicates a voluntary newsletter unsubscribe (not misconduct)
function isNewsletterOptOut(reason?: string): boolean {
  if (!reason) return false;
  const normalized = reason.toLowerCase().trim();
  const optOutPatterns = [
    'abmeldung vom rundschreiben',
    'keine weiteren e-mails',
    'keine emails mehr',
    'keine e-mails mehr',
    'vom verteiler abmelden',
    'verteilerabmeldung',
    'newsletter abmelden',
    'newsletter abbestellen',
    'rundschreiben abmelden',
    'möchte keine mails',
    'will keine mails',
    'will keine e-mails',
    'keine benachrichtigungen',
    'abmeldung vom newsletter',
    'opt-out',
    'opt out',
    'unsubscribe',
  ];
  return optOutPatterns.some(p => normalized.includes(p));
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

    // ── Newsletter opt-out path (no block, no punitive email) ──
    if (isBlocked && isNewsletterOptOut(reason)) {
      console.log(`📧 Newsletter opt-out for driver ${driverId} – no block triggered`);

      const { error: optOutError } = await supabase
        .from('fahrer_profile')
        .update({
          email_opt_out: true,
          status: 'inactive',
          blocked_reason: 'Inaktiv – Verteilerabmeldung auf Wunsch',
          // Explicitly NOT setting is_blocked = true
          is_blocked: false,
          blocked_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', driverId);

      if (optOutError) {
        console.error('❌ Failed to set newsletter opt-out:', optOutError);
        return new Response(JSON.stringify({ error: 'Failed to update driver status' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log(`✅ Driver ${driverId} marked as inactive (newsletter opt-out). No block email sent.`);

      return new Response(JSON.stringify({
        success: true,
        type: 'newsletter_optout',
        message: 'Kein Fehlverhalten – freiwillige Abmeldung. Fahrer bleibt technisch verfügbar, aber nicht im Verteiler.',
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ── Standard block/unblock path ──
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

    // Send email notification to driver in background (only for real blocks)
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
      .select('vorname, nachname, email, blocked_at')
      .eq('id', driverId)
      .single();

    if (driverError || !driver) {
      console.error('❌ Failed to fetch driver data:', driverError);
      return;
    }

    const mailFrom = Deno.env.get('MAIL_FROM') || 'Fahrerexpress <info@kraftfahrer-mieten.com>';

    // Send email to driver
    const driverEmailHtml = await renderAsync(
      React.createElement(DriverBlockNotice, {
        driverName: `${driver.vorname} ${driver.nachname}`,
        reason: reason,
      })
    );

    await resend.emails.send({
      from: mailFrom,
      to: [driver.email],
      subject: 'Wichtig: Sperrung Ihres Fahrerprofils bei fahrerexpress',
      html: driverEmailHtml,
    });

    console.log(`✉️ Block notification sent to driver ${driver.email}`);

    // Send notification to admin
    const adminEmail = Deno.env.get('ADMIN_EMAIL') || 'guenter.killer@t-online.de';
    
    const adminEmailHtml = await renderAsync(
      React.createElement(AdminBlockNotice, {
        driverName: `${driver.vorname} ${driver.nachname}`,
        driverEmail: driver.email,
        driverId: driverId,
        reason: reason,
        blockedAt: driver.blocked_at || new Date().toISOString(),
      })
    );

    await resend.emails.send({
      from: mailFrom,
      to: [adminEmail],
      subject: `🚫 Fahrersperrung: ${driver.vorname} ${driver.nachname}`,
      html: adminEmailHtml,
    });

    console.log(`✉️ Admin notification sent to ${adminEmail}`);

    // Log emails to database
    await supabase.from('email_log').insert([
      {
        template: 'driver_block_notice',
        recipient: driver.email,
        status: 'sent',
        subject: 'Wichtig: Sperrung Ihres Fahrerprofils bei fahrerexpress'
      },
      {
        template: 'admin_block_notice',
        recipient: adminEmail,
        status: 'sent',
        subject: `🚫 Fahrersperrung: ${driver.vorname} ${driver.nachname}`
      }
    ]);

  } catch (error: any) {
    console.error('❌ Error sending block notification:', error);
    // Don't throw error - notification failure shouldn't block the main operation
  }
}

serve(handler);
