import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  categoryLabel,
  categoryToCollection,
  isProductCategory,
  placeholderImage,
  Product,
  products,
} from "@/data/products";
import { subscribeToCatalogChanges } from "@/lib/catalogRealtime";

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  emailVerified: boolean;
  phoneVerified: boolean;
};

export type CartLine = {
  productId: string;
  quantity: number;
};

type CheckoutState = {
  status: "idle" | "loading" | "success" | "error";
  message: string;
};

type AuthMode = "login" | "register";

export type OrderStatus =
  | "order_placed"
  | "confirmed"
  | "making"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type CustomerOrder = {
  id: string;
  amount: number;
  currency: "INR";
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  status: OrderStatus;
  payment_status: "pending" | "paid" | "failed" | "refunded";
  tracking_number: string | null;
  estimated_delivery: string | null;
  status_history: Array<{
    status: OrderStatus;
    label: string;
    note: string;
    at: string;
  }>;
  created_at: string;
};

export type CheckoutDetails = {
  name: string;
  mobile: string;
  address: string;
  pinCode: string;
  paymentMethod: "online" | "upi" | "cod";
};

type RazorpaySuccess = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: "INR";
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  handler: (response: RazorpaySuccess) => void;
  modal: {
    ondismiss: () => void;
  };
};

type RazorpayConstructor = new (options: RazorpayOptions) => {
  open: () => void;
};

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

type CommerceContextValue = {
  user: User | null;
  cart: CartLine[];
  cartOpen: boolean;
  ordersOpen: boolean;
  authOpen: boolean;
  authMode: AuthMode;
  checkout: CheckoutState;
  orders: CustomerOrder[];
  products: Product[];
  cartCount: number;
  cartTotal: number;
  setCartOpen: (open: boolean) => void;
  setOrdersOpen: (open: boolean) => void;
  openAuth: (mode?: AuthMode) => void;
  closeAuth: () => void;
  addToCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  login: (payload: EmailLoginPayload) => Promise<{ otpRequested?: boolean } | void>;
  requestSignupOtp: (payload: EmailSignupPayload) => Promise<void>;
  verifySignupOtp: (payload: { otp: string }) => Promise<void>;
  logout: () => Promise<void>;
  placeOrder: (couponCode?: string, details?: CheckoutDetails) => Promise<void>;
  loadOrders: () => Promise<void>;
  getProduct: (productId: string) => Product | undefined;
};

type EmailLoginPayload = {
  email: string;
  otp?: string;
};

type EmailSignupPayload = {
  name: string;
  email: string;
  phone?: string;
};

const CommerceContext = createContext<CommerceContextValue | null>(null);
const CART_KEY = "iksha-cart";

type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void) => number;
  cancelIdleCallback?: (id: number) => void;
};

type ManagedProductRow = Product & {
  imageUrl?: string;
  image_url?: string;
  cartUrl?: string;
  cart_url?: string;
  categorySlug?: string;
  desc?: string;
  description?: string;
  collection?: Product["collection"];
  old_price?: number | null;
  stockQuantity?: number;
  stock_quantity?: number;
  isAvailable?: boolean;
  is_available?: boolean;
  isFeatured?: boolean;
  is_featured?: boolean;
  isBestSeller?: boolean;
  is_best_seller?: boolean;
  sortOrder?: number;
  sort_order?: number;
};

function isBlockedPlaceholderImage(value?: string | null) {
  return Boolean(value && /(^https?:\/\/)?via\.placeholder\.com\//i.test(value));
}

function resolveProductImage(product: ManagedProductRow, fallback?: Product) {
  const image = product.imageUrl || product.image_url || product.image;
  if (image && !isBlockedPlaceholderImage(image)) return image;
  return fallback?.image || placeholderImage(product.name || "Gift");
}

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error ?? "Something went wrong.");
  }
  return data as T;
}

function loadRazorpayCheckout() {
  if (window.Razorpay) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Razorpay could not load.")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Razorpay could not load."));
    document.body.appendChild(script);
  });
}

