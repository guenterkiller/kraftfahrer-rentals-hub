import Navigation from "@/components/Navigation";

export default function FahrerWerden() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Navigation />
      
      <div className="p-6 max-w-xl mx-auto pt-24">
        <h1 className="text-3xl font-bold mb-4 text-foreground">🚀 Jetzt als Fahrer registrieren</h1>
        
        <div className="mb-8 p-6 bg-card border border-border rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-foreground">💬 Warum selbstständige Fahrer bei uns mehr erreichen</h2>
          <p className="mb-4 text-base text-muted-foreground">
            Stell dir vor, du bestimmst selbst, wann, wo und für wen du fährst – ganz ohne Disponenten, Schichtpläne oder endlose Diskussionen mit der Dispo.
          </p>
          <p className="mb-6 text-base text-muted-foreground">
            Bei Fahrerexpress bist du nicht „nur ein Fahrer". Du bist Partner auf Augenhöhe – mit klaren Aufträgen, ehrlicher Bezahlung und einem Ansprechpartner, der selbst jahrelang auf dem Bock saß.
          </p>
          
          <div className="mb-6">
            <p className="mb-3 text-base text-foreground">🚛 Du willst mehr verdienen als mit Festanstellung?</p>
            <p className="mb-3 text-base text-foreground">🧭 Du willst selbst bestimmen, wann du fährst – und wann du Pause machst?</p>
            <p className="mb-3 text-base text-foreground">💼 Du willst endlich raus aus dem Hamsterrad und dein eigener Chef sein?</p>
          </div>
          
          <p className="mb-6 text-base font-medium text-foreground">
            Dann ist jetzt der richtige Moment, dich bei uns zu registrieren.
          </p>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-foreground">✅ Was du bekommst:</h3>
            <ul className="space-y-2 text-base text-muted-foreground">
              <li>• Planbare Aufträge, deutschlandweit – keine „Springerdienste"</li>
              <li>• Transparente Honorare – keine Lohnverhandlungen oder Tricks</li>
              <li>• Keine Lohnabzüge wie bei Zeitarbeit – du schreibst deine eigene Rechnung</li>
              <li>• Persönliche Betreuung – kein Callcenter, kein Systemdruck</li>
            </ul>
          </div>
          
          <p className="mb-4 text-base text-muted-foreground">
            🔧 Du bringst Erfahrung, Führerschein und Motivation mit – wir liefern dir die passenden Aufträge.
          </p>
          
          <p className="text-base font-medium text-foreground">
            Trag dich jetzt ein – kostenlos & unverbindlich.<br />
            Und vielleicht ist dein erster Auftrag schon morgen drin.
          </p>
        </div>
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

