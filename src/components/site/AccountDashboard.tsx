import { FormEvent, useEffect, useState } from "react";
import { LogOut, PackageCheck, Pencil, UserRound } from "lucide-react";
import { formatPrice } from "@/data/products";
import { CustomerOrder, useCommerce } from "@/lib/commerce";

const statusLabels: Record<string, string> = {
  order_placed: "Order Placed",
  confirmed: "Processing",
  making: "Processing",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

async function accountApi<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(path, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Account request failed.");
  return data as T;
}

export function AccountDashboard() {
  const { user, openAuth, logout, updateProfile } = useCommerce();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [firstName, setFirstName] = useState(user?.name || "");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      openAuth("login");
      return;
    }
    setFirstName(user.name);
    accountApi<{ orders: CustomerOrder[] }>("/api/auth/me?action=account")
      .then((data) => setOrders(data.orders || []))
      .catch((error) => setMessage(error instanceof Error ? error.message : "Unable to load."));
  }, [openAuth, user]);

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await updateProfile({ firstName });
      setMessage("Profile updated.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Profile could not be updated.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <section className="min-h-screen bg-[#F3E8E2] px-5 py-20 text-center text-[#2E2320]">
        <h1 className="font-display text-4xl">Login to continue</h1>
        <button
          type="button"
          onClick={() => openAuth("login")}
          className="mt-6 rounded-full bg-[#2E2320] px-6 py-3 text-sm font-semibold text-[#F3E8E2]"
        >
          Open OTP Login
        </button>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#F3E8E2] px-5 py-8 text-[#2E2320]">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#8B6F5A]">My Account</p>
            <h1 className="mt-2 font-display text-4xl">Welcome, {user.name}</h1>
          </div>
          <button
            type="button"
            onClick={async () => {
              await logout();
              window.history.pushState(null, "", "/");
              window.dispatchEvent(new PopStateEvent("popstate"));
            }}
            className="inline-flex items-center gap-2 rounded-full border border-[#C6A769]/60 px-5 py-3 text-sm font-semibold"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        {message && (
          <p className="mt-6 rounded-2xl bg-white/60 px-4 py-3 text-sm text-[#2E2320]">{message}</p>
        )}

        <div className="mt-8 grid gap-5 lg:grid-cols-[0.85fr_1.4fr]">
          <article className="rounded-[1.5rem] border border-[#C6A769]/35 bg-white/55 p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-[#2E2320] text-[#F3E8E2]">
                <UserRound size={18} />
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#8B6F5A]">Profile</p>
                <h2 className="font-display text-2xl">Your details</h2>
              </div>
            </div>

            <form onSubmit={saveProfile} className="mt-5 space-y-4">
              <label className="block text-sm font-medium">
                First Name
                <div className="mt-2 flex items-center gap-2 rounded-2xl border border-[#C6A769]/45 bg-[#F3E8E2]/70 px-4 py-3">
                  <Pencil size={15} className="text-[#8B6F5A]" />
                  <input
                    required
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </label>
              <label className="block text-sm font-medium">
                Email Address
                <input
                  readOnly
                  value={user.email}
                  className="mt-2 w-full rounded-2xl border border-[#C6A769]/45 bg-[#F3E8E2]/70 px-4 py-3 text-sm text-[#8B6F5A] outline-none"
                />
              </label>
              <p className="text-xs leading-6 text-[#8B6F5A]">
                Email changes require fresh OTP verification.
              </p>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-[#2E2320] px-5 py-3 text-sm font-semibold text-[#F3E8E2] disabled:opacity-60"
              >
                {loading ? "Saving..." : "Save Name"}
              </button>
            </form>
          </article>

          <article className="rounded-[1.5rem] border border-[#C6A769]/35 bg-white/55 p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-[#C6A769] text-[#2E2320]">
                <PackageCheck size={18} />
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#8B6F5A]">My Orders</p>
                <h2 className="font-display text-2xl">Track orders</h2>
              </div>
            </div>

            <div className="mt-5 overflow-x-auto">
              {!orders.length ? (
                <p className="rounded-2xl bg-[#F3E8E2]/70 px-4 py-8 text-center text-sm text-[#8B6F5A]">
                  No orders yet.
                </p>
              ) : (
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-[0.16em] text-[#8B6F5A]">
                    <tr>
                      <th className="py-3">Order ID</th>
                      <th className="py-3">Product Name</th>
                      <th className="py-3">Amount</th>
                      <th className="py-3">Payment</th>
                      <th className="py-3">Status</th>
                      <th className="py-3">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#C6A769]/25">
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td className="py-3 font-semibold">{order.id}</td>
                        <td className="py-3">
                          {order.items.map((item) => item.name).join(", ") || "Gift order"}
                        </td>
                        <td className="py-3">{formatPrice(order.amount)}</td>
                        <td className="py-3 capitalize">{order.payment_status}</td>
                        <td className="py-3">{statusLabels[order.status] || "Processing"}</td>
                        <td className="py-3">
                          {new Date(order.created_at).toLocaleDateString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
