import Navigation from "@/components/Navigation";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const Datenschutz = () => {
  useSEO({
    title: "Datenschutzerklärung | Fahrerexpress-Agentur Frankfurt",
    description: "Datenschutzerklärung der Fahrerexpress-Agentur. Transparente Informationen über Datenverarbeitung, DSGVO-konform.",
    keywords: "Datenschutz Fahrerexpress, DSGVO, Datenschutzerklärung",
    noindex: true
  });
  return (
    <div>
      <Navigation />
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück zur Startseite
          </Link>
          <h1 className="text-4xl font-bold mb-4">Datenschutz</h1>
        </div>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-primary">1. Verantwortlicher</h2>
            <div className="bg-muted p-4 rounded-lg">
              <p className="font-semibold">Fahrerexpress-Agentur – Günter Killer</p>
              <p>Walther-von-Cronberg-Platz 12<br />
              60594 Frankfurt am Main</p>
              <p>E-Mail: <a href="mailto:info@kraftfahrer-mieten.com" className="text-primary hover:underline">info@kraftfahrer-mieten.com</a></p>
              <p>Telefon: 01577 1442285</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-primary">2. Allgemeines zur Datenverarbeitung</h2>
            <p className="text-muted-foreground leading-relaxed">
              Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Personenbezogene Daten werden vertraulich 
              und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung behandelt.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-primary">3. Erhebung und Speicherung personenbezogener Daten</h2>
            <p className="mb-4">Bei Nutzung unserer Webseite oder Nutzung des Kontaktformulars erheben wir folgende Daten:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Name</li>
              <li>Telefonnummer</li>
              <li>E-Mail-Adresse</li>
              <li>Region</li>
              <li>Angaben zum Fahrzeugtyp oder Einsatzwunsch (bei Fahreranfrage / Bewerbung)</li>
            </ul>
            <p className="mt-4 text-muted-foreground">
              Diese Daten werden ausschließlich zur Bearbeitung Ihrer Anfrage gespeichert und verwendet.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-primary">4. Weitergabe von Daten</h2>
            <p className="text-muted-foreground leading-relaxed">
              Ihre Daten werden nicht an Dritte weitergegeben – außer dies ist zur Vertragsabwicklung erforderlich 
              oder gesetzlich vorgeschrieben.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-primary">5. Verwendung von reCAPTCHA</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Zum Schutz unserer Formulare verwenden wir Google reCAPTCHA v2 ("Ich bin kein Roboter"). 
              Anbieter: Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Der Dienst prüft, ob die Eingabe durch einen Menschen erfolgt, und kann dabei IP-Adresse, 
              Mausbewegungen und weitere technische Informationen erfassen. Die Nutzung erfolgt auf Grundlage 
              von Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse am Schutz vor Spam und Missbrauch).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-primary">6. E-Mail-Versand über Resend</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Für den Versand von Bestätigungs-E-Mails verwenden wir Resend (resend.com). 
              Die Datenverarbeitung erfolgt durch:
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="font-semibold">Resend, Inc.</p>
              <p>2261 Market Street #4451, San Francisco, CA 94114, USA.</p>
            </div>
            <p className="mt-4 text-muted-foreground">
              Ein Vertrag zur Auftragsverarbeitung wurde abgeschlossen.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-primary">7. Hosting und DNS über IONOS</h2>
            <p className="text-muted-foreground leading-relaxed">
              Diese Website wird über IONOS SE (Elgendorfer Straße 57, 56410 Montabaur) gehostet. 
              Dabei werden Zugriffsdaten (z. B. IP-Adresse, Browsertyp, Zugriffszeit) für Sicherheits- 
              und Diagnosezwecke erfasst.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-primary">8. SSL-/TLS-Verschlüsselung</h2>
            <p className="text-muted-foreground leading-relaxed">
              Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte 
              eine SSL-Verschlüsselung. Erkennbar am "https://" in der Adresszeile Ihres Browsers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-primary">9. Ihre Rechte als Betroffener</h2>
            <p className="mb-4">Sie haben jederzeit das Recht auf:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO)</li>
              <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
              <li>Löschung Ihrer Daten (Art. 17 DSGVO)</li>
              <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
              <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
              <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
            </ul>
            <p className="mt-4 text-muted-foreground">
              Bitte richten Sie Ihr Anliegen an{" "}
              <a href="mailto:info@kraftfahrer-mieten.com" className="text-primary hover:underline">
                info@kraftfahrer-mieten.com
              </a>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-primary">10. Beschwerderecht</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren – z. B. 
              beim hessischen Datenschutzbeauftragten:
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="font-semibold">Der Hessische Beauftragte für Datenschutz und Informationsfreiheit</p>
              <p>Postfach 3163, 65021 Wiesbaden</p>
              <p>
                <a 
                  href="http://www.datenschutz.hessen.de" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  www.datenschutz.hessen.de
                </a>
              </p>
            </div>
          </section>

          <section className="mb-8">
            <div className="bg-border/50 border border-border p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-primary">Hinweis zu Cookies & Tracking:</h3>
              <p className="text-muted-foreground leading-relaxed">
                Diese Website verwendet keine Cookies und keine Tracking-Dienste wie Google Analytics oder Facebook Pixel.
              </p>
            </div>
          </section>

          <div className="text-center pt-8 border-t">
            <p className="text-sm text-muted-foreground">
              Letzte Aktualisierung: 04.08.2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Datenschutz;