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
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    console.log("fahrerwerden start", new Date().toISOString());
    console.log("has RESEND key:", !!Deno.env.get("RESEND_API_KEY"));
    
    // Runtime guard for MAIL_FROM domain
    const MAIL_FROM = Deno.env.get("MAIL_FROM") ?? "info@kraftfahrer-mieten.com";
    const addr = MAIL_FROM.split('<').pop()?.replace(/[<>]/g,'') ?? MAIL_FROM;
    if (!/@kraftfahrer-mieten\.com$/i.test(addr.trim())) {
      throw new Error(`MAIL_FROM uses unverified domain: ${MAIL_FROM}`);
    }
    
    console.log("Fahrer-Anfrage submission received");
    
    const contentType = req.headers.get("content-type") || "";
    console.log("Content-Type:", contentType);
    
    let formData: FormData | null = null;
    let requestData: FahrerAnfrageRequest = {
      name: "",
      email: "",
      phone: "",
      company: "",
      message: "",
      description: "",
      license_classes: [],
      experience: "",
      specializations: [],
      regions: [],
      hourly_rate: ""
    };
    
    try {
      if (contentType.includes("multipart/form-data")) {
        formData = await req.formData();
        requestData = {
          name: (formData.get("name") as string) || "",
          email: (formData.get("email") as string) || "",
          phone: (formData.get("phone") as string) || "",
          company: (formData.get("company") as string) || "",
          message: (formData.get("message") as string) || "",
          description: (formData.get("description") as string) || "",
          license_classes: JSON.parse((formData.get("license_classes") as string) || "[]"),
          experience: (formData.get("experience") as string) || "",
          specializations: JSON.parse((formData.get("specializations") as string) || "[]"),
          regions: JSON.parse((formData.get("regions") as string) || "[]"),
          hourly_rate: (formData.get("hourly_rate") as string) || "",
        };
      } else if (contentType.includes("application/json")) {
        const body = await req.json();
        requestData = {
          name: body.name ?? "",
          email: body.email ?? "",
          phone: body.phone ?? "",
          company: body.company ?? "",
          message: body.message ?? "",
          description: body.description ?? "",
          license_classes: Array.isArray(body.license_classes) ? body.license_classes : [],
          experience: body.experience ?? "",
          specializations: Array.isArray(body.specializations) ? body.specializations : [],
          regions: Array.isArray(body.regions) ? body.regions : [],
          hourly_rate: body.hourly_rate ?? "",
        };
      } else {
        // Fallback: try to parse as FormData
        try {
          formData = await req.formData();
          requestData = {
            name: (formData.get("name") as string) || "",
            email: (formData.get("email") as string) || "",
            phone: (formData.get("phone") as string) || "",
            company: (formData.get("company") as string) || "",
            message: (formData.get("message") as string) || "",
            description: (formData.get("description") as string) || "",
            license_classes: JSON.parse((formData.get("license_classes") as string) || "[]"),
            experience: (formData.get("experience") as string) || "",
            specializations: JSON.parse((formData.get("specializations") as string) || "[]"),
            regions: JSON.parse((formData.get("regions") as string) || "[]"),
            hourly_rate: (formData.get("hourly_rate") as string) || "",
          };
        } catch (_e) {
          // ignore
        }
      }
    } catch (parseErr) {
      console.error("Parse error:", parseErr);
    }

    // Optional smoke test to validate logging without side effects
    const url = new URL(req.url);
    const smoke = req.headers.get("x-smoke-test") === "1" || url.searchParams.get("smoke") === "1";
    if (smoke) {
      console.log("Smoke test active → early 200 response");
      return new Response(JSON.stringify({ success: true, smoke: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

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

    // Upload files to storage first
    console.log("Uploading files to storage...");
    const uploadedFiles: { [key: string]: string } = {};
    const emailSafe = requestData.email.replace(/[^a-zA-Z0-9@.-]/g, '_');
    
    // Upload Führerschein files
    const fuehrerscheinFiles = formData ? (formData.getAll("fuehrerschein") as File[]) : [];
    if (fuehrerscheinFiles.length > 0) {
      const fuehrerscheinPaths: string[] = [];
      for (let i = 0; i < fuehrerscheinFiles.length; i++) {
        const file = fuehrerscheinFiles[i];
        if (file && file.size > 0) {
          const fileExt = file.name.split('.').pop() || 'pdf';
          const fileName = `uploads/${emailSafe}/fuehrerschein_${i + 1}.${fileExt}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('fahrer-dokumente')
            .upload(fileName, file, { upsert: true });
          
          if (uploadError) {
            console.error(`Upload error for Führerschein ${i + 1}:`, uploadError);
          } else {
            fuehrerscheinPaths.push(fileName);
            console.log(`Führerschein ${i + 1} uploaded successfully: ${fileName}`);
          }
        }
      }
      if (fuehrerscheinPaths.length > 0) {
        uploadedFiles.fuehrerschein = fuehrerscheinPaths.join(',');
      }
    }
    
    // Upload Fahrerkarte files
    const fahrerkarteFiles = formData ? (formData.getAll("fahrerkarte") as File[]) : [];
    if (fahrerkarteFiles.length > 0) {
      const fahrerkartePaths: string[] = [];
      for (let i = 0; i < fahrerkarteFiles.length; i++) {
        const file = fahrerkarteFiles[i];
        if (file && file.size > 0) {
          const fileExt = file.name.split('.').pop() || 'pdf';
          const fileName = `uploads/${emailSafe}/fahrerkarte_${i + 1}.${fileExt}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('fahrer-dokumente')
            .upload(fileName, file, { upsert: true });
          
          if (uploadError) {
            console.error(`Upload error for Fahrerkarte ${i + 1}:`, uploadError);
          } else {
            fahrerkartePaths.push(fileName);
            console.log(`Fahrerkarte ${i + 1} uploaded successfully: ${fileName}`);
          }
        }
      }
      if (fahrerkartePaths.length > 0) {
        uploadedFiles.fahrerkarte = fahrerkartePaths.join(',');
      }
    }
    
    // Upload Zertifikat files
    const zertifikatFiles = formData ? (formData.getAll("zertifikate") as File[]) : [];
    if (zertifikatFiles.length > 0) {
      const zertifikatPaths: string[] = [];
      for (let i = 0; i < zertifikatFiles.length; i++) {
        const file = zertifikatFiles[i];
        if (file && file.size > 0) {
          const fileExt = file.name.split('.').pop() || 'pdf';
          const fileName = `uploads/${emailSafe}/zertifikat_${i + 1}.${fileExt}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('fahrer-dokumente')
            .upload(fileName, file, { upsert: true });
          
          if (uploadError) {
            console.error(`Upload error for Zertifikat ${i + 1}:`, uploadError);
          } else {
            zertifikatPaths.push(fileName);
            console.log(`Zertifikat ${i + 1} uploaded successfully: ${fileName}`);
          }
        }
      }
      if (zertifikatPaths.length > 0) {
        uploadedFiles.zertifikate = zertifikatPaths.join(',');
      }
    }
    
    console.log("File uploads completed. Uploaded files:", uploadedFiles);

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
      status: 'pending',
      dokumente: uploadedFiles,
      bf2_erlaubnis: requestData.bf2_erlaubnis === 'true',
      bf3_erlaubnis: requestData.bf3_erlaubnis === 'true',
      spezialanforderungen: Array.isArray(requestData.spezialanforderungen) 
        ? requestData.spezialanforderungen 
        : (requestData.spezialanforderungen ? 
           (() => {
             try {
               return JSON.parse(requestData.spezialanforderungen);
             } catch (e) {
               console.warn('Could not parse spezialanforderungen:', requestData.spezialanforderungen);
               return [];
             }
           })() : [])
    };
    
    console.log("Insert data being sent:", JSON.stringify(insertData, null, 2));
    
    const { data, error } = await supabase
      .from('fahrer_profile')
      .insert([insertData])
      .select();
    
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
      
      // Also create entries in fahrer_dokumente table for admin preview
      const fahrerId = dbData.id;
      const documentInserts = [];
      
      // Create entries for each uploaded file
      if (uploadedFiles.fuehrerschein) {
        const paths = uploadedFiles.fuehrerschein.split(',');
        paths.forEach((path, index) => {
          documentInserts.push({
            fahrer_id: fahrerId,
            filepath: path,
            filename: `fuehrerschein_${index + 1}`,
            type: 'fuehrerschein',
            url: path
          });
        });
      }
      
      if (uploadedFiles.fahrerkarte) {
        const paths = uploadedFiles.fahrerkarte.split(',');
        paths.forEach((path, index) => {
          documentInserts.push({
            fahrer_id: fahrerId,
            filepath: path,
            filename: `fahrerkarte_${index + 1}`,
            type: 'fahrerkarte',
            url: path
          });
        });
      }
      
      if (uploadedFiles.zertifikate) {
        const paths = uploadedFiles.zertifikate.split(',');
        paths.forEach((path, index) => {
          documentInserts.push({
            fahrer_id: fahrerId,
            filepath: path,
            filename: `zertifikat_${index + 1}`,
            type: 'zertifikate',
            url: path
          });
        });
      }
      
      if (documentInserts.length > 0) {
        console.log("Creating document entries for admin access...");
        const { error: docError } = await supabase
          .from('fahrer_dokumente')
          .insert(documentInserts);
        
        if (docError) {
          console.error("Error creating document entries:", docError);
        } else {
          console.log(`Created ${documentInserts.length} document entries for admin access`);
        }
      }
      
      console.log("File uploads completed successfully. Documents are stored in Storage and logged for admin access.");
    } else {
      console.log("Kein Datensatz gespeichert – möglicherweise wegen Duplikat oder Fehler.");
    }

    // Send notification email to admin
    const adminEmailResponse = await resend.emails.send({
      from: MAIL_FROM,
      to: ["info@kraftfahrer-mieten.com"],
      subject: "Neue Fahrer-Registrierung",
      html: `
        <h2>📥 Neue Fahrerregistrierung eingegangen</h2>
        <p>Ein neuer Fahrer hat sich erfolgreich über das Portal registriert:</p>
        
        <h3>🧾 Persönliche Daten:</h3>
        <ul>
          <li><strong>Vorname:</strong> ${insertData.vorname}</li>
          <li><strong>Nachname:</strong> ${insertData.nachname}</li>
          <li><strong>E-Mail:</strong> ${insertData.email}</li>
          <li><strong>Telefon:</strong> ${insertData.telefon}</li>
        </ul>
        
        <h3>🚛 Fahrerdetails:</h3>
        <ul>
          <li><strong>Region:</strong> ${insertData.verfuegbare_regionen?.length ? insertData.verfuegbare_regionen.join(', ') : 'nicht angegeben'}</li>
          <li><strong>Fahrzeugtyp:</strong> ${insertData.fuehrerscheinklassen?.length ? insertData.fuehrerscheinklassen.join(', ') : 'nicht angegeben'}</li>
          <li><strong>Besonderheiten:</strong> ${insertData.spezialisierungen?.length ? insertData.spezialisierungen.join(', ') : 'keine'}</li>
        </ul>
        
        <p><strong>📅 Registriert am:</strong> ${new Date().toLocaleString('de-DE')}</p>
      `
    });

    if (adminEmailResponse.error) {
      console.error("Admin email error (Fahrer werden):", adminEmailResponse.error);
      throw new Error("Fehler beim Senden der Admin-E-Mail");
    }

    console.log("Admin email sent successfully:", adminEmailResponse);

    // Send confirmation email to applicant
    const confirmationEmailResponse = await resend.emails.send({
      from: MAIL_FROM,
      to: [requestData.email],
      subject: "Willkommen bei der Fahrerexpress-Agentur – Registrierung bestätigt",
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #333;">
          <div style="background: linear-gradient(135deg, #0891b2, #0e7490); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px; font-weight: bold;">🚛 Willkommen bei der Fahrerexpress-Agentur</h1>
          </div>
          <div style="border: 3px solid #0891b2; border-top: none; padding: 0;">
            <div style="background: #f8fafc; padding: 20px; border-bottom: 3px solid #0891b2;">
              <p style="margin: 0 0 10px 0; font-size: 16px;">Sehr geehrte/r ${insertData.vorname} ${insertData.nachname},</p>
              <p style="margin: 10px 0;">vielen Dank, dass Sie sich bei uns als selbstständiger Kraftfahrer mit eigenem Gewerbe registriert haben. <strong>Ihre Registrierung war erfolgreich!</strong></p>
            </div>

            <div style="background: #dcfce7; border-left: 4px solid #16a34a; padding: 20px; margin: 0;">
              <h3 style="margin: 0 0 15px 0; color: #16a34a; font-size: 18px;">✅ Nächste Schritte</h3>
              <p style="margin: 0;">Wir haben Ihre Angaben erhalten und melden uns telefonisch oder per E-Mail, sobald passende Fahraufträge verfügbar sind. Halten Sie Ihr Telefon bereit!</p>
            </div>

            <div style="padding: 20px;">
              <h3 style="margin: 0 0 15px 0; color: #7c2d12; font-size: 18px;">💼 Vermittlung & Provision</h3>
              <p style="margin: 0 0 15px 0; font-weight: bold;">Wie funktioniert unsere Vermittlung?</p>
              <p style="margin: 0 0 15px 0;">Wenn Sie sich über unsere Seite als selbstständiger Fahrer eintragen, vermitteln wir Sie an Auftraggeber in ganz Deutschland.</p>

              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0;">
                <h4 style="margin: 0 0 10px 0; color: #92400e;">💰 Vermittlungskosten für Fahrer</h4>
                <p style="margin: 0;">Für die erfolgreiche Vermittlung eines Einsatzes berechnen wir nur dem vermittelten Fahrer eine Provision in Höhe von <strong>15 % des Nettohonorars</strong>. Die Vermittlung ist für Auftraggeber vollständig kostenlos.</p>
              </div>

              <ul style="margin: 15px 0; padding-left: 20px;">
                <li style="margin: 5px 0;"><strong>Wann wird die Provision fällig?</strong> Die Provision wird ausschließlich bei tatsächlichem Einsatz fällig und kann entweder per Einbehalt oder separater Rechnung abgerechnet werden.</li>
                <li style="margin: 5px 0;"><strong>Wie läuft die Abrechnung?</strong> Die Provision wird nach Einsatzabschluss per Rechnung gestellt – entweder pro Auftrag oder gesammelt am Monatsende.</li>
                <li style="margin: 5px 0;"><strong>Gibt es eine Mindestlaufzeit?</strong> Nein. Sie können Ihre Teilnahme jederzeit beenden. Es entstehen keine Fixkosten oder Verpflichtungen.</li>
              </ul>

              <h4 style="margin: 20px 0 10px 0; color: #16a34a;">✅ Was ist NICHT provisionspflichtig?</h4>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Direktaufträge außerhalb unserer Vermittlung</li>
                <li>Einsätze ohne vorherige Abstimmung mit Fahrerexpress</li>
              </ul>
            </div>

            <div style="background: #f1f5f9; padding: 20px; border-top: 1px solid #e2e8f0;">
              <h3 style="margin: 0 0 15px 0; color: #334155;">📝 Ihre Daten ändern</h3>
              <p style="margin: 0;">Falls Sie Ihre Angaben korrigieren oder ergänzen möchten, schreiben Sie uns bitte an:<br>
              📧 <a href="mailto:info@kraftfahrer-mieten.com" style="color: #0891b2;">info@kraftfahrer-mieten.com</a><br>
              unter Angabe Ihres Namens und Ihrer Telefonnummer.</p>
            </div>

            <div style="background: #0891b2; color: white; padding: 20px; text-align: center;">
              <h3 style="margin: 0 0 15px 0;">📞 Kontakt</h3>
              <p style="margin: 0;">Für Rückfragen zur Abrechnung oder allgemeine Fragen stehen wir Ihnen jederzeit zur Verfügung:</p>
              <p style="margin: 10px 0 0 0;">
                📧 <a href="mailto:info@kraftfahrer-mieten.com" style="color: white;">info@kraftfahrer-mieten.com</a><br>
                📞 01577 1442285
              </p>
              <p style="margin: 20px 0 0 0; font-weight: bold;">Mit freundlichen Grüßen<br>Ihr Fahrerexpress-Team</p>
            </div>

            <div style="background: #f8fafc; padding: 15px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0;"><strong>Fahrerexpress-Agentur</strong> | info@kraftfahrer-mieten.com | 01577 1442285</p>
              <p style="margin: 5px 0 0 0;">
                <a href="https://kraftfahrer-mieten.com/impressum" style="color: #64748b;">Impressum</a> | 
                <a href="https://kraftfahrer-mieten.com/datenschutz" style="color: #64748b;">Datenschutz</a> | 
                <a href="https://kraftfahrer-mieten.com/agb" style="color: #64748b;">AGB</a>
              </p>
            </div>
          </div>
        </div>
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
    console.error("Error in fahrerwerden function:", error);
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