import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import React from 'npm:react@18.3.1';
import { CustomerBookingConfirmation } from '../_shared/email-templates/customer-booking-confirmation.tsx';
import { analyzeWeekendHoliday } from '../_shared/german-holidays.ts';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-internal-secret",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const providedSecret = req.headers.get("x-internal-secret");
  const expectedSecret = Deno.env.get("INTERNAL_FN_SECRET");
  if (!expectedSecret || providedSecret !== expectedSecret) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
  const body = await req.json();
  const computed = analyzeWeekendHoliday(body.einsatzbeginn, body.einsatzende || body.einsatzbeginn);
  const html = await renderAsync(React.createElement(CustomerBookingConfirmation, {
    customerName: body.customerName,
    companyName: body.companyName,
    driverType: body.tarif?.label,
    requirements: body.anforderungen ?? [],
    timeframe: body.timeframe,
    location: body.location,
    message: body.message,
    weekendHolidayAffected: computed.affected,
    weekendHolidayAcknowledged: false,
    tarif: body.tarif,
  }));
  const res = await resend.emails.send({
    from: "Fahrerexpress-Agentur <info@kraftfahrer-mieten.com>",
    to: ["info@kraftfahrer-mieten.com"],
    subject: "[TEST – NICHT AN KUNDEN VERSENDEN] Finale Buchungsbestätigung",
    html,
  });
  return new Response(JSON.stringify({ res, affected: computed.affected }), { headers: { "Content-Type": "application/json", ...corsHeaders } });
});
