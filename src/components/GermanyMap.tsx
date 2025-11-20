import { MapPin, Truck, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const GermanyMap = () => {
  const cities = [
    { name: "Hamburg", x: "48%", y: "15%" },
    { name: "Berlin", x: "72%", y: "22%" },
    { name: "Frankfurt", x: "42%", y: "48%", highlight: true },
    { name: "München", x: "55%", y: "82%" },
    { name: "Köln", x: "30%", y: "42%" },
    { name: "Stuttgart", x: "48%", y: "72%" },
    { name: "Dresden", x: "75%", y: "45%" },
    { name: "Hannover", x: "50%", y: "30%" },
    { name: "Nürnberg", x: "52%", y: "65%" },
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
                {/* Realistic Germany SVG Map */}
                <div className="relative w-full aspect-[4/5] max-w-md mx-auto">
                  <svg
                    viewBox="0 0 400 500"
                    className="w-full h-full"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Realistic Germany outline based on actual shape */}
                    <path
                      d="M 200 30
                         L 230 35 L 260 45 L 280 55 L 295 70 L 310 85 L 325 105 L 335 125
                         L 340 145 L 345 165 L 350 185 L 355 205 L 358 225 L 360 245
                         L 358 265 L 355 285 L 350 305 L 345 325 L 338 345 L 330 365
                         L 320 383 L 308 400 L 295 415 L 280 428 L 265 438 L 248 446
                         L 230 452 L 210 456 L 190 458 L 170 457 L 150 453 L 132 447
                         L 115 439 L 100 428 L 87 415 L 76 400 L 68 383 L 62 365
                         L 58 345 L 55 325 L 53 305 L 52 285 L 53 265 L 55 245
                         L 58 225 L 62 205 L 67 185 L 73 165 L 80 145 L 88 125
                         L 98 105 L 110 87 L 125 72 L 142 60 L 160 50 L 180 40 Z"
                      className="fill-primary/10 stroke-primary stroke-[3] transition-all duration-300 hover:fill-primary/20"
                    />
                    
                    {/* Grid pattern for visual depth */}
                    <defs>
                      <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                        <circle cx="15" cy="15" r="1.5" className="fill-primary/8" />
                      </pattern>
                      
                      {/* Gradient for map */}
                      <linearGradient id="mapGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
                      </linearGradient>
                    </defs>
                    
                    {/* Background pattern */}
                    <rect width="400" height="500" fill="url(#grid)" opacity="0.3" />
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
