import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const UNSUBSCRIBE_BASE_URL = "https://fahrerexpress.de/unsubscribe";

interface CustomerContact {
  email: string;
  name: string;
  firma?: string;
}

interface NewsletterRequest {
  subject: string;
  message: string;
  customers: CustomerContact[];
}

// Normalize email: trim, lowercase, handle comma-separated emails
const normalizeEmail = (email: string): string[] => {
  if (!email) return [];
  
  // Split by comma or semicolon, then normalize each
  return email
    .split(/[,;]/)
    .map(e => e.trim().toLowerCase())
    .filter(e => e.length > 0 && e.includes('@'));
};

// Generate a secure random token
const generateToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

const replaceVariables = (text: string, customer: CustomerContact): string => {
  return text
    .replace(/\{name\}/g, customer.name || 'Kunde')
    .replace(/\{firma\}/g, customer.firma || '');
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subject, message, customers }: NewsletterRequest = await req.json();

    console.log(`Starting customer newsletter to ${customers.length} recipients`);

    if (!subject || !message || !customers?.length) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Normalize all customer emails
    const normalizedCustomers: CustomerContact[] = [];
    const seenEmails = new Set<string>();

    for (const customer of customers) {
      const emails = normalizeEmail(customer.email);
      for (const email of emails) {
        if (!seenEmails.has(email)) {
          seenEmails.add(email);
          normalizedCustomers.push({
            ...customer,
            email: email
          });
        }
      }
    }

    console.log(`Normalized ${customers.length} entries to ${normalizedCustomers.length} unique emails`);

    let sent = 0;
    let failed = 0;
    let skipped = 0;
    const errors: string[] = [];

    // Fetch opt-out list for customer newsletter ONLY
    const { data: optOuts } = await supabase
      .from('customer_newsletter_optout')
      .select('email');
    
    const optOutEmails = new Set((optOuts || []).map(o => o.email.toLowerCase()));
    console.log(`Opt-out list contains ${optOutEmails.size} emails`);

    // Send emails with rate limiting (1 per second to avoid Resend limits)
    for (let i = 0; i < normalizedCustomers.length; i++) {
      const customer = normalizedCustomers[i];

      // Check opt-out list - only affects this newsletter, nothing else
      if (optOutEmails.has(customer.email)) {
        console.log(`Skipping ${customer.email} - opted out of customer newsletter`);
        skipped++;
        continue;
      }

      try {
        const personalizedSubject = replaceVariables(subject, customer);
        const personalizedMessage = replaceVariables(message, customer);

        // Generate unique unsubscribe token for this email
        const unsubscribeToken = generateToken();

        // Store token in database
        await supabase
          .from("customer_newsletter_tokens")
          .insert({
            email: customer.email,
            token: unsubscribeToken,
          });

        const unsubscribeUrl = `${UNSUBSCRIBE_BASE_URL}?token=${unsubscribeToken}`;

        // Convert line breaks to HTML
        const htmlMessage = personalizedMessage
          .split("\n")
          .map((line) =>
            line.trim() ? `<p style="margin: 0 0 10px 0;">${line}</p>` : "<br>"
          )
          .join("");

        const senderEmail = Deno.env.get("NEWSLETTER_FROM") || "info@kraftfahrer-mieten.com";
        
        const emailResponse = await resend.emails.send({
          from: `Fahrerexpress-Agentur <${senderEmail}>`,
          reply_to: senderEmail,
          to: [customer.email],
          subject: personalizedSubject,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #1a365d 0%, #2d5a87 100%); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Fahrerexpress</h1>
                <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0 0; font-size: 12px;">Informationen für unsere Kunden</p>
              </div>
              
              <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e5e5; border-top: none;">
                ${htmlMessage}
              </div>
              
              <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e5e5e5; border-top: none;">
                <p style="margin: 0; color: #666; font-size: 14px;">
                  Mit freundlichen Grüßen<br>
                  <strong>Ihr Fahrerexpress-Team</strong>
                </p>
                <p style="margin: 15px 0 0 0; color: #999; font-size: 12px;">
                  Fahrerexpress GmbH | Tel: +49 (0) 123 456789<br>
                  <a href="https://kraftfahrer-mieten.com" style="color: #2d5a87;">www.kraftfahrer-mieten.com</a>
                </p>
                <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 15px 0;" />
                <p style="margin: 0; color: #999; font-size: 11px;">
                  Sie erhalten diese E-Mail, weil wir bereits geschäftlich Kontakt hatten.<br>
                  <a href="${unsubscribeUrl}" style="color: #999;">Abmelden</a>
                </p>
              </div>
            </body>
            </html>
          `,
        });

        // Resend returns { data, error } and may NOT throw on delivery errors
        if ((emailResponse as any)?.error) {
          throw new Error((emailResponse as any).error.message || "Resend error");
        }

        console.log(`Email sent to ${customer.email}:`, emailResponse);
        sent++;

        // Rate limit: wait 1 second between attempts (except after last item)
        if (i < normalizedCustomers.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (emailError: any) {
        console.error(`Failed to send to ${customer.email}:`, emailError);
        failed++;
        errors.push(`${customer.email}: ${emailError?.message || String(emailError)}`);
      }
    }

    console.log(`Newsletter complete: ${sent} sent, ${failed} failed, ${skipped} skipped (opt-out)`);

    return new Response(
      JSON.stringify({
        success: failed === 0,
        sent,
        failed,
        skipped,
        total: normalizedCustomers.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error: any) {
    console.error("Newsletter error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
};

serve(handler);
