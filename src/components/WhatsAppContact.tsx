import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

const WhatsAppContact = () => {
  const handleWhatsApp = () => {
    const phoneNumber = "4915771442285"; // Without leading zero
    const message = encodeURIComponent("Hallo! Ich interessiere mich für die Fahrerexpress-Vermittlung und hätte gerne weitere Informationen.");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 md:hidden">
      <Button
        onClick={handleWhatsApp}
        className="bg-green-500 hover:bg-green-600 rounded-full w-14 h-14 shadow-lg"
        size="icon"
        aria-label="Per WhatsApp kontaktieren"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default WhatsAppContact;