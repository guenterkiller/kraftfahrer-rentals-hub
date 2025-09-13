import { Button } from "@/components/ui/button";
import { Truck, Clock, Users } from "lucide-react";
import heroImage from "@/assets/german-truck.jpg";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Optimized background image with proper alt text for accessibility */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed md:bg-scroll"
        style={{ backgroundImage: `url(${heroImage})` }}
        role="img"
        aria-label="Professioneller LKW-Fahrer mit Sattelzug auf deutscher Autobahn - Fahrerexpress vermittelt bundesweit"
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>
      
      <div className="relative z-10 container mx-auto px-4 text-center text-white animate-fade-in">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-6 leading-tight drop-shadow-lg">
          <span className="block sm:hidden">Fahrerexpress-Agentur</span>
          <span className="block sm:hidden">Günter Killer</span>
          <span className="hidden sm:block">Fahrerexpress-Agentur - Günter Killer</span>
        </h1>
        
        <div className="bg-primary/90 backdrop-blur-sm text-white p-4 md:p-6 mb-8 max-w-4xl mx-auto rounded-lg shadow-xl animate-slide-up">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 drop-shadow-md">
            Flexibel. Zuverlässig. Deutschlandweit.
          </h2>
          <p className="text-base sm:text-lg md:text-xl drop-shadow-sm">
            Selbstständiger C+E-Fahrer · Fahrmischerfahrer · Mischmeister für Flüssigboden
          </p>
        </div>
        
        <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-8 max-w-4xl mx-auto leading-relaxed px-4 drop-shadow-sm animate-fade-in">
          Sie möchten kurzfristig einen LKW-Fahrer mieten? Fahrerexpress vermittelt bundesweit 
          selbstständige LKW-Fahrer, Kraftfahrer und Baumaschinenführer – flexibel, zuverlässig 
          und ohne Arbeitnehmerüberlassung.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center mb-12 animate-slide-up">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full border border-white/20">
            <Clock className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
            <span className="text-sm md:text-base font-medium">Kurzfristig verfügbar</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full border border-white/20">
            <Users className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
            <span className="text-sm md:text-base font-medium">Bundesweite Vermittlung</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full border border-white/20">
            <Truck className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
            <span className="text-sm md:text-base font-medium">Professionelle Fahrer</span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center max-w-2xl mx-auto animate-scale-in">
          <Button 
            size="lg" 
            className="text-base md:text-lg px-6 md:px-8 py-4 md:py-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:ring-2 focus:ring-primary/50 focus:outline-none backdrop-blur-sm" 
            asChild
          >
            <a 
              href="#fahreranfrage"
              onClick={(e) => {
                e.preventDefault();
                const element = document.querySelector('#fahreranfrage');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              aria-label="Fahrer buchen - Zu Buchungsformular scrollen"
            >
              🚚 Fahrer buchen
            </a>
          </Button>
          <Button 
            size="lg" 
            className="text-base md:text-lg px-6 md:px-8 py-4 md:py-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:ring-2 focus:ring-blue-500/50 focus:outline-none border-0 backdrop-blur-sm" 
            asChild
          >
            <Link to="/fahrer-registrierung" aria-label="Als Fahrer registrieren">
              🚀 Fahrer werden
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;