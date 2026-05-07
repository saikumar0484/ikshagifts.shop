/* eslint-disable @typescript-eslint/no-explicit-any */

import { randomUUID } from "node:crypto";
import {
  requireAdmin,
  setAdminSession,
  clearAdminSession,
  isAdmin,
  verifyAdminLogin,
  verifyAdminPasscode,
  getPrimaryAdminUser,
  markAdminLogin,
} from "./_lib/admin.js";
import {
  bumpCatalogVersion,
  categoryLabel,
  isProductCategory,
  ProductRow,
} from "./_lib/catalog.js";
import { db, uploadStorageObject } from "./_lib/db.js";
import { json, method, readBody } from "./_lib/http.js";
import { listIntegrations, saveIntegration } from "./_lib/integrations.js";
import { assertSameOrigin, rateLimit, requireJson, safeString } from "./_lib/security.js";
import {
  addSupportNote,
  getSupportConversation,
  listSupportWorkspace,
  sendSupportMessage,
  suggestSupportReplies,
  updateSupportConversation,
} from "./_lib/whatsapp.js";

type CustomerRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  email_verified?: boolean;
  phone_verified?: boolean;
  created_at: string;
};

type OrderRow = {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  items: Array<{ name: string; quantity: number; lineTotal: number }>;
  status: string;
  payment_status: string;
  tracking_number: string | null;
  estimated_delivery: string | null;
  status_history: unknown[];
  created_at: string;
};

