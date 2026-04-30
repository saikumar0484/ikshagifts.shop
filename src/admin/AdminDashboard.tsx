import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Boxes,
  CheckCircle2,
  ClipboardList,
  IndianRupee,
  KeyRound,
  LogOut,
  Mail,
  MessageCircle,
  PackageCheck,
  Plug,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  Smartphone,
  Users,
} from "lucide-react";
import { formatPrice } from "@/data/products";

type ProductRow = {
  id: string;
  name: string;
  category: string;
  tag: string;
  description: string;
  image_url: string | null;
  price: number;
  old_price: number | null;
  rating: number;
  delivery: string;
  stock_quantity: number;
  is_available: boolean;
  is_featured: boolean;
  sort_order: number;
};

type CustomerRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  orderCount?: number;
  lifetimeValue?: number;
  lastOrderAt?: string | null;
};

type OrderRow = {
  id: string;
  amount: number;
  currency: string;
  items: Array<{ name: string; quantity: number; lineTotal: number }>;
  status: string;
  payment_status: string;
  tracking_number: string | null;
  estimated_delivery: string | null;
  created_at: string;
  customer: CustomerRow | null;
};

type Summary = {
  metrics: {
    totalOrders: number;
    recentOrders: number;
    totalCustomers: number;
    totalProducts: number;
    activeProducts: number;
    lowStockProducts: number;
    revenue: number;
    paidRevenue: number;
    pendingOrders: number;
  };
  byStatus: Record<string, number>;
  lowStock: ProductRow[];
  recentOrders: OrderRow[];
};

type IntegrationView = {
  key: "email" | "whatsapp";
  label: string;
  provider: string;
  enabled: boolean;
  status: "ready" | "needs_setup" | "manual";
  publicConfig: Record<string, string>;
  secrets: Record<string, { configured: boolean; masked: string }>;
  updatedAt: string | null;
};

type IntegrationDraft = {
  provider: string;
  enabled: boolean;
  publicConfig: Record<string, string>;
  secrets: Record<string, string>;
};

const emptyProduct: ProductRow = {
  id: "",
  name: "",
  category: "Bouquets",
  tag: "New",
  description: "",
  image_url: "",
  price: 0,
  old_price: null,
  rating: 4.8,
  delivery: "Ships in 4-6 days",
  stock_quantity: 1,
  is_available: true,
  is_featured: false,
  sort_order: 100,
};

const statuses = [
  "order_placed",
  "confirmed",
  "making",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

async function api<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(path, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed.");
  return data as T;
}

function whatsappLink(phone: string, message: string) {
  const normalized = phone.replace(/[^\d]/g, "");
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: typeof BarChart3;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon size={18} className="text-primary" />
      </div>
      <p className="mt-3 font-display text-3xl text-foreground">{value}</p>
    </div>
  );
}

