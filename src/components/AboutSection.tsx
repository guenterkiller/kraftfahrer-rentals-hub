import { Card, CardContent } from "@/components/ui/card";
import LazyImage from "@/components/LazyImage";

const AboutSection = () => {
  return (
    <section className="py-16 bg-muted">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Über mich</h2>
          
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-32 h-32 rounded-full overflow-hidden shadow-lg">
                  <LazyImage 
                    src="/lovable-uploads/78e60df8-7b75-4383-98da-b6043410d6c6.png" 
                    alt="Günter Killer - Erfahrener selbstständiger LKW-Fahrer und Gründer der Fahrerexpress-Agentur Frankfurt" 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold mb-4">Günter Killer</h3>
                  <p className="text-lg mb-4 text-primary font-semibold">
                    Fahrerexpress-Agentur
                  </p>
                  <p className="text-lg mb-4">
                    Flexibel. Zuverlässig. Deutschlandweit.
                  </p>
                  <p className="text-muted-foreground mb-4">
                    Seit 2009 vernetze ich als erfahrener Kraftfahrer Unternehmen mit qualifizierten Fahrern – CE, ADR, Fahrmischer und Baumaschinenführer. Vermittlung nach § 652 BGB (Maklervertrag).
                  </p>
                  <div className="text-sm text-muted-foreground">
                    <p>📱 Mobil: 01577 1442285</p>
                    <p>✉️ E-Mail: info@kraftfahrer-mieten.com</p>
                    <p>🌐 Web: www.kraftfahrer-mieten.com</p>
                    <p>📍 60594 Frankfurt, Walther-von-Cronberg-Platz 12</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;