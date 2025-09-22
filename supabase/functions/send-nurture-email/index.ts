import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NurtureEmailRequest {
  recipient_email: string;
  recipient_name: string;
  template_type: 'auftraggeber' | 'fahrer';
  sequence_day: 0 | 2 | 7;
  variables?: Record<string, string>;
}

const getEmailTemplate = (type: 'auftraggeber' | 'fahrer', day: 0 | 2 | 7) => {
  const templates = {
    auftraggeber: {
      0: {
        subject: "Ihre Fahreranfrage bei Fahrerexpress – wir disponieren für Sie",
        content: `Hallo {{contact_person}},

vielen Dank für Ihre Anfrage über unsere Website! 

**Ihre Anfrage im Überblick:**
- Fahrzeugtyp: {{vehicle_types}}
- Starttermin: {{start_date}} (KW {{calendar_week}})
- Einsatzort: {{location}}
- Dauer: {{duration}}

**Wie es jetzt weitergeht:**
1. Wir prüfen verfügbare Fahrer in Ihrer Region
2. Sie erhalten spätestens am nächsten Werktag unsere Rückmeldung
3. Bei Verfügbarkeit stellen wir den direkten Kontakt zum Fahrer her

**Warum Fahrerexpress?**
✅ Keine Kosten, falls kein Fahrer verfügbar ist
✅ Eine Rechnung, transparente Abwicklung  
✅ Dienst-/Werkleistung – keine Arbeitnehmerüberlassung

Bei Rückfragen erreichen Sie uns unter: 01577 1442285

Viele Grüße
Günter Killer
Fahrerexpress-Agentur`
      },
      2: {
        subject: "{{vehicle_types}} für KW {{calendar_week}} – Verfügbarkeit & Optionen",
        content: `Hallo {{contact_person}},

ein kurzes Update zu Ihrer Fahreranfrage:

**Aktuelle Situation:**
Für Ihren gewünschten Starttermin ({{start_date}}) prüfen wir noch die finale Verfügbarkeit. 

**Alternativ-Optionen:**
- Flexibler Starttermin: oft bessere Verfügbarkeit ab der Folgewoche
- Benachbarte Regionen: Fahrer mit Anfahrt möglich
- Ähnliche Qualifikationen: falls Spezialscheine nicht zwingend erforderlich

Bei Fragen: 01577 1442285 (Mo-Fr 8-18 Uhr)

Viele Grüße
Günter Killer`
      },
      7: {
        subject: "Planen Sie weitere Einsätze? Fahrerexpress als verlässlicher Partner",
        content: `Hallo {{contact_person}},

falls Sie regelmäßig oder projektweise Fahrer benötigen, sind wir gerne Ihr fester Ansprechpartner.

**Vorteile für Stammkunden:**
- Bevorzugte Disposition bei kurzfristigen Anfragen
- Feste Ansprechpartner für Ihre Projekte  
- Optimierte Abläufe und bewährte Fahrer-Teams

Bei Fragen bin ich da: 01577 1442285

Viele Grüße  
Günter Killer
Fahrerexpress-Agentur`
      }
    },
    fahrer: {
      0: {
        subject: "Willkommen bei Fahrerexpress – Ihre Registrierung ist eingegangen",
        content: `Hallo {{name}},

herzlich willkommen im Fahrerexpress-Netzwerk!

**Ihre Registrierung:**
- Qualifikationen: {{qualifications}}
- Einsatzregion: {{region}}  
- Verfügbarkeit: {{availability}}

**Nächste Schritte:**
1. ✅ Registrierung abgeschlossen
2. 📋 Dokumentenprüfung (falls erforderlich)
3. 🔔 Jobalarm aktiviert
4. 💼 Einsätze verfügbar

Fragen? Rufen Sie an: 01577 1442285

Viele Grüße
Günter Killer
Fahrerexpress-Agentur`
      },
      2: {
        subject: "{{name}}, passende Einsätze in Ihrer Region verfügbar",
        content: `Hallo {{name}},

erste Einsätze in Ihrer Region sind verfügbar:

**Wichtige Infos zur Zusammenarbeit:**
✅ Abrechnung läuft über Fahrerexpress (eine Rechnung für den Auftraggeber)
✅ Sie arbeiten als selbstständiger Subunternehmer
✅ Keine Arbeitnehmerüberlassung – rechtssichere Dienst-/Werkleistung

Bei Interesse einfach anrufen oder per E-Mail melden.

Viele Grüße
Günter Killer`
      },
      7: {
        subject: "{{name}}, so optimieren Sie Ihre Einsatzplanung bei Fahrerexpress",
        content: `Hallo {{name}},

nach einer Woche im Fahrerexpress-Netzwerk hier einige Tipps für mehr Einsätze:

**Mehr Einsätze durch:**
🔔 Jobalarm aktiviert? Sofortige Benachrichtigung bei passenden Anfragen
📍 Flexible Einsatzregion? Erweitert Ihre Möglichkeiten erheblich  
⏰ Kurzfristige Verfügbarkeit? Besonders gefragt für Ausfälle
📋 Zusatzqualifikationen? ADR, Kran, Baumaschinen sind sehr gefragt

Fragen zur Abrechnung, Versicherung oder Steuern?
Wir helfen gerne: 01577 1442285

Viele Grüße
Günter Killer
Fahrerexpress-Agentur`
      }
    }
  };

  return templates[type][day];
};

const replaceVariables = (text: string, variables: Record<string, string> = {}) => {
  let result = text;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return result;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      recipient_email, 
      recipient_name, 
      template_type, 
      sequence_day,
      variables = {}
    }: NurtureEmailRequest = await req.json();

    const template = getEmailTemplate(template_type, sequence_day);
    
    const subject = replaceVariables(template.subject, { ...variables, name: recipient_name });
    const content = replaceVariables(template.content, { ...variables, name: recipient_name });

    const emailResponse = await resend.emails.send({
      from: "Fahrerexpress <onboarding@resend.dev>",
      to: [recipient_email],
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <pre style="white-space: pre-wrap; font-family: Arial, sans-serif;">${content}</pre>
          </div>
          <div style="margin-top: 20px; padding: 15px; background-color: #e3f2fd; border-radius: 6px; font-size: 12px; color: #666;">
            <strong>Rechtlicher Hinweis:</strong> Dienst-/Werkleistung durch selbstständige Subunternehmer – keine Arbeitnehmerüberlassung.
          </div>
        </div>
      `,
    });

    console.log("Nurture email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-nurture-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);