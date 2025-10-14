import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const BookingFAQ = () => {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (item: string) => {
    setOpenItems(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const faqItems = [
    {
      id: "verbindlich",
      question: "Ist die Buchung verbindlich?",
      answer: "Ihre Angaben werden erfasst, passende Fahrer informiert und der Einsatz bestätigt. Sie erhalten eine Einsatzbestätigung per E-Mail."
    },
    {
      id: "email",
      question: "Kann ich trotzdem per E-Mail anfragen?",
      answer: "Ja – für schnelle Einsätze empfehlen wir den Button \"Fahrer buchen\"."
    },
    {
      id: "angaben",
      question: "Welche Angaben sind wichtig?",
      answer: "Einsatzort, Zeitraum, Fahrzeugtyp, besondere Anforderungen (z. B. ADR, Ladekran), Kontaktperson & Telefonnummer."
    }
  ];

  return (
    <section className="mt-8">
      <h3 className="text-base font-semibold mb-4">Häufige Fragen</h3>
      <div className="space-y-3">
        {faqItems.map((item) => (
          <Collapsible key={item.id} open={openItems.includes(item.id)}>
            <CollapsibleTrigger
              onClick={() => toggleItem(item.id)}
              className="w-full rounded-lg border border-muted p-3 text-left hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{item.question}</span>
                <ChevronDown 
                  className={`h-4 w-4 transition-transform ${
                    openItems.includes(item.id) ? 'rotate-180' : ''
                  }`} 
                />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3">
              <p className="text-sm text-muted-foreground pt-2">
                {item.answer}
              </p>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </section>
  );
};

export default BookingFAQ;