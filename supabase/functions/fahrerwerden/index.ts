import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import React from 'npm:react@18.3.1';
import { DriverRegistrationConfirmation } from '../_shared/email-templates/driver-registration-confirmation.tsx';
import { AdminDriverNotification } from '../_shared/email-templates/admin-driver-notification.tsx';

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
  bf2_erlaubnis?: string;
  bf3_erlaubnis?: string;
  spezialanforderungen?: string[] | string;
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
      hourly_rate: "",
      bf2_erlaubnis: "",
      bf3_erlaubnis: "",
      spezialanforderungen: []
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
          bf2_erlaubnis: (formData.get("bf2_erlaubnis") as string) || "",
          bf3_erlaubnis: (formData.get("bf3_erlaubnis") as string) || "",
          spezialanforderungen: JSON.parse((formData.get("spezialanforderungen") as string) || "[]"),
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
            bf2_erlaubnis: (formData.get("bf2_erlaubnis") as string) || "",
            bf3_erlaubnis: (formData.get("bf3_erlaubnis") as string) || "",
            spezialanforderungen: JSON.parse((formData.get("spezialanforderungen") as string) || "[]"),
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
      bf2_erlaubnis: requestData.bf2_erlaubnis === 'true' || requestData.bf2_erlaubnis === true,
      bf3_erlaubnis: requestData.bf3_erlaubnis === 'true' || requestData.bf3_erlaubnis === true,
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
    const adminEmailHtml = await renderAsync(
      React.createElement(AdminDriverNotification, {
        firstName: insertData.vorname,
        lastName: insertData.nachname,
        email: insertData.email,
        phone: insertData.telefon,
        regions: insertData.verfuegbare_regionen || [],
        licenseClasses: insertData.fuehrerscheinklassen || [],
        specializations: insertData.spezialisierungen || [],
      })
    );

    const adminEmailResponse = await resend.emails.send({
      from: MAIL_FROM,
      to: ["info@kraftfahrer-mieten.com"],
      subject: `Neue Fahrer-Registrierung: ${insertData.vorname} ${insertData.nachname}`,
      html: adminEmailHtml,
    });

    if (adminEmailResponse.error) {
      console.error("Admin email error (Fahrer werden):", adminEmailResponse.error);
      throw new Error("Fehler beim Senden der Admin-E-Mail");
    }

    console.log("Admin email sent successfully:", adminEmailResponse);

    // Send confirmation email to applicant
    const confirmationEmailHtml = await renderAsync(
      React.createElement(DriverRegistrationConfirmation, {
        driverName: `${insertData.vorname} ${insertData.nachname}`,
      })
    );

    const confirmationEmailResponse = await resend.emails.send({
      from: MAIL_FROM,
      to: [requestData.email],
      subject: "Willkommen bei der Fahrerexpress-Agentur – Registrierung bestätigt",
      html: confirmationEmailHtml,
    });

    // Log email sending
    if (confirmationEmailResponse.error) {
      console.error("Failed to send confirmation email:", confirmationEmailResponse.error);
      
      await supabase.from('email_log').insert({
        recipient: insertData.email,
        subject: "Willkommen bei der Fahrerexpress-Agentur – Registrierung bestätigt",
        template: 'driver_registration_confirmation',
        status: 'failed',
        error_message: confirmationEmailResponse.error.message || String(confirmationEmailResponse.error),
      });
    } else {
      console.log("Confirmation email sent successfully:", confirmationEmailResponse);
      
      await supabase.from('email_log').insert({
        recipient: insertData.email,
        subject: "Willkommen bei der Fahrerexpress-Agentur – Registrierung bestätigt",
        template: 'driver_registration_confirmation',
        status: 'sent',
        sent_at: new Date().toISOString(),
        message_id: confirmationEmailResponse.data?.id,
      });
    }

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