type InboxMessageRow = {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

const imageTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const labels: Record<string, string> = {
  order_placed: "Order placed",
  confirmed: "Order confirmed",
  making: "Being handmade",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function actionFrom(req: any) {
  const direct = String(req.query?.action || "");
  if (direct) return direct;
  return (
    new URL(req.url || "/api/admin", "https://ikshagifts.shop").searchParams.get("action") || ""
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function productBody(body: any) {
  const name = safeString(body.name, 120);
  if (!name) throw new Error("Product name is required.");
  const id = safeString(body.id || slugify(name), 100);
  const category = safeString(body.category || "", 80);
  if (!isProductCategory(category)) {
    throw new Error("Choose Women, Men, or Customized Gifts for the product category.");
  }
  const isAvailable = body.isAvailable ?? body.is_available;
  return {
    id,
    name,
    category,
    tag: safeString(body.tag || "New", 60),
    description: safeString(body.description || body.desc, 500),
    image_url: safeString(body.imageUrl || body.image_url, 500) || null,
    price: Math.max(0, Math.round(Number(body.price) || 0)),
    old_price:
      body.oldPrice || body.old_price
        ? Math.max(0, Math.round(Number(body.oldPrice || body.old_price)))
        : null,
    rating: Math.max(0, Math.min(Number(body.rating) || 4.8, 5)),
    delivery: safeString(body.delivery || "Ships in 4-6 days", 80),
    stock_quantity: Math.max(0, Math.round(Number(body.stockQuantity ?? body.stock_quantity ?? 0))),
    is_available: isAvailable === undefined ? true : Boolean(isAvailable),
    is_featured: Boolean(body.isFeatured ?? body.is_featured),
    sort_order: Math.round(Number(body.sortOrder ?? body.sort_order ?? 100)),
    updated_at: new Date().toISOString(),
  };
}

async function productImageBody(body: any) {
  const dataUrl = String(body.dataUrl || body.data_url || "");
  const match = dataUrl.match(/^data:(image\/(?:jpe?g|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) throw new Error("Upload a JPG, PNG, or WEBP image.");
  const mimeType = match[1].toLowerCase();
  const extension = imageTypes[mimeType];
  if (!extension) throw new Error("Upload a JPG, PNG, or WEBP image.");
  const bytes = Buffer.from(match[2], "base64");
  if (!bytes.length) throw new Error("Image file is empty.");
  if (bytes.byteLength > 5 * 1024 * 1024) throw new Error("Image must be 5 MB or smaller.");

  const name = slugify(safeString(body.name || "product-image", 120)) || "product-image";
  const imageUrl = await uploadStorageObject(
    "product-images",
    `${name}-${randomUUID()}.${extension}`,
    bytes,
    mimeType === "image/jpg" ? "image/jpeg" : mimeType,
  );
  return { imageUrl };
}

function inLastDays(date: string, days: number) {
  return new Date(date).getTime() >= Date.now() - days * 24 * 60 * 60 * 1000;
}

async function listOrdersWithCustomers() {
  const [orders, customers] = await Promise.all([
    db.list<OrderRow>("orders", { order: "created_at.desc" }),
    db.list<CustomerRow>("customers"),
  ]);
  const customersById = new Map(customers.map((customer) => [customer.id, customer]));
  return orders.map((order) => ({ ...order, customer: customersById.get(order.user_id) || null }));
}

export default async function handler(req: any, res: any) {
  const action = actionFrom(req);
  try {
    if (action === "me") {
      if (!method(req, res, ["GET"])) return;
      json(res, 200, { admin: await isAdmin(req) });
      return;
    }

    if (action === "login") {
      if (!method(req, res, ["POST"])) return;
      assertSameOrigin(req);
      requireJson(req);
      await rateLimit(req, res, "admin:login", 10, 15 * 60);
      const body = await readBody(req);
      let adminUser: { id: string; email: string; name: string } | null = null;

      if (body.email || body.password) {
        adminUser = await verifyAdminLogin(String(body.email || ""), String(body.password || ""));
      } else if (verifyAdminPasscode(String(body.passcode || ""))) {
        adminUser = await getPrimaryAdminUser();
        if (!adminUser) {
          throw new Error("Owner account is not set up yet.");
        }
      } else {
        json(res, 401, { error: "Invalid owner email or password." });
        return;
      }
      if (!adminUser) throw new Error("Owner account is not set up yet.");

      await markAdminLogin(adminUser.id);
      await setAdminSession(res, adminUser.id);
      json(res, 200, { ok: true, owner: { email: adminUser.email, name: adminUser.name } });
      return;
    }

    if (action === "logout") {
      if (!method(req, res, ["POST"])) return;
      assertSameOrigin(req);
      await clearAdminSession(req, res);
      json(res, 200, { ok: true });
      return;
    }

    await requireAdmin(req);

    if (action === "summary") {
      if (!method(req, res, ["GET"])) return;
      const [orders, customers, products, messages] = await Promise.all([
        db.list<OrderRow>("orders", { order: "created_at.desc" }),
        db.list<CustomerRow>("customers", { order: "created_at.desc" }),
        db.list<ProductRow>("products", { order: "sort_order.asc,name.asc" }),
        db.list<InboxMessageRow>("inbox_messages", { order: "created_at.desc" }).catch(() => []),
      ]);
      const revenue = orders.reduce((sum, order) => sum + Number(order.amount || 0), 0);
      const paidRevenue = orders
        .filter((order) => order.payment_status === "paid")
        .reduce((sum, order) => sum + Number(order.amount || 0), 0);
      const lowStock = products.filter(
        (product) => product.is_available && product.stock_quantity <= 3,
      );
      const productsWithoutImages = products.filter((product) => !product.image_url);
      const byStatus = orders.reduce<Record<string, number>>((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {});
      json(res, 200, {
        metrics: {
          totalOrders: orders.length,
          recentOrders: orders.filter((order) => inLastDays(order.created_at, 7)).length,
          totalCustomers: customers.length,
          totalProducts: products.length,
          activeProducts: products.filter((product) => product.is_available).length,
          hiddenProducts: products.filter((product) => !product.is_available).length,
          lowStockProducts: lowStock.length,
          productsWithoutImages: productsWithoutImages.length,
          unreadMessages: messages.filter((message) => !message.is_read).length,
          revenue,
          paidRevenue,
          pendingOrders: orders.filter(
            (order) => order.status !== "delivered" && order.status !== "cancelled",
          ).length,
        },
        byStatus,
        recentOrders: orders.slice(0, 8),
        lowStock,
        productsWithoutImages,
      });
      return;
    }

    if (action === "products") {
      if (!method(req, res, ["GET", "POST", "PATCH", "DELETE"])) return;
      await rateLimit(req, res, `admin:products:${req.method.toLowerCase()}`, 80, 15 * 60);
      if (req.method === "GET") {
        const category = safeString(req.query?.category || "", 80);
        if (category && !isProductCategory(category)) {
          throw new Error("Unknown product category.");
        }
        const products = category
          ? await db.selectMany<ProductRow>(
              "products",
              { category },
              { order: "sort_order.asc,name.asc" },
            )
          : await db.list<ProductRow>("products", {
              order: "sort_order.asc,name.asc",
            });
        json(res, 200, {
          products: products.map((product) => ({
            ...product,
            category_label: categoryLabel(product.category),
          })),
        });
        return;
      }
      assertSameOrigin(req);
      requireJson(req);
      const body = await readBody(req);
      if (req.method === "DELETE") {
        const id = safeString(body.id, 100);
        if (!id) throw new Error("Product id is required.");
        await db.delete("products", { id });
        await bumpCatalogVersion("product-deleted");
        json(res, 200, { ok: true });
        return;
      }
      const payload = productBody(body);
      const product =
        req.method === "POST"
          ? await db.upsert<ProductRow>(
              "products",
              { ...payload, created_at: new Date().toISOString() },
              "id",
            )
          : await db.update<ProductRow>("products", { id: payload.id }, payload);
      await bumpCatalogVersion(req.method === "POST" ? "product-saved" : "product-updated");
      json(res, 200, { product });
      return;
    }

    if (action === "product-image") {
      if (!method(req, res, ["POST"])) return;
      assertSameOrigin(req);
      requireJson(req);
      await rateLimit(req, res, "admin:product-image", 20, 15 * 60);
      json(res, 200, await productImageBody(await readBody(req, 7 * 1024 * 1024)));
      return;
    }

    if (action === "inbox") {
      if (!method(req, res, ["GET", "PATCH", "DELETE"])) return;
      await rateLimit(req, res, `admin:inbox:${req.method.toLowerCase()}`, 80, 15 * 60);
      if (req.method === "GET") {
        const messages = await db.list<InboxMessageRow>("inbox_messages", {
          order: "created_at.desc",
        });
        json(res, 200, { messages });
        return;
      }
      assertSameOrigin(req);
      requireJson(req);
      const body = await readBody(req);
      const id = safeString(body.id, 100);
      if (!id) throw new Error("Message id is required.");
      if (req.method === "DELETE") {
        await db.delete("inbox_messages", { id });
        json(res, 200, { ok: true });
        return;
      }
      const message = await db.update<InboxMessageRow>(
        "inbox_messages",
        { id },
        { is_read: Boolean(body.isRead ?? body.is_read) },
      );
      json(res, 200, { message });
      return;
    }

    if (action === "orders") {
      if (!method(req, res, ["GET"])) return;
      json(res, 200, { orders: await listOrdersWithCustomers() });
      return;
    }

    if (action === "customers") {
      if (!method(req, res, ["GET"])) return;
      const [customers, orders] = await Promise.all([
        db.list<CustomerRow>("customers", { order: "created_at.desc" }),
        db.list<OrderRow>("orders"),
      ]);
      json(res, 200, {
        customers: customers.map((customer) => {
          const customerOrders = orders.filter((order) => order.user_id === customer.id);
          return {
            ...customer,
            orderCount: customerOrders.length,
            lifetimeValue: customerOrders.reduce(
              (sum, order) => sum + Number(order.amount || 0),
              0,
            ),
            lastOrderAt:
              customerOrders.sort((a, b) => b.created_at.localeCompare(a.created_at))[0]
                ?.created_at || null,
          };
        }),
      });
      return;
    }

    if (action === "integrations") {
      if (!method(req, res, ["GET", "POST"])) return;
      if (req.method === "GET") {
        json(res, 200, { integrations: await listIntegrations() });
        return;
      }
      assertSameOrigin(req);
      requireJson(req);
      await rateLimit(req, res, "admin:integrations", 20, 15 * 60);
      const body = await readBody(req);
      json(res, 200, { integration: await saveIntegration(body) });
      return;
    }

    if (action === "support") {
      if (!method(req, res, ["GET"])) return;
      try {
        json(res, 200, await listSupportWorkspace());
      } catch (error) {
        json(res, 200, {
          conversations: [],
          agents: [],
          templates: [],
          unreadCount: 0,
          setupRequired:
            error instanceof Error
              ? error.message
              : "Support tables are not ready. Apply the Supabase schema.",
        });
      }
      return;
    }

    if (action === "support-conversation") {
      if (!method(req, res, ["GET", "PATCH"])) return;
      if (req.method === "GET") {
        const id = safeString(req.query?.id || "", 80);
        json(res, 200, { conversation: await getSupportConversation(id) });
        return;
      }
      assertSameOrigin(req);
      requireJson(req);
      const body = await readBody(req);
      json(res, 200, { conversation: await updateSupportConversation(body) });
      return;
    }

    if (action === "support-message") {
      if (!method(req, res, ["POST"])) return;
      assertSameOrigin(req);
      requireJson(req);
      await rateLimit(req, res, "admin:support-message", 60, 15 * 60);
      json(res, 200, { conversation: await sendSupportMessage(await readBody(req)) });
      return;
    }

    if (action === "support-note") {
      if (!method(req, res, ["POST"])) return;
      assertSameOrigin(req);
      requireJson(req);
      await rateLimit(req, res, "admin:support-note", 80, 15 * 60);
      json(res, 200, { conversation: await addSupportNote(await readBody(req)) });
      return;
    }

    if (action === "support-suggestions") {
      if (!method(req, res, ["GET"])) return;
      const id = safeString(req.query?.id || "", 80);
      json(res, 200, { suggestions: await suggestSupportReplies(id) });
      return;
    }

    if (action === "order-status") {
      if (!method(req, res, ["POST"])) return;
      assertSameOrigin(req);
      requireJson(req);
      await rateLimit(req, res, "admin:orders:status", 30, 15 * 60);
      const body = await readBody(req);
      const order = await db.selectOne<any>("orders", { id: safeString(body.orderId, 80) });
      if (!order) throw new Error("Order not found.");
      const status = safeString(body.status, 40);
      if (!labels[status]) throw new Error("Unknown order status.");
      const history = Array.isArray(order.status_history) ? order.status_history : [];
      const updated = await db.update(
        "orders",
        { id: order.id },
        {
          status,
          tracking_number: body.trackingNumber
            ? safeString(body.trackingNumber, 80)
            : order.tracking_number,
          estimated_delivery: body.estimatedDelivery
            ? safeString(body.estimatedDelivery, 20)
            : order.estimated_delivery,
          status_history: [
            ...history,
            {
              status,
              label: labels[status],
              note: safeString(body.note || labels[status], 240),
              at: new Date().toISOString(),
            },
          ],
        },
      );
      json(res, 200, { order: updated });
      return;
    }

    json(res, 404, { error: "Unknown admin action." });
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMITED") return;
    json(res, 400, { error: error instanceof Error ? error.message : "Admin request failed." });
  }
}
