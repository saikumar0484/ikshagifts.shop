import { Quote, Star } from "lucide-react";
import { customerReviews } from "@/data/storefront";
import { SiteImage } from "@/components/site/SiteImage";

export function SocialProof() {
  return (
    <section id="reviews" className="py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-primary">Social Proof</span>
            <h2 className="mt-3 font-display text-4xl text-foreground md:text-5xl">
              100+ Happy Customers
            </h2>
          </div>
          <p className="max-w-lg text-sm leading-7 text-muted-foreground">
            From gifting moments to custom surprises, customers keep coming back for the quality,
            packaging, and the feeling these gifts create.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
          {customerReviews.map((review) => (
            <article
              key={`${review.name}-${review.title}`}
              className="rounded-xl border border-border bg-card p-3 shadow-card"
            >
              <div className="relative overflow-hidden rounded-lg bg-secondary p-2">
                <div className="aspect-square overflow-hidden rounded-md">
                  <SiteImage
                    src={review.image}
                    alt={review.title}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="absolute left-3 top-3 rounded-full bg-card px-2 py-1.5 text-primary shadow-sm">
                  <Quote size={12} />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-primary">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} size={12} className="fill-current" />
                ))}
              </div>
              <h3 className="mt-3 font-display text-lg text-foreground">{review.title}</h3>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">"{review.quote}"</p>
              <p className="mt-3 text-xs font-semibold text-foreground">{review.name}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
