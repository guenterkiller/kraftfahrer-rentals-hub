import { Button } from "@/components/ui/button";
import { Truck, Clock, Users } from "lucide-react";
import heroImage from "@/assets/german-truck.jpg";
import { Link } from "react-router-dom";

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
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-6 leading-tight">
          <span className="block sm:hidden">Fahrerexpress-Agentur</span>
          <span className="block sm:hidden">Günter Killer</span>
          <span className="hidden sm:block">Fahrerexpress-Agentur - Günter Killer</span>
        </h1>
        
        <div className="bg-primary text-white p-4 md:p-6 mb-8 max-w-4xl mx-auto">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">
            Flexibel. Zuverlässig. Deutschlandweit.
          </h2>
          <p className="text-base sm:text-lg md:text-xl">
            Selbstständiger C+E-Fahrer · Fahrmischerfahrer · Mischmeister für Flüssigboden
          </p>
        </div>
        
        <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-8 max-w-4xl mx-auto leading-relaxed px-4">
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
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-2xl mx-auto">
          <Button size="lg" className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all transform hover:scale-105" asChild>
            <a 
              href="#fahreranfrage"
              onClick={(e) => {
                e.preventDefault();
                const element = document.querySelector('#fahreranfrage');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
            >
              🚛 Fahrer buchen
            </a>
          </Button>
          <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105 border-0" asChild>
            <Link to="/fahrer-registrierung">🚀 Fahrer werden</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;