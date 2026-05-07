/* eslint-disable @typescript-eslint/no-explicit-any */

import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { deductProductStock, priceCart } from "../_lib/catalog.js";
import { db } from "../_lib/db.js";
import { json, method, readBody } from "../_lib/http.js";
import { getIntegrationSecrets, listIntegrations } from "../_lib/integrations.js";
import { assertSameOrigin, rateLimit, requireJson, safeString } from "../_lib/security.js";
import { getSessionUser, hashPassword } from "../_lib/session.js";

const firstStatus = {
  status: "order_placed",
  label: "Order placed",
  note: "We received your handmade order request.",
};

function signaturesMatch(expected: string, actual: string) {
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(actual);
  return (
    expectedBuffer.length === actualBuffer.length && timingSafeEqual(expectedBuffer, actualBuffer)
  );
}

function couponDiscount(code: string, total: number) {
  const normalized = code.trim().toUpperCase();
  if (normalized === "IKSHA150") {
    return { code: normalized, discount: Math.min(150, total) };
  }
  if (!normalized) return { code: "", discount: 0 };
  throw new Error("Invalid coupon code.");
}

function normalizeMobile(value: unknown) {
  const mobile = safeString(value, 20).replace(/\s+/g, "");
  if (!/^\+?[0-9]{10,15}$/.test(mobile)) {
    throw new Error("Enter a valid mobile number.");
  }
  return mobile;
}

function normalizePinCode(value: unknown) {
  const pinCode = safeString(value, 6);
  if (!/^[0-9]{6}$/.test(pinCode)) {
    throw new Error("Enter a valid 6 digit pin code.");
  }
  return pinCode;
}

async function getOrCreateOrderCustomer(details: any) {
  const name = safeString(details?.name, 120);
  const phone = normalizeMobile(details?.mobile);
  if (!name) throw new Error("Name is required.");

  const existing = await db.selectOne<{ id: string }>("customers", { phone });
  if (existing) return existing;

  const passwordData = hashPassword(randomUUID());
  return db.insert<{ id: string }>("customers", {
    name,
    email: `guest-${phone.replace(/\D/g, "")}-${randomUUID().slice(0, 8)}@orders.ikshagifts.local`,
    phone,
    password_hash: passwordData.passwordHash,
    salt: passwordData.salt,
    email_verified: false,
    phone_verified: true,
  });
}

async function createRazorpayOrder(amount: number, receipt: string) {
  const { keyId, keySecret, enabled } = await razorpayConfig();
  if (!enabled) {
    throw new Error("Razorpay is disabled in Admin > Integrations.");
  }
  if (!keyId || !keySecret) {
    throw new Error(
      "Razorpay is not configured. Add Key ID and Key Secret in Admin > Integrations.",
    );
  }

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amount * 100,
      currency: "INR",
      receipt,
      payment_capture: 1,
      notes: {
        app_order_id: receipt,
        store: "iksha gifts",
      },
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error?.description || "Razorpay order could not be created.");
  }
  return data as { id: string; amount: number; currency: "INR" };
}

async function razorpayConfig() {
  const integrations = await listIntegrations().catch(() => []);
  const integration = integrations.find((item) => item.key === "razorpay");
  const publicConfig = (integration?.publicConfig || {}) as Record<string, string>;
  const secrets: Record<string, string> = await getIntegrationSecrets("razorpay").catch(() => ({}));
  const envKeyId = process.env.RAZORPAY_KEY_ID || "";
  const envKeySecret = process.env.RAZORPAY_KEY_SECRET || "";
  return {
    enabled: Boolean(integration?.enabled) || Boolean(envKeyId && envKeySecret),
    keyId: envKeyId || safeString(publicConfig.keyId, 120),
    keySecret: envKeySecret || secrets.keySecret || "",
    mode: safeString(publicConfig.mode || "test", 12),
    businessName: safeString(publicConfig.businessName || "iksha gifts", 80),
  };
}

