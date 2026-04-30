export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-muted-foreground md:flex-row md:px-10">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 bg-card font-display italic text-primary">
            IG
          </span>
          <span className="font-display text-foreground">iksha gifts</span>
        </div>
        <p>(c) {new Date().getFullYear()} iksha gifts. All rights reserved.</p>
        <nav className="flex flex-wrap justify-center gap-4" aria-label="Legal and social links">
          <a href="#privacy" className="hover:text-primary">
            Privacy
          </a>
          <a href="#terms" className="hover:text-primary">
            Terms
          </a>
          <a href="#refunds" className="hover:text-primary">
            Refunds
          </a>
          <a href="#copyright" className="hover:text-primary">
            Copyright
          </a>
          <a
            href="https://instagram.com/iksha_cozies"
            target="_blank"
            rel="noreferrer"
            className="hover:text-primary"
          >
            Instagram
          </a>
        </nav>
      </div>
    </footer>
  );
}
