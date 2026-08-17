import { Resend } from 'npm:resend@2.0.0';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';
import { CustomerBookingConfirmation } from '../_shared/email-templates/customer-booking-confirmation.tsx';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const previewOnly = url.searchParams.get('preview') === '1';

    const html = await renderAsync(
      React.createElement(CustomerBookingConfirmation, {
        customerName: 'Max Mustermann',
        companyName: 'Musterbau GmbH',
        driverType: 'LKW-Fahrer CE',
        requirements: ['Kran', 'ADR-Basis'],
        timeframe: '24.08.2026 bis 28.08.2026',
        location: 'Musterstraße 5, 60594 Frankfurt am Main',
        message: 'Nahverkehr mit Sattelzug, Be- und Entladung mit Mitnahmestapler.',
        isFernfahrerTarif: false,
        weekendHolidayAffected: true,
        weekendHolidayAcknowledged: true,
        tarif: {
          tarif: 'lkw_ce',
          label: 'LKW-Fahrer CE',
          netto: 349,
          einheit: 'netto je tatsächlichem Einsatztag',
          mehrstunde: 45,
          needsReview: false,
          reason: 'Testdaten',
        },
      }),
    );

    if (previewOnly) {
      return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    const res = await resend.emails.send({
      from: 'Fahrerexpress-Agentur <info@kraftfahrer-mieten.com>',
      to: ['info@kraftfahrer-mieten.com'],
      subject: '[TEST – NICHT AN KUNDEN VERSENDEN] Buchungsbestätigung – Version 2',
      html,
    });

    return new Response(JSON.stringify({ sent_at: new Date().toISOString(), result: res }), {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});
