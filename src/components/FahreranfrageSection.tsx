import BookingForm from "@/components/BookingForm";
import BookingPriorityBanner from "@/components/BookingPriorityBanner";
import BookingAdvantagesInfo from "@/components/BookingAdvantagesInfo";

const FahreranfrageSection = () => {
  return (
    <div>
      <BookingPriorityBanner />
      <BookingForm />
      <div className="container mx-auto px-4">
        <BookingAdvantagesInfo />
      </div>
    </div>
  );
};

export default FahreranfrageSection;