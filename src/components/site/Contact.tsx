import { FormEvent, useState } from "react";

const instagramLink = "https://instagram.com/iksha_cozies";
const whatsappLink =
  "https://wa.me/919704668710?text=Hi%20iksha%20gifts%2C%20I%20want%20to%20customize%20a%20gift.";

export function Contact() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const submitMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus("loading");
    setMessage("");
    try {
      const response = await fetch("/api/inbox", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(form.get("name") || ""),
          email: String(form.get("email") || ""),
          message: String(form.get("message") || ""),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Message could not be sent.");
      event.currentTarget.reset();
      setStatus("success");
      setMessage("Message sent. We will reply soon.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Message could not be sent.");
    }
  };

  return (
    <section id="contact" className="py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <div className="grid gap-8 rounded-[1.5rem] border border-border bg-card px-5 py-8 shadow-soft md:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:p-8">
          <div>
            <span className="text-[11px] uppercase tracking-[0.24em] text-primary">
              Customer care
            </span>
            <p className="mt-4 max-w-2xl text-sm font-bold leading-7 text-foreground">
              Talk to us on WhatsApp for order help, custom requests, and occasion-based gift
              planning, or send a message here and we will handle it from the admin inbox.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
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

            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
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
          </div>
          <form onSubmit={submitMessage} className="rounded-[1.6rem] bg-background p-5 md:p-6">
            <div className="grid gap-4">
              <label className="text-sm font-medium text-foreground">
                Name
                <input
                  name="name"
                  required
                  className="mt-2 w-full rounded-xl border border-input bg-card px-4 py-3 outline-none focus:border-primary"
                />
              </label>
              <label className="text-sm font-medium text-foreground">
                Email
                <input
                  name="email"
                  type="email"
                  required
                  className="mt-2 w-full rounded-xl border border-input bg-card px-4 py-3 outline-none focus:border-primary"
                />
              </label>
              <label className="text-sm font-medium text-foreground">
                Message
                <textarea
                  name="message"
                  required
                  minLength={10}
                  className="mt-2 min-h-36 w-full rounded-xl border border-input bg-card px-4 py-3 outline-none focus:border-primary"
                />
              </label>
              {message && (
                <p
                  className={`rounded-xl px-4 py-3 text-sm ${
                    status === "error"
                      ? "bg-destructive/10 text-destructive"
                      : "bg-secondary text-foreground"
                  }`}
                >
                  {message}
                </p>
              )}
              <button
                type="submit"
                disabled={status === "loading"}
                className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {status === "loading" ? "Sending..." : "Send Message"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
