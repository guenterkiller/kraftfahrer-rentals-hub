const IndustriesRow = () => {
  const industries = [
    { icon: "🚚", name: "Speditionen" },
    { icon: "🏗️", name: "Bau/Entsorgung" },
    { icon: "🧱", name: "Beton" },
    { icon: "🎤", name: "Events" },
    { icon: "🚌", name: "Bus & Sonderfahrzeuge" }
  ];

  return (
    <section className="py-12 bg-white border-y">
      <div className="container mx-auto px-4">
        <h3 className="text-xl font-semibold text-center mb-8 text-gray-700">
          Branchen, die uns nutzen
        </h3>
        
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
          {industries.map((industry, index) => (
            <div key={index} className="flex flex-col items-center text-center min-w-[100px]">
              <div className="text-3xl mb-2">{industry.icon}</div>
              <span className="text-sm font-medium text-gray-600">
                {industry.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IndustriesRow;