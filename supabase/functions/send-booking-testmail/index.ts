import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import React from 'npm:react@18.3.1';
import { CustomerBookingConfirmation } from '../_shared/email-templates/customer-booking-confirmation.tsx';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const SUBJECT = "[TEST – NICHT AN KUNDEN VERSENDEN] Buchungsbestätigung";

serve(async (req) => {
  if (req.headers.get("x-test-token") !== "c7e5e566295747c1af23b875") {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }
  const html = await renderAsync(React.createElement(CustomerBookingConfirmation, {
    customerName: "Testbesteller",
    companyName: "Testfirma GmbH",
    driverType: "LKW-Fahrer CE",
    requirements: ["Kipper"],
    timeframe: "Ab 24.08.2026 für 2 Einsatztage",
    location: "60594 Frankfurt am Main",
    message: "Testbuchung – Transportfahrten mit Sattelzug, keine Bedienung technischer Arbeitsanlagen.",
    weekendHolidayAffected: false,
    weekendHolidayAcknowledged: false,
    tarif: { tarif: "lkw_ce", label: "LKW-Fahrer CE", netto: 349, einheit: "(bis max. 9 Stunden)", mehrstunde: 45, needsReview: false, reason: "Testmail" },
    surchargeDays: [],
  }));
  const { searchParams } = new URL(req.url);
  if (searchParams.get("preview") === "1") {
    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
  const res = await resend.emails.send({
    from: "Fahrerexpress-Agentur <info@kraftfahrer-mieten.com>",
    to: ["info@kraftfahrer-mieten.com"],
    subject: SUBJECT,
    html,
  });
  return new Response(JSON.stringify({ res, sent_at: new Date().toISOString() }), { headers: { "Content-Type": "application/json" } });
});
