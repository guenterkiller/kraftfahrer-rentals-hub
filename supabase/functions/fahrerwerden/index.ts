import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface FahrerAnfrageRequest {
  name: string;
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
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Fahrer-Anfrage submission received");
    
    const requestData: FahrerAnfrageRequest = await req.json();

    // Validation - only name, email, and phone are required
    if (!requestData.name || !requestData.email || !requestData.phone) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ error: "Name, E-Mail und Telefon sind Pflichtfelder." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Processing fahrer request from ${requestData.name}`);

    // Extract IP address and User-Agent from headers
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Save to database
    console.log("Saving to database...");
    
    // Split name into vorname and nachname
    const nameParts = requestData.name.trim().split(' ');
    const vorname = nameParts[0] || '';
    const nachname = nameParts.slice(1).join(' ') || '';
    
    // Map data to correct table fields
    const insertData = {
      vorname,
      nachname,
      email: requestData.email,
      telefon: requestData.phone,
      beschreibung: requestData.description || '',
      fuehrerscheinklassen: Array.isArray(requestData.license_classes) ? requestData.license_classes : [],
      erfahrung_jahre: requestData.experience ? parseInt(requestData.experience) : null,
      spezialisierungen: Array.isArray(requestData.specializations) ? requestData.specializations : [],
      verfuegbare_regionen: Array.isArray(requestData.regions) ? requestData.regions : [],
      stundensatz: requestData.hourly_rate ? parseFloat(requestData.hourly_rate) : null,
      status: 'pending'
    };
    
    console.log("Insert data being sent:", JSON.stringify(insertData, null, 2));
    
    const { data, error } = await supabase
      .from('fahrer_profile')
      .insert([insertData]);
    
    console.log("Insert result:", { data, error });

    if (error) {
      console.error("Supabase insert error:", JSON.stringify(error, null, 2));
      
      // Check for duplicate email error
      if (error.code === '23505' && error.message.includes('fahrer_profile_email_key')) {
        return new Response(
          JSON.stringify({ 
            error: 'Diese E-Mail-Adresse ist bereits registriert. Falls Sie bereits ein Fahrer-Profil haben, kontaktieren Sie uns bitte direkt.' 
          }),
          { 
            status: 400, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders } 
          }
        );
      }
      
      throw new Error("Fehler beim Speichern der Anfrage in der Datenbank");
    }
    
    const dbData = data && data[0] ? data[0] : null;

    console.log("Saved to database successfully:", dbData.id);

    // Send notification email to admin
    const adminEmailResponse = await resend.emails.send({
      from: "Kraftfahrer-Mieten <info@kraftfahrer-mieten.com>",
      to: ["info@kraftfahrer-mieten.com"],
      subject: `Neue Fahreranfrage von ${requestData.name}`,
      html: `
        <h2>Neue Fahreranfrage</h2>
        <p><strong>Name:</strong> ${requestData.name}</p>
        <p><strong>E-Mail:</strong> ${requestData.email}</p>
        <p><strong>Telefon:</strong> ${requestData.phone}</p>
        <p><strong>Unternehmen:</strong> ${requestData.company || 'nicht angegeben'}</p>
        <p><strong>Nachricht:</strong> ${requestData.message || 'nicht angegeben'}</p>
        <p><strong>Beschreibung:</strong> ${requestData.description || 'nicht angegeben'}</p>
        <p><strong>Führerscheinklassen:</strong> ${requestData.license_classes?.length ? requestData.license_classes.join(', ') : 'nicht angegeben'}</p>
        <p><strong>Erfahrung:</strong> ${requestData.experience || 'nicht angegeben'}</p>
        <p><strong>Spezialisierungen:</strong> ${requestData.specializations?.length ? requestData.specializations.join(', ') : 'nicht angegeben'}</p>
        <p><strong>Verfügbare Regionen:</strong> ${requestData.regions?.length ? requestData.regions.join(', ') : 'nicht angegeben'}</p>
        <p><strong>Stundensatz:</strong> ${requestData.hourly_rate || 'nicht angegeben'}</p>
        <p><strong>IP-Adresse:</strong> ${ipAddress}</p>
        <p><em>Gesendet am ${new Date().toLocaleString('de-DE')}</em></p>
      `,
    });

    console.log("Admin email sent successfully:", adminEmailResponse);

    // Send confirmation email to applicant
    const confirmationEmailResponse = await resend.emails.send({
      from: "Fahrerexpress-Agentur <info@kraftfahrer-mieten.com>",
      to: [requestData.email],
      subject: "Ihre Anfrage bei der Fahrerexpress-Agentur",
      html: `
        <h2>Vielen Dank für Ihre Anfrage!</h2>
        <p>Lieber Herr/Frau ${requestData.name},</p>
        <p>vielen Dank für Ihre Fahreranfrage. Wir haben Ihre Daten erhalten und melden uns kurzfristig bei Ihnen.</p>
        <p>Bei passenden Anfragen melden wir uns gerne auch telefonisch bei Ihnen.</p>
        <p>Wenn Sie Ihre Angaben nachträglich korrigieren oder ergänzen möchten, schreiben Sie uns bitte direkt an info@kraftfahrer-mieten.com unter Angabe Ihres Namens und der Telefonnummer.</p>
        <p>Bei Rückfragen erreichen Sie uns jederzeit unter:</p>
        <ul>
          <li>E-Mail: <a href="mailto:info@kraftfahrer-mieten.com">info@kraftfahrer-mieten.com</a></li>
          <li>Telefon: <a href="tel:015771442285">01577 1442285</a></li>
        </ul>
        <p>Freundliche Grüße<br>
        Ihr Fahrerexpress-Team</p>
      `,
    });

    console.log("Confirmation email sent successfully:", confirmationEmailResponse);

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in submit-fahrer-anfrage function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Fehler beim Senden der Anfrage" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);