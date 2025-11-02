import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
};

// DEPRECATED: Diese Funktion wurde durch respond-invite ersetzt
// Wird nur noch für Kompatibilität mit alten Links beibehalten

interface DriverResponseRequest {
  jobId: string;
  driverId: string;
  action: 'accept' | 'decline';
  billingModel?: 'direct' | 'agency';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Return deprecation notice
  const deprecationHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Veralteter Link</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          max-width: 600px;
          margin: 50px auto;
          padding: 24px;
          line-height: 1.55;
        }
        .warning {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        h2 {
          color: #92400e;
          margin: 0 0 15px 0;
        }
        p {
          color: #92400e;
          margin: 10px 0;
        }
        .contact {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="warning">
        <h2>⚠️ Veralteter Link</h2>
        <p>Dieser Link ist veraltet. Bitte verwenden Sie den aktuellen Link aus Ihrer neuesten E-Mail.</p>
        <p><strong>Warum?</strong> Wir haben auf ein sichereres Token-basiertes System umgestellt.</p>
      </div>
      <div class="contact">
        <p><strong>Bei Fragen:</strong></p>
        <p>
          📞 +49-1577-1442285<br>
          ✉️ info@kraftfahrer-mieten.com
        </p>
      </div>
    </body>
    </html>
  `;

  return new Response(deprecationHtml, {
    status: 410, // Gone
    headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' }
  });

};

serve(handler);