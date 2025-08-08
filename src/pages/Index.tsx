import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import PricingSection from "@/components/PricingSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ContactSection from "@/components/ContactSection";
import JobAlertSection from "@/components/JobAlertSection";
import FahreranfrageSection from "@/components/FahreranfrageSection";
import { useSEO } from "@/hooks/useSEO";

const Index = () => {
  useSEO({
    title: "LKW-Fahrer mieten – Selbstständige Fahrer bundesweit | Fahrerexpress",
    description: "Jetzt erfahrene LKW-Fahrer & Baumaschinenführer mieten. Flexibel, rechtskonform & bundesweit. Fahrerexpress – Ihre Lösung bei Fahrermangel.",
    keywords: "kraftfahrer mieten, selbständiger berufskraftfahrer gesucht, LKW-Fahrer mieten, selbstständige Kraftfahrer, Baumaschinenführer, bundesweite Vermittlung",
    ogImage: "https://kraftfahrer-mieten.com/uploads/facebook-preview-v2.jpg"
  });
  return (
    <div>
      <Navigation />
      {/* TEMP: Favicon Vorschau – wird nach Freigabe entfernt */}
      <section aria-label="Favicon Vorschau (temporär)" className="bg-card border-b border-border">
        <div className="container py-6">
          <p className="text-sm md:text-base text-muted-foreground mb-4">Temporäre Favicon-Vorschau – bitte Variante wählen. Wird nach Freigabe wieder entfernt.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
            <figure className="flex flex-col items-center gap-2">
              <img src="/lovable-uploads/favicon-fe-512.png" alt="Fahrerexpress Favicon Vorschau – FE Monogramm" className="h-20 w-20 md:h-24 md:w-24 rounded-full" loading="eager" />
              <figcaption className="text-sm">FE‑Monogramm</figcaption>
            </figure>
            <figure className="flex flex-col items-center gap-2">
              <img src="/lovable-uploads/favicon-wheel-512.png" alt="Fahrerexpress Favicon Vorschau – Lenkrad" className="h-20 w-20 md:h-24 md:w-24 rounded-full" loading="eager" />
              <figcaption className="text-sm">Lenkrad</figcaption>
            </figure>
            <figure className="flex flex-col items-center gap-2">
              <img src="/lovable-uploads/favicon-truck-512.png" alt="Fahrerexpress Favicon Vorschau – LKW-Front" className="h-20 w-20 md:h-24 md:w-24 rounded-full" loading="eager" />
              <figcaption className="text-sm">LKW‑Front</figcaption>
            </figure>
          </div>
        </div>
      </section>
      <div id="home">
        <HeroSection />
      </div>
      <div id="about">
        <AboutSection />
      </div>
      <div id="services">
        <ServicesSection />
      </div>
      <div id="pricing">
        <PricingSection />
      </div>
      <div id="testimonials">
        <TestimonialsSection />
      </div>
      <div id="jobalert">
        <JobAlertSection />
      </div>
      <div id="fahreranfrage">
        <FahreranfrageSection />
      </div>
      <div id="contact">
        <ContactSection />
      </div>
    </div>
  );
};

export default Index;
