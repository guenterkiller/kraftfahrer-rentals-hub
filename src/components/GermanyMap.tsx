import { MapPin, Truck, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

const DefaultIcon = new Icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom highlighted marker icon
const HighlightIcon = new Icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [35, 57],
  iconAnchor: [17, 57],
  popupAnchor: [1, -48],
  shadowSize: [57, 57],
  className: 'highlighted-marker'
});

interface City {
  name: string;
  lat: number;
  lng: number;
  highlight?: boolean;
}

const GermanyMap = () => {
  const cities: City[] = [
    { name: "Hamburg", lat: 53.5511, lng: 9.9937 },
    { name: "Berlin", lat: 52.5200, lng: 13.4050 },
    { name: "Frankfurt", lat: 50.1109, lng: 8.6821, highlight: true },
    { name: "München", lat: 48.1351, lng: 11.5820 },
    { name: "Köln", lat: 50.9375, lng: 6.9603 },
    { name: "Stuttgart", lat: 48.7758, lng: 9.1829 },
    { name: "Dresden", lat: 51.0504, lng: 13.7373 },
    { name: "Hannover", lat: 52.3759, lng: 9.7320 },
    { name: "Nürnberg", lat: 49.4521, lng: 11.0767 },
  ];

  const centerPosition: LatLngExpression = [51.1657, 10.4515]; // Center of Germany

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
                  <MapContainer
                    center={centerPosition}
                    zoom={6}
                    scrollWheelZoom={false}
                    className="h-full w-full z-0"
                    style={{ background: 'hsl(var(--muted))' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {cities.map((city, index) => (
                      <Marker
                        key={index}
                        position={[city.lat, city.lng]}
                        icon={city.highlight ? HighlightIcon : DefaultIcon}
                      >
                        <Popup>
                          <div className="text-center p-2">
                            <h3 className="font-bold text-lg text-primary">{city.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {city.highlight ? '🎯 Hauptstandort' : 'Verfügbar'}
                            </p>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
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
