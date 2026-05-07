import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Bell,
  Bot,
  Boxes,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Download,
  ExternalLink,
  IndianRupee,
  Inbox,
  KeyRound,
  LayoutDashboard,
  ListFilter,
  LogOut,
  Mail,
  MessageCircle,
  Minus,
  PackageCheck,
  Pencil,
  Plug,
  Plus,
  RefreshCw,
  Save,
  Search,
  Send,
  Settings,
  Smartphone,
  StickyNote,
  Trash2,
  Upload,
  UserCheck,
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
  subtotal_amount?: number | null;
  discount_amount?: number | null;
  coupon_code?: string | null;
  currency: string;
  items: Array<{ name: string; quantity: number; lineTotal: number }>;
  status: string;
  payment_status: string;
  payment_method?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  shipping_address?: string | null;
  pin_code?: string | null;
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
    hiddenProducts: number;
    lowStockProducts: number;
    productsWithoutImages: number;
    unreadMessages: number;
    revenue: number;
    paidRevenue: number;
    pendingOrders: number;
  };
  byStatus: Record<string, number>;
  lowStock: ProductRow[];
  productsWithoutImages: ProductRow[];
  recentOrders: OrderRow[];
};

type IntegrationView = {
  key: "email" | "whatsapp" | "razorpay";
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

type SupportAgent = {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
};

type SupportTemplate = {
  id: string;
  key: string;
  label: string;
  category: string;
  body: string;
  whatsapp_template_name: string | null;
  language_code: string;
};

type SupportMessage = {
  id: string;
  direction: "inbound" | "outbound";
  message_type: string;
  body: string;
  template_name: string | null;
  status: string;
  created_at: string;
};

type SupportNote = {
  id: string;
  body: string;
  created_at: string;
};

type SupportConversation = {
  id: string;
  customer_id: string | null;
  wa_id: string;
  customer_name: string;
  customer_phone: string;
  status: "open" | "pending" | "resolved";
  assigned_agent_id: string | null;
  unread_count: number;
  last_message_preview: string;
  last_message_at: string;
  customer: CustomerRow | null;
  agent: SupportAgent | null;
  messages: SupportMessage[];
  notes: SupportNote[];
  orders: OrderRow[];
};

type SupportWorkspace = {
  conversations: SupportConversation[];
  agents: SupportAgent[];
  templates: SupportTemplate[];
  unreadCount: number;
  setupRequired?: string;
};

const emptySupportWorkspace: SupportWorkspace = {
  conversations: [],
  agents: [],
  templates: [],
  unreadCount: 0,
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

function phoneDigits(phone: string) {
  return phone.replace(/[^\d]/g, "");
}

function formatPhone(phone: string) {
  const digits = phoneDigits(phone);
  if (!digits) return phone || "No phone saved";
  if (digits.length === 10) return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  return `+${digits}`;
}

function csvCell(value: unknown) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function orderItemsText(order: OrderRow) {
  return (order.items || [])
    .map((item) => `${item.name} x ${item.quantity} (${formatPrice(item.lineTotal || 0)})`)
    .join("; ");
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
  const [support, setSupport] = useState<SupportWorkspace>(emptySupportWorkspace);
  const [selectedConversationId, setSelectedConversationId] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<SupportConversation | null>(
    null,
  );
  const [supportSearch, setSupportSearch] = useState("");
  const [supportFilter, setSupportFilter] = useState<"all" | "open" | "pending" | "resolved">(
    "all",
  );
  const [replyText, setReplyText] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [replySuggestions, setReplySuggestions] = useState<string[]>([]);
  const [productDraft, setProductDraft] = useState<ProductRow>(emptyProduct);
  const [productFilter, setProductFilter] = useState<"all" | ProductCategory>("all");
  const [productStatusFilter, setProductStatusFilter] = useState<
    "all" | "available" | "hidden" | "low" | "no-image"
  >("all");
  const [productSearch, setProductSearch] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [orderSearch, setOrderSearch] = useState("");
  const [statusDraft, setStatusDraft] = useState<Record<string, string>>({});
  const [trackingDraft, setTrackingDraft] = useState<Record<string, string>>({});
  const [deliveryDraft, setDeliveryDraft] = useState<Record<string, string>>({});

  const loadAll = async () => {
    setError("");
    const [
      summaryData,
      productData,
      inboxData,
      orderData,
      customerData,
      integrationData,
      supportData,
    ] = await Promise.all([
      api<Summary>("/api/admin?action=summary"),
      api<{ products: ProductRow[] }>("/api/admin?action=products"),
      api<{ messages: InboxMessage[] }>("/api/admin?action=inbox"),
      api<{ orders: OrderRow[] }>("/api/admin?action=orders"),
      api<{ customers: CustomerRow[] }>("/api/admin?action=customers"),
      api<{ integrations: IntegrationView[] }>("/api/admin?action=integrations"),
      api<SupportWorkspace>("/api/admin?action=support").catch(() => emptySupportWorkspace),
    ]);
    setSummary(summaryData);
    setProducts(productData.products);
    setMessages(inboxData.messages);
    setOrders(orderData.orders);
    setCustomers(customerData.customers);
    setIntegrations(integrationData.integrations);
    setSupport(supportData);
    setSelectedConversationId((current) => current || supportData.conversations[0]?.id || "");
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

  const filteredSupportConversations = useMemo(() => {
    const query = supportSearch.trim().toLowerCase();
    return support.conversations.filter((conversation) => {
      const matchesStatus = supportFilter === "all" || conversation.status === supportFilter;
      const searchable = [
        conversation.customer_name,
        conversation.customer_phone,
        conversation.wa_id,
        conversation.customer?.email,
        conversation.last_message_preview,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesStatus && (!query || searchable.includes(query));
    });
  }, [support.conversations, supportFilter, supportSearch]);

  useEffect(() => {
    api<{ admin: boolean }>("/api/admin?action=me")
      .then(async (data) => {
        setAdmin(data.admin);
        if (data.admin) await loadAll();
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!admin || !selectedConversationId) {
      setSelectedConversation(null);
      setReplySuggestions([]);
      return;
    }
    api<{ conversation: SupportConversation }>(
      `/api/admin?action=support-conversation&id=${encodeURIComponent(selectedConversationId)}`,
    )
      .then((data) => {
        setSelectedConversation(data.conversation);
        return api<{ suggestions: string[] }>(
          `/api/admin?action=support-suggestions&id=${encodeURIComponent(selectedConversationId)}`,
        );
      })
      .then((data) => setReplySuggestions(data.suggestions || []))
      .catch(() => undefined);
  }, [admin, selectedConversationId]);

  useEffect(() => {
    if (!admin) return undefined;
    const timer = window.setInterval(() => {
      api<SupportWorkspace>("/api/admin?action=support")
        .then((data) => setSupport(data))
        .catch(() => undefined);
    }, 12000);
    return () => window.clearInterval(timer);
  }, [admin]);

  const filteredOrders = useMemo(() => {
    const term = orderSearch.toLowerCase();
    return orders.filter((order) => {
      const text = `${order.id} ${order.customer_name || order.customer?.name || ""} ${order.customer_phone || order.customer?.phone || ""} ${order.shipping_address || ""} ${order.pin_code || ""} ${order.status}`;
      return text.toLowerCase().includes(term);
    });
  }, [orders, orderSearch]);

  const exportOrdersCsv = () => {
    const headers = [
      "Order ID",
      "Date",
      "Customer Name",
      "Mobile Number",
      "Address",
      "Pin Code",
      "Payment Option",
      "Status",
      "Payment Status",
      "Subtotal",
      "Discount",
      "Coupon",
      "Total",
      "Items",
      "Tracking Number",
      "Estimated Delivery",
    ];
    const rows = filteredOrders.map((order) => [
      order.id,
      new Date(order.created_at).toLocaleString(),
      order.customer_name || order.customer?.name || "",
      order.customer_phone || order.customer?.phone || "",
      order.shipping_address || "",
      order.pin_code || "",
      order.payment_method || "",
      order.status.replaceAll("_", " "),
      order.payment_status,
      order.subtotal_amount ?? order.amount,
      order.discount_amount ?? 0,
      order.coupon_code || "",
      order.amount,
      orderItemsText(order),
      order.tracking_number || "",
      order.estimated_delivery || "",
    ]);
    const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `iksha-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const filteredProducts = useMemo(() => {
    const term = productSearch.toLowerCase();
    return products.filter((product) => {
      const matchesCategory = productFilter === "all" || product.category === productFilter;
      const matchesStatus =
        productStatusFilter === "all" ||
        (productStatusFilter === "available" && product.is_available) ||
        (productStatusFilter === "hidden" && !product.is_available) ||
        (productStatusFilter === "low" && product.is_available && product.stock_quantity <= 3) ||
        (productStatusFilter === "no-image" && !product.image_url);
      const searchable =
        `${product.name} ${product.category} ${product.tag} ${product.description}`.toLowerCase();
      return matchesCategory && matchesStatus && searchable.includes(term);
    });
  }, [productFilter, productSearch, productStatusFilter, products]);

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
        method: products.some((product) => product.id === productDraft.id) ? "PATCH" : "POST",
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

  const updateProductQuick = async (product: ProductRow, patch: Partial<ProductRow>) => {
    setError("");
    try {
      await api("/api/admin?action=products", {
        method: "PATCH",
        body: JSON.stringify({ ...product, ...patch }),
      });
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Product could not be updated.");
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

  const updateSupportConversation = async (patch: Record<string, unknown>) => {
    if (!selectedConversationId) return;
    setError("");
    try {
      const data = await api<{ conversation: SupportConversation }>(
        "/api/admin?action=support-conversation",
        {
          method: "PATCH",
          body: JSON.stringify({ id: selectedConversationId, ...patch }),
        },
      );
      setSelectedConversation(data.conversation);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Conversation could not be updated.");
    }
  };

  const sendSupportReply = async (templateId = "") => {
    if (!selectedConversationId) return;
    setError("");
    try {
      const data = await api<{ conversation: SupportConversation }>(
        "/api/admin?action=support-message",
        {
          method: "POST",
          body: JSON.stringify({
            conversationId: selectedConversationId,
            body: templateId ? "" : replyText,
            templateId,
          }),
        },
      );
      setSelectedConversation(data.conversation);
      setReplyText("");
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "WhatsApp reply could not be sent.");
    }
  };

  const addConversationNote = async () => {
    if (!selectedConversationId || !internalNote.trim()) return;
    setError("");
    try {
      const data = await api<{ conversation: SupportConversation }>(
        "/api/admin?action=support-note",
        {
          method: "POST",
          body: JSON.stringify({ conversationId: selectedConversationId, body: internalNote }),
        },
      );
      setSelectedConversation(data.conversation);
      setInternalNote("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Internal note could not be saved.");
    }
  };

  const attachProductImage = async (file: File | null) => {
    if (!file) return;
    setError("");
    setImageUploading(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () =>
          typeof reader.result === "string"
            ? resolve(reader.result)
            : reject(new Error("Image could not be read."));
        reader.onerror = () => reject(new Error("Image could not be read."));
        reader.readAsDataURL(file);
      });
      const data = await api<{ imageUrl: string }>("/api/admin?action=product-image", {
        method: "POST",
        body: JSON.stringify({ name: productDraft.name || file.name, dataUrl }),
      });
      setProductDraft((current) => ({
        ...current,
        image_url: data.imageUrl,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image could not be uploaded.");
    } finally {
      setImageUploading(false);
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
            <button
              type="button"
              onClick={() => setTab("support")}
              className={`inline-flex shrink-0 items-center justify-between gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold ${
                tab === "support"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-foreground"
              }`}
            >
              <span className="inline-flex items-center gap-3">
                <MessageCircle size={17} />
                Support
              </span>
              {support.unreadCount > 0 && (
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-foreground">
                  {support.unreadCount}
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
              <StatCard
                label="Active products"
                value={summary.metrics.activeProducts}
                icon={PackageCheck}
              />
              <StatCard
                label="Hidden products"
                value={summary.metrics.hiddenProducts}
                icon={Boxes}
              />
              <StatCard
                label="Pending orders"
                value={summary.metrics.pendingOrders}
                icon={ClipboardList}
              />
              <StatCard label="Unread inbox" value={summary.metrics.unreadMessages} icon={Mail} />
            </div>
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-2xl">Needs attention</h2>
              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <button
                  type="button"
                  onClick={() => {
                    setProductStatusFilter("low");
                    setTab("product-list");
                  }}
                  className="rounded-xl bg-background px-4 py-3 text-left"
                >
                  <p className="text-sm text-muted-foreground">Low stock</p>
                  <p className="mt-1 font-display text-2xl text-primary">
                    {summary.lowStock.length}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setTab("orders")}
                  className="rounded-xl bg-background px-4 py-3 text-left"
                >
                  <p className="text-sm text-muted-foreground">New orders</p>
                  <p className="mt-1 font-display text-2xl text-primary">
                    {summary.metrics.pendingOrders}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setTab("inbox")}
                  className="rounded-xl bg-background px-4 py-3 text-left"
                >
                  <p className="text-sm text-muted-foreground">Unread messages</p>
                  <p className="mt-1 font-display text-2xl text-primary">
                    {summary.metrics.unreadMessages}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProductStatusFilter("no-image");
                    setTab("product-list");
                  }}
                  className="rounded-xl bg-background px-4 py-3 text-left"
                >
                  <p className="text-sm text-muted-foreground">Missing images</p>
                  <p className="mt-1 font-display text-2xl text-primary">
                    {summary.metrics.productsWithoutImages}
                  </p>
                </button>
              </div>
            </section>
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

        {tab === "support" && (
          <section className="space-y-5">
            <div className="grid gap-4 md:grid-cols-3">
              <StatCard
                label="Conversations"
                value={support.conversations.length}
                icon={MessageCircle}
              />
              <StatCard label="Unread WhatsApp" value={support.unreadCount} icon={Bell} />
              <StatCard
                label="Active agents"
                value={support.agents.filter((agent) => agent.is_active).length}
                icon={UserCheck}
              />
            </div>

            {support.setupRequired && (
              <div className="rounded-2xl border border-dashed border-primary/40 bg-card p-5 text-sm leading-6 text-muted-foreground">
                <strong className="text-foreground">Support schema setup needed:</strong>{" "}
                {support.setupRequired}
              </div>
            )}

            <div className="grid min-h-[680px] overflow-hidden rounded-2xl border border-border bg-card xl:grid-cols-[340px_minmax(0,1fr)_360px]">
              <aside className="border-b border-border xl:border-b-0 xl:border-r">
                <div className="space-y-3 border-b border-border p-4">
                  <label className="flex items-center gap-2 rounded-full border border-input bg-background px-4 py-2 text-sm">
                    <Search size={16} className="text-primary" />
                    <input
                      value={supportSearch}
                      onChange={(event) => setSupportSearch(event.target.value)}
                      placeholder="Search chats"
                      className="min-w-0 flex-1 bg-transparent outline-none"
                    />
                  </label>
                  <select
                    value={supportFilter}
                    onChange={(event) =>
                      setSupportFilter(
                        event.target.value as "all" | "open" | "pending" | "resolved",
                      )
                    }
                    className="w-full rounded-full border border-input bg-background px-4 py-2 text-sm outline-none"
                  >
                    <option value="all">All conversations</option>
                    <option value="open">Open</option>
                    <option value="pending">Pending</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
                <div className="max-h-[580px] overflow-y-auto">
                  {filteredSupportConversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => {
                        setSelectedConversationId(conversation.id);
                        updateSupportConversation({ id: conversation.id, markRead: true });
                      }}
                      className={`w-full border-b border-border px-4 py-4 text-left last:border-b-0 ${
                        selectedConversationId === conversation.id ? "bg-secondary" : "bg-card"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-display text-lg">
                            {conversation.customer?.name || conversation.customer_name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {formatPhone(conversation.customer_phone)}
                          </p>
                        </div>
                        {conversation.unread_count > 0 && (
                          <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                            {conversation.unread_count}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm leading-5 text-muted-foreground">
                        {conversation.last_message_preview || "No messages yet"}
                      </p>
                      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                        <span className="capitalize">{conversation.status}</span>
                        <span>
                          {new Date(conversation.last_message_at).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </span>
                      </div>
                    </button>
                  ))}
                  {!filteredSupportConversations.length && (
                    <div className="p-5 text-sm text-muted-foreground">
                      No WhatsApp conversations yet.
                    </div>
                  )}
                </div>
              </aside>

              <section className="flex min-h-[680px] flex-col">
                {selectedConversation ? (
                  <>
                    <div className="flex flex-col gap-3 border-b border-border p-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-primary">
                          WhatsApp Business Platform
                        </p>
                        <h2 className="font-display text-2xl">
                          {selectedConversation.customer?.name ||
                            selectedConversation.customer_name}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {formatPhone(selectedConversation.customer_phone)} -{" "}
                          {selectedConversation.agent?.name || "Unassigned"}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <select
                          value={selectedConversation.status}
                          onChange={(event) =>
                            updateSupportConversation({ status: event.target.value })
                          }
                          className="rounded-full border border-input bg-background px-4 py-2 text-sm"
                        >
                          <option value="open">Open</option>
                          <option value="pending">Pending</option>
                          <option value="resolved">Resolved</option>
                        </select>
                        <select
                          value={selectedConversation.assigned_agent_id || ""}
                          onChange={(event) =>
                            updateSupportConversation({ assignedAgentId: event.target.value })
                          }
                          className="rounded-full border border-input bg-background px-4 py-2 text-sm"
                        >
                          <option value="">Unassigned</option>
                          {support.agents.map((agent) => (
                            <option key={agent.id} value={agent.id}>
                              {agent.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto bg-background/50 p-4">
                      {selectedConversation.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.direction === "outbound" ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                              message.direction === "outbound"
                                ? "bg-primary text-primary-foreground"
                                : "border border-border bg-card text-foreground"
                            }`}
                          >
                            <p>{message.body}</p>
                            <p
                              className={`mt-2 text-[11px] ${
                                message.direction === "outbound"
                                  ? "text-primary-foreground/75"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {new Date(message.created_at).toLocaleString("en-IN")} -{" "}
                              {message.status}
                            </p>
                          </div>
                        </div>
                      ))}
                      {!selectedConversation.messages.length && (
                        <div className="grid h-full place-items-center text-sm text-muted-foreground">
                          Select a customer conversation to start support.
                        </div>
                      )}
                    </div>

                    <div className="border-t border-border p-4">
                      <div className="mb-3 rounded-2xl border border-border bg-background p-3">
                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                          <Bot size={14} />
                          AI-assisted reply ideas
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {replySuggestions.map((suggestion) => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => setReplyText(suggestion)}
                              className="rounded-full border border-border bg-card px-3 py-2 text-xs text-left"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="mb-3 flex flex-wrap gap-2">
                        {support.templates.map((template) => (
                          <button
                            key={template.id}
                            type="button"
                            onClick={() => sendSupportReply(template.id)}
                            className="rounded-full border border-border bg-background px-3 py-2 text-xs font-semibold text-primary"
                          >
                            {template.label}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <textarea
                          value={replyText}
                          onChange={(event) => setReplyText(event.target.value)}
                          placeholder="Type a support reply. Use approved templates outside the customer-service window."
                          className="min-h-20 flex-1 rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                        />
                        <button
                          type="button"
                          onClick={() => sendSupportReply()}
                          className="inline-flex min-w-24 items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
                        >
                          <Send size={16} />
                          Send
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="grid flex-1 place-items-center p-8 text-center text-sm text-muted-foreground">
                    Connect WhatsApp Cloud API and wait for customer messages to arrive.
                  </div>
                )}
              </section>

              <aside className="border-t border-border p-5 xl:border-l xl:border-t-0">
                {selectedConversation ? (
                  <div className="space-y-5">
                    <section>
                      <p className="text-xs uppercase tracking-[0.18em] text-primary">
                        Customer profile
                      </p>
                      <h3 className="mt-2 font-display text-2xl">
                        {selectedConversation.customer?.name || selectedConversation.customer_name}
                      </h3>
                      <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                        <p>{formatPhone(selectedConversation.customer_phone)}</p>
                        <p>{selectedConversation.customer?.email || "No customer email linked"}</p>
                      </div>
                    </section>

                    <section className="rounded-2xl border border-border bg-background p-4">
                      <h4 className="font-semibold">Order history</h4>
                      <div className="mt-3 space-y-3">
                        {selectedConversation.orders.map((order) => (
                          <div key={order.id} className="rounded-xl bg-card p-3 text-sm">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-semibold">{order.id}</span>
                              <span className="text-primary">{formatPrice(order.amount)}</span>
                            </div>
                            <p className="mt-1 capitalize text-muted-foreground">
                              {order.status.replaceAll("_", " ")} - {order.payment_status}
                            </p>
                            <p className="mt-1 text-muted-foreground">
                              {order.shipping_address || "No shipping address"}{" "}
                              {order.pin_code ? `- ${order.pin_code}` : ""}
                            </p>
                            {order.tracking_number && (
                              <p className="mt-1 text-primary">Tracking: {order.tracking_number}</p>
                            )}
                          </div>
                        ))}
                        {!selectedConversation.orders.length && (
                          <p className="text-sm text-muted-foreground">No linked orders yet.</p>
                        )}
                      </div>
                    </section>

                    <section className="rounded-2xl border border-border bg-background p-4">
                      <h4 className="mb-3 inline-flex items-center gap-2 font-semibold">
                        <StickyNote size={16} />
                        Internal notes
                      </h4>
                      <div className="space-y-2">
                        {selectedConversation.notes.map((note) => (
                          <p key={note.id} className="rounded-xl bg-card p-3 text-sm leading-6">
                            {note.body}
                          </p>
                        ))}
                      </div>
                      <textarea
                        value={internalNote}
                        onChange={(event) => setInternalNote(event.target.value)}
                        placeholder="Add private support note"
                        className="mt-3 min-h-20 w-full rounded-xl border border-input bg-card px-3 py-2 text-sm outline-none"
                      />
                      <button
                        type="button"
                        onClick={addConversationNote}
                        className="mt-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                      >
                        Save note
                      </button>
                    </section>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No conversation selected.</p>
                )}
              </aside>
            </div>
          </section>
        )}

        {tab === "orders" && (
          <section className="space-y-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <label className="flex max-w-xl flex-1 items-center gap-3 rounded-full border border-border bg-card px-5 py-3 text-sm text-muted-foreground">
                <Search size={18} />
                <input
                  value={orderSearch}
                  onChange={(event) => setOrderSearch(event.target.value)}
                  placeholder="Search order, customer, phone, status, address"
                  className="w-full bg-transparent outline-none"
                />
              </label>
              <button
                type="button"
                onClick={exportOrdersCsv}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
              >
                <Download size={16} />
                Export Excel CSV
              </button>
            </div>
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
                      <div className="mt-3 grid gap-1 text-sm text-muted-foreground">
                        <p>
                          <span className="font-semibold text-foreground">Checkout name:</span>{" "}
                          {order.customer_name || order.customer?.name || "Not added"}
                        </p>
                        <p>
                          <span className="font-semibold text-foreground">Mobile:</span>{" "}
                          {order.customer_phone || order.customer?.phone || "Not added"}
                        </p>
                        <p>
                          <span className="font-semibold text-foreground">Address:</span>{" "}
                          {order.shipping_address || "Not added"}
                        </p>
                        <p>
                          <span className="font-semibold text-foreground">Pin code:</span>{" "}
                          {order.pin_code || "Not added"}
                        </p>
                        <p>
                          <span className="font-semibold text-foreground">Payment:</span>{" "}
                          {(order.payment_method || "cod").replaceAll("_", " ")}
                        </p>
                      </div>
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
                  <span className="mt-1 flex items-center gap-3 rounded-xl border border-input bg-background px-3 py-2 text-sm">
                    <Upload size={16} className="text-primary" />
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(event) => attachProductImage(event.target.files?.[0] || null)}
                      className="w-full text-sm"
                    />
                  </span>
                  {imageUploading && (
                    <span className="mt-1 block text-xs text-primary">Uploading image...</span>
                  )}
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
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm">
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
                  <label className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm">
                    <input
                      type="checkbox"
                      checked={productDraft.is_featured}
                      onChange={(event) =>
                        setProductDraft((current) => ({
                          ...current,
                          is_featured: event.target.checked,
                        }))
                      }
                    />
                    Featured product
                  </label>
                </div>
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
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="font-display text-2xl">All products</h2>
                <p className="text-sm text-muted-foreground">
                  Search, filter, edit stock, hide, or delete products from one list.
                </p>
              </div>
              <div className="grid gap-2 md:grid-cols-[minmax(220px,1fr)_auto_auto]">
                <label className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm">
                  <Search size={16} />
                  <input
                    value={productSearch}
                    onChange={(event) => setProductSearch(event.target.value)}
                    placeholder="Search products"
                    className="w-full bg-transparent outline-none"
                  />
                </label>
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
                <label className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm">
                  <PackageCheck size={16} />
                  <select
                    value={productStatusFilter}
                    onChange={(event) =>
                      setProductStatusFilter(
                        event.target.value as "all" | "available" | "hidden" | "low" | "no-image",
                      )
                    }
                    className="bg-transparent outline-none"
                  >
                    <option value="all">All status</option>
                    <option value="available">Available</option>
                    <option value="hidden">Hidden</option>
                    <option value="low">Low stock</option>
                    <option value="no-image">No image</option>
                  </select>
                </label>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="hidden grid-cols-[80px_1.4fr_120px_150px_160px_110px] gap-4 border-b border-border px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground lg:grid">
                <span>Image</span>
                <span>Name</span>
                <span>Price</span>
                <span>Category</span>
                <span>Stock</span>
                <span>Actions</span>
              </div>
              {filteredProducts.map((product) => (
                <article
                  key={product.id}
                  className="grid gap-4 border-b border-border px-5 py-4 last:border-b-0 lg:grid-cols-[80px_1.4fr_120px_150px_160px_110px] lg:items-center"
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
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateProductQuick(product, {
                          stock_quantity: Math.max(0, product.stock_quantity - 1),
                        })
                      }
                      className="grid h-8 w-8 place-items-center rounded-full border border-border bg-background text-primary"
                      title="Decrease stock"
                    >
                      <Minus size={14} />
                    </button>
                    <input
                      value={product.stock_quantity}
                      type="number"
                      min={0}
                      onChange={(event) =>
                        updateProductQuick(product, {
                          stock_quantity: Math.max(0, Number(event.target.value) || 0),
                        })
                      }
                      className="h-8 w-16 rounded-lg border border-input bg-background px-2 text-center text-sm outline-none focus:border-primary"
                      aria-label={`${product.name} stock quantity`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        updateProductQuick(product, { stock_quantity: product.stock_quantity + 1 })
                      }
                      className="grid h-8 w-8 place-items-center rounded-full border border-border bg-background text-primary"
                      title="Increase stock"
                    >
                      <Plus size={14} />
                    </button>
                    <label className="ml-2 inline-flex items-center gap-2 text-xs text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={product.is_available}
                        onChange={(event) =>
                          updateProductQuick(product, { is_available: event.target.checked })
                        }
                      />
                      Show
                    </label>
                  </div>
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
              const isWhatsApp = integration.key === "whatsapp";
              const isRazorpay = integration.key === "razorpay";
              return (
                <article
                  key={integration.key}
                  className="rounded-2xl border border-border bg-card p-6"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex gap-3">
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-secondary text-primary">
                        {isEmail ? (
                          <Mail size={20} />
                        ) : isRazorpay ? (
                          <CreditCard size={20} />
                        ) : (
                          <Smartphone size={20} />
                        )}
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
                              : isRazorpay
                                ? "Add Razorpay keys to collect online payments."
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
                        ) : isRazorpay ? (
                          <>
                            <option value="razorpay">Razorpay Payment Gateway</option>
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
                    ) : isRazorpay ? (
                      <>
                        <div className="rounded-2xl border border-border bg-background p-4">
                          <h3 className="font-display text-xl">Razorpay checkout</h3>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            Customer UPI, card, wallet, and netbanking payments open through
                            Razorpay Checkout. The server creates the order and verifies the payment
                            signature before marking an order paid.
                          </p>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          <label className="text-sm font-medium">
                            Mode
                            <select
                              value={draft.publicConfig.mode || "test"}
                              onChange={(event) =>
                                updateIntegrationDraft(integration.key, {
                                  publicConfig: { mode: event.target.value },
                                })
                              }
                              className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:border-primary"
                            >
                              <option value="test">Test mode</option>
                              <option value="live">Live mode</option>
                            </select>
                          </label>
                          <label className="text-sm font-medium">
                            Business name on checkout
                            <input
                              value={draft.publicConfig.businessName || "iksha gifts"}
                              onChange={(event) =>
                                updateIntegrationDraft(integration.key, {
                                  publicConfig: { businessName: event.target.value },
                                })
                              }
                              className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:border-primary"
                            />
                          </label>
                        </div>
                        <label className="text-sm font-medium">
                          Razorpay Key ID
                          <input
                            value={draft.publicConfig.keyId || ""}
                            placeholder="rzp_test_... or rzp_live_..."
                            onChange={(event) =>
                              updateIntegrationDraft(integration.key, {
                                publicConfig: { keyId: event.target.value },
                              })
                            }
                            className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:border-primary"
                          />
                        </label>
                        <label className="text-sm font-medium">
                          Razorpay Key Secret
                          <input
                            type="password"
                            value={draft.secrets.keySecret || ""}
                            placeholder={
                              integration.secrets.keySecret?.configured
                                ? `Saved: ${integration.secrets.keySecret.masked}`
                                : "Paste Key Secret"
                            }
                            onChange={(event) =>
                              updateIntegrationDraft(integration.key, {
                                secrets: { keySecret: event.target.value },
                              })
                            }
                            className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:border-primary"
                          />
                        </label>
                        <label className="text-sm font-medium">
                          Webhook Secret (optional)
                          <input
                            type="password"
                            value={draft.secrets.webhookSecret || ""}
                            placeholder={
                              integration.secrets.webhookSecret?.configured
                                ? `Saved: ${integration.secrets.webhookSecret.masked}`
                                : "Optional for later webhook verification"
                            }
                            onChange={(event) =>
                              updateIntegrationDraft(integration.key, {
                                secrets: { webhookSecret: event.target.value },
                              })
                            }
                            className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:border-primary"
                          />
                        </label>
                      </>
                    ) : isWhatsApp ? (
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
                        <div className="rounded-2xl border border-border bg-background p-4">
                          <div className="mb-3">
                            <h3 className="font-display text-xl">Official Cloud API setup</h3>
                            <p className="mt-1 text-sm leading-6 text-muted-foreground">
                              Use Meta WhatsApp Business Platform credentials only. Embedded Signup
                              can be added later after Meta Tech Provider or BSP approval.
                            </p>
                          </div>
                          <div className="grid gap-3 md:grid-cols-2">
                            <label className="text-sm font-medium">
                              Webhook URL
                              <input
                                value={
                                  draft.publicConfig.webhookUrl ||
                                  "https://ikshagifts.shop/api/whatsapp/webhook"
                                }
                                onChange={(event) =>
                                  updateIntegrationDraft(integration.key, {
                                    publicConfig: { webhookUrl: event.target.value },
                                  })
                                }
                                className="mt-1 w-full rounded-xl border border-input bg-card px-3 py-2 outline-none focus:border-primary"
                              />
                            </label>
                            <label className="text-sm font-medium">
                              Graph API version
                              <input
                                value={draft.publicConfig.graphVersion || "v23.0"}
                                onChange={(event) =>
                                  updateIntegrationDraft(integration.key, {
                                    publicConfig: { graphVersion: event.target.value },
                                  })
                                }
                                className="mt-1 w-full rounded-xl border border-input bg-card px-3 py-2 outline-none focus:border-primary"
                              />
                            </label>
                            <label className="text-sm font-medium">
                              Meta App ID
                              <input
                                value={draft.publicConfig.appId || ""}
                                onChange={(event) =>
                                  updateIntegrationDraft(integration.key, {
                                    publicConfig: { appId: event.target.value },
                                  })
                                }
                                className="mt-1 w-full rounded-xl border border-input bg-card px-3 py-2 outline-none focus:border-primary"
                              />
                            </label>
                            <label className="text-sm font-medium">
                              WABA ID
                              <input
                                value={draft.publicConfig.wabaId || ""}
                                onChange={(event) =>
                                  updateIntegrationDraft(integration.key, {
                                    publicConfig: { wabaId: event.target.value },
                                  })
                                }
                                className="mt-1 w-full rounded-xl border border-input bg-card px-3 py-2 outline-none focus:border-primary"
                              />
                            </label>
                          </div>
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
                            Cloud API access token
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
                            Phone number ID
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
                          <label className="text-sm font-medium">
                            Webhook verify token
                            <input
                              type="password"
                              value={draft.secrets.verifyToken || ""}
                              placeholder="Create a private verification token"
                              onChange={(event) =>
                                updateIntegrationDraft(integration.key, {
                                  secrets: { verifyToken: event.target.value },
                                })
                              }
                              className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:border-primary"
                            />
                          </label>
                          <label className="text-sm font-medium">
                            Meta App secret
                            <input
                              type="password"
                              value={draft.secrets.appSecret || ""}
                              placeholder="Required for webhook signature verification"
                              onChange={(event) =>
                                updateIntegrationDraft(integration.key, {
                                  secrets: { appSecret: event.target.value },
                                })
                              }
                              className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:border-primary"
                            />
                          </label>
                        </div>
                        <div className="rounded-2xl border border-border bg-background p-4">
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex gap-3">
                              <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl border border-dashed border-primary/40 bg-card text-primary">
                                <UserCheck size={38} />
                              </div>
                              <div>
                                <h3 className="font-display text-xl">
                                  Official account onboarding
                                </h3>
                                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                  Connect a Meta WhatsApp Business Account, phone number ID, access
                                  token, and webhook subscription. Use Embedded Signup only through
                                  Meta-approved Tech Provider or BSP flows.
                                </p>
                                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                                  This module avoids WhatsApp Web automation, scraping, and session
                                  hijacking. All sending and receiving runs through official APIs.
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <a
                                href="https://business.facebook.com/wa/manage/home/"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1f7a4d] px-4 py-2 text-sm font-semibold text-white"
                              >
                                <ExternalLink size={16} />
                                WhatsApp Manager
                              </a>
                              <a
                                href="https://developers.facebook.com/apps/"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-primary"
                              >
                                <ExternalLink size={16} />
                                Meta App
                              </a>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : null}

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
            <article className="rounded-2xl border border-border bg-card p-6 xl:col-span-2">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-primary">
                    WhatsApp support inbox
                  </p>
                  <h2 className="font-display text-2xl">Manage chats inside this dashboard</h2>
                  <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
                    Once the official Cloud API webhook is connected, customer messages appear in
                    the Support tab with conversation history, customer profile, order details,
                    assignments, notes, templates, and reply suggestions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTab("support")}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
                >
                  <MessageCircle size={16} />
                  Open Support Inbox
                </button>
              </div>
            </article>
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
