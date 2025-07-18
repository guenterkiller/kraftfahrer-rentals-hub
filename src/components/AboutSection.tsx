import { Card, CardContent } from "@/components/ui/card";

const AboutSection = () => {
  return (
    <section className="py-16 bg-muted">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Über mich</h2>
          
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center">
                  <span className="text-4xl font-bold text-primary">GK</span>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold mb-4">Inh. Günter Killer</h3>
                  <p className="text-lg mb-4">
                    Seit 2009 Ihr Partner für die rechtskonforme Vermittlung selbstständiger Berufskraftfahrer.
                  </p>
                  <p className="text-muted-foreground">
                    Keine Arbeitnehmerüberlassung, keine Zeitarbeit – nur geprüfte Profis mit Werkvertrag.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;