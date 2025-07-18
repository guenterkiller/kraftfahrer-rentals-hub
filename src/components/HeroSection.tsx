import { Button } from "@/components/ui/button";
import { Truck, Clock, Users } from "lucide-react";
import heroImage from "@/assets/german-truck.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>
      
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Fahrerexpress-Agentur - Günter Killer
        </h1>
        
        <div className="bg-primary text-white p-6 mb-8 max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Flexibel. Zuverlässig. Deutschlandweit.
          </h2>
          <p className="text-lg md:text-xl">
            Selbstständiger C+E-Fahrer · Fahrmischerfahrer · Mischmeister für Flüssigboden
          </p>
        </div>
        
        <p className="text-lg md:text-xl mb-8 max-w-4xl mx-auto leading-relaxed">
          Sie möchten kurzfristig einen LKW-Fahrer mieten? Fahrerexpress vermittelt bundesweit 
          selbstständige LKW-Fahrer, Kraftfahrer und Baumaschinenführer – flexibel, zuverlässig 
          und ohne Arbeitnehmerüberlassung.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <span>Kurzfristig verfügbar</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <span>Bundesweite Vermittlung</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            <span>Professionelle Fahrer</span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-primary hover:bg-primary/90" asChild>
            <a href="#contact">Fahrer anfragen</a>
          </Button>
          <Button size="lg" variant="hero" asChild>
            <a href="#about">Mehr erfahren</a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;