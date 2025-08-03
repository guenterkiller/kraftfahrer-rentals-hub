import Navigation from "@/components/Navigation";

export default function FahrerWerden() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Navigation />
      
      <div className="p-6 max-w-xl mx-auto pt-24">
        <h1 className="text-3xl font-bold mb-4 text-foreground">🚀 Jetzt als Fahrer registrieren</h1>
        <p className="mb-6 text-lg text-muted-foreground">
          Du bist selbstständiger LKW-Fahrer, Fahrmischerfahrer oder Baumaschinenführer mit Gewerbe? Dann trag dich jetzt kostenlos bei der Fahrerexpress-Agentur ein – wir bringen dich mit Auftraggebern in ganz Deutschland zusammen.
        </p>
        <ul className="list-disc pl-6 mb-6 text-base text-foreground">
          <li>✅ Vermittlung ohne Arbeitnehmerüberlassung</li>
          <li>✅ Flexible Einsätze deutschlandweit</li>
          <li>✅ Faire Bezahlung & schnelle Rückmeldung</li>
        </ul>
        <form
          name="fahrer-anmeldung"
          method="POST"
          action="https://hxnabnsoffzevqhruvar.supabase.co/functions/v1/send-pool-inquiry"
          className="grid gap-4"
        >
          <input type="hidden" name="form_type" value="fahrerregistrierung" />
          <input type="text" name="name" placeholder="Vollständiger Name *" required className="p-3 border border-border rounded bg-background text-foreground" />
          <input type="tel" name="telefon" placeholder="Telefonnummer *" required className="p-3 border border-border rounded bg-background text-foreground" />
          <input type="email" name="email" placeholder="E-Mail-Adresse" className="p-3 border border-border rounded bg-background text-foreground" />
          <input type="text" name="einsatzgebiet" placeholder="Bevorzugter Einsatzort / Region" className="p-3 border border-border rounded bg-background text-foreground" />
          <textarea name="qualifikation" placeholder="Fahrerprofil / Qualifikation (optional)" rows={3} className="p-3 border border-border rounded bg-background text-foreground" />
          <label className="text-sm text-muted-foreground">
            <input type="checkbox" required className="mr-2" /> Ich stimme der{' '}
            <a href="/impressum" className="underline text-primary" target="_blank">Datenschutzerklärung</a> zu.
          </label>
          <button type="submit" className="bg-primary text-primary-foreground py-3 px-6 rounded hover:bg-primary/90 transition-colors">
            ✅ Jetzt registrieren
          </button>
        </form>
        <p className="mt-6 text-sm text-muted-foreground">
          📞 Bei Fragen erreichst du uns unter 01577 1442285 oder info@kraftfahrer-mieten.com
        </p>
      </div>
    </main>
  );
}

