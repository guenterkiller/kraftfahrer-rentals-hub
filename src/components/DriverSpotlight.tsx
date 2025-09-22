import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, User } from "lucide-react";
import { Link } from "react-router-dom";

const DriverSpotlight = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Fahrer des Monats
        </h2>
        
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Alexander K.</h3>
              <div className="flex justify-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                C+E Fahrer • 7 Jahre Erfahrung • ADR-Schein
              </p>
            </div>
            
            <blockquote className="text-lg italic text-gray-700 mb-6">
              „Mir gefällt die klare Disposition und faire Abrechnung. 
              Fahrerexpress hält, was versprochen wird – pünktliche Zahlung, 
              transparente Konditionen und respektvoller Umgang."
            </blockquote>
            
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Einsätze 2024:</span>
                  <span className="block text-blue-600">47 Tage</span>
                </div>
                <div>
                  <span className="font-medium">Bewertung:</span>
                  <span className="block text-green-600">5.0 ⭐</span>
                </div>
              </div>
            </div>
            
            <Button 
              size="lg"
              asChild
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              <Link to="/fahrer-registrierung">
                Fahrer werden
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default DriverSpotlight;