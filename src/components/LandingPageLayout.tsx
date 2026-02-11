import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Phone, Mail } from "lucide-react";
import Navigation from "@/components/Navigation";
import FahreranfrageSection from "@/components/FahreranfrageSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import SafeFAQAnswer from "@/components/SafeFAQAnswer";
import { useSEO } from "@/hooks/useSEO";

interface LandingPageLayoutProps {
  seoData: {
    title: string;
    description: string;
    keywords: string;
    structuredData?: any;
  };
  hero: {
    h1: string;
    intro: string;
    bullets: string[];
  };
  faq: {
    title: string;
    items: Array<{
      question: string;
      answer: string;
    }>;
  };
  relatedServices: Array<{
    title: string;
    path: string;
    description: string;
  }>;
}

const LandingPageLayout = ({ seoData, hero, faq, relatedServices }: LandingPageLayoutProps) => {
  useSEO(seoData);

  const scrollToBooking = () => {
    const form = document.querySelector('#booking-form');
    if (form) {
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Skip link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
      >
        Zum Hauptinhalt springen
      </a>
      
      <Navigation />
      
      <main id="main-content" className="pt-16">
        {/* Hero Section */}
        <section className="py-16 px-4 bg-gradient-to-br from-background to-muted/30">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              {hero.h1}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              {hero.intro}
            </p>
            
            {/* Key Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
              {hero.bullets.map((bullet, index) => (
                <div key={index} className="flex items-center justify-center gap-2 p-3 bg-background border rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm font-medium">{bullet}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={scrollToBooking}
                className="text-lg px-8 py-3"
              >
                Jetzt Fahrer buchen
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                asChild
                className="text-lg px-8 py-3"
              >
                <a href="tel:+4915771442285" className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Sofort anrufen
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* Quick Contact Info */}
        <section className="py-8 px-4 bg-muted/50">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-center">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                <span className="font-semibold">+49 1577 1442285</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                <span className="font-semibold">info@kraftfahrer-mieten.com</span>
              </div>
              <div className="text-sm text-muted-foreground">
                <strong>Verfügbarkeit:</strong> Deutschlandweit • <strong>Reaktionszeit:</strong> Meist &lt; 24h
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              {faq.title}
            </h2>
            <div className="space-y-4">
              {faq.items.map((item, index) => (
                <details key={index} className="group rounded-lg border border-muted p-4 hover:border-primary/50 transition-colors">
                  <summary className="font-semibold cursor-pointer flex items-center justify-between group-open:text-primary">
                    {item.question}
                    <span className="ml-2 transform group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <SafeFAQAnswer text={item.answer} className="mt-3 text-muted-foreground" />
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Related Services */}
        <section className="py-16 px-4 bg-muted/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Weitere Fahrerarten
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedServices.map((service, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="outline" className="w-full">
                      <Link to={service.path} className="no-underline">Mehr erfahren</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Booking Section */}
        <section id="fahreranfrage" className="scroll-mt-16">
          <FahreranfrageSection />
        </section>

        {/* Legal Disclaimer */}
        <section className="py-8 px-4 bg-muted/30">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-sm text-muted-foreground font-medium">
              Dienst-/Werkleistung durch selbstständige Subunternehmer – keine Arbeitnehmerüberlassung.
            </p>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="scroll-mt-16">
          <ContactSection />
        </section>
      </main>

      <Footer />

      {/* Admin Badge */}
      <div className="fixed bottom-4 right-4 z-40">
        <Link 
          to="/admin" 
          className="inline-flex items-center px-3 py-2 bg-red-600 text-white text-xs rounded-lg shadow-lg hover:bg-red-700 transition-colors"
          title="Admin-Bereich (nur für Günter Killer)"
        >
          🔐 Admin
        </Link>
      </div>
    </div>
  );
};

export default LandingPageLayout;