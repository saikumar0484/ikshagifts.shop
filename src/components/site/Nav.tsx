import { useMemo, useState } from "react";
import {
  Menu,
  MessageCircleMore,
  PackageCheck,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";
import { collectionNav } from "@/data/storefront";
import { useCommerce } from "@/lib/commerce";

const links = [
  { href: "#featured-products", label: "Featured" },
  { href: "#best-selling-products", label: "Best Sellers" },
  { href: "#reviews", label: "Reviews" },
  { href: "#gift-experience", label: "Gift Experience" },
  { href: "#contact", label: "Contact" },
];

const whatsappLink =
  "https://wa.me/919704668710?text=Hi%20iksha%20gifts%2C%20I%20want%20to%20place%20an%20order.";

export function Nav() {
  const [open, setOpen] = useState(false);
  const { cartCount, setCartOpen, setOrdersOpen, loadOrders, openAuth, user, logout } =
    useCommerce();
  const activeCollection = useMemo(() => {
    const match = window.location.pathname.match(/^\/collections\/(men|custom)/);
    return match?.[1] || null;
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/92 backdrop-blur-xl">
      <div className="bg-primary px-4 py-2 text-center text-xs font-semibold tracking-wide text-primary-foreground">
        🎉 Welcome Offer: ₹150 OFF | Free Shipping – Use Code EKSHA150
      </div>
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 md:px-10">
        <div className="flex items-center gap-6">
          <a href="/" className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-card font-display text-lg italic text-primary">
              IG
            </span>
            <span className="font-display text-xl tracking-tight text-foreground">iksha gifts</span>
          </a>

          <div className="group hidden md:block">
            <a
              href="/collections/women"
              className="text-sm font-semibold text-foreground transition-colors hover:text-primary"
            >
              Collections
            </a>
            <div className="pointer-events-none absolute left-1/2 top-[104px] w-[min(980px,calc(100vw-48px))] -translate-x-1/2 rounded-[1.75rem] border border-border bg-card p-6 opacity-0 shadow-soft transition group-hover:pointer-events-auto group-hover:opacity-100">
              <div className="grid grid-cols-[1.2fr_1fr] gap-6">
                <div className="grid gap-3">
                  {collectionNav.map((item) => (
                    <a
                      key={item.slug}
                      href={item.href}
                      className={`rounded-[1.3rem] px-4 py-4 transition-colors ${
                        activeCollection === item.slug
                          ? "bg-primary text-primary-foreground"
                          : "bg-background text-foreground hover:bg-secondary"
                      }`}
                    >
                      <div className="font-display text-2xl">{item.label}</div>
                      <div
                        className={`mt-1 text-sm ${
                          activeCollection === item.slug
                            ? "text-primary-foreground/80"
                            : "text-muted-foreground"
                        }`}
                      >
                        {item.blurb}
                      </div>
                    </a>
                  ))}
                </div>
                <div className="rounded-[1.6rem] bg-secondary/75 p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-primary">
                    Today&apos;s rush
                  </p>
                  <p className="mt-3 font-display text-3xl text-foreground">
                    Limited custom orders available today
                  </p>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    Order before 5PM for faster dispatch and a gift-ready finish.
                  </p>
                  <div className="mt-5 flex gap-2">
                    <a
                      href="#best-selling-products"
                      className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                    >
                      Order Your Gift Now
                    </a>
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground"
                    >
                      Chat on WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ul className="hidden items-center gap-7 lg:flex">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-sm tracking-wide text-foreground/80 transition-colors hover:text-primary"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="hidden flex-1 items-center justify-end gap-3 md:flex">
          <a
            href="#featured-products"
            className="flex max-w-xs flex-1 items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary"
          >
            <Search size={16} />
            Search premium personalized gifts
          </a>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="grid h-11 w-11 place-items-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-primary hover:text-primary"
            aria-label="Chat on WhatsApp"
            title="Chat on WhatsApp"
          >
            <MessageCircleMore size={18} />
          </a>
          <button
            type="button"
            onClick={() => (user ? logout() : openAuth("login"))}
            className="grid h-11 w-11 place-items-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-primary hover:text-primary"
            aria-label={user ? "Log out" : "Log in"}
            title={user ? `Logged in as ${user.name}. Click to log out.` : "Log in"}
          >
            <UserRound size={18} />
          </button>
          <button
            type="button"
            onClick={async () => {
              if (user) await loadOrders();
              setOrdersOpen(true);
            }}
            className="grid h-11 w-11 place-items-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-primary hover:text-primary"
            aria-label="Open orders"
            title="My orders"
          >
            <PackageCheck size={18} />
          </button>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-[1.03]"
            aria-label="Open cart"
          >
            <ShoppingBag size={18} />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-card px-1 text-xs font-bold text-primary">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        <button
          aria-label="Menu"
          onClick={() => setOpen((value) => !value)}
          className="rounded-full border border-foreground/15 bg-card p-2.5 md:hidden"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {open && (
        <div className="mx-6 mb-4 rounded-2xl border border-border bg-card p-4 shadow-card md:hidden">
          <div className="grid gap-3">
            {collectionNav.map((item) => (
              <a
                key={item.slug}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block rounded-[1rem] bg-background px-4 py-3 text-foreground hover:bg-secondary"
              >
                <div className="font-display text-xl">{item.label}</div>
                <div className="mt-1 text-sm text-muted-foreground">{item.blurb}</div>
              </a>
            ))}
          </div>

          <ul className="mt-4 flex flex-col gap-3">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-foreground/80 hover:bg-secondary"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                openAuth("login");
                setOpen(false);
              }}
              className="rounded-full border border-border px-4 py-3 text-sm font-semibold text-foreground"
            >
              Account
            </button>
            <button
              type="button"
              onClick={() => {
                setCartOpen(true);
                setOpen(false);
              }}
              className="rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
            >
              Cart ({cartCount})
            </button>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="col-span-2 rounded-full border border-border px-4 py-3 text-center text-sm font-semibold text-foreground"
            >
              Chat with us
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
