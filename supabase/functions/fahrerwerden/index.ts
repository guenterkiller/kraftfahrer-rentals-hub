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

    // Check if email already exists first
    console.log("Checking if email already exists...");
    const { data: existingDriver, error: checkError } = await supabase
      .from('fahrer_profile')
      .select('id')
      .eq('email', requestData.email)
      .maybeSingle();
    
    if (checkError) {
      console.error("Error checking existing email:", checkError);
      throw new Error("Fehler beim Überprüfen der E-Mail-Adresse");
    }
    
    if (existingDriver) {
      console.log("Email already exists, returning 409");
      return new Response(
        JSON.stringify({ 
          error: 'Ein Fahrer mit dieser E-Mail-Adresse ist bereits registriert.' 
        }),
        { 
          status: 409, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Save to database
    console.log("Email is unique, proceeding with registration...");
    
    // Split name into vorname and nachname
    const nameParts = requestData.name.trim().split(' ');
    const vorname = nameParts[0] || '';
    const nachname = nameParts.slice(1).join(' ') || '';
    
    // Parse hourly rate safely
    let parsedRate = null;
    if (requestData.hourly_rate) {
      const cleaned = String(requestData.hourly_rate).replace(/[^\d.,]/g, '').replace(',', '.');
      const parsed = parseFloat(cleaned);
      parsedRate = isNaN(parsed) ? null : parsed;
    }
    
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
      stundensatz: parsedRate,
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
      if (error.code === '23505') {
        return new Response(
          JSON.stringify({ 
            error: 'Diese E-Mail ist bereits registriert.' 
          }),
          { 
            status: 409, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders } 
          }
        );
      }
      
      throw new Error("Fehler beim Speichern der Anfrage in der Datenbank");
    }
    
    const dbData = data && data[0] ? data[0] : null;

    if (dbData && dbData.id) {
      console.log("Saved to database successfully:", dbData.id);
    } else {
      console.log("Kein Datensatz gespeichert – möglicherweise wegen Duplikat oder Fehler.");
    }

    // Send notification email to admin
    const adminEmailResponse = await resend.emails.send({
      from: "Fahrerexpress <noreply@kraftfahrer-mieten.com>",
      to: ["info@kraftfahrer-mieten.com"],
      subject: "Neue Fahrer-Registrierung",
      html: `
        <h2>Ein neuer Fahrer hat sich registriert</h2>
        <p><strong>Vorname:</strong> ${insertData.vorname}</p>
        <p><strong>Nachname:</strong> ${insertData.nachname}</p>
        <p><strong>E-Mail:</strong> ${insertData.email}</p>
        <p><strong>Telefon:</strong> ${insertData.telefon}</p>
        <p><strong>Region:</strong> ${insertData.verfuegbare_regionen?.length ? insertData.verfuegbare_regionen.join(', ') : 'nicht angegeben'}</p>
        <p><strong>Fahrzeugtyp:</strong> ${insertData.fuehrerscheinklassen?.length ? insertData.fuehrerscheinklassen.join(', ') : 'nicht angegeben'}</p>
        <p><strong>Besonderheiten:</strong> ${insertData.spezialisierungen?.length ? insertData.spezialisierungen.join(', ') : 'keine'}</p>
        <hr>
        <p><strong>Registriert am:</strong> ${new Date().toLocaleString('de-DE')}</p>
      `
    });

    if (adminEmailResponse.error) {
      console.error("Admin email error (Fahrer werden):", adminEmailResponse.error);
      throw new Error("Fehler beim Senden der Admin-E-Mail");
    }

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
        <p><strong>Hinweis:</strong> Sie haben der Vermittlungsprovision von 15 % auf vermittelte Einsätze zugestimmt. 
        Die Abrechnung erfolgt je nach Einsatz monatlich oder fallbezogen.</p>
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