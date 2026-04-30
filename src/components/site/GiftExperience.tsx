import { Gift, Package2, Sparkles } from "lucide-react";
import { giftExperience } from "@/data/storefront";
import { SiteImage } from "@/components/site/SiteImage";

const icons = [Package2, Gift, Sparkles];

export function GiftExperience() {
  return (
    <section id="gift-experience" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-primary">
              Gift Experience
            </span>
            <h2 className="mt-3 font-display text-4xl text-foreground md:text-5xl">
              From wrapping to the final reveal
            </h2>
          </div>
          <p className="max-w-lg text-sm leading-7 text-muted-foreground">
            We design the full gifting journey so the packaging, wrapping, and final delivered
            look feel as premium as the product itself.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {giftExperience.map((item, index) => {
            const Icon = icons[index] || Gift;
            return (
              <article
                key={item.title}
                className="overflow-hidden rounded-[1.8rem] border border-border bg-card shadow-card"
              >
                <div className="aspect-[4/3] overflow-hidden bg-secondary p-4">
                  <SiteImage
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="h-full w-full rounded-[1.3rem] object-cover"
                  />
                </div>
                <div className="p-5">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-primary">
                    <Icon size={18} />
                  </span>
                  <h3 className="mt-4 font-display text-2xl text-foreground">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
