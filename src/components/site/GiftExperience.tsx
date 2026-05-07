import { Gift, Heart, Package2, Sparkles } from "lucide-react";
import { giftExperience } from "@/data/storefront";
import { SiteImage } from "@/components/site/SiteImage";

const icons = [Package2, Gift, Sparkles, Heart];

export function GiftExperience() {
  return (
    <section id="gift-experience" className="py-14 md:py-20">
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
            We design the full gifting journey so the packaging, wrapping, and final delivered look
            feel as premium as the product itself.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
          {giftExperience.map((item, index) => {
            const Icon = icons[index] || Gift;
            return (
              <article
                key={item.title}
                className="overflow-hidden rounded-xl border border-border bg-card shadow-card"
              >
                <div className="aspect-square overflow-hidden bg-secondary p-2">
                  <SiteImage
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="h-full w-full rounded-md object-cover"
                  />
                </div>
                <div className="p-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-primary">
                    <Icon size={14} />
                  </span>
                  <h3 className="mt-3 font-display text-lg text-foreground">{item.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{item.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
