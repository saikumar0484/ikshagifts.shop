import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Product, products } from "@/data/products";

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
  login: (payload: PhoneLoginPayload) => Promise<{ otpRequested?: boolean } | void>;
  requestSignupOtp: (payload: PhoneSignupPayload) => Promise<void>;
  verifySignupOtp: (payload: { otp: string }) => Promise<void>;
  logout: () => Promise<void>;
  placeOrder: () => Promise<void>;
  loadOrders: () => Promise<void>;
  getProduct: (productId: string) => Product | undefined;
};

type PhoneLoginPayload = {
  phone: string;
  otp?: string;
};

type PhoneSignupPayload = {
  name: string;
  phone: string;
};

const CommerceContext = createContext<CommerceContextValue | null>(null);
const CART_KEY = "iksha-cart";

type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void) => number;
  cancelIdleCallback?: (id: number) => void;
};

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

  useEffect(() => {
    const saved = window.localStorage.getItem(CART_KEY);
    if (saved) {
      setCart(JSON.parse(saved));
    }

    const hydrateCommerce = () => {
      api<{ user: User | null }>("/api/auth/me")
        .then((data) => setUser(data.user))
        .catch(() => undefined);
      api<{
        products: Array<
          Product & {
            imageUrl?: string;
            image_url?: string;
            desc?: string;
            description?: string;
            collection?: Product["collection"];
            is_featured?: boolean;
            is_best_seller?: boolean;
          }
        >;
      }>("/api/products")
        .then((data) => {
          if (!data.products?.length) return;
          setManagedProducts(
            data.products.map((product) => {
              const fallback = products.find((item) => item.id === product.id);
              return {
                ...product,
                category: product.category || fallback?.category || "Gifts",
                tag: product.tag || fallback?.tag || "New",
                desc: product.desc || product.description || fallback?.desc || "",
                image: product.imageUrl || product.image_url || fallback?.image || products[0].image,
                oldPrice: product.oldPrice ?? (product as any).old_price ?? fallback?.oldPrice,
                rating: product.rating ?? fallback?.rating ?? 4.8,
                delivery: product.delivery || fallback?.delivery || "Ships in 4-6 days",
                collection: product.collection || fallback?.collection || "custom",
                isFeatured:
                  product.isFeatured ?? product.is_featured ?? fallback?.isFeatured ?? false,
                isBestSeller:
                  (product as Product & { is_best_seller?: boolean }).isBestSeller ??
                  product.is_best_seller ??
                  fallback?.isBestSeller ??
                  false,
              };
            }),
          );
        })
        .catch(() => undefined);
    };

    const idleWindow = window as IdleWindow;
    const idleId = idleWindow.requestIdleCallback?.(hydrateCommerce);
    const timeoutId =
      idleId === undefined ? window.setTimeout(hydrateCommerce, 180) : undefined;

    return () => {
      if (idleId !== undefined) idleWindow.cancelIdleCallback?.(idleId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, []);

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

  const addToCart = (productId: string) => {
    setCart((current) => {
      const existing = current.find((line) => line.productId === productId);
      if (existing) {
        return current.map((line) =>
          line.productId === productId ? { ...line, quantity: line.quantity + 1 } : line,
        );
      }
      return [...current, { productId, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((current) =>
      current.map((line) => (line.productId === productId ? { ...line, quantity } : line)),
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

  const login = async (payload: PhoneLoginPayload) => {
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

  const requestSignupOtp = async (payload: PhoneSignupPayload) => {
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

  const placeOrder = async () => {
    if (!cart.length) return;
    if (!user) {
      openAuth("login");
      return;
    }
    setCheckout({ status: "loading", message: "Creating your order request..." });
    try {
      await api<{ order: CustomerOrder }>("/api/orders", {
        method: "POST",
        body: JSON.stringify({ items: cart }),
      });
      clearCart();
      await loadOrders();
      setCartOpen(false);
      setOrdersOpen(true);
      setCheckout({
        status: "success",
        message: "Order request created. Track it from My Orders.",
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
