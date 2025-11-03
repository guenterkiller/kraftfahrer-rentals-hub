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
      <!DOCTYPE html>
      <html lang="de">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sperrung Fahrerprofil</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8f8f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8f8f8;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, hsl(0, 73%, 41%) 0%, hsl(0, 73%, 51%) 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">fahrerexpress</h1>
                    <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Fahrervermittlung</p>
                  </td>
                </tr>
                
                <!-- Warning Banner -->
                <tr>
                  <td style="background-color: #fef3cd; border-left: 4px solid #ffc107; padding: 20px 30px;">
                    <p style="margin: 0; color: #856404; font-size: 16px; font-weight: 600;">
                      ⚠️ Wichtige Information zu Ihrem Fahrerprofil
                    </p>
                  </td>
                </tr>
                
                <!-- Main Content -->
                <tr>
                  <td style="padding: 30px;">
                    <p style="margin: 0 0 20px 0; color: #333; font-size: 16px; line-height: 1.6;">
                      Sehr geehrte/r ${driver.vorname} ${driver.nachname},
                    </p>
                    
                    <p style="margin: 0 0 24px 0; color: #333; font-size: 16px; line-height: 1.6;">
                      Ihr Fahrerprofil bei <strong>fahrerexpress</strong> wurde vorübergehend gesperrt.
                    </p>
                    
                    <!-- Reason Box -->
                    <div style="background-color: #fff5f5; border: 1px solid #fee; border-radius: 6px; padding: 20px; margin: 24px 0;">
                      <p style="margin: 0 0 8px 0; color: #c53030; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
                        Grund der Sperrung
                      </p>
                      <p style="margin: 0; color: #333; font-size: 15px; line-height: 1.6;">
                        ${reason}
                      </p>
                    </div>
                    
                    <!-- Rights Section -->
                    <div style="margin: 32px 0;">
                      <h2 style="margin: 0 0 16px 0; color: hsl(0, 73%, 41%); font-size: 18px; font-weight: 600;">
                        Ihre Rechte
                      </h2>
                      <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
                            <p style="margin: 0; color: #333; font-size: 15px; line-height: 1.6;">
                              <strong style="color: hsl(0, 73%, 41%);">Widerspruchsrecht:</strong> Sie haben das Recht, gegen diese Sperrung Widerspruch einzulegen
                            </p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
                            <p style="margin: 0; color: #333; font-size: 15px; line-height: 1.6;">
                              <strong style="color: hsl(0, 73%, 41%);">Stellungnahme:</strong> Sie können zu diesem Vorgang Stellung nehmen
                            </p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0;">
                            <p style="margin: 0; color: #333; font-size: 15px; line-height: 1.6;">
                              <strong style="color: hsl(0, 73%, 41%);">Auskunftsrecht:</strong> Sie können jederzeit Auskunft über die zu Ihrer Person gespeicherten Daten verlangen (DSGVO Art. 15)
                            </p>
                          </td>
                        </tr>
                      </table>
                    </div>
                    
                    <!-- Contact Section -->
                    <div style="background-color: #f8f9fa; border-radius: 6px; padding: 24px; margin: 32px 0;">
                      <h3 style="margin: 0 0 16px 0; color: #333; font-size: 16px; font-weight: 600;">
                        Kontakt für Rückfragen
                      </h3>
                      <table role="presentation" style="width: 100%;">
                        <tr>
                          <td>
                            <p style="margin: 0 0 8px 0; color: #333; font-size: 15px; font-weight: 600;">
                              fahrerexpress (Günter Killer)
                            </p>
                            <p style="margin: 0 0 4px 0; color: #666; font-size: 14px;">
                              📧 <a href="mailto:${contactEmail}" style="color: hsl(0, 73%, 41%); text-decoration: none;">${contactEmail}</a>
                            </p>
                            <p style="margin: 0 0 4px 0; color: #666; font-size: 14px;">
                              📞 ${contactPhone}
                            </p>
                            <p style="margin: 0; color: #666; font-size: 14px;">
                              📍 Walther-von-Cronberg-Platz 12, 60594 Frankfurt
                            </p>
                          </td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 24px 30px; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;">
                    <p style="margin: 0 0 8px 0; color: #6c757d; font-size: 12px; line-height: 1.5;">
                      Diese E-Mail wurde automatisch generiert. Die Sperrung erfolgte gemäß unserer AGB und den vertraglichen Vereinbarungen.
                    </p>
                    <p style="margin: 0; color: #6c757d; font-size: 12px; line-height: 1.5;">
                      Sie erhalten diese Information gemäß Art. 14 DSGVO. Weitere Informationen zum Datenschutz finden Sie unter 
                      <a href="https://fahrerexpress.de/datenschutz" style="color: hsl(0, 73%, 41%);">fahrerexpress.de/datenschutz</a>
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;


    await resend.emails.send({
      from: mailFrom,
      to: [driver.email],
      subject: 'Wichtig: Sperrung Ihres Fahrerprofils bei fahrerexpress',
      html: emailHtml,
    });

    console.log(`✉️ Block notification sent to driver ${driver.email}`);

    // Send notification to admin
    const adminEmail = Deno.env.get('ADMIN_EMAIL') || 'guenter.killer@t-online.de';
    const adminHtml = `
      <!DOCTYPE html>
      <html lang="de">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Fahrer gesperrt</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8f8f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8f8f8;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, hsl(0, 73%, 41%) 0%, hsl(0, 73%, 51%) 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">🚫 Fahrersperrung durchgeführt</h1>
                    <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Admin-Benachrichtigung</p>
                  </td>
                </tr>
                
                <!-- Main Content -->
                <tr>
                  <td style="padding: 30px;">
                    <p style="margin: 0 0 24px 0; color: #333; font-size: 16px; line-height: 1.6;">
                      Ein Fahrerprofil wurde im System gesperrt. Nachfolgend die Details:
                    </p>
                    
                    <!-- Driver Details -->
                    <div style="background-color: #f8f9fa; border-radius: 6px; padding: 24px; margin: 24px 0;">
                      <h2 style="margin: 0 0 16px 0; color: hsl(0, 73%, 41%); font-size: 18px; font-weight: 600;">
                        Fahrer-Informationen
                      </h2>
                      <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef; width: 140px;">
                            <strong style="color: #495057; font-size: 14px;">Name:</strong>
                          </td>
                          <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;">
                            <span style="color: #212529; font-size: 15px;">${driver.vorname} ${driver.nachname}</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;">
                            <strong style="color: #495057; font-size: 14px;">E-Mail:</strong>
                          </td>
                          <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;">
                            <a href="mailto:${driver.email}" style="color: hsl(0, 73%, 41%); text-decoration: none; font-size: 15px;">${driver.email}</a>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;">
                            <strong style="color: #495057; font-size: 14px;">Fahrer-ID:</strong>
                          </td>
                          <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;">
                            <code style="background-color: #e9ecef; padding: 2px 6px; border-radius: 3px; font-size: 12px; color: #495057;">${driverId}</code>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0;">
                            <strong style="color: #495057; font-size: 14px;">Gesperrt am:</strong>
                          </td>
                          <td style="padding: 10px 0;">
                            <span style="color: #212529; font-size: 15px;">${new Date().toLocaleString('de-DE', { 
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</span>
                          </td>
                        </tr>
                      </table>
                    </div>
                    
                    <!-- Block Reason -->
                    <div style="background-color: #fff5f5; border: 1px solid #fee; border-left: 4px solid hsl(0, 73%, 41%); border-radius: 6px; padding: 20px; margin: 24px 0;">
                      <p style="margin: 0 0 8px 0; color: hsl(0, 73%, 41%); font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
                        Sperrgrund
                      </p>
                      <p style="margin: 0; color: #333; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${reason}</p>
                    </div>
                    
                    <!-- Info Box -->
                    <div style="background-color: #e7f3ff; border: 1px solid #b3d9ff; border-radius: 6px; padding: 16px; margin: 24px 0;">
                      <p style="margin: 0; color: #004085; font-size: 14px; line-height: 1.6;">
                        ℹ️ <strong>Automatische Benachrichtigung:</strong> Der Fahrer wurde parallel per E-Mail über die Sperrung informiert und erhielt Informationen zu seinen Rechten (Widerspruch, Stellungnahme, DSGVO-Auskunft).
                      </p>
                    </div>
                    
                    <!-- Action Required -->
                    <div style="margin: 32px 0;">
                      <h3 style="margin: 0 0 12px 0; color: #333; font-size: 16px; font-weight: 600;">
                        Nächste Schritte
                      </h3>
                      <ul style="margin: 0; padding-left: 20px; color: #666; font-size: 14px; line-height: 1.8;">
                        <li>Dokumentation der Sperrung im Admin-System ist erfolgt</li>
                        <li>Bei Rückfragen des Fahrers: Stellungnahme prüfen und dokumentieren</li>
                        <li>Entsperrung bei Klärung über Admin-Panel möglich</li>
                      </ul>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 20px 30px; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef; text-align: center;">
                    <p style="margin: 0; color: #6c757d; font-size: 12px; line-height: 1.5;">
                      Diese E-Mail wurde automatisch vom <strong>fahrerexpress</strong> Admin-System generiert<br>
                      Walther-von-Cronberg-Platz 12 · 60594 Frankfurt · info@poolaufbau.com
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    await resend.emails.send({
      from: mailFrom,
      to: [adminEmail],
      subject: `🚫 Fahrersperrung: ${driver.vorname} ${driver.nachname}`,
      html: adminHtml,
    });

    console.log(`✉️ Admin notification sent to ${adminEmail}`);

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
