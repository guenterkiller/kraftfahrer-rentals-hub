import { Resend } from "npm:resend@2.0.0";
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import CustomerBookingConfirmation from '../_shared/email-templates/customer-booking-confirmation.tsx';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const html = await renderAsync(
    React.createElement(CustomerBookingConfirmation, {
      customerName: 'Testempfänger',
      companyName: 'Fahrerexpress-Agentur (interner Test)',
      driverType: 'LKW-Fahrer CE',
      timeframe: '20.08.2026 – 24.08.2026',
      location: '60311 Frankfurt am Main',
      message: 'Testbuchung zur Prüfung der einheitlichen Tarifdarstellung.',
      weekendHolidayAffected: true,
      weekendHolidayAcknowledged: true,
      tarif: {
        tarif: 'baumaschine',
        label: 'Baumaschinenführer/Mischmeister/Spezialfahrzeuge',
        netto: 489,
        einheit: 'je Einsatztag bis 8 Stunden',
        mehrstunde: 60,
        needsReview: false,
        reason: 'Test',
      },
      surchargeDays: [{ label: 'Samstag, 22.08.2026', percent: 25 }],
    })
  );
  const { data, error } = await resend.emails.send({
    from: "Fahrerexpress-Agentur <info@kraftfahrer-mieten.com>",
    to: ["info@kraftfahrer-mieten.com"],
    subject: "[TEST – NICHT AN KUNDEN VERSENDEN] Einheitliche Tarifdarstellung",
    html,
  });
  return new Response(JSON.stringify({ data, error }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
});
