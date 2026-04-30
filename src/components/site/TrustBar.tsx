import { Gift, ShieldCheck, Truck } from "lucide-react";

const items = [
  { icon: Truck, label: "Pan India shipping" },
  { icon: Gift, label: "Gift-ready wrapping" },
  { icon: ShieldCheck, label: "Verified order requests" },
];

export function TrustBar() {
  return (
    <section className="border-y border-border bg-card/70">
      <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-border px-6 md:grid-cols-3 md:divide-x md:divide-y-0 md:px-10">
        {items.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center justify-center gap-3 py-4 text-sm font-medium text-foreground"
          >
            <Icon size={18} className="text-primary" />
            {label}
          </div>
        ))}
      </div>
    </section>
  );
}
