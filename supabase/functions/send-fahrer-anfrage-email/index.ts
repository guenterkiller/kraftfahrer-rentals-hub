import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.0';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FahrerAnfrageEmailRequest {
  vorname: string;
  nachname: string;
  email: string;
  phone: string;
  company?: string;
  message?: string;
  description?: string;
  license_classes?: string[];
  experience?: string;
  specializations?: string[];
  regions?: string[];
  hourly_rate?: string;
  // Additional fields for customer job requests
  einsatzbeginn?: string;
  einsatzdauer?: string;
  fahrzeugtyp?: string;
  spezialanforderungen?: string[];
  datenschutz?: boolean;
  newsletter?: boolean;
  // Price acknowledgement proof
  price_acknowledged?: boolean;
  price_ack_time?: string;
  price_plan?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Fahrer-Anfrage email sending received");

    const requestData: FahrerAnfrageEmailRequest = await req.json();
    console.log("Eingehende Anfrage:", requestData);
    
    console.log("Processing fahrer email request from", `${requestData.vorname} ${requestData.nachname}`);

    // Validate required fields
    if (!requestData.vorname || !requestData.nachname || !requestData.email || !requestData.phone) {
      throw new Error("Vorname, Nachname, E-Mail und Telefon sind Pflichtfelder");
    }

