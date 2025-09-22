import OriginalBookingForm from "@/components/OriginalBookingForm";
import BookingAdvantagesInfo from "@/components/BookingAdvantagesInfo";

const FahreranfrageSection = () => {
  return (
    <div>
      <OriginalBookingForm />
      <div className="container mx-auto px-4">
        <BookingAdvantagesInfo />
      </div>
    </div>
  );
};

export default FahreranfrageSection;