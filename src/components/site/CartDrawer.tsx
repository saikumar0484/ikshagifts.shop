import { FormEvent, useEffect, useMemo, useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { formatPrice } from "@/data/products";
import { CheckoutDetails, useCommerce } from "@/lib/commerce";

const validCouponCode = "IKSHA150";
const couponDiscountAmount = 150;

export function CartDrawer() {
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [details, setDetails] = useState<CheckoutDetails>({
    name: "",
    mobile: "",
    address: "",
    pinCode: "",
    paymentMethod: "online",
  });
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

  const cartDiscount = useMemo(() => {
    if (appliedCoupon !== validCouponCode || cartTotal <= 0) return 0;
    return Math.min(couponDiscountAmount, cartTotal);
  }, [appliedCoupon, cartTotal]);

  const finalTotal = Math.max(0, cartTotal - cartDiscount);

  useEffect(() => {
    if (!cart.length) {
      setCouponInput("");
      setAppliedCoupon("");
      setCouponMessage("");
      setShowCheckoutForm(false);
    }
  }, [cart.length]);

  const updateDetails = (field: keyof CheckoutDetails, value: string) => {
    setDetails((current) => ({ ...current, [field]: value }));
  };

  const applyCoupon = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = couponInput.trim().toUpperCase();
    if (!normalized) {
      setCouponMessage("Enter a coupon code.");
      setAppliedCoupon("");
      return;
    }
    if (normalized !== validCouponCode) {
      setCouponMessage("Invalid coupon code.");
      setAppliedCoupon("");
      return;
    }
    setAppliedCoupon(normalized);
    setCouponInput(normalized);
    setCouponMessage(`Coupon applied. You saved ${formatPrice(couponDiscountAmount)}.`);
  };

  const submitOrder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    placeOrder(appliedCoupon, details);
  };

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
        className={`absolute right-0 top-0 flex h-dvh w-full max-w-md flex-col overflow-hidden border-l border-border bg-card shadow-soft transition-transform duration-300 ${
          cartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="shrink-0 flex items-center justify-between border-b border-border px-6 py-5">
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

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {!cart.length ? (
            <div className="grid min-h-[60dvh] place-items-center text-center">
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
                const stockLimit = product.stockQuantity ?? 25;
                const quantityAtLimit = line.quantity >= stockLimit;
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
                        <div>
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
                              disabled={quantityAtLimit}
                              className="grid h-9 w-9 place-items-center disabled:cursor-not-allowed disabled:text-muted-foreground/45"
                              aria-label={`Increase ${product.name}`}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          {product.stockQuantity !== undefined && (
                            <p className="mt-1 text-[11px] text-muted-foreground">
                              {quantityAtLimit
                                ? `Only ${stockLimit} available`
                                : `${stockLimit} available`}
                            </p>
                          )}
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

          {cart.length > 0 && (
            <div className="mt-6 border-t border-border pt-5">
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
                <span className="font-display text-2xl text-foreground">
                  {formatPrice(cartTotal)}
                </span>
              </div>
              <form onSubmit={applyCoupon} className="mt-4 rounded-2xl bg-background p-3">
                <label className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Coupon code
                </label>
                <div className="mt-2 flex gap-2">
                  <input
                    value={couponInput}
                    onChange={(event) => setCouponInput(event.target.value)}
                    placeholder="Enter coupon"
                    className="min-w-0 flex-1 rounded-full border border-border bg-card px-4 py-2 text-sm outline-none focus:border-primary"
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-background"
                  >
                    Apply
                  </button>
                </div>
                {couponMessage && (
                  <p
                    className={`mt-2 text-xs ${
                      appliedCoupon ? "text-primary" : "text-destructive"
                    }`}
                  >
                    {couponMessage}
                  </p>
                )}
              </form>
              {cartDiscount > 0 && (
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Discount ({appliedCoupon})</span>
                  <span className="font-display text-xl text-primary">
                    -{formatPrice(cartDiscount)}
                  </span>
                </div>
              )}
              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <span className="text-sm font-semibold text-foreground">Total bill</span>
                <span className="font-display text-3xl text-foreground">
                  {formatPrice(finalTotal)}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Shipping and customisation notes are confirmed after checkout.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                UPI and card payments open securely through Razorpay.
              </p>
              {showCheckoutForm && (
                <form
                  onSubmit={submitOrder}
                  className="mt-5 grid gap-3 rounded-2xl bg-background p-4"
                >
                  <label className="text-sm font-medium text-foreground">
                    Name
                    <input
                      value={details.name}
                      onChange={(event) => updateDetails("name", event.target.value)}
                      required
                      className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary"
                    />
                  </label>
                  <label className="text-sm font-medium text-foreground">
                    Mobile Number
                    <input
                      value={details.mobile}
                      onChange={(event) => updateDetails("mobile", event.target.value)}
                      required
                      inputMode="tel"
                      pattern="[0-9+\\-\\s]{10,16}"
                      className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary"
                    />
                  </label>
                  <label className="text-sm font-medium text-foreground">
                    Address
                    <textarea
                      value={details.address}
                      onChange={(event) => updateDetails("address", event.target.value)}
                      required
                      minLength={8}
                      className="mt-1.5 min-h-20 w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary"
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="text-sm font-medium text-foreground">
                      Pin Code
                      <input
                        value={details.pinCode}
                        onChange={(event) => updateDetails("pinCode", event.target.value)}
                        required
                        inputMode="numeric"
                        pattern="[0-9]{6}"
                        className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary"
                      />
                    </label>
                    <label className="text-sm font-medium text-foreground">
                      Payment
                      <select
                        value={details.paymentMethod}
                        onChange={(event) =>
                          updateDetails(
                            "paymentMethod",
                            event.target.value as CheckoutDetails["paymentMethod"],
                          )
                        }
                        className="mt-1.5 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
                      >
                        <option value="online">Pay With UPI / Cards</option>
                        <option value="upi">UPI after confirmation</option>
                        <option value="cod">Cash on delivery</option>
                      </select>
                    </label>
                  </div>
                  <button
                    type="submit"
                    disabled={checkout.status === "loading"}
                    className="mt-2 w-full rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.01] disabled:opacity-60"
                  >
                    {checkout.status === "loading" ? "Placing order..." : "Place Your Order"}
                  </button>
                </form>
              )}
              {!showCheckoutForm && (
                <button
                  type="button"
                  disabled={checkout.status === "loading"}
                  onClick={() => setShowCheckoutForm(true)}
                  className="mt-5 w-full rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.01] disabled:opacity-60"
                >
                  Place Your Order
                </button>
              )}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
