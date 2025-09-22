import EnhancedBookingForm from "@/components/EnhancedBookingForm";
import BookingPriorityBanner from "@/components/BookingPriorityBanner";
import BookingAdvantagesInfo from "@/components/BookingAdvantagesInfo";

const FahreranfrageSection = () => {
  return (
    <div>
      <BookingPriorityBanner />
      <EnhancedBookingForm />
      <div className="container mx-auto px-4">
        <BookingAdvantagesInfo />
      </div>
    </div>
  );
};

export default FahreranfrageSection;