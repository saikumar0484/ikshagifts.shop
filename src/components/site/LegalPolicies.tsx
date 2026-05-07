const policies = [
  {
    id: "terms",
    title: "Terms of purchase",
    text: "Orders are handmade or made in small batches. Colors, sizes, yarn texture, and finishing can vary slightly from photos. By placing an order request, you agree to provide accurate contact and delivery details so we can confirm availability, pricing, and dispatch timelines.",
  },
  {
    id: "privacy",
    title: "Privacy and customer data",
    text: "Customer name, email, phone, address, cart, and order history are collected only to verify accounts, process orders, provide support, and share order updates. We do not sell customer data. Account access is protected with verified contact details and secure server-side sessions.",
  },
  {
    id: "shipping",
    title: "Shipping and tracking",
    text: "Every accepted order moves through confirmation, making, packing, shipping, out-for-delivery, and delivered statuses. Tracking details are shared when a courier handoff is completed. Delivery timelines can vary by city, courier load, and custom work.",
  },
  {
    id: "refunds",
    title: "Refunds and cancellations",
    text: "Cancellation or refund requests should be raised before custom work begins. Personalized or made-to-order items may not be eligible for return unless they arrive damaged, incorrect, or materially different from the confirmed order details.",
  },
  {
    id: "copyright",
    title: "Copyright and brand use",
    text: "The iksha gifts name, product photos, product names, original descriptions, page design, and custom handmade product designs shown here belong to iksha gifts or are used with permission. Copying, scraping, reproducing, reselling, or reusing our content, images, branding, or custom designs without written permission is not allowed. Third-party names and marks belong to their respective owners, and no endorsement or affiliation is claimed.",
  },
];

export function LegalPolicies() {
  return (
    <section
      id="legal"
      className="border-y border-border bg-secondary/35 px-6 py-10 md:px-10"
      aria-labelledby="legal-heading"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 max-w-3xl">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
            customer care
          </p>
          <h2 id="legal-heading" className="font-display text-xl text-foreground md:text-2xl">
            Clear policies for safer shopping
          </h2>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            These policies protect customers and the original work on this store. For final legal
            readiness, have the wording reviewed by a qualified professional for your location and
            business model.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {policies.map((policy) => (
            <article
              id={policy.id}
              key={policy.id}
              className="rounded-xl border border-border bg-card p-4 shadow-sm"
            >
              <h3 className="font-display text-base text-foreground">{policy.title}</h3>
              <p className="mt-2 text-[11px] leading-5 text-muted-foreground">{policy.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
