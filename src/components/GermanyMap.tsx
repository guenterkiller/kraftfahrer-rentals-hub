import { useEffect, useRef } from "react";
import { MapPin, Truck, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import L, { divIcon, LatLngExpression, Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";

// Create custom marker icons using divIcon (works better in Vite)
const createCustomIcon = (highlight: boolean = false) => {
  const size = highlight ? 40 : 30;
  const color = highlight ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))";
  
  return divIcon({
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid hsl(var(--background));
        box-shadow: 0 3px 10px rgba(0,0,0,0.3);
        ${highlight ? "animation: pulse 2s infinite;" : ""}
      ">
        <div style="
          transform: rotate(45deg);
          color: hsl(var(--primary-foreground));
          font-size: ${highlight ? "20px" : "16px"};
        ">📍</div>
      </div>
    `,
    className: 'custom-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size]
  });
};

interface City {
  name: string;
  lat: number;
  lng: number;
  highlight?: boolean;
}

const GermanyMap = () => {
  const mapRef = useRef<LeafletMap | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const cities: City[] = [
    { name: "Hamburg", lat: 53.5511, lng: 9.9937 },
    { name: "Berlin", lat: 52.52, lng: 13.405 },
    { name: "Frankfurt", lat: 50.1109, lng: 8.6821, highlight: true },
    { name: "München", lat: 48.1351, lng: 11.582 },
    { name: "Köln", lat: 50.9375, lng: 6.9603 },
    { name: "Stuttgart", lat: 48.7758, lng: 9.1829 },
    { name: "Dresden", lat: 51.0504, lng: 13.7373 },
    { name: "Hannover", lat: 52.3759, lng: 9.732 },
    { name: "Nürnberg", lat: 49.4521, lng: 11.0767 },
  ];

  const centerPosition: LatLngExpression = [51.1657, 10.4515]; // Center of Germany

  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: centerPosition,
      zoom: 6,
      scrollWheelZoom: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    cities.forEach((city) => {
      const markerIcon = createCustomIcon(city.highlight);
      L.marker([city.lat, city.lng], { icon: markerIcon })
        .addTo(map)
        .bindPopup(
          `<div class="text-center p-2">
             <h3 class="font-bold text-lg text-primary">${city.name}</h3>
             <p class="text-sm text-muted-foreground mt-1">
               ${city.highlight ? "🎯 Hauptstandort" : "Verfügbar"}
             </p>
           </div>`
        );
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

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
                <div className="relative w-full h-[500px] rounded-lg overflow-hidden">
                  <div
                    ref={mapContainerRef}
                    className="h-full w-full z-0"
                    style={{ background: "hsl(var(--muted))" }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Info Cards Section */}
          <div className="space-y-6">
            <Card className="border-2 border-primary/20 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Deutschlandweit verfügbar</h3>
                    <p className="text-muted-foreground">
                      Unser Netzwerk selbstständiger Fahrer deckt alle Bundesländer ab. 
                      Egal wo Sie einen Fahrer benötigen – wir finden die passende Lösung.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Truck className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Schnelle Vermittlung</h3>
                    <p className="text-muted-foreground">
                      In weniger als 24 Stunden vermitteln wir Ihnen qualifizierte Fahrer 
                      für Ihre Einsätze – zuverlässig und professionell.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Alle Regionen abgedeckt</h3>
                    <p className="text-muted-foreground">
                      Nord, Süd, Ost und West – unsere Fahrer sind in allen Regionen 
                      Deutschlands einsatzbereit und kennen sich lokal aus.
                    </p>
                  </div>
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
