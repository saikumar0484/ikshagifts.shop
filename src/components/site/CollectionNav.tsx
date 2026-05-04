import { collectionNav } from "@/data/storefront";

type CollectionNavProps = {
  active?: string | null;
};

export function CollectionNav({ active }: CollectionNavProps) {
  return (
    <section className="border-y border-border bg-card/70 py-5">
      <div className="mx-auto grid max-w-7xl gap-3 px-6 md:grid-cols-2 md:px-10">
        {collectionNav.map((item) => {
          const isActive = active === item.slug;
          return (
            <a
              key={item.slug}
              href={item.href}
              className={`rounded-[1.5rem] border px-5 py-5 transition-all ${
                isActive
                  ? "border-primary bg-primary text-primary-foreground shadow-card"
                  : "border-border bg-background hover:border-primary/40 hover:bg-secondary/55"
              }`}
            >
              <p className="font-display text-2xl">{item.label}</p>
              <p
                className={`mt-2 text-sm leading-6 ${
                  isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                }`}
              >
                {item.blurb}
              </p>
            </a>
          );
        })}
      </div>
    </section>
  );
}
