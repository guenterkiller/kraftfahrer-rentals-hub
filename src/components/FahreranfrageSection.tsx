import SimpleBookingForm from "@/components/SimpleBookingForm";
import BookingAdvantagesInfo from "@/components/BookingAdvantagesInfo";

const FahreranfrageSection = () => {
  return (
    <div>
      <SimpleBookingForm />
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-foreground text-center mt-8 mb-4">
          So funktioniert die LKW-Fahrer-Vermittlung
        </h2>
        <BookingAdvantagesInfo />
      </div>
    </div>
  );
};

export default FahreranfrageSection;