export function AdminDashboard() {
  const [admin, setAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("overview");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationView[]>([]);
  const [integrationDrafts, setIntegrationDrafts] = useState<Record<string, IntegrationDraft>>({});
  const [productDraft, setProductDraft] = useState<ProductRow>(emptyProduct);
  const [orderSearch, setOrderSearch] = useState("");
  const [statusDraft, setStatusDraft] = useState<Record<string, string>>({});
  const [trackingDraft, setTrackingDraft] = useState<Record<string, string>>({});
  const [deliveryDraft, setDeliveryDraft] = useState<Record<string, string>>({});

  const loadAll = async () => {
    setError("");
    const [summaryData, productData, orderData, customerData, integrationData] = await Promise.all([
      api<Summary>("/api/admin?action=summary"),
      api<{ products: ProductRow[] }>("/api/admin?action=products"),
      api<{ orders: OrderRow[] }>("/api/admin?action=orders"),
      api<{ customers: CustomerRow[] }>("/api/admin?action=customers"),
      api<{ integrations: IntegrationView[] }>("/api/admin?action=integrations"),
    ]);
    setSummary(summaryData);
    setProducts(productData.products);
    setOrders(orderData.orders);
    setCustomers(customerData.customers);
    setIntegrations(integrationData.integrations);
    setIntegrationDrafts(
      Object.fromEntries(
        integrationData.integrations.map((integration) => [
          integration.key,
          {
            provider: integration.provider,
            enabled: integration.enabled,
            publicConfig: Object.fromEntries(
              Object.entries(integration.publicConfig || {}).map(([key, value]) => [
                key,
                String(value ?? ""),
              ]),
            ),
            secrets: {},
          },
        ]),
      ),
    );
  };

  useEffect(() => {
    api<{ admin: boolean }>("/api/admin?action=me")
      .then(async (data) => {
        setAdmin(data.admin);
        if (data.admin) await loadAll();
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const filteredOrders = useMemo(() => {
    const term = orderSearch.toLowerCase();
    return orders.filter((order) => {
      const text = `${order.id} ${order.customer?.name || ""} ${order.customer?.phone || ""} ${order.status}`;
      return text.toLowerCase().includes(term);
    });
  }, [orders, orderSearch]);

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      await api("/api/admin?action=login", {
        method: "POST",
        body: JSON.stringify({
          email: String(form.get("email") || ""),
          password: String(form.get("password") || ""),
        }),
      });
      setAdmin(true);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Admin login failed.");
    }
  };

  const logout = async () => {
    await api("/api/admin?action=logout", { method: "POST" }).catch(() => undefined);
    setAdmin(false);
  };

  const saveProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    try {
      await api("/api/admin?action=products", {
        method: productDraft.id ? "POST" : "POST",
        body: JSON.stringify(productDraft),
      });
      setProductDraft(emptyProduct);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Product could not be saved.");
    }
  };

  const updateOrderStatus = async (order: OrderRow) => {
    setError("");
    try {
      await api("/api/admin?action=order-status", {
        method: "POST",
        body: JSON.stringify({
          orderId: order.id,
          status: statusDraft[order.id] || order.status,
          trackingNumber: trackingDraft[order.id] ?? order.tracking_number ?? "",
          estimatedDelivery: deliveryDraft[order.id] ?? order.estimated_delivery ?? "",
          note: `Updated to ${statusDraft[order.id] || order.status}`,
        }),
      });
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Order status could not be updated.");
    }
  };

  const updateIntegrationDraft = (
    key: string,
    patch: Partial<IntegrationDraft> & {
      publicConfig?: Record<string, string>;
      secrets?: Record<string, string>;
    },
  ) => {
    setIntegrationDrafts((current) => ({
      ...current,
      [key]: {
        ...(current[key] || { provider: "", enabled: false, publicConfig: {}, secrets: {} }),
        ...patch,
        publicConfig: {
          ...(current[key]?.publicConfig || {}),
          ...(patch.publicConfig || {}),
        },
        secrets: {
          ...(current[key]?.secrets || {}),
          ...(patch.secrets || {}),
        },
      },
    }));
  };

  const saveIntegration = async (integration: IntegrationView) => {
    setError("");
    try {
      const draft = integrationDrafts[integration.key];
      await api("/api/admin?action=integrations", {
        method: "POST",
        body: JSON.stringify({ key: integration.key, ...draft }),
      });
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Integration could not be saved.");
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-foreground">
        Loading admin...
      </div>
    );
  }

  if (!admin) {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-4">
        <form
          onSubmit={login}
          className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-soft"
        >
          <p className="text-xs uppercase tracking-[0.25em] text-primary">iksha gifts admin</p>
          <h1 className="mt-3 font-display text-4xl text-foreground">Owner login</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Sign in with the owner email and password saved for your business dashboard.
          </p>
          <label className="mt-8 block text-sm font-medium text-foreground">
            Owner email
            <input
              name="email"
              type="email"
              autoComplete="username"
              required
              className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 outline-none focus:border-primary"
            />
          </label>
          <label className="mt-4 block text-sm font-medium text-foreground">
            Password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 outline-none focus:border-primary"
            />
          </label>
          {error && (
            <p className="mt-4 rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          )}
          <button className="mt-6 w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
            Open dashboard
          </button>
        </form>
      </main>
    );
  }

  const navItems = [
    ["overview", BarChart3, "Overview"],
    ["orders", ClipboardList, "Orders"],
    ["products", Boxes, "Products"],
    ["customers", Users, "Customers"],
    ["integrations", Plug, "Integrations"],
    ["settings", Settings, "Growth"],
  ] as const;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-primary">iksha gifts admin</p>
            <h1 className="font-display text-3xl text-foreground">Business control room</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {navItems.map(([id, Icon, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                  tab === id ? "bg-primary text-primary-foreground" : "bg-card text-foreground"
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
            <button
              type="button"
              onClick={loadAll}
              className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-primary"
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
            <button
              type="button"
              onClick={logout}
              className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-primary"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8">
        {error && (
          <p className="mb-5 rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        {tab === "overview" && summary && (
          <section className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Revenue requested"
                value={formatPrice(summary.metrics.revenue)}
                icon={IndianRupee}
              />
              <StatCard label="Orders" value={summary.metrics.totalOrders} icon={PackageCheck} />
              <StatCard label="Customers" value={summary.metrics.totalCustomers} icon={Users} />
              <StatCard label="Low stock" value={summary.metrics.lowStockProducts} icon={Boxes} />
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              <section className="rounded-2xl border border-border bg-card p-6">
                <h2 className="font-display text-2xl">Order pipeline</h2>
                <div className="mt-5 grid gap-3">
                  {Object.entries(summary.byStatus).map(([status, count]) => (
                    <div
                      key={status}
                      className="flex items-center justify-between rounded-xl bg-background px-4 py-3"
                    >
                      <span className="capitalize">{status.replaceAll("_", " ")}</span>
                      <span className="font-semibold text-primary">{count}</span>
                    </div>
                  ))}
                </div>
              </section>
              <section className="rounded-2xl border border-border bg-card p-6">
                <h2 className="font-display text-2xl">Low stock watch</h2>
                <div className="mt-5 grid gap-3">
                  {summary.lowStock.length ? (
                    summary.lowStock.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => {
                          setProductDraft(product);
                          setTab("products");
                        }}
                        className="flex items-center justify-between rounded-xl bg-background px-4 py-3 text-left"
                      >
                        <span>{product.name}</span>
                        <span className="font-semibold text-primary">
                          {product.stock_quantity} left
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No urgent low-stock items.</p>
                  )}
                </div>
              </section>
            </div>
          </section>
        )}

        {tab === "orders" && (
          <section className="space-y-5">
            <label className="flex max-w-xl items-center gap-3 rounded-full border border-border bg-card px-5 py-3 text-sm text-muted-foreground">
              <Search size={18} />
              <input
                value={orderSearch}
                onChange={(event) => setOrderSearch(event.target.value)}
                placeholder="Search order, customer, phone, status"
                className="w-full bg-transparent outline-none"
              />
            </label>
            <div className="grid gap-4">
              {filteredOrders.map((order) => (
                <article key={order.id} className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h2 className="font-display text-2xl">{order.id}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {order.customer?.name || "Unknown customer"} ·{" "}
                        {order.customer?.phone || "No phone"} · {formatPrice(order.amount)}
                      </p>
                      <p className="mt-2 text-sm capitalize text-primary">
                        {order.status.replaceAll("_", " ")} · {order.payment_status}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {order.customer?.phone && (
                        <a
                          href={whatsappLink(
                            order.customer.phone,
                            `Hi ${order.customer.name}, your iksha gifts order ${order.id} is now ${order.status.replaceAll("_", " ")}.`,
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-full bg-[#1f7a4d] px-4 py-2 text-sm font-semibold text-white"
                        >
                          <MessageCircle size={16} />
                          WhatsApp
                        </a>
                      )}
                      <select
                        value={statusDraft[order.id] || order.status}
                        onChange={(event) =>
                          setStatusDraft((current) => ({
                            ...current,
                            [order.id]: event.target.value,
                          }))
                        }
                        className="rounded-full border border-border bg-background px-4 py-2 text-sm"
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status.replaceAll("_", " ")}
                          </option>
                        ))}
                      </select>
                      <input
                        value={trackingDraft[order.id] ?? order.tracking_number ?? ""}
                        onChange={(event) =>
                          setTrackingDraft((current) => ({
                            ...current,
                            [order.id]: event.target.value,
                          }))
                        }
                        placeholder="Tracking number"
                        className="rounded-full border border-border bg-background px-4 py-2 text-sm"
                      />
                      <input
                        type="date"
                        value={deliveryDraft[order.id] ?? order.estimated_delivery ?? ""}
                        onChange={(event) =>
                          setDeliveryDraft((current) => ({
                            ...current,
                            [order.id]: event.target.value,
                          }))
                        }
                        className="rounded-full border border-border bg-background px-4 py-2 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => updateOrderStatus(order)}
                        className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                      >
                        Update
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
                    {order.items?.map((item, index) => (
                      <div
                        key={`${order.id}-${index}`}
                        className="flex justify-between rounded-xl bg-background px-4 py-2"
                      >
                        <span>
                          {item.name} x {item.quantity}
                        </span>
                        <span>{formatPrice(item.lineTotal || 0)}</span>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {tab === "products" && (
          <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
            <form onSubmit={saveProduct} className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-display text-2xl">
                {productDraft.id ? "Edit product" : "Add product"}
              </h2>
              <div className="mt-5 grid gap-3">
                {[
                  ["name", "Name"],
                  ["category", "Category"],
                  ["tag", "Badge"],
                  ["image_url", "Image URL"],
                  ["delivery", "Delivery text"],
                ].map(([key, label]) => (
                  <label key={key} className="text-sm font-medium">
                    {label}
                    <input
                      value={String(productDraft[key as keyof ProductRow] ?? "")}
                      onChange={(event) =>
                        setProductDraft((current) => ({ ...current, [key]: event.target.value }))
                      }
                      className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:border-primary"
                    />
                  </label>
                ))}
                <label className="text-sm font-medium">
                  Description
                  <textarea
                    value={productDraft.description}
                    onChange={(event) =>
                      setProductDraft((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    className="mt-1 min-h-24 w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:border-primary"
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["price", "Price"],
                    ["old_price", "Compare price"],
                    ["stock_quantity", "Stock"],
                    ["sort_order", "Sort"],
                  ].map(([key, label]) => (
                    <label key={key} className="text-sm font-medium">
                      {label}
                      <input
                        type="number"
                        value={Number(productDraft[key as keyof ProductRow] ?? 0)}
                        onChange={(event) =>
                          setProductDraft((current) => ({
                            ...current,
                            [key]: Number(event.target.value),
                          }))
                        }
                        className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:border-primary"
                      />
                    </label>
                  ))}
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={productDraft.is_available}
                    onChange={(event) =>
                      setProductDraft((current) => ({
                        ...current,
                        is_available: event.target.checked,
                      }))
                    }
                  />
                  Available in shop
                </label>
                <button className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
                  <Plus size={16} />
                  Save product
                </button>
              </div>
            </form>
            <div className="grid gap-3">
              {products.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => setProductDraft(product)}
                  className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 text-left md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <h3 className="font-display text-xl">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {product.category} · {formatPrice(product.price)} · {product.stock_quantity}{" "}
                      in stock
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${product.is_available ? "bg-secondary" : "bg-destructive/10 text-destructive"}`}
                  >
                    {product.is_available ? "Available" : "Hidden"}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {tab === "customers" && (
          <section className="grid gap-3">
            {customers.map((customer) => (
              <article
                key={customer.id}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <h2 className="font-display text-xl">{customer.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {customer.email} · {customer.phone}
                  </p>
                  <p className="mt-1 text-sm text-primary">
                    {customer.orderCount || 0} orders · {formatPrice(customer.lifetimeValue || 0)}
                  </p>
                </div>
                <a
                  href={whatsappLink(
                    customer.phone,
                    `Hi ${customer.name}, thank you for shopping with iksha gifts.`,
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1f7a4d] px-4 py-2 text-sm font-semibold text-white"
                >
                  <MessageCircle size={16} />
                  WhatsApp
                </a>
              </article>
            ))}
          </section>
        )}

        {tab === "integrations" && (
          <section className="grid gap-5 xl:grid-cols-2">
            {integrations.map((integration) => {
              const draft = integrationDrafts[integration.key] || {
                provider: integration.provider,
                enabled: integration.enabled,
                publicConfig: {},
                secrets: {},
              };
              const isEmail = integration.key === "email";
              return (
                <article key={integration.key} className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex gap-3">
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-secondary text-primary">
                        {isEmail ? <Mail size={20} /> : <Smartphone size={20} />}
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-primary">
                          {integration.key}
                        </p>
                        <h2 className="font-display text-2xl">{integration.label}</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {integration.status === "ready"
                            ? "Configured and ready for server-side use."
                            : integration.status === "manual"
                              ? "Manual WhatsApp links are active. Automated OTP needs a provider API."
                              : "Needs provider credentials before it can send messages."}
                        </p>
                      </div>
                    </div>
                    <label className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm">
                      <input
                        type="checkbox"
                        checked={draft.enabled}
                        onChange={(event) =>
                          updateIntegrationDraft(integration.key, { enabled: event.target.checked })
                        }
                      />
                      Enabled
                    </label>
                  </div>

                  <div className="mt-6 grid gap-4">
                    <label className="text-sm font-medium">
                      Provider
                      <select
                        value={draft.provider}
                        onChange={(event) =>
                          updateIntegrationDraft(integration.key, { provider: event.target.value })
                        }
                        className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:border-primary"
                      >
                        {isEmail ? (
                          <>
                            <option value="resend">Resend</option>
                            <option value="smtp">SMTP</option>
                            <option value="sendgrid">SendGrid</option>
                          </>
                        ) : (
                          <>
                            <option value="manual">Manual WhatsApp links</option>
                            <option value="whatsapp_cloud">WhatsApp Cloud API</option>
                            <option value="aisensy">AiSensy</option>
                            <option value="twilio">Twilio WhatsApp</option>
                          </>
                        )}
                      </select>
                    </label>

                    {isEmail ? (
                      <>
                        <div className="grid gap-3 md:grid-cols-2">
                          <label className="text-sm font-medium">
                            From name
                            <input
                              value={draft.publicConfig.fromName || ""}
                              onChange={(event) =>
                                updateIntegrationDraft(integration.key, {
                                  publicConfig: { fromName: event.target.value },
                                })
                              }
                              className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:border-primary"
                            />
                          </label>
                          <label className="text-sm font-medium">
                            From email
                            <input
                              value={draft.publicConfig.fromEmail || ""}
                              onChange={(event) =>
                                updateIntegrationDraft(integration.key, {
                                  publicConfig: { fromEmail: event.target.value },
                                })
                              }
                              className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:border-primary"
                            />
                          </label>
                        </div>
                        <label className="text-sm font-medium">
                          Reply-to email
                          <input
                            value={draft.publicConfig.replyTo || ""}
                            onChange={(event) =>
                              updateIntegrationDraft(integration.key, {
                                publicConfig: { replyTo: event.target.value },
                              })
                            }
                            className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:border-primary"
                          />
                        </label>
                        <label className="text-sm font-medium">
                          Resend API key
                          <input
                            type="password"
                            value={draft.secrets.resendApiKey || ""}
                            placeholder={
                              integration.secrets.resendApiKey?.configured
                                ? `Saved: ${integration.secrets.resendApiKey.masked}`
                                : "Paste API key"
                            }
                            onChange={(event) =>
                              updateIntegrationDraft(integration.key, {
                                secrets: { resendApiKey: event.target.value },
                              })
                            }
                            className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:border-primary"
                          />
                        </label>
                      </>
                    ) : (
                      <>
                        <div className="grid gap-3 md:grid-cols-2">
                          <label className="text-sm font-medium">
                            Business WhatsApp phone
                            <input
                              value={draft.publicConfig.businessPhone || ""}
                              placeholder="+919876543210"
                              onChange={(event) =>
                                updateIntegrationDraft(integration.key, {
                                  publicConfig: { businessPhone: event.target.value },
                                })
                              }
                              className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:border-primary"
                            />
                          </label>
                          <label className="text-sm font-medium">
                            Default country code
                            <input
                              value={draft.publicConfig.defaultCountryCode || ""}
                              onChange={(event) =>
                                updateIntegrationDraft(integration.key, {
                                  publicConfig: { defaultCountryCode: event.target.value },
                                })
                              }
                              className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:border-primary"
                            />
                          </label>
                        </div>
                        <label className="text-sm font-medium">
                          Order update message template
                          <textarea
                            value={draft.publicConfig.orderTemplate || ""}
                            onChange={(event) =>
                              updateIntegrationDraft(integration.key, {
                                publicConfig: { orderTemplate: event.target.value },
                              })
                            }
                            className="mt-1 min-h-24 w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:border-primary"
                          />
                        </label>
                        <div className="grid gap-3 md:grid-cols-2">
                          <label className="text-sm font-medium">
                            Provider API token
                            <input
                              type="password"
                              value={draft.secrets.apiToken || ""}
                              placeholder={
                                integration.secrets.apiToken?.configured
                                  ? `Saved: ${integration.secrets.apiToken.masked}`
                                  : "Optional for future API provider"
                              }
                              onChange={(event) =>
                                updateIntegrationDraft(integration.key, {
                                  secrets: { apiToken: event.target.value },
                                })
                              }
                              className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:border-primary"
                            />
                          </label>
                          <label className="text-sm font-medium">
                            Sender / phone number ID
                            <input
                              type="password"
                              value={draft.secrets.senderId || ""}
                              placeholder={
                                integration.secrets.senderId?.configured
                                  ? `Saved: ${integration.secrets.senderId.masked}`
                                  : "Optional for Cloud API"
                              }
                              onChange={(event) =>
                                updateIntegrationDraft(integration.key, {
                                  secrets: { senderId: event.target.value },
                                })
                              }
                              className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:border-primary"
                            />
                          </label>
                        </div>
                      </>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-background px-4 py-3 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-2">
                        <KeyRound size={16} />
                        Secrets are encrypted before saving and only masked here.
                      </span>
                      <button
                        type="button"
                        onClick={() => saveIntegration(integration)}
                        className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                      >
                        <Save size={16} />
                        Save
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {tab === "settings" && (
          <section className="grid gap-4 lg:grid-cols-2">
            {[
              "Connect Supabase production environment variables",
              "Add Resend email domain for OTP and order emails",
              "Use WhatsApp quick replies until AiSensy or Twilio is ready",
              "Add courier tracking provider when shipping volume grows",
              "Add Razorpay keys after website verification completes",
              "Review policies with a legal professional before paid ads",
            ].map((item) => (
              <div key={item} className="flex gap-3 rounded-2xl border border-border bg-card p-5">
                <CheckCircle2 className="mt-0.5 text-primary" size={18} />
                <p className="text-sm leading-6 text-muted-foreground">{item}</p>
              </div>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
