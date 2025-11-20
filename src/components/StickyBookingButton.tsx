import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";

const StickyBookingButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button after scrolling down 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToForm = () => {
    const element = document.querySelector('#fahreranfrage');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Desktop: Bottom right */}
      <div className="hidden md:block fixed bottom-6 right-6 z-50 animate-fade-in">
        <Button
          onClick={scrollToForm}
          size="lg"
          className="shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 text-base px-6 py-6 bg-primary hover:bg-primary/90"
        >
          Jetzt Fahrer buchen
        </Button>
      </div>

      {/* Mobile: Bottom center with phone option */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-50 animate-fade-in">
        <div className="flex gap-2">
          <Button
            onClick={scrollToForm}
            size="lg"
            className="flex-1 shadow-2xl text-sm py-6 bg-primary hover:bg-primary/90"
          >
            Fahrer buchen
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="shadow-2xl bg-white hover:bg-gray-50 px-4 py-6"
          >
            <a href="tel:+4915771442285" aria-label="Jetzt anrufen">
              <Phone className="h-5 w-5" />
            </a>
          </Button>
        </div>
      </div>
    </>
  );
};

export default StickyBookingButton;
