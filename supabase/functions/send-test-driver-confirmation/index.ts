import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import React from 'npm:react@18.3.1';
import { DriverRegistrationConfirmation } from '../_shared/email-templates/driver-registration-confirmation.tsx';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (_req) => {
  const MAIL_FROM = Deno.env.get("MAIL_FROM") ?? "info@kraftfahrer-mieten.com";
  const to = "info@kraftfahrer-mieten.com";
  const subject = "Willkommen bei der Fahrerexpress-Agentur – Registrierung bestätigt";

  const html = await renderAsync(
    React.createElement(DriverRegistrationConfirmation, {
      driverName: "Günter Killer",
    })
  );

  const res = await resend.emails.send({
    from: MAIL_FROM,
    to: [to],
    subject,
    html,
  });

  return new Response(JSON.stringify({ ok: !res.error, to, subject, res }), {
    status: res.error ? 500 : 200,
    headers: { "Content-Type": "application/json" },
  });
});