async function handleCreateOrder(req: any, res: any, body: any) {
  const customerDetails = body.customerDetails ?? {};
  const user = (await getSessionUser(req)) || (await getOrCreateOrderCustomer(customerDetails));
  const priced = await priceCart(body.items ?? []);
  if (priced.total <= 0) throw new Error("Your cart is empty.");

  const coupon = couponDiscount(String(body.couponCode || ""), priced.total);
  const finalTotal = Math.max(0, priced.total - coupon.discount);
  const shippingAddress = safeString(customerDetails.address, 500);
  if (shippingAddress.length < 8) throw new Error("Enter a complete delivery address.");
  const pinCode = normalizePinCode(customerDetails.pinCode);
  const customerPhone = normalizeMobile(customerDetails.mobile);
  const now = new Date();
  const estimated = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const appOrderId = `IKSHA-${randomUUID().slice(0, 8).toUpperCase()}`;
  const razorpayOrder = await createRazorpayOrder(finalTotal, appOrderId);

  await db.insert("orders", {
    id: appOrderId,
    user_id: user.id,
    amount: finalTotal,
    subtotal_amount: priced.total,
    discount_amount: coupon.discount,
    coupon_code: coupon.code || null,
    currency: "INR",
    items: priced.lines,
    status: "order_placed",
    payment_status: "pending",
    payment_method: "online",
    customer_name: safeString(customerDetails.name, 120),
    customer_phone: customerPhone,
    shipping_address: shippingAddress,
    pin_code: pinCode,
    payment_id: null,
    razorpay_order_id: razorpayOrder.id,
    tracking_number: null,
    estimated_delivery: estimated.toISOString().slice(0, 10),
    status_history: [
      {
        ...firstStatus,
        note: coupon.discount
          ? `${firstStatus.note} Coupon ${coupon.code} applied.`
          : firstStatus.note,
        at: now.toISOString(),
      },
    ],
  });

  const config = await razorpayConfig();
  json(res, 201, {
    keyId: config.keyId,
    businessName: config.businessName,
    mode: config.mode,
    appOrderId,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    customer: {
      name: safeString(customerDetails.name, 120),
      contact: customerPhone,
    },
  });
}

async function handleVerifyPayment(body: any, res: any) {
  const { keySecret } = await razorpayConfig();
  if (!keySecret) {
    json(res, 501, { error: "Razorpay secret is not configured on the server." });
    return;
  }

  const appOrderId = String(body.appOrderId || "");
  const razorpayOrderId = String(body.razorpayOrderId || "");
  const paymentId = String(body.paymentId || "");
  const signature = String(body.signature || "");
  const order = await db.selectOne<{
    razorpay_order_id: string;
    payment_status: string;
    items: Array<{ productId: string; quantity: number }>;
  }>("orders", {
    id: appOrderId,
  });
  if (!order || order.razorpay_order_id !== razorpayOrderId) {
    throw new Error("Order not found.");
  }
  if (order.payment_status === "paid") {
    json(res, 200, { ok: true });
    return;
  }

  const generatedSignature = createHmac("sha256", keySecret)
    .update(`${razorpayOrderId}|${paymentId}`)
    .digest("hex");

  if (!signature || !signaturesMatch(generatedSignature, signature)) {
    await db.update(
      "orders",
      { id: appOrderId },
      {
        payment_status: "failed",
      },
    );
    throw new Error("Payment signature verification failed.");
  }

  await deductProductStock(order.items || []);
  await db.update(
    "orders",
    { id: appOrderId },
    {
      status: "confirmed",
      payment_status: "paid",
      payment_id: paymentId,
      razorpay_order_id: razorpayOrderId,
      paid_at: new Date().toISOString(),
    },
  );

  const paidOrder = await db.selectOne<{ user_id: string }>("orders", {
    id: appOrderId,
  });
  if (paidOrder) await db.upsert("carts", { user_id: paidOrder.user_id, items: [] }, "user_id");

  json(res, 200, { ok: true });
}

export default async function handler(req: any, res: any) {
  if (!method(req, res, ["POST"])) return;
  try {
    assertSameOrigin(req);
    requireJson(req);
    await rateLimit(req, res, "payments:verify", 10, 15 * 60);
    const body = await readBody(req);
    const requestUrl = new URL(req.url || "", `http://${req.headers.host || "localhost"}`);
    if (requestUrl.searchParams.get("action") === "create-order") {
      await handleCreateOrder(req, res, body);
      return;
    }

    await handleVerifyPayment(body, res);
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMITED") return;
    json(res, 400, {
      error: error instanceof Error ? error.message : "Payment verification failed.",
    });
  }
}
