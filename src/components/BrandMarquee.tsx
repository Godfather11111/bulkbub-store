export default function BrandMarquee() {
  const brands = [
    { name: "Sony", abbr: "SNY" },
    { name: "Apple", abbr: "APL" },
    { name: "Samsung", abbr: "SMG" },
    { name: "Bose", abbr: "BOSE" },
    { name: "Nike", abbr: "NKE" },
    { name: "Adidas", abbr: "ADS" },
    { name: "Herschel", abbr: "HSC" },
    { name: "Ray-Ban", abbr: "RB" },
    { name: "Philips", abbr: "PHL" },
    { name: "Dyson", abbr: "DYS" },
    { name: "Lululemon", abbr: "LULU" },
    { name: "The Ordinary", abbr: "ORD" },
  ];

  const doubled = [...brands, ...brands];

  return (
    <section className="py-8 border-y border-border overflow-hidden bg-card/30">
      <div className="relative">
        <div className="flex animate-marquee whitespace-nowrap">
          {doubled.map((brand, idx) => (
            <div
              key={idx}
              className="flex items-center justify-center mx-8 lg:mx-12 shrink-0"
            >
              <span className="text-lg lg:text-xl font-bold tracking-[0.2em] text-muted-foreground/40 hover:text-primary transition-colors duration-300 select-none">
                {brand.abbr}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
