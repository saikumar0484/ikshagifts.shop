import hands from "@/assets/about-hands.jpg";
import { SiteImage } from "@/components/site/SiteImage";

export function About() {
  return (
    <section className="relative overflow-hidden py-24 motion-safe:animate-fade-up md:py-32">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-secondary/40 via-background to-background" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 md:grid-cols-2 md:px-10">
        <div className="relative order-2 md:order-1">
          <div className="absolute -inset-4 rounded-[2rem] bg-rose/20 blur-2xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-border shadow-soft">
            <SiteImage
              src={hands}
              alt="Hands crocheting cream yarn with a wooden hook by a window"
              loading="lazy"
              width={1200}
              height={1400}
              containerClassName="rounded-[2rem]"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute -right-3 bottom-8 rounded-2xl border border-border bg-card p-4 shadow-card md:-right-8">
            <div className="font-display text-sm text-muted-foreground">crafted in</div>
            <div className="font-display text-xl text-foreground">our cozy nook</div>
          </div>
        </div>

        <div className="order-1 md:order-2">
          <span className="text-xs uppercase tracking-[0.25em] text-primary">Our Story</span>
          <h2 className="mt-3 font-display text-4xl leading-tight text-foreground md:text-5xl">
            A small studio with <em className="text-primary">big, soft feelings.</em>
          </h2>

          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            iksha_cozies began as a quiet evening hobby: a cup of chai, a ball of yarn, and the
            steady rhythm of stitches. Today we make cozy little keepsakes for people who love
            thoughtful, handmade things.
          </p>

          <ul className="mt-8 space-y-4">
            {[
              {
                icon: "Yarn",
                title: "Soft, cuddle-worthy yarns",
                desc: "Hand-picked cottons and velvet blends.",
              },
              {
                icon: "Batch",
                title: "Made in tiny batches",
                desc: "No two pieces are exactly alike.",
              },
              {
                icon: "Custom",
                title: "Customised, just for you",
                desc: "Pick your colours and message us your vision.",
              },
            ].map((feature) => (
              <li key={feature.title} className="flex gap-4">
                <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-secondary px-2 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                  {feature.icon}
                </span>
                <div>
                  <div className="font-display text-lg text-foreground">{feature.title}</div>
                  <div className="text-sm text-muted-foreground">{feature.desc}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
