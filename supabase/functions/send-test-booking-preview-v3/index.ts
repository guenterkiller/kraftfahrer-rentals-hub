import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import React from 'npm:react@18.3.1';
import { CustomerBookingConfirmation } from '../_shared/email-templates/customer-booking-confirmation.tsx';
import { analyzeWeekendHoliday, listSurchargeDays } from '../_shared/german-holidays.ts';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const start = '2026-08-24';
  const end = '2026-08-28';
  const info = analyzeWeekendHoliday(start, end);
  const days = listSurchargeDays(start, end);
  const tarif = {
    tarif: 'lkw_ce', label: 'LKW-Fahrer CE', netto: 349, einheit: 'Einsatztag',
    mehrstunde: 45, needsReview: false, reason: 'test',
  };
  const html = await renderAsync(React.createElement(CustomerBookingConfirmation, {
    customerName: 'Max Mustermann',
    companyName: 'Musterbau GmbH',
    driverType: 'LKW-Fahrer CE',
    requirements: [],
    timeframe: 'vom 24.08.2026 bis 28.08.2026',
    location: 'Frankfurt am Main',
    message: 'Nahverkehr, Sattelzug, Palettenware',
    isFernfahrerTarif: false,
    weekendHolidayAffected: info.affected,
    weekendHolidayAcknowledged: false,
    tarif,
  }));
  const url = new URL(req.url);
  const sendIt = url.searchParams.get('send') === '1';
  let res: unknown = null;
  if (sendIt) {
    res = await resend.emails.send({
      from: "Fahrerexpress-Agentur <info@kraftfahrer-mieten.com>",
      to: ["info@kraftfahrer-mieten.com"],
      subject: "[TEST – NICHT AN KUNDEN VERSENDEN] Buchungsbestätigung – Version 3",
      html,
    });
  }
  const text = html
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<\/(p|div|td|tr|li|h1|h2|h3|section|table)>/g, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/[ \t]+/g, ' ')
    .split('\n').map((l) => l.trim()).filter(Boolean).join('\n');
  const emptyCells = (html.match(/<td[^>]*>\s*<\/td>/g) || []).length;
  return new Response(JSON.stringify({ detection: { info, days }, send: res, emptyCells, text }), {
    headers: { "Content-Type": "application/json", ...cors },
  });
});
