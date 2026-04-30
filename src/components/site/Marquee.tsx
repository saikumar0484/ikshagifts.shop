const items = [
  "Bows",
  "Bouquets",
  "Keychains",
  "Hairclips",
  "Bunnies",
  "Bags",
  "Flowers",
  "Charms",
  "Plushies",
  "Gifts",
];

export function Marquee() {
  return (
    <div className="relative overflow-hidden border-y border-border bg-secondary/60 py-5">
      <div className="flex animate-[marquee_30s_linear_infinite] gap-12 whitespace-nowrap">
        {[...items, ...items, ...items].map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-12 font-display text-2xl italic text-primary md:text-3xl"
          >
            {item}
            <span className="text-clay/50">✿</span>
          </span>
        ))}
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-33.333%) } }`}</style>
    </div>
  );
}
