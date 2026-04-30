const instagramLink = "https://instagram.com/iksha_cozies";
const whatsappLink =
  "https://wa.me/919704668710?text=Hi%20iksha%20gifts%2C%20I%20want%20to%20customize%20a%20gift.";

export function Contact() {
  return (
    <section id="contact" className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <div className="rounded-[2.4rem] border border-border bg-card px-8 py-16 text-center shadow-soft md:px-16 md:py-20">
          <div className="mx-auto max-w-3xl">
            <span className="text-xs uppercase tracking-[0.3em] text-primary">
              Let&apos;s plan your gift
            </span>
            <h2 className="mt-4 font-display text-4xl leading-tight text-foreground md:text-6xl">
              Thoughtful gifting, polished presentation, and custom details that feel personal.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-muted-foreground">
              Talk to us on WhatsApp for order help, custom requests, and occasion-based gift
              planning. Follow Instagram to move from inspiration to checkout faster.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-card transition-transform hover:scale-[1.03]"
              >
                Order Your Gift Now 🎁
              </a>
              <a
                href="/collections/custom"
                className="rounded-full border border-border bg-background px-7 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                Customize Your Gift 💝
              </a>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm">
              <a
                href={instagramLink}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-border px-5 py-2.5 text-foreground transition-colors hover:bg-secondary"
              >
                View Instagram Proof
              </a>
              <a
                href="mailto:hello@ikshagifts.shop"
                className="rounded-full border border-border px-5 py-2.5 text-foreground transition-colors hover:bg-secondary"
              >
                hello@ikshagifts.shop
              </a>
            </div>

            <div className="mt-10 grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
              <div className="rounded-2xl bg-background px-5 py-4">Custom orders welcome</div>
              <div className="rounded-2xl bg-background px-5 py-4">
                Order before 5PM for faster dispatch
              </div>
              <div className="rounded-2xl bg-background px-5 py-4">Premium wrapping included</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

