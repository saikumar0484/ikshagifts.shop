import { Clock, PackageCheck, Truck, X } from "lucide-react";
import { formatPrice } from "@/data/products";
import { CustomerOrder, OrderStatus, useCommerce } from "@/lib/commerce";

const steps: Array<{ status: OrderStatus; label: string }> = [
  { status: "order_placed", label: "Placed" },
  { status: "confirmed", label: "Confirmed" },
  { status: "making", label: "Making" },
  { status: "packed", label: "Packed" },
  { status: "shipped", label: "Shipped" },
  { status: "out_for_delivery", label: "Out for delivery" },
  { status: "delivered", label: "Delivered" },
];

function progressIndex(order: CustomerOrder) {
  if (order.status === "cancelled") return -1;
  return steps.findIndex((step) => step.status === order.status);
}

export function OrdersDrawer() {
  const { orders, ordersOpen, setOrdersOpen, loadOrders, user } = useCommerce();

  return (
    <div
      className={`fixed inset-0 z-40 transition ${ordersOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!ordersOpen}
    >
      <div
        className={`absolute inset-0 bg-foreground/25 backdrop-blur-sm transition-opacity ${
          ordersOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => setOrdersOpen(false)}
      />
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-2xl flex-col border-l border-border bg-card shadow-soft transition-transform duration-300 ${
          ordersOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-primary">My Orders</p>
            <h2 className="font-display text-3xl text-foreground">Track your gifts</h2>
          </div>
          <button
            type="button"
            onClick={() => setOrdersOpen(false)}
            className="grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:text-primary"
            aria-label="Close orders"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {!user ? (
            <div className="grid h-full place-items-center text-center">
              <p className="font-display text-2xl text-foreground">Log in to view your orders</p>
            </div>
          ) : !orders.length ? (
            <div className="grid h-full place-items-center text-center">
              <div>
                <PackageCheck className="mx-auto text-primary" size={38} />
                <p className="mt-4 font-display text-2xl text-foreground">No orders yet</p>
                <button
                  type="button"
                  onClick={loadOrders}
                  className="mt-4 rounded-full border border-border px-5 py-2 text-sm font-semibold text-foreground"
                >
                  Refresh orders
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {orders.map((order) => {
                const active = progressIndex(order);
                return (
                  <article
                    key={order.id}
                    className="rounded-[1.5rem] border border-border bg-background p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-primary">
                          Order {order.id}
                        </p>
                        <h3 className="mt-1 font-display text-2xl text-foreground">
                          {formatPrice(order.amount)}
                        </h3>
                      </div>
                      <div className="rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground">
                        {order.status.replaceAll("_", " ")}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
                      <span className="inline-flex items-center gap-2">
                        <Clock size={15} /> ETA {order.estimated_delivery || "soon"}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <Truck size={15} /> Tracking {order.tracking_number || "pending"}
                      </span>
                      <span>Payment {order.payment_status}</span>
                    </div>

                    <div className="mt-5 grid grid-cols-7 gap-2">
                      {steps.map((step, index) => (
                        <div key={step.status} className="min-w-0">
                          <div
                            className={`h-2 rounded-full ${
                              active >= index ? "bg-primary" : "bg-border"
                            }`}
                          />
                          <p className="mt-2 truncate text-[11px] text-muted-foreground">
                            {step.label}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 rounded-2xl bg-card p-4">
                      <p className="text-sm font-semibold text-foreground">Items</p>
                      <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                        {order.items.map((item) => (
                          <div key={item.productId} className="flex justify-between gap-3">
                            <span>
                              {item.name} x {item.quantity}
                            </span>
                            <span>{formatPrice(item.lineTotal)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
