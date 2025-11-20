import { MapPin, Truck, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const GermanyMap = () => {
  const cities = [
    { name: "Hamburg", x: "52%", y: "18%" },
    { name: "Berlin", x: "70%", y: "28%" },
    { name: "Frankfurt", x: "45%", y: "50%", highlight: true },
    { name: "München", x: "58%", y: "80%" },
    { name: "Köln", x: "35%", y: "42%" },
    { name: "Stuttgart", x: "48%", y: "68%" },
    { name: "Dortmund", x: "35%", y: "38%" },
    { name: "Dresden", x: "72%", y: "45%" },
    { name: "Hannover", x: "50%", y: "30%" },
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-primary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Bundesweit für Sie verfügbar
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Von Hamburg bis München, von Köln bis Dresden – unsere selbstständigen Fahrer sind in ganz Deutschland im Einsatz
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
          {/* Map Section */}
          <div className="relative">
            <Card className="overflow-hidden border-2 border-primary/20 bg-white/50 backdrop-blur-sm">
              <CardContent className="p-8">
                {/* Simplified Germany SVG Map */}
                <div className="relative w-full aspect-[3/4] max-w-md mx-auto">
                  {/* Germany outline - simplified shape */}
                  <svg
                    viewBox="0 0 200 280"
                    className="w-full h-full"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Germany shape - simplified */}
                    <path
                      d="M 100 10 
                         L 120 15 L 140 25 L 155 40 L 165 60 L 170 80 
                         L 168 100 L 165 120 L 160 140 L 155 160 
                         L 150 180 L 140 200 L 130 220 L 120 240 
                         L 110 255 L 100 265 L 90 255 L 80 240 
                         L 70 220 L 60 200 L 50 180 L 45 160 
                         L 40 140 L 35 120 L 33 100 L 35 80 
                         L 40 60 L 50 40 L 65 25 L 80 15 Z"
                      className="fill-primary/10 stroke-primary stroke-2 transition-all duration-300 hover:fill-primary/20"
                    />
                    
                    {/* Grid pattern for visual effect */}
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <circle cx="10" cy="10" r="1" className="fill-primary/5" />
                      </pattern>
                    </defs>
                    <rect width="200" height="280" fill="url(#grid)" />
                  </svg>

                  {/* City markers */}
                  {cities.map((city, index) => (
                    <div
                      key={city.name}
                      className="absolute group cursor-pointer animate-fade-in"
                      style={{
                        left: city.x,
                        top: city.y,
                        animationDelay: `${index * 100}ms`,
                      }}
                    >
                      <div className="relative">
                        {/* Pin icon */}
                        <MapPin
                          className={`h-6 w-6 ${
                            city.highlight
                              ? "text-red-600 animate-pulse"
                              : "text-primary"
                          } transition-transform duration-200 group-hover:scale-125 drop-shadow-lg`}
                        />
                        
                        {/* City name tooltip */}
                        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                          <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded whitespace-nowrap shadow-lg">
                            {city.name}
                            {city.highlight && " (Hauptsitz)"}
                          </div>
                        </div>

                        {/* Ripple effect for highlight */}
                        {city.highlight && (
                          <div className="absolute inset-0 animate-ping">
                            <MapPin className="h-6 w-6 text-red-600 opacity-50" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Info Section */}
          <div className="space-y-6">
            <Card className="border-2 border-green-500/20 bg-green-50/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Deutschlandweit verfügbar</h3>
                    <p className="text-muted-foreground">
                      Unsere selbstständigen LKW-Fahrer und Baumaschinenführer sind in allen Bundesländern einsatzbereit
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-500/20 bg-blue-50/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <Truck className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Schnelle Verfügbarkeit</h3>
                    <p className="text-muted-foreground">
                      Dank unseres bundesweiten Netzwerks können wir Fahrer auch kurzfristig in Ihrer Region vermitteln
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Abgedeckte Regionen:</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    "Norddeutschland",
                    "Süddeutschland", 
                    "Westdeutschland",
                    "Ostdeutschland",
                    "Rhein-Ruhr",
                    "Bayern",
                    "Baden-Württemberg",
                    "Alle Bundesländer"
                  ].map((region) => (
                    <div key={region} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm">{region}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GermanyMap;
