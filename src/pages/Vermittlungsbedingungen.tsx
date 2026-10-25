import React from "react";
import { CUSTOMER_TERMS_SECTIONS } from "@/lib/customerConfirmation";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const Vermittlungsbedingungen = () => {
  useSEO({
    title: "Vermittlungsbedingungen für Auftraggeber – Fahrerexpress",
    description: "Vermittlungsbedingungen für Auftraggeber der Fahrerexpress-Agentur. Vermittlung selbstständiger LKW-Fahrer als Subunternehmer.",
    keywords: "Vermittlungsbedingungen, Auftraggeber, Fahrerexpress, LKW Fahrer Vermittlung"
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
            Vermittlungsbedingungen für Auftraggeber
          </h1>

          <Card className="mb-8">
            <CardContent className="p-6 md:p-8 space-y-8">
              
              {CUSTOMER_TERMS_SECTIONS.map((section) => (
                <React.Fragment key={section.title}>
                  <section>
                    <h2 className="text-xl font-semibold text-foreground mb-4">{section.title}</h2>
                    {section.blocks.map((block, index) => block.kind === 'list' ? (
                      <ul key={index} className={block.className}>
                        {block.items.map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    ) : (
                      <p key={index} className={block.className}>
                        {block.emphasis ? <>{block.text.split(block.emphasis)[0]}<strong className="text-foreground">{block.emphasis}</strong>{block.text.split(block.emphasis)[1]}</> : block.text}
                      </p>
                    ))}
                  </section>
                  <Separator />
                </React.Fragment>
              ))}

              {/* Kontakt */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">Kontakt</h2>
                <div className="flex flex-col sm:flex-row gap-4 text-foreground">
                  <a 
                    href="mailto:info@kraftfahrer-mieten.com" 
                    className="flex items-center gap-2 underline decoration-muted-foreground/50 hover:text-primary hover:decoration-primary transition-colors"
                  >
                    <Mail className="h-5 w-5" />
                    info@kraftfahrer-mieten.com
                  </a>
                  <a 
                    href="tel:+4915771442285" 
                    className="flex items-center gap-2 underline decoration-muted-foreground/50 hover:text-primary hover:decoration-primary transition-colors"
                  >
                    <Phone className="h-5 w-5" />
                    01577 1442285
                  </a>
                </div>
              </section>

            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Vermittlungsbedingungen;
