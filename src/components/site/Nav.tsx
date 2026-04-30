import { useState } from "react";
import { Menu, PackageCheck, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useCommerce } from "@/lib/commerce";

const links = [
  { href: "#shop", label: "Shop" },
  { href: "#new", label: "New Drops" },
  { href: "#about", label: "Our Story" },
  { href: "#gallery", label: "Gallery" },
  { href: "#contact", label: "Contact" },
];

const shopLinks = ["Bouquets", "Hairclips", "Keychains", "Bunnies", "Gift Sets"];

export function Nav() {
  const [open, setOpen] = useState(false);
  const { cartCount, setCartOpen, setOrdersOpen, loadOrders, openAuth, user, logout } =
    useCommerce();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-xl">
      <div className="bg-primary px-4 py-2 text-center text-xs font-medium tracking-wide text-primary-foreground">
        Handmade gifts, custom orders, and secure order requests now live.
      </div>
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 md:px-10">
        <div className="flex items-center gap-6">
          <a href="#top" className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-card font-display text-lg italic text-primary">
              IG
            </span>
            <span className="font-display text-xl tracking-tight text-foreground">
              iksha<span className="text-primary"> </span>gifts
            </span>
          </a>

          <div className="group hidden md:block">
            <a
              href="#shop"
              className="text-sm font-semibold text-foreground transition-colors hover:text-primary"
            >
              Shop
            </a>
            <div className="pointer-events-none absolute left-1/2 top-[104px] w-[min(920px,calc(100vw-48px))] -translate-x-1/2 rounded-[1.75rem] border border-border bg-card p-6 opacity-0 shadow-soft transition group-hover:pointer-events-auto group-hover:opacity-100">
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-primary">
                    Shop by category
                  </p>
                  <div className="mt-4 grid gap-3">
                    {shopLinks.map((label) => (
                      <a
                        key={label}
                        href="#shop"
                        className="rounded-2xl bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                      >
                        {label}
                      </a>
                    ))}
                  </div>
                </div>
                <div className="rounded-3xl bg-secondary p-5">
                  <p className="font-display text-2xl text-foreground">Made-to-order studio</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Pick yarn colours, names, tiny charms, gift wrapping, and delivery notes before
                    placing an order request.
                  </p>
                </div>
                <div className="rounded-3xl bg-primary p-5 text-primary-foreground">
                  <p className="font-display text-2xl">Fresh batch</p>
                  <p className="mt-2 text-sm text-primary-foreground/80">
                    Bouquets, bows, and pocket pals are ready for gifting this week.
                  </p>
                  <a
                    href="#shop"
                    className="mt-5 inline-flex rounded-full bg-card px-4 py-2 text-sm font-semibold text-primary"
                  >
                    Browse now
                  </a>
                </div>
              </div>
            </div>
          </div>

          <ul className="hidden items-center gap-7 lg:flex">
            {links.slice(1).map((link) => (
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
            href="#shop"
            className="flex max-w-xs flex-1 items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary"
          >
            <Search size={16} />
            Search bows, bouquets, bunnies
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
          <ul className="flex flex-col gap-3">
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
            <button
              type="button"
              onClick={async () => {
                if (user) await loadOrders();
                setOrdersOpen(true);
                setOpen(false);
              }}
              className="col-span-2 rounded-full border border-border px-4 py-3 text-sm font-semibold text-foreground"
            >
              My Orders
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
