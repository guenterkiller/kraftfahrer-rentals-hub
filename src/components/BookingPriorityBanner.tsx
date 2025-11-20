import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

const BookingPriorityBanner = () => {
  const scrollToBooking = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.querySelector('#fahreranfrage');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="py-8 bg-background">
      <div className="container mx-auto px-4">
        <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 shadow-lg hover:shadow-xl transition-all">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-bold mb-3">
                  Schneller zum Fahrer
                </h2>
                <p className="text-muted-foreground text-base md:text-lg mb-4">
                  Ihre Anfrage wird strukturiert erfasst und zügig disponiert. 
                  So vermeiden wir Rückfragen und können den passenden Fahrer schnell zuweisen.
                </p>
                <p className="text-sm text-muted-foreground">
                  ⏰ <strong>Mindestvorlauf:</strong> 24 Stunden werktags – Einsatzstart frühestens am nächsten Werktag
                </p>
              </div>
              
              <div className="flex-shrink-0">
                <Button 
                  onClick={scrollToBooking}
                  size="lg"
                  className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all group"
                  aria-label="Zum Buchungsformular springen"
                >
                  Jetzt Fahrer buchen
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default BookingPriorityBanner;