import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { formatPrice } from "@/data/products";
import { useCommerce } from "@/lib/commerce";

export function CartDrawer() {
  const {
    cart,
    cartOpen,
    checkout,
    cartTotal,
    setCartOpen,
    updateQuantity,
    removeFromCart,
    placeOrder,
    getProduct,
  } = useCommerce();

  return (
    <div
      className={`fixed inset-0 z-40 transition ${cartOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!cartOpen}
    >
      <div
        className={`absolute inset-0 bg-foreground/25 backdrop-blur-sm transition-opacity ${
          cartOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => setCartOpen(false)}
      />
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-soft transition-transform duration-300 ${
          cartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-primary">Cart</p>
            <h2 className="font-display text-3xl text-foreground">Your gift bag</h2>
          </div>
          <button
            type="button"
            onClick={() => setCartOpen(false)}
            className="grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:text-primary"
            aria-label="Close cart"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {!cart.length ? (
            <div className="grid h-full place-items-center text-center">
              <div>
                <ShoppingBag className="mx-auto text-primary" size={36} />
                <p className="mt-4 font-display text-2xl text-foreground">Your cart is empty</p>
                <p className="mt-2 text-sm text-muted-foreground">Add a handmade piece to begin.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((line) => {
                const product = getProduct(line.productId);
                if (!product) return null;
                return (
                  <article
                    key={line.productId}
                    className="grid grid-cols-[84px_1fr] gap-4 rounded-3xl bg-background p-3"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-24 w-[84px] rounded-2xl object-cover"
                      width={168}
                      height={192}
                    />
                    <div className="min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-display text-xl text-foreground">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatPrice(product.price)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(line.productId)}
                          className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
                          aria-label={`Remove ${product.name}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <div className="flex items-center rounded-full border border-border">
                          <button
                            type="button"
                            onClick={() => updateQuantity(line.productId, line.quantity - 1)}
                            className="grid h-9 w-9 place-items-center"
                            aria-label={`Decrease ${product.name}`}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold">
                            {line.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(line.productId, line.quantity + 1)}
                            className="grid h-9 w-9 place-items-center"
                            aria-label={`Increase ${product.name}`}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <span className="font-display text-lg text-primary">
                          {formatPrice(product.price * line.quantity)}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-border p-6">
          {checkout.message && (
            <p
              className={`mb-4 rounded-2xl px-4 py-3 text-sm ${
                checkout.status === "error"
                  ? "bg-destructive/10 text-destructive"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {checkout.message}
            </p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Subtotal</span>
            <span className="font-display text-2xl text-foreground">{formatPrice(cartTotal)}</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Shipping and customisation notes are confirmed after checkout.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Online payment is paused until Razorpay verification is complete.
          </p>
          <button
            type="button"
            disabled={!cart.length || checkout.status === "loading"}
            onClick={placeOrder}
            className="mt-5 w-full rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.01] disabled:opacity-60"
          >
            {checkout.status === "loading" ? "Creating order..." : "Place order request"}
          </button>
        </div>
      </aside>
    </div>
  );
}
