import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock, Users, Truck, Calendar } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
// Using uploaded project images

const Projekte = () => {
  useSEO({
    title: "Projekte & Referenzen – Fahrer-Vermittlung deutschlandweit",
    description: "Erfolgreiche Fahrereinsätze deutschlandweit: Referenzen aus München, Hamburg, Speyer. Bundesweite Fahrer-Vermittlung.",
    keywords: "Fahrerexpress Referenzen, erfolgreiche projekte, kundenbewertungen, fahrereinsätze deutschlandweit, fahrmischer münchen, logistik hamburg, ersatzfahrer bundesweit, Fahrer-Vermittlung deutschlandweit"
  });
  const projekte = [
    {
      id: 1,
      title: "Großbaustelle München - Fahrmischer-Einsatz",
      kunde: "RRS-System",
      zeitraum: "März 2024 - Mai 2024",
      dauer: "8 Wochen",
      ort: "München, Bayern",
      fahrzeugtyp: "Fahrmischer",
      beschreibung: "Kontinuierlicher Betonlieferservice für Wohnbauprojekt mit 3 Fahrmischern täglich.",
      herausforderungen: [
        "Enge Baustelle mit schwierigen Zufahrtsverhältnissen",
        "Präzise Zeitplanung erforderlich",
        "Koordination mit mehreren Gewerken"
      ],
      losung: "Erfahrene Fahrmischerfahrer mit Stadtkenntnis eingesetzt. Enge Abstimmung mit Bauleitung.",
      ergebnis: "Termingerechte Fertigstellung ohne Verzögerungen. Folgeaufträge erhalten.",
      bewertung: 5,
      bild: "/lovable-uploads/b2cd4743-98d6-4618-81c8-418636570dfc.png"
    },
    {
      id: 2,
      title: "Logistik-Support Hamburg - Wochenend-Einsätze",
      kunde: "Transport & Logistik Nord",
      zeitraum: "Januar 2024 - laufend",
      dauer: "Wochenenden",
      ort: "Hamburg und Umgebung",
      fahrzeugtyp: "Sattelzug",
      beschreibung: "Wochenend-Unterstützung für erhöhtes Transportaufkommen in der Logistik.",
      herausforderungen: [
        "Kurzfristige Verfügbarkeit",
        "Wechselnde Einsatzorte",
        "Hohe Qualitätsanforderungen"
      ],
      losung: "Pool erfahrener Wochenend-Fahrer aufgebaut. Flexible Einsatzplanung.",
      ergebnis: "Zuverlässige Abdeckung aller Wochenend-Transporte. Dauerhaft zufriedener Kunde.",
      bewertung: 5,
      bild: "/lovable-uploads/20627488-c22f-4d48-a48c-a32273f9a5dc.png"
    },
    {
      id: 3,
      title: "Baggerfahrer-Einsatz Künzelau – Flüssigbodenaufbereitung",
      kunde: "Flüssigboden GmbH",
      zeitraum: "Mai 2021 - Juli 2021",
      dauer: "10 Wochen",
      ort: "Künzelau",
      fahrzeugtyp: "Spezialbagger",
      beschreibung: "Flüssigbodenaufbereitung für Infrastrukturprojekt mit speziellen Anforderungen an Bodenbeschaffenheit.",
      herausforderungen: [
        "Spezielle Bodenmischverfahren",
        "Präzise Materialzufuhr",
        "Umweltschutzauflagen"
      ],
      losung: "Erfahrene Baggerfahrer mit Spezialkenntnissen in Flüssigbodenverfahren eingesetzt.",
      ergebnis: "Erfolgreiche Bodenaufbereitung nach Zeitplan. Qualitätsstandards übertroffen.",
      bewertung: 5,
      bild: "/lovable-uploads/878ffe35-4811-4857-8771-adce4681b6b0.png"
    },
    {
      id: 4,
      title: "Schwerlasttransport Speyer – Baumaschinen-Transporte",
      kunde: "Bauunternehmen Speyer",
      zeitraum: "August 2018",
      dauer: "3 Wochen",
      ort: "Speyer",
      fahrzeugtyp: "Schwerlast-Sattelzug",
      beschreibung: "Transport von Baumaschinen und schweren Geräten mit speziellen Anforderungen an Ladungssicherung.",
      herausforderungen: [
        "Übermaße und Übergewicht",
        "Spezielle Genehmigungen erforderlich",
        "Komplexe Routenplanung"
      ],
      losung: "Erfahrene Schwerlastfahrer mit entsprechenden Qualifikationen und Begleitfahrzeugen.",
      ergebnis: "Alle Anlagenteile sicher und termingerecht am Zielort angeliefert.",
      bewertung: 5,
      bild: "/lovable-uploads/317386e9-d20a-42c9-bf9c-306b44687d48.png"
    }
  ];

  const statistiken = [
    { icon: Users, label: "Zufriedene Kunden", wert: "150+" },
    { icon: Truck, label: "Erfolgreiche Einsätze", wert: "500+" },
    { icon: Clock, label: "Einsatzstunden", wert: "10.000+" },
    { icon: Star, label: "Durchschnittsbewertung", wert: "4.9/5" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              Projekte & Einsatzbeispiele
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Einblicke in unsere erfolgreichen Projekte und Kundeneinsätze. Unsere bundesweite Fahrer-Vermittlung ermöglicht deutschlandweit flexible Einsätze für Bau, Logistik und Transport.
            </p>
          </div>

          {/* Statistiken */}
          <section className="mb-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {statistiken.map((stat, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="pt-6">
                    <stat.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold mb-1">{stat.wert}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Projekte */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Erfolgreiche Projekte</h2>
            
            <div className="space-y-8">
              {projekte.map((projekt) => (
                <Card key={projekt.id} className="overflow-hidden">
                  <div className="md:flex">
                    <div className="md:w-1/3">
                      <img 
                        src={projekt.bild} 
                        alt={`${projekt.title} - Erfolgreicher ${projekt.fahrzeugtyp}-Fahrereinsatz in ${projekt.ort} für ${projekt.kunde} durch Fahrerexpress vermittelt`}
                        className="w-full h-64 md:h-full object-cover"
                      />
                    </div>
                    
                    <div className="md:w-2/3 p-6">
                      <CardHeader className="px-0 pt-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-2">{projekt.title}</CardTitle>
                            <CardDescription className="text-base">
                              {projekt.kunde}
                            </CardDescription>
                          </div>
                          
                          <div className="flex items-center gap-1 ml-4">
                            {[...Array(projekt.bewertung)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-3">
                          <Badge variant="secondary">
                            <MapPin className="h-3 w-3 mr-1" />
                            {projekt.ort}
                          </Badge>
                          <Badge variant="secondary">
                            <Calendar className="h-3 w-3 mr-1" />
                            {projekt.zeitraum}
                          </Badge>
                          <Badge variant="secondary">
                            <Truck className="h-3 w-3 mr-1" />
                            {projekt.fahrzeugtyp}
                          </Badge>
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            {projekt.dauer}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="px-0">
                        <p className="text-muted-foreground mb-4">
                          {projekt.beschreibung}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <h4 className="font-semibold mb-2 text-orange-600">Herausforderungen</h4>
                            <ul className="space-y-1">
                              {projekt.herausforderungen.map((item, i) => (
                                <li key={i} className="text-muted-foreground">• {item}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-2 text-blue-600">Lösung</h4>
                            <p className="text-muted-foreground">{projekt.losung}</p>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-2 text-green-600">Ergebnis</h4>
                            <p className="text-muted-foreground">{projekt.ergebnis}</p>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Testimonials */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Was unsere Kunden sagen</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardTitle className="text-lg">Zuverlässig und professionell</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    "Die Fahrerexpress-Agentur hat uns bei unserem Großprojekt hervorragend unterstützt. 
                    Alle Fahrer waren pünktlich, kompetent und haben sich perfekt in unser Team integriert."
                  </p>
                  <p className="text-sm font-medium">
                    - Thomas M., RRS-System
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardTitle className="text-lg">Flexible Lösungen</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    "Besonders beeindruckt hat uns die kurzfristige Verfügbarkeit. Auch bei dringenden 
                    Anfragen konnten qualifizierte Fahrer vermittelt werden."
                  </p>
                  <p className="text-sm font-medium">
                    - Sandra K., Transport & Logistik Nord
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Call to Action */}
          <div className="text-center">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Ihr Projekt mit uns realisieren?</CardTitle>
                <CardDescription>
                  Kontaktieren Sie uns für ein unverbindliches Beratungsgespräch
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild>
                    <a href="/#contact">Projekt besprechen</a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/wissenswertes">Mehr erfahren</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Projekte;