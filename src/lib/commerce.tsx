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
import { supabase } from "@/lib/supabaseClient";

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
  login: (
    payload: EmailOtpPayload,
  ) => Promise<{ otpRequested?: boolean; pendingId?: string } | void>;
  requestSignupOtp: (payload: EmailOtpPayload) => Promise<void>;
  verifySignupOtp: (payload: {
    email: string;
    firstName: string;
    pendingId: string;
    otp: string;
  }) => Promise<void>;
  updateProfile: (payload: { firstName: string }) => Promise<void>;
  logout: () => Promise<void>;
  placeOrder: (couponCode?: string, details?: CheckoutDetails) => Promise<void>;
  loadOrders: () => Promise<void>;
  getProduct: (productId: string) => Product | undefined;
};

type EmailOtpPayload = {
  firstName: string;
  email: string;
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
  image2Url?: string;
  image2_url?: string;
  images?: string[];
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
  return Boolean(
    value &&
    (/(^https?:\/\/)?via\.placeholder\.com\//i.test(value) ||
      /drive\.google\.com\/drive\/folders\//i.test(value)),
  );
}

function normalizeExternalImageUrl(value?: string | null) {
  const image = String(value || "").trim();
  const driveMatch = image.match(/drive\.google\.com\/file\/d\/([^/]+)/i);
  const driveOpenMatch = image.match(/[?&]id=([^&]+)/i);
  const driveId =
    driveMatch?.[1] || (image.includes("drive.google.com") ? driveOpenMatch?.[1] : "");
  if (driveId) return `https://drive.google.com/thumbnail?id=${driveId}&sz=w1200`;
  return image;
}

function resolveProductImage(product: ManagedProductRow, fallback?: Product) {
  const image = resolveProductImages(product, fallback)[0];
  if (image && !isBlockedPlaceholderImage(image)) return image;
  return fallback?.image || placeholderImage(product.name || "Gift");
}

function splitStoredImages(value?: string | null) {
  return String(value || "")
    .split("||")
    .map(normalizeExternalImageUrl)
    .filter((image) => image && !isBlockedPlaceholderImage(image));
}

function resolveProductImages(product: ManagedProductRow, fallback?: Product) {
  const storedImages = splitStoredImages(product.image_url);
  const directImages = Array.isArray(product.images) ? product.images : [];
  const images = [
    ...directImages,
    normalizeExternalImageUrl(product.imageUrl),
    normalizeExternalImageUrl(product.image2Url),
    normalizeExternalImageUrl(product.image2_url),
    ...storedImages,
    normalizeExternalImageUrl(product.image),
    ...(fallback?.images || []),
    normalizeExternalImageUrl(fallback?.imageUrl),
    normalizeExternalImageUrl(fallback?.image2Url),
    normalizeExternalImageUrl(fallback?.image2),
    normalizeExternalImageUrl(fallback?.image),
  ]
    .filter((image): image is string => Boolean(image && !isBlockedPlaceholderImage(image)))
    .filter((image, index, list) => list.indexOf(image) === index);
  const firstImage = images[0] || placeholderImage(product.name || "Gift");
  const secondImage = images[1] || firstImage;
  return [firstImage, secondImage];
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

  const syncSupabaseSession = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    if (!session?.access_token || !session.user.email) return;

    const metadata = session.user.user_metadata as { first_name?: string } | null;
    const fallbackName = session.user.email
      .split("@")[0]
      ?.replace(/[^a-z0-9]+/gi, " ")
      .trim();
    const firstName = metadata?.first_name || fallbackName || "Customer";

    const response = await api<{ user: User }>("/api/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({
        email: session.user.email,
        firstName,
        accessToken: session.access_token,
      }),
    });
    setUser(response.user);
  }, []);

  const loadProducts = useCallback(async () => {
    const data = await api<{ products: ManagedProductRow[] }>(`/api/products?t=${Date.now()}`, {
      cache: "no-store",
    });
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
          images: resolveProductImages(product, fallback),
          image2: resolveProductImages(product, fallback)[1],
          image2Url: resolveProductImages(product, fallback)[1],
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
        .then((data) => {
          if (data.user) {
            setUser(data.user);
            return;
          }
          syncSupabaseSession().catch(() => undefined);
        })
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
  }, [loadProducts, syncSupabaseSession]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        syncSupabaseSession().catch(() => undefined);
      }
    });

    return () => subscription.unsubscribe();
  }, [syncSupabaseSession]);

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

  const login = async (payload: EmailOtpPayload) => {
    const data = await api<{ email: string; pendingId: string; expiresInSeconds: number }>(
      "/api/auth/request-otp",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
    return { otpRequested: true, pendingId: data.pendingId };
  };

  const requestSignupOtp = async (payload: EmailOtpPayload) => {
    await api<{ email: string; pendingId: string; expiresInSeconds: number }>(
      "/api/auth/request-otp",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  };

  const logout = async () => {
    await supabase.auth.signOut().catch(() => undefined);
    await api("/api/auth/logout", { method: "POST" });
    setUser(null);
  };

  const verifySignupOtp = async (payload: {
    email: string;
    firstName: string;
    pendingId: string;
    otp: string;
  }) => {
    const data = await api<{ user: User; redirectTo?: string }>("/api/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setUser(data.user);
    setAuthOpen(false);
    if (window.location.pathname !== "/account") {
      window.history.pushState(null, "", data.redirectTo || "/account");
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  };

  const updateProfile = async (payload: { firstName: string }) => {
    const data = await api<{ user: User }>("/api/auth/me", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    setUser(data.user);
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
        updateProfile,
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
