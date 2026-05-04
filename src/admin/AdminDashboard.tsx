import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Boxes,
  CheckCircle2,
  ClipboardList,
  IndianRupee,
  Inbox,
  KeyRound,
  LayoutDashboard,
  ListFilter,
  LogOut,
  Mail,
  MessageCircle,
  PackageCheck,
  Pencil,
  Plug,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  Smartphone,
  Trash2,
  Users,
} from "lucide-react";
import { categoryLabel, formatPrice, productCategories, ProductCategory } from "@/data/products";

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
  category_label?: string;
};

type InboxMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
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
  category: "customized_gifts",
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
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationView[]>([]);
  const [integrationDrafts, setIntegrationDrafts] = useState<Record<string, IntegrationDraft>>({});
  const [productDraft, setProductDraft] = useState<ProductRow>(emptyProduct);
  const [productFilter, setProductFilter] = useState<"all" | ProductCategory>("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [statusDraft, setStatusDraft] = useState<Record<string, string>>({});
  const [trackingDraft, setTrackingDraft] = useState<Record<string, string>>({});
  const [deliveryDraft, setDeliveryDraft] = useState<Record<string, string>>({});

  const loadAll = async () => {
    setError("");
    const [summaryData, productData, inboxData, orderData, customerData, integrationData] =
      await Promise.all([
        api<Summary>("/api/admin?action=summary"),
        api<{ products: ProductRow[] }>("/api/admin?action=products"),
        api<{ messages: InboxMessage[] }>("/api/admin?action=inbox"),
        api<{ orders: OrderRow[] }>("/api/admin?action=orders"),
        api<{ customers: CustomerRow[] }>("/api/admin?action=customers"),
        api<{ integrations: IntegrationView[] }>("/api/admin?action=integrations"),
      ]);
    setSummary(summaryData);
    setProducts(productData.products);
    setMessages(inboxData.messages);
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

  const filteredProducts = useMemo(
    () =>
      productFilter === "all"
        ? products
        : products.filter((product) => product.category === productFilter),
    [productFilter, products],
  );

  const unreadMessages = useMemo(
    () => messages.filter((message) => !message.is_read).length,
    [messages],
  );

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
      setTab("product-list");
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Product could not be saved.");
    }
  };

  const deleteProduct = async (product: ProductRow) => {
    if (!window.confirm(`Delete ${product.name}?`)) return;
    setError("");
    try {
      await api("/api/admin?action=products", {
        method: "DELETE",
        body: JSON.stringify({ id: product.id }),
      });
      if (productDraft.id === product.id) setProductDraft(emptyProduct);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Product could not be deleted.");
    }
  };

  const markMessage = async (message: InboxMessage, isRead: boolean) => {
    setError("");
    try {
      await api("/api/admin?action=inbox", {
        method: "PATCH",
        body: JSON.stringify({ id: message.id, isRead }),
      });
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Message could not be updated.");
    }
  };

  const deleteMessage = async (message: InboxMessage) => {
    if (!window.confirm(`Delete message from ${message.name}?`)) return;
    setError("");
    try {
      await api("/api/admin?action=inbox", {
        method: "DELETE",
        body: JSON.stringify({ id: message.id }),
      });
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Message could not be deleted.");
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

  const attachProductImage = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setProductDraft((current) => ({
        ...current,
        image_url: typeof reader.result === "string" ? reader.result : current.image_url,
      }));
    };
    reader.readAsDataURL(file);
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
    ["overview", LayoutDashboard, "Dashboard"],
    ["inbox", Inbox, "Inbox"],
    ["product-add", Plus, "Add Product"],
    ["product-list", Boxes, "Product List"],
    ["orders", ClipboardList, "Orders"],
    ["customers", Users, "Customers"],
    ["integrations", Plug, "Integrations"],
    ["settings", Settings, "Growth"],
  ] as const;

  return (
    <main className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="border-b border-border bg-card/80 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex h-full flex-col gap-5 px-5 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-primary">iksha gifts admin</p>
            <h1 className="mt-2 font-display text-3xl text-foreground">Control room</h1>
          </div>

          <nav className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
            <button
              type="button"
              onClick={() => setTab("overview")}
              className={`inline-flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold ${
                tab === "overview"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-foreground"
              }`}
            >
              <LayoutDashboard size={17} />
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => setTab("inbox")}
              className={`inline-flex shrink-0 items-center justify-between gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold ${
                tab === "inbox"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-foreground"
              }`}
            >
              <span className="inline-flex items-center gap-3">
                <Inbox size={17} />
                Inbox
              </span>
              {unreadMessages > 0 && (
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-foreground">
                  {unreadMessages}
                </span>
              )}
            </button>
            <div className="shrink-0 rounded-xl border border-border bg-background p-2 lg:mt-1">
              <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Products
              </p>
              <div className="flex gap-2 lg:flex-col">
                <button
                  type="button"
                  onClick={() => setTab("product-add")}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${
                    tab === "product-add"
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-secondary"
                  }`}
                >
                  <Plus size={16} />
                  Add Product
                </button>
                <button
                  type="button"
                  onClick={() => setTab("product-list")}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${
                    tab === "product-list"
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-secondary"
                  }`}
                >
                  <Boxes size={16} />
                  Product List
                </button>
              </div>
            </div>
            {navItems.slice(4).map(([id, Icon, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`inline-flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold ${
                  tab === id
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-foreground"
                }`}
              >
                <Icon size={17} />
                {label}
              </button>
            ))}
          </nav>

          <div className="mt-auto hidden gap-2 lg:grid">
            <button
              type="button"
              onClick={loadAll}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold text-primary"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      <div className="px-5 py-6 lg:px-8 lg:py-8">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary">Business workspace</p>
            <h2 className="font-display text-3xl text-foreground">
              {tab === "overview"
                ? "Dashboard"
                : tab === "product-add"
                  ? productDraft.id
                    ? "Edit Product"
                    : "Add Product"
                  : tab === "product-list"
                    ? "Product List"
                    : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </h2>
          </div>
          <div className="flex gap-2 lg:hidden">
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
                          setTab("product-add");
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

        {tab === "inbox" && (
          <section className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <StatCard label="Messages" value={messages.length} icon={Inbox} />
              <StatCard label="Unread" value={unreadMessages} icon={Mail} />
              <StatCard
                label="Latest"
                value={
                  messages[0]
                    ? new Date(messages[0].created_at).toLocaleDateString("en-IN")
                    : "None"
                }
                icon={MessageCircle}
              />
            </div>
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="hidden grid-cols-[1fr_1.2fr_2fr_150px_150px] gap-4 border-b border-border px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground lg:grid">
                <span>Name</span>
                <span>Email</span>
                <span>Message</span>
                <span>Date</span>
                <span>Actions</span>
              </div>
              {messages.length ? (
                messages.map((message) => (
                  <article
                    key={message.id}
                    className={`grid gap-3 border-b border-border px-5 py-4 last:border-b-0 lg:grid-cols-[1fr_1.2fr_2fr_150px_150px] lg:items-center ${
                      message.is_read ? "bg-card" : "bg-secondary/45"
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-foreground">{message.name}</p>
                      <p className="text-xs text-muted-foreground lg:hidden">{message.email}</p>
                    </div>
                    <a
                      className="hidden text-sm text-primary lg:block"
                      href={`mailto:${message.email}`}
                    >
                      {message.email}
                    </a>
                    <p className="text-sm leading-6 text-muted-foreground">{message.message}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(message.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => markMessage(message, !message.is_read)}
                        className="rounded-full border border-border bg-background px-3 py-2 text-xs font-semibold"
                      >
                        {message.is_read ? "Unread" : "Read"}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteMessage(message)}
                        className="grid h-9 w-9 place-items-center rounded-full border border-border bg-background text-destructive"
                        title="Delete message"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <p className="px-5 py-8 text-sm text-muted-foreground">No customer messages yet.</p>
              )}
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

        {tab === "product-add" && (
          <section className="grid gap-6 xl:grid-cols-[minmax(0,620px)_1fr]">
            <form onSubmit={saveProduct} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl">
                    {productDraft.id ? "Edit product" : "Add product"}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Products are stored in one fixed category and fetched from Supabase by category.
                  </p>
                </div>
                {productDraft.id && (
                  <button
                    type="button"
                    onClick={() => setProductDraft(emptyProduct)}
                    className="rounded-full border border-border px-4 py-2 text-sm font-semibold"
                  >
                    New
                  </button>
                )}
              </div>
              <div className="mt-5 grid gap-4">
                <label className="text-sm font-medium">
                  Product Name
                  <input
                    value={productDraft.name}
                    required
                    onChange={(event) =>
                      setProductDraft((current) => ({ ...current, name: event.target.value }))
                    }
                    className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:border-primary"
                  />
                </label>
                <label className="text-sm font-medium">
                  Category
                  <select
                    value={productDraft.category}
                    required
                    onChange={(event) =>
                      setProductDraft((current) => ({
                        ...current,
                        category: event.target.value as ProductCategory,
                      }))
                    }
                    className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:border-primary"
                  >
                    {productCategories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-medium">
                  Description
                  <textarea
                    value={productDraft.description}
                    required
                    onChange={(event) =>
                      setProductDraft((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    className="mt-1 min-h-28 w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:border-primary"
                  />
                </label>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="text-sm font-medium">
                    Price
                    <input
                      type="number"
                      min={0}
                      value={Number(productDraft.price || 0)}
                      required
                      onChange={(event) =>
                        setProductDraft((current) => ({
                          ...current,
                          price: Number(event.target.value),
                        }))
                      }
                      className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:border-primary"
                    />
                  </label>
                  <label className="text-sm font-medium">
                    Compare Price
                    <input
                      type="number"
                      min={0}
                      value={Number(productDraft.old_price || 0)}
                      onChange={(event) =>
                        setProductDraft((current) => ({
                          ...current,
                          old_price: event.target.value ? Number(event.target.value) : null,
                        }))
                      }
                      className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:border-primary"
                    />
                  </label>
                </div>
                <label className="text-sm font-medium">
                  Image URL
                  <input
                    value={productDraft.image_url || ""}
                    onChange={(event) =>
                      setProductDraft((current) => ({ ...current, image_url: event.target.value }))
                    }
                    className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:border-primary"
                  />
                </label>
                <label className="text-sm font-medium">
                  Image Upload
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => attachProductImage(event.target.files?.[0] || null)}
                    className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                  />
                </label>
                <div className="grid gap-4 md:grid-cols-3">
                  <label className="text-sm font-medium">
                    Badge
                    <input
                      value={productDraft.tag}
                      onChange={(event) =>
                        setProductDraft((current) => ({ ...current, tag: event.target.value }))
                      }
                      className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:border-primary"
                    />
                  </label>
                  <label className="text-sm font-medium">
                    Stock
                    <input
                      type="number"
                      min={0}
                      value={Number(productDraft.stock_quantity || 0)}
                      onChange={(event) =>
                        setProductDraft((current) => ({
                          ...current,
                          stock_quantity: Number(event.target.value),
                        }))
                      }
                      className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:border-primary"
                    />
                  </label>
                  <label className="text-sm font-medium">
                    Sort
                    <input
                      type="number"
                      value={Number(productDraft.sort_order || 100)}
                      onChange={(event) =>
                        setProductDraft((current) => ({
                          ...current,
                          sort_order: Number(event.target.value),
                        }))
                      }
                      className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:border-primary"
                    />
                  </label>
                </div>
                <label className="text-sm font-medium">
                  Delivery Text
                  <input
                    value={productDraft.delivery}
                    onChange={(event) =>
                      setProductDraft((current) => ({ ...current, delivery: event.target.value }))
                    }
                    className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:border-primary"
                  />
                </label>
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
                  <Save size={16} />
                  Save Product
                </button>
              </div>
            </form>
            <aside className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-display text-2xl">Preview</h3>
              <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-background">
                {productDraft.image_url ? (
                  <img
                    src={productDraft.image_url}
                    alt={productDraft.name || "Product preview"}
                    className="aspect-[4/3] w-full object-cover"
                  />
                ) : (
                  <div className="grid aspect-[4/3] place-items-center text-sm text-muted-foreground">
                    Add an image URL or upload
                  </div>
                )}
                <div className="p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-primary">
                    {categoryLabel(productDraft.category)}
                  </p>
                  <h4 className="mt-2 font-display text-2xl">
                    {productDraft.name || "Product name"}
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {productDraft.description || "Product description will appear here."}
                  </p>
                  <p className="mt-3 font-display text-xl text-primary">
                    {formatPrice(productDraft.price || 0)}
                  </p>
                </div>
              </div>
            </aside>
          </section>
        )}

        {tab === "product-list" && (
          <section className="space-y-4">
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-display text-2xl">All products</h2>
                <p className="text-sm text-muted-foreground">
                  Filter by category before editing, hiding, or deleting products.
                </p>
              </div>
              <label className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm">
                <ListFilter size={16} />
                <select
                  value={productFilter}
                  onChange={(event) =>
                    setProductFilter(event.target.value as "all" | ProductCategory)
                  }
                  className="bg-transparent outline-none"
                >
                  <option value="all">All categories</option>
                  {productCategories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="hidden grid-cols-[80px_1.4fr_120px_160px_110px] gap-4 border-b border-border px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground lg:grid">
                <span>Image</span>
                <span>Name</span>
                <span>Price</span>
                <span>Category</span>
                <span>Actions</span>
              </div>
              {filteredProducts.map((product) => (
                <article
                  key={product.id}
                  className="grid gap-4 border-b border-border px-5 py-4 last:border-b-0 lg:grid-cols-[80px_1.4fr_120px_160px_110px] lg:items-center"
                >
                  <div className="h-20 w-20 overflow-hidden rounded-xl bg-background">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-xs text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-display text-xl">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {product.stock_quantity} in stock ·{" "}
                      {product.is_available ? "Available" : "Hidden"}
                    </p>
                  </div>
                  <p className="font-semibold text-primary">{formatPrice(product.price)}</p>
                  <p className="text-sm text-muted-foreground">{categoryLabel(product.category)}</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setProductDraft(product);
                        setTab("product-add");
                      }}
                      className="grid h-9 w-9 place-items-center rounded-full border border-border bg-background text-primary"
                      title="Edit product"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteProduct(product)}
                      className="grid h-9 w-9 place-items-center rounded-full border border-border bg-background text-destructive"
                      title="Delete product"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </article>
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
                <article
                  key={integration.key}
                  className="rounded-2xl border border-border bg-card p-6"
                >
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
