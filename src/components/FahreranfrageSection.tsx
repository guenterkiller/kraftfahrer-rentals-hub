import SimpleBookingForm from "@/components/SimpleBookingForm";
import BookingAdvantagesInfo from "@/components/BookingAdvantagesInfo";

const FahreranfrageSection = () => {
  return (
    <div>
      <SimpleBookingForm />
      <div className="container mx-auto px-4">
        <BookingAdvantagesInfo />
      </div>
    </div>
  );
};

export default FahreranfrageSection;