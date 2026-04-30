export function Contact() {
  return (
    <section className="relative overflow-hidden py-24 motion-safe:animate-fade-up md:py-32">
      <div className="mx-auto max-w-5xl px-6 md:px-10">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-border bg-primary px-8 py-16 text-center shadow-soft md:px-16 md:py-24">
          <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-rose/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-accent/40 blur-3xl" />

          <div className="relative">
            <span className="text-xs uppercase tracking-[0.3em] text-primary-foreground/70">
              Let's chat
            </span>
            <h2 className="mt-4 font-display text-4xl leading-tight text-primary-foreground md:text-6xl">
              Got something <em className="italic">cozy</em> in mind?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-primary-foreground/80">
              Slide into our DMs on Instagram for orders, custom pieces and the occasional
              behind-the-scenes peek. We'd love to make something for you.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <a
                href="https://instagram.com/iksha_cozies"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-card px-7 py-3.5 text-sm font-medium text-primary shadow-card transition-transform hover:scale-[1.03]"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
                </svg>
                iksha gifts
              </a>
              <a
                href="mailto:hello@ikshagifts.shop"
                className="rounded-full border border-primary-foreground/30 px-7 py-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/10"
              >
                hello@ikshagifts.shop
              </a>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-primary-foreground/70">
              <span>Custom orders welcome</span>
              <span className="hidden md:inline">.</span>
              <span>Ships across India</span>
              <span className="hidden md:inline">.</span>
              <span>Wrapped with care</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
