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

const UNSUBSCRIBE_BASE_URL = "https://www.kraftfahrer-mieten.com/unsubscribe";

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

        // Determine greeting name with proper fallback:
        // 1. If name provided → use name
        // 2. Else if firma provided → "Team {firma}"
        // 3. Else → just "Guten Tag,"
        let greetingName = '';
        if (customer.name && customer.name.trim()) {
          greetingName = customer.name.trim();
        } else if (customer.firma && customer.firma.trim()) {
          greetingName = `Team ${customer.firma.trim()}`;
        }
        
        const greetingLine = greetingName ? `Guten Tag ${greetingName},` : 'Guten Tag,';

        // Convert line breaks to HTML - admin message is CONTENT ONLY
        const contentHtml = personalizedMessage
          .split("\n")
          .map((line) =>
            line.trim() ? `<p style="margin: 0 0 10px 0;">${line}</p>` : "<br>"
          )
          .join("");
        
        // Full message = auto greeting + admin content (footer is in template below)
        const htmlMessage = `<p style="margin: 0 0 16px 0;">${greetingLine}</p>${contentHtml}`;

        const senderEmail = Deno.env.get("NEWSLETTER_FROM") || "info@kraftfahrer-mieten.com";
        
        const emailResponse = await resend.emails.send({
          from: `"Fahrerexpress-Agentur" <${senderEmail}>`,
          reply_to: senderEmail,
          to: [customer.email],
          subject: personalizedSubject,
          html: `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${personalizedSubject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f6f8;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#f4f6f8">
    <tr>
      <td align="center" style="padding: 30px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" bgcolor="#ffffff" style="max-width: 600px; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td bgcolor="#1a365d" style="padding: 25px 30px; text-align: center; background: linear-gradient(135deg, #1a365d 0%, #2d5a87 100%);">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold; font-family: Arial, Helvetica, sans-serif;">Fahrerexpress</h1>
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.8); font-size: 13px; font-family: Arial, Helvetica, sans-serif;">Informationen für unsere Kunden</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td bgcolor="#ffffff" style="padding: 35px 30px; font-size: 15px; line-height: 1.6; color: #333333; font-family: Arial, Helvetica, sans-serif;">
              ${htmlMessage}
            </td>
          </tr>
          <!-- Footer Signature -->
          <tr>
            <td bgcolor="#f8f9fa" style="padding: 25px 30px; text-align: center; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0; color: #666666; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">
                Mit freundlichen Grüßen<br>
                <strong style="color: #333333;">Fahrerexpress-Agentur – Günter Killer</strong>
              </p>
              <p style="margin: 15px 0 0 0; color: #888888; font-size: 12px; font-family: Arial, Helvetica, sans-serif;">
                Tel.: +49 (0) 1577 1442285<br>
                <a href="https://www.kraftfahrer-mieten.com" style="color: #2d5a87; text-decoration: none;">www.kraftfahrer-mieten.com</a>
              </p>
              <p style="margin: 15px 0 0 0; color: #1a365d; font-size: 13px; font-weight: bold; font-family: Arial, Helvetica, sans-serif;">
                Bitte speichern Sie sich diese Seite als Favorit ab – für den Notfall.
              </p>
            </td>
          </tr>
          <!-- Legal Footer -->
          <tr>
            <td bgcolor="#f0f2f4" style="padding: 20px 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0; color: #555555; font-size: 12px; line-height: 1.5; font-family: Arial, Helvetica, sans-serif;">
                Sie erhalten diese E-Mail, weil wir bereits geschäftlich Kontakt hatten.<br>
                <strong>Abmelden:</strong>
                <a href="${unsubscribeUrl}" style="color: #2d5a87; text-decoration: underline; font-weight: 600;">${unsubscribeUrl}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
        });

        // Determine if this is a test email (subject starts with [TEST])
        const isTestEmail = personalizedSubject.startsWith('[TEST]');
        const templateName = isTestEmail ? 'customer_newsletter_test' : 'customer_newsletter';

        // Resend returns { data, error } and may NOT throw on delivery errors
        if ((emailResponse as any)?.error) {
          // Log failed email
          await supabase.from("email_log").insert({
            recipient: customer.email,
            template: templateName,
            subject: personalizedSubject,
            status: "failed",
            error_message: (emailResponse as any).error.message || "Resend error",
            delivery_mode: isTestEmail ? "test" : "live",
          });
          throw new Error((emailResponse as any).error.message || "Resend error");
        }

        // Log successful email
        await supabase.from("email_log").insert({
          recipient: customer.email,
          template: templateName,
          subject: personalizedSubject,
          status: "sent",
          sent_at: new Date().toISOString(),
          delivery_mode: isTestEmail ? "test" : "live",
        });

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
