import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);



  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="font-bold text-sm md:text-xl text-primary">
            <div className="hidden sm:block">Fahrerexpress-Agentur - Günter Killer</div>
            <div className="sm:hidden">Fahrerexpress<br/>Günter Killer</div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Button size="sm" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all" asChild>
              <Link to="/fahrer-registrierung">
                🚀 Fahrer werden
              </Link>
            </Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
              <Link 
                to="/#fahreranfrage"
                onClick={(e) => {
                  // Wenn wir schon auf der Index-Seite sind, scrolle zum Formular
                  if (window.location.pathname === '/') {
                    e.preventDefault();
                    const element = document.querySelector('#fahreranfrage');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }
                }}
              >
                Fahrer buchen
              </Link>
            </Button>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all mb-2" asChild>
                <Link 
                  to="/fahrer-registrierung"
                  onClick={() => setIsMenuOpen(false)}
                >
                  🚀 Fahrer werden
                </Link>
              </Button>
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                <Link 
                  to="/#fahreranfrage"
                  onClick={(e) => {
                    setIsMenuOpen(false);
                    // Wenn wir schon auf der Index-Seite sind, scrolle zum Formular
                    if (window.location.pathname === '/') {
                      e.preventDefault();
                      const element = document.querySelector('#fahreranfrage');
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }
                  }}
                >
                  Fahrer buchen
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;