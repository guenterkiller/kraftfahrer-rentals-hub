import { Button } from "@/components/ui/button";

const ContactSection = () => {
  const scrollToForm = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.querySelector('#fahreranfrage');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Bereit, den passenden Fahrer zu buchen?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Nutzen Sie unser Buchungsformular für eine schnelle und unkomplizierte Anfrage.
          </p>
          <Button 
            onClick={scrollToForm}
            size="lg"
            className="text-lg px-12 py-6 min-h-[56px]"
            aria-label="Zum Buchungsformular springen"
          >
            Jetzt Fahrer buchen
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
