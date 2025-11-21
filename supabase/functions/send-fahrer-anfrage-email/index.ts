import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FahrerAnfrageEmailRequest {
  vorname: string;
  nachname: string;
  email: string;
  phone: string;
  company?: string;
  message: string;
  einsatzbeginn?: string;
  einsatzdauer?: string;
  fahrzeugtyp: string;
  anforderungen?: string[];
  customer_street?: string;
  customer_house_number?: string;
  customer_postal_code?: string;
  customer_city?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: FahrerAnfrageEmailRequest = await req.json();
    
    const {
      vorname,
      nachname,
      email,
      phone,
      company,
      message,
      einsatzbeginn,
      einsatzdauer,
      fahrzeugtyp,
      anforderungen = [],
      customer_street,
      customer_house_number,
      customer_postal_code,
      customer_city
    } = requestData;

    const kundenname = `${vorname} ${nachname}`.trim();
    const firmaOderName = company ? `${company} (${kundenname})` : kundenname;
    
    // Format date range
    let zeitraumText = "Nach Absprache";
    if (einsatzbeginn) {
      try {
        const date = new Date(einsatzbeginn + "T08:00:00");
        if (!isNaN(date.getTime())) {
          const formattedDate = date.toLocaleDateString('de-DE');
          zeitraumText = einsatzdauer 
            ? `Ab ${formattedDate} für ${einsatzdauer} Tag(e)`
            : `Ab ${formattedDate}`;
        }
      } catch (dateError) {
        console.error("Date conversion error:", dateError);
        zeitraumText = einsatzbeginn + (einsatzdauer ? ` für ${einsatzdauer} Tag(e)` : "");
      }
    } else if (einsatzdauer) {
      zeitraumText = `Dauer: ${einsatzdauer} Tag(e)`;
    }

    // Format address
    let adresseText = "";
    if (customer_street && customer_house_number && customer_postal_code && customer_city) {
      adresseText = `${customer_street} ${customer_house_number}, ${customer_postal_code} ${customer_city}`;
    } else if (customer_city && customer_postal_code) {
      adresseText = `${customer_postal_code} ${customer_city}`;
    }

    // Determine driver type
    let fahrerTyp = "LKW CE Fahrer";
    if (fahrzeugtyp.toLowerCase().includes('baumaschine') || 
        fahrzeugtyp.toLowerCase().includes('bagger') ||
        fahrzeugtyp.toLowerCase().includes('radlader')) {
      fahrerTyp = "Baumaschinenführer";
    }

    const emailHtml = `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ihre Fahrerbuchung bei der Fahrerexpress-Agentur</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4; padding: 20px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #4472c4; padding: 30px 40px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">Fahrerexpress-Agentur</h1>
                            <p style="margin: 5px 0 0 0; color: #ffffff; font-size: 14px;">LKW CE Fahrer & Baumaschinenführer</p>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 40px;">
                            
                            <h2 style="margin: 0 0 20px 0; color: #333; font-size: 20px;">Sehr geehrte/r ${firmaOderName},</h2>
                            
                            <p style="margin: 0 0 15px 0; color: #333; font-size: 14px; line-height: 1.6;">
                                vielen Dank für Ihre Anfrage über unsere Website!
                            </p>
                            
                            <p style="margin: 0 0 25px 0; color: #333; font-size: 14px; line-height: 1.6;">
                                <strong>Wichtiger Hinweis:</strong> Diese Bestätigung ist eine Eingangsbestätigung Ihrer Buchungsanfrage. 
                                Die Buchung wird erst verbindlich, wenn ein Fahrer den Auftrag annimmt und wir Ihnen dies separat per E-Mail bestätigen.
                            </p>

                            <!-- Anfrage im Überblick -->
                            <div style="background-color: #f8f9fa; border-left: 4px solid #4472c4; padding: 20px; margin-bottom: 25px;">
                                <h3 style="margin: 0 0 15px 0; color: #4472c4; font-size: 16px; font-weight: bold;">📝 Ihre Anfrage im Überblick</h3>
                                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                    <tr>
                                        <td style="padding: 5px 0; color: #333; font-size: 14px;"><strong>Fahrertyp:</strong></td>
                                        <td style="padding: 5px 0; color: #333; font-size: 14px;">${fahrerTyp}</td>
                                    </tr>
                                    ${anforderungen.length > 0 ? `
                                    <tr>
                                        <td style="padding: 5px 0; color: #333; font-size: 14px;"><strong>Spezialanforderungen:</strong></td>
                                        <td style="padding: 5px 0; color: #333; font-size: 14px;">${anforderungen.join(', ')}</td>
                                    </tr>
                                    ` : ''}
                                    <tr>
                                        <td style="padding: 5px 0; color: #333; font-size: 14px;"><strong>Zeitraum:</strong></td>
                                        <td style="padding: 5px 0; color: #333; font-size: 14px;">${zeitraumText}</td>
                                    </tr>
                                    ${adresseText ? `
                                    <tr>
                                        <td style="padding: 5px 0; color: #333; font-size: 14px;"><strong>Einsatzort:</strong></td>
                                        <td style="padding: 5px 0; color: #333; font-size: 14px;">${adresseText}</td>
                                    </tr>
                                    ` : ''}
                                    <tr>
                                        <td style="padding: 5px 0; color: #333; font-size: 14px;"><strong>Ihre Nachricht:</strong></td>
                                        <td style="padding: 5px 0; color: #333; font-size: 14px;">${message}</td>
                                    </tr>
                                </table>
                            </div>

                            <!-- Konditionen -->
                            <div style="background-color: #e8f4f8; border-left: 4px solid #2196f3; padding: 20px; margin-bottom: 25px;">
                                <h3 style="margin: 0 0 15px 0; color: #2196f3; font-size: 16px; font-weight: bold;">💰 Abrechnung & Preise</h3>
                                
                                <div style="background-color: #fff; border-left: 4px solid #4472c4; padding: 15px; margin-bottom: 20px;">
                                    <p style="margin: 0 0 10px 0; color: #333; font-size: 14px; font-weight: bold;">
                                        Die Abrechnung erfolgt ausschließlich über die Fahrerexpress-Agentur.
                                    </p>
                                    <p style="margin: 0; color: #333; font-size: 13px;">
                                        Es gelten die öffentlich einsehbaren Tagespreise:
                                    </p>
                                </div>
                                
                                <div style="margin-bottom: 20px;">
                                    <h4 style="margin: 0 0 10px 0; color: #333; font-size: 15px; font-weight: bold;">LKW CE Fahrer</h4>
                                    <p style="margin: 0 0 5px 0; color: #333; font-size: 14px;"><strong>349 € pro Tag</strong> (8 Stunden)</p>
                                    <p style="margin: 0 0 5px 0; color: #333; font-size: 14px;"><strong>30 € pro Überstunde</strong></p>
                                    <p style="margin: 0; color: #666; font-size: 13px;">
                                        Gilt für: Fahrmischer, Fernverkehr, Nahverkehr, ADR, Container, Wechselbrücke, 
                                        Kühltransport, Baustellenverkehr, Event- und Messe-Logistik u. v. m.
                                    </p>
                                </div>

                                <div style="margin-bottom: 20px;">
                                    <h4 style="margin: 0 0 10px 0; color: #333; font-size: 15px; font-weight: bold;">Baumaschinenführer</h4>
                                    <p style="margin: 0 0 5px 0; color: #333; font-size: 14px;"><strong>459 € pro Tag</strong> (8 Stunden)</p>
                                    <p style="margin: 0 0 5px 0; color: #333; font-size: 14px;"><strong>60 € pro Überstunde</strong></p>
                                    <p style="margin: 0; color: #666; font-size: 13px;">
                                        Gilt für: Bagger, Radlader, Fahrmischer, Flüssigboden, Mischanlagen, 
                                        Störungsbehebung, Baustellenlogistik & Materialfluss.
                                    </p>
                                </div>

                                <div style="margin-bottom: 15px;">
                                    <h4 style="margin: 0 0 10px 0; color: #333; font-size: 15px; font-weight: bold;">Fahrtkosten & Langzeiteinsätze</h4>
                                    <ul style="margin: 0; padding-left: 20px; color: #333; font-size: 14px;">
                                        <li style="margin-bottom: 5px;"><strong>Fahrtkosten:</strong> 25 km inklusive, danach 0,40 €/km (Hin- und Rückweg)</li>
                                        <li style="margin-bottom: 5px;"><strong>Wochenpreise:</strong> LKW CE Fahrer ab 1.490 €/Woche (5 Tage)</li>
                                        <li><strong>Monatspreise:</strong> auf Anfrage je nach Einsatzdauer und Planungssicherheit</li>
                                    </ul>
                                </div>

                                <p style="margin: 15px 0 0 0; color: #666; font-size: 12px; font-style: italic;">
                                    Alle Preise verstehen sich netto zzgl. gesetzlicher MwSt., Fahrt- und ggf. Übernachtungskosten. 
                                    Abrechnung nach tatsächlichem Einsatzumfang. Zuschläge für Überstunden, Nacht-, Sonn- und Feiertage 
                                    gemäß aktueller Preisliste.
                                </p>
                            </div>

                            <!-- Wie es weitergeht -->
                            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin-bottom: 25px;">
                                <h3 style="margin: 0 0 15px 0; color: #856404; font-size: 16px; font-weight: bold;">🔄 Wie es jetzt weitergeht</h3>
                                <ol style="margin: 0; padding-left: 20px; color: #333; font-size: 14px; line-height: 1.8;">
                                    <li>Wir prüfen verfügbare Fahrer in Ihrer Region</li>
                                    <li>Sie erhalten spätestens am nächsten Werktag unsere Rückmeldung</li>
                                    <li>Bei Verfügbarkeit stellen wir den direkten Kontakt zum Fahrer her</li>
                                    <li>Nach Annahme durch den Fahrer erhalten Sie eine separate Auftragsbestätigung</li>
                                </ol>
                            </div>

                            <!-- Warum Fahrerexpress -->
                            <div style="background-color: #e8f5e9; border-left: 4px solid #4caf50; padding: 20px; margin-bottom: 25px;">
                                <h3 style="margin: 0 0 15px 0; color: #2e7d32; font-size: 16px; font-weight: bold;">✅ Warum Fahrerexpress?</h3>
                                <ul style="margin: 0; padding-left: 20px; color: #333; font-size: 14px; line-height: 1.8;">
                                    <li>Keine Kosten, falls kein Fahrer verfügbar ist</li>
                                    <li>Eine Rechnung, transparente Abwicklung</li>
                                    <li>Dienst-/Werkleistung – keine Arbeitnehmerüberlassung</li>
                                    <li>Qualifizierte und erfahrene Fahrer</li>
                                </ul>
                            </div>

                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px 40px; border-top: 1px solid #e0e0e0;">
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td style="text-align: center;">
                                        <h3 style="margin: 0 0 10px 0; color: #333; font-size: 16px; font-weight: bold;">Fahrerexpress-Agentur</h3>
                                        <p style="margin: 0 0 5px 0; color: #666; font-size: 14px;">
                                            📧 info@kraftfahrer-mieten.com<br>
                                            📱 01577 1442285
                                        </p>
                                        <p style="margin: 15px 0 0 0; color: #999; font-size: 12px;">
                                            Günter Killer<br>
                                            Vermittlung gewerblicher Fahrer
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Fahrerexpress-Agentur <info@kraftfahrer-mieten.com>",
      to: [email],
      subject: "Ihre Fahrerbuchung bei der Fahrerexpress-Agentur",
      html: emailHtml,
    });

    // Create Supabase client for logging
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (supabaseUrl && supabaseKey) {
      const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.52.0");
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Log email sending
      if (emailResponse.error) {
        console.error("Failed to send customer confirmation:", emailResponse.error);
        
        await supabase.from('email_log').insert({
          recipient: email,
          subject: "Ihre Fahrerbuchung bei der Fahrerexpress-Agentur",
          template: 'customer_booking_confirmation',
          status: 'failed',
          error_message: emailResponse.error.message || String(emailResponse.error),
        });
      } else {
        console.log("Customer confirmation email sent successfully:", emailResponse);
        
        await supabase.from('email_log').insert({
          recipient: email,
          subject: "Ihre Fahrerbuchung bei der Fahrerexpress-Agentur",
          template: 'customer_booking_confirmation',
          status: 'sent',
          sent_at: new Date().toISOString(),
          message_id: emailResponse.data?.id,
        });
      }
    }

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-fahrer-anfrage-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