const rawIp = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';
const anonymizeIp = (ip: string) => {
  if (!ip || ip === 'unknown') return 'unknown';
  // Handle possible multiple IPs in x-forwarded-for
  const firstIp = ip.split(',')[0].trim();
  if (firstIp.includes(':')) { // IPv6
    const parts = firstIp.split(':');
    return parts.slice(0, 4).join(':') + '::/64';
  }
  const octets = firstIp.split('.');
  if (octets.length === 4) {
    return `${octets[0]}.${octets[1]}.${octets[2]}.0`;
  }
  return 'unknown';
};
const ipAddressMasked = anonymizeIp(rawIp);
const userAgent = req.headers.get('user-agent') || 'unknown';

    // Send notification email to admin
    console.log("Sending admin notification email...");
    const adminEmailResponse = await resend.emails.send({
      from: 'Fahrerexpress-Agentur <info@kraftfahrer-mieten.com>',
      to: [Deno.env.get("ADMIN_TO")!],
      reply_to: requestData.email,
      subject: `Neue Fahreranfrage von ${requestData.vorname} ${requestData.nachname}`,
      html: `
        <h2>📥 Neue Fahreranfrage eingegangen</h2>
        <p>Eine neue Anfrage wurde gestellt:</p>
        
        <h3>🚛 Fahrzeugdetails:</h3>
        <ul>
          <li><strong>Fahrzeugtyp:</strong> ${requestData.fahrzeugtyp || 'nicht angegeben'}</li>
          <li><strong>Führerscheinklasse:</strong> ${Array.isArray(requestData.license_classes) ? requestData.license_classes.join(', ') : 'C+E (Standard)'}</li>
          <li><strong>Spezialanforderungen:</strong> ${Array.isArray(requestData.spezialanforderungen) && requestData.spezialanforderungen.length > 0 ? requestData.spezialanforderungen.join(', ') : 'keine'}</li>
          <li><strong>Region:</strong> ${Array.isArray(requestData.regions) ? requestData.regions.join(', ') : 'nicht angegeben'}</li>
        </ul>
        
        <h3>👤 Kundendaten:</h3>
        <ul>
          <li><strong>Absender:</strong> ${requestData.vorname} ${requestData.nachname}</li>
          <li><strong>Telefon:</strong> ${requestData.phone}</li>
          <li><strong>E-Mail:</strong> ${requestData.email}</li>
          <li><strong>Firma:</strong> ${requestData.company || 'nicht angegeben'}</li>
        </ul>
        
${requestData.einsatzbeginn ? `<p><strong>Einsatzbeginn:</strong> ${requestData.einsatzbeginn}</p>` : ''}
${requestData.einsatzdauer ? `<p><strong>Einsatzdauer:</strong> ${requestData.einsatzdauer}</p>` : ''}
${requestData.message ? `<p><strong>Nachricht:</strong> ${requestData.message}</p>` : ''}
        
<p><strong>Datenschutz zugestimmt:</strong> ${requestData.datenschutz ? 'Ja' : 'Nein'}</p>
<p><strong>Newsletter gewünscht:</strong> ${requestData.newsletter ? 'Ja' : 'Nein'}</p>
<hr>

<h3>💶 Preisbestätigung</h3>
<ul>
  <li><strong>Preisbestätigung:</strong> ${requestData.price_acknowledged ? 'JA' : 'NEIN'}</li>
  <li><strong>Zeit der Bestätigung:</strong> ${requestData.price_ack_time ? new Date(requestData.price_ack_time).toLocaleString('de-DE') : '—'}</li>
  <li><strong>Fahrertyp:</strong> ${requestData.price_plan || '—'}</li>
</ul>

<p><strong>IP-Adresse (anonymisiert):</strong> ${ipAddressMasked}</p>
<p><strong>User-Agent:</strong> ${userAgent}</p>
<p><strong>Zeitpunkt:</strong> ${new Date().toLocaleString('de-DE')}</p>
      `,
    });

    if (adminEmailResponse.error) {
      console.error("Admin email error:", adminEmailResponse.error);
      throw new Error("Fehler beim Senden der Admin-E-Mail");
    }

    console.log("Admin email sent successfully to info@kraftfahrer-mieten.com:", adminEmailResponse.data?.id);

    // Send confirmation email to client
    console.log("Sending confirmation email to client...");
    const clientEmailResponse = await resend.emails.send({
      from: 'Fahrerexpress-Agentur <info@kraftfahrer-mieten.com>',
      to: [requestData.email],
      subject: "Ihre Fahrerbuchung bei der Fahrerexpress-Agentur – Eingangsbestätigung",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6; color: #333;">
          <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">Ihre Fahrerbuchung bei der Fahrerexpress-Agentur</h2>
          
          <p>Sehr geehrte/r ${requestData.vorname} ${requestData.nachname},</p>
          
          <p>vielen Dank für Ihre Anfrage bei der Fahrerexpress-Agentur. Wir haben Ihre Buchungsanfrage erhalten und werden diese umgehend bearbeiten. <strong>Sobald ein Fahrer den Auftrag annimmt, bestätigen wir Ihnen die Buchung separat per E-Mail.</strong></p>
          
          <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-left: 4px solid #3498db;">
            <h3 style="margin-top: 0; color: #2c3e50;">📝 Ihre Anfrage im Überblick</h3>
            <ul style="margin: 0; padding-left: 20px;">
              ${requestData.fahrzeugtyp ? `<li><strong>Fahrzeugtyp:</strong> ${requestData.fahrzeugtyp}</li>` : ''}
              <li><strong>Führerscheinklassen:</strong> ${Array.isArray(requestData.license_classes) ? requestData.license_classes.join(', ') : 'C+E (Standard)'}</li>
              <li><strong>Spezialisierungen:</strong> ${Array.isArray(requestData.specializations) && requestData.specializations.length > 0 ? requestData.specializations.join(', ') : 'Standard'}</li>
              <li><strong>Region:</strong> ${Array.isArray(requestData.regions) && requestData.regions.length > 0 ? requestData.regions.join(', ') : 'nach Vereinbarung'}</li>
              ${Array.isArray(requestData.spezialanforderungen) && requestData.spezialanforderungen.length > 0 ? `<li><strong>Spezialanforderungen:</strong> ${requestData.spezialanforderungen.join(', ')}</li>` : ''}
            </ul>
          </div>
          
          <div style="background-color: #fff3cd; padding: 15px; margin: 20px 0; border-left: 4px solid #ffc107; border-radius: 4px;">
            <h3 style="margin-top: 0; color: #856404;">💰 Konditionen</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li><strong>Standard-LKW-Fahrer:</strong> 399,00 € netto / Tag (8 Std.)</li>
              <li><strong>Spezialfahrer (ADR/Kran):</strong> 539,00 € netto / Tag (8 Std.)</li>
              <li><strong>Baumaschinenführer:</strong> 489,00 € netto / Tag (8 Std.)</li>
            </ul>
            <p style="font-size: 14px; margin-top: 15px; color: #6c757d;">
              <em>Alle Preise zzgl. MwSt., Fahrtkosten und ggf. Übernachtung. Abrechnung nach tatsächlichem Einsatzumfang. Zuschläge für Überstunden, Nacht-, Sonn- und Feiertage laut gültiger Preisliste.</em>
            </p>
          </div>
          
          <div style="background-color: #d1ecf1; padding: 15px; margin: 20px 0; border-left: 4px solid #bee5eb; border-radius: 4px;">
            <h3 style="margin-top: 0; color: #0c5460;">📌 Wichtiger Hinweis</h3>
            <p style="margin: 0; font-weight: 500;">
              Mit Absenden des Formulars haben Sie eine verbindliche Buchungsanfrage gestellt. Verbindlich wird die Buchung erst, wenn ein Fahrer den Auftrag annimmt und wir dies schriftlich bestätigen.
            </p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <h3 style="margin-top: 0; color: #2c3e50;">📞 Kontakt</h3>
            <p style="margin: 0;">
              📧 <a href="mailto:info@kraftfahrer-mieten.com" style="color: #3498db; text-decoration: none;">info@kraftfahrer-mieten.com</a><br>
              📞 01577 1442285
            </p>
          </div>
          
          <p style="margin-top: 30px;">
            Mit freundlichen Grüßen<br>
            <strong>Ihr Fahrerexpress-Team</strong>
          </p>
          
          <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
          <p style="font-size: 12px; color: #6c757d; text-align: center;">
            Fahrerexpress-Agentur | info@kraftfahrer-mieten.com | 01577 1442285
          </p>
        </div>
      `,
    });

    if (clientEmailResponse.error) {
      console.error("Client email error:", clientEmailResponse.error);
      throw new Error("Fehler beim Senden der Bestätigungs-E-Mail");
    }

    console.log("Client email sent successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Anfrage erfolgreich versendet"
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error("Error in send-fahrer-anfrage-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Ein unbekannter Fehler ist aufgetreten" 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);