export function CommerceProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [managedProducts, setManagedProducts] = useState<Product[]>(products);
  const [cartOpen, setCartOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [checkout, setCheckout] = useState<CheckoutState>({ status: "idle", message: "" });
  const [pendingSignupId, setPendingSignupId] = useState("");

  const loadProducts = useCallback(async () => {
    const data = await api<{ products: ManagedProductRow[] }>("/api/products");
    if (!data.products?.length) return;
    setManagedProducts(
      data.products.map((product) => {
        const fallback = products.find((item) => item.id === product.id);
        const dbCategory = product.categorySlug || product.category;
        const managedCategory = isProductCategory(dbCategory) ? dbCategory : null;
        return {
          ...product,
          category: managedCategory
            ? categoryLabel(managedCategory)
            : product.category || fallback?.category || "Gifts",
          categorySlug: managedCategory || fallback?.categorySlug,
          tag: product.tag || fallback?.tag || "New",
          desc: product.desc || product.description || fallback?.desc || "",
          image: resolveProductImage(product, fallback),
          cartUrl:
            product.cartUrl || product.cart_url || fallback?.cartUrl || `/cart/add/${product.id}`,
          oldPrice: product.oldPrice ?? product.old_price ?? fallback?.oldPrice,
          rating: product.rating ?? fallback?.rating ?? 4.8,
          delivery: product.delivery || fallback?.delivery || "Ships in 4-6 days",
          collection:
            product.collection ||
            (managedCategory ? categoryToCollection[managedCategory] : fallback?.collection) ||
            "custom",
          stockQuantity: product.stockQuantity ?? product.stock_quantity ?? fallback?.stockQuantity,
          isAvailable: product.isAvailable ?? product.is_available ?? fallback?.isAvailable ?? true,
          isFeatured: product.isFeatured ?? product.is_featured ?? fallback?.isFeatured ?? false,
          isBestSeller:
            product.isBestSeller ?? product.is_best_seller ?? fallback?.isBestSeller ?? false,
          sortOrder: product.sortOrder ?? product.sort_order ?? fallback?.sortOrder,
        };
      }),
    );
  }, []);

  useEffect(() => {
    const saved = window.localStorage.getItem(CART_KEY);
    if (saved) {
      setCart(JSON.parse(saved));
    }

    const hydrateCommerce = () => {
      api<{ user: User | null }>("/api/auth/me")
        .then((data) => setUser(data.user))
        .catch(() => undefined);
      loadProducts().catch(() => undefined);
    };

    const idleWindow = window as IdleWindow;
    const idleId = idleWindow.requestIdleCallback?.(hydrateCommerce);
    const timeoutId = idleId === undefined ? window.setTimeout(hydrateCommerce, 180) : undefined;

    return () => {
      if (idleId !== undefined) idleWindow.cancelIdleCallback?.(idleId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [loadProducts]);

  useEffect(
    () =>
      subscribeToCatalogChanges(() => {
        loadProducts().catch(() => undefined);
      }),
    [loadProducts],
  );

  useEffect(() => {
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const getProduct = useCallback(
    (productId: string) => managedProducts.find((product) => product.id === productId),
    [managedProducts],
  );

  const cartCount = useMemo(() => cart.reduce((sum, line) => sum + line.quantity, 0), [cart]);

  const cartTotal = useMemo(
    () =>
      cart.reduce((sum, line) => {
        const product = getProduct(line.productId);
        return product ? sum + product.price * line.quantity : sum;
      }, 0),
    [cart, getProduct],
  );

  useEffect(() => {
    setCart((current) =>
      current.flatMap((line) => {
        const product = managedProducts.find((item) => item.id === line.productId);
        if (!product || product.isAvailable === false || (product.stockQuantity ?? 1) <= 0) {
          return [];
        }
        return [
          {
            ...line,
            quantity: Math.min(line.quantity, product.stockQuantity ?? line.quantity),
          },
        ];
      }),
    );
  }, [managedProducts]);

  const addToCart = useCallback(
    (productId: string) => {
      const product = managedProducts.find((item) => item.id === productId);
      if (!product || product.isAvailable === false || (product.stockQuantity ?? 1) <= 0) return;
      setCart((current) => {
        const existing = current.find((line) => line.productId === productId);
        if (existing) {
          return current.map((line) =>
            line.productId === productId
              ? { ...line, quantity: Math.min(line.quantity + 1, product.stockQuantity ?? 25) }
              : line,
          );
        }
        return [...current, { productId, quantity: 1 }];
      });
      setCartOpen(true);
    },
    [managedProducts],
  );

  useEffect(() => {
    const match = window.location.pathname.match(/^\/cart\/add\/([^/]+)\/?$/);
    if (!match) return;
    const productId = decodeURIComponent(match[1]);
    if (!managedProducts.some((product) => product.id === productId)) return;
    addToCart(productId);
    window.history.replaceState(null, "", "/#featured-products");
  }, [addToCart, managedProducts]);

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const product = getProduct(productId);
    if (!product || product.isAvailable === false || (product.stockQuantity ?? 1) <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((current) =>
      current.map((line) =>
        line.productId === productId
          ? { ...line, quantity: Math.min(quantity, product.stockQuantity ?? quantity) }
          : line,
      ),
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((current) => current.filter((line) => line.productId !== productId));
  };

  const clearCart = () => setCart([]);

  const openAuth = (mode: AuthMode = "login") => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const closeAuth = () => setAuthOpen(false);

  const login = async (payload: EmailLoginPayload) => {
    const data = await api<{ user?: User; otpRequested?: boolean }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (data.user) {
      setUser(data.user);
      setAuthOpen(false);
      return;
    }
    return { otpRequested: data.otpRequested };
  };

  const requestSignupOtp = async (payload: EmailSignupPayload) => {
    const data = await api<{ pendingId: string }>("/api/auth/request-otp", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setPendingSignupId(data.pendingId);
  };

  const logout = async () => {
    await api("/api/auth/logout", { method: "POST" });
    setUser(null);
  };

  const verifySignupOtp = async (payload: { otp: string }) => {
    if (!pendingSignupId) throw new Error("Please request OTP first.");
    const data = await api<{ user: User }>("/api/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ pendingId: pendingSignupId, ...payload }),
    });
    setUser(data.user);
    setPendingSignupId("");
    setAuthOpen(false);
  };

  const loadOrders = async () => {
    if (!user) return;
    const data = await api<{ orders: CustomerOrder[] }>("/api/orders");
    setOrders(data.orders);
  };

  const placeOrder = async (couponCode = "", details?: CheckoutDetails) => {
    if (!cart.length) return;
    setCheckout({
      status: "loading",
      message:
        details?.paymentMethod === "online"
          ? "Opening secure Razorpay payment..."
          : "Creating your order...",
    });
    try {
      if (details?.paymentMethod === "online") {
        const paymentOrder = await api<{
          keyId: string;
          businessName?: string;
          mode?: "test" | "live";
          appOrderId: string;
          razorpayOrderId: string;
          amount: number;
          currency: "INR";
          customer: {
            name: string;
            contact: string;
          };
        }>("/api/payments/verify?action=create-order", {
          method: "POST",
          body: JSON.stringify({ items: cart, couponCode, customerDetails: details }),
        });

        await loadRazorpayCheckout();
        if (!window.Razorpay) throw new Error("Razorpay could not load.");

        await new Promise<void>((resolve, reject) => {
          const checkout = new window.Razorpay!({
            key: paymentOrder.keyId,
            amount: paymentOrder.amount,
            currency: paymentOrder.currency,
            name: paymentOrder.businessName || "iksha gifts",
            description: "Gift order payment",
            order_id: paymentOrder.razorpayOrderId,
            prefill: paymentOrder.customer,
            theme: {
              color: "#8c5b43",
            },
            handler: async (response) => {
              try {
                await api("/api/payments/verify", {
                  method: "POST",
                  body: JSON.stringify({
                    appOrderId: paymentOrder.appOrderId,
                    razorpayOrderId: response.razorpay_order_id,
                    paymentId: response.razorpay_payment_id,
                    signature: response.razorpay_signature,
                  }),
                });
                resolve();
              } catch (error) {
                reject(error);
              }
            },
            modal: {
              ondismiss: () => reject(new Error("Payment was not completed.")),
            },
          });
          checkout.open();
        });

        clearCart();
        if (user) await loadOrders();
        setCartOpen(false);
        if (user) setOrdersOpen(true);
        setCheckout({
          status: "success",
          message: "Order Has Been Placed. Congratulations!",
        });
        return;
      }

      await api<{ order: CustomerOrder }>("/api/orders", {
        method: "POST",
        body: JSON.stringify({ items: cart, couponCode, customerDetails: details }),
      });
      clearCart();
      if (user) await loadOrders();
      setCartOpen(false);
      if (user) setOrdersOpen(true);
      setCheckout({
        status: "success",
        message: "Order Has Been Placed. Congratulations!",
      });
    } catch (error) {
      setCheckout({
        status: "error",
        message: error instanceof Error ? error.message : "Order could not be created.",
      });
    }
  };

  return (
    <CommerceContext.Provider
      value={{
        user,
        cart,
        orders,
        products: managedProducts,
        cartOpen,
        ordersOpen,
        authOpen,
        authMode,
        checkout,
        cartCount,
        cartTotal,
        setCartOpen,
        setOrdersOpen,
        openAuth,
        closeAuth,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        login,
        requestSignupOtp,
        verifySignupOtp,
        logout,
        placeOrder,
        loadOrders,
        getProduct,
      }}
    >
      {children}
    </CommerceContext.Provider>
  );
}

export function useCommerce() {
  const context = useContext(CommerceContext);
  if (!context) {
    throw new Error("useCommerce must be used inside CommerceProvider");
  }
  return context;
}
