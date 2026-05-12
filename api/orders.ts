/* eslint-disable @typescript-eslint/no-explicit-any */

import { randomUUID } from "node:crypto";
import { deductProductStock, priceCart } from "./_lib/catalog.js";
import { db } from "./_lib/db.js";
import { json, method, readBody } from "./_lib/http.js";
import { sendStoreEmail } from "./_lib/otp.js";
import { assertSameOrigin, rateLimit, requireJson, safeString } from "./_lib/security.js";
import { getSessionUser, hashPassword, requireUser } from "./_lib/session.js";

const firstStatus = {
  status: "order_placed",
  label: "Order placed",
  note: "We received your handmade order request.",
};

const couponMinimumCartValue = 299;

function canEmailCustomer(email?: string | null) {
  return Boolean(email && !email.endsWith("@orders.ikshagifts.local"));
}

async function sendOrderPlacedEmail(order: any, user: any) {
  if (!canEmailCustomer(user.email)) return;
  const items = Array.isArray(order.items) ? order.items : [];
  const itemText = items
    .map((item: { name?: string; quantity?: number }) => `${item.quantity || 1} x ${item.name}`)
    .join(", ");
  await sendStoreEmail({
    to: user.email,
    subject: `iksha gifts received your order ${order.id}`,
    text: `Hi ${user.name}, your iksha gifts order ${order.id} has been placed. ${
      itemText ? `Items: ${itemText}.` : ""
    } Total: ₹${order.amount}.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#241f1a">
        <h2 style="margin:0 0 12px">Order placed</h2>
        <p>Hi ${user.name},</p>
        <p>Your iksha gifts order <strong>${order.id}</strong> has been placed.</p>
        ${itemText ? `<p><strong>Items:</strong> ${itemText}</p>` : ""}
        <p><strong>Total:</strong> ₹${order.amount}</p>
        <p>We will update you when the order moves ahead.</p>
      </div>
    `,
  }).catch(() => undefined);
}

function couponDiscount(code: string, total: number) {
  const normalized = code.trim().toUpperCase();
  if (normalized === "IKSHA150") {
    if (total < couponMinimumCartValue) {
      throw new Error("Add minimum ₹299 to apply coupon.");
    }
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

export default async function handler(req: any, res: any) {
  if (!method(req, res, ["GET", "POST"])) return;
  try {
    assertSameOrigin(req);
    await rateLimit(
      req,
      res,
      `orders:${req.method.toLowerCase()}`,
      req.method === "POST" ? 10 : 60,
      15 * 60,
    );
    if (req.method === "GET") {
      const user = await requireUser(req);
      const orders = await db.selectMany(
        "orders",
        { user_id: user.id },
        { order: "created_at.desc" },
      );
      json(res, 200, { orders });
      return;
    }

    requireJson(req);
    const body = await readBody(req);
    const customerDetails = body.customerDetails ?? {};
    const user = (await getSessionUser(req)) || (await getOrCreateOrderCustomer(customerDetails));
    const priced = await priceCart(body.items ?? []);
    if (priced.total <= 0) throw new Error("Your cart is empty.");
    const coupon = couponDiscount(String(body.couponCode || ""), priced.total);
    const finalTotal = Math.max(0, priced.total - coupon.discount);
    const shippingAddress = safeString(customerDetails.address, 500);
    if (shippingAddress.length < 8) throw new Error("Enter a complete delivery address.");
    const pinCode = normalizePinCode(customerDetails.pinCode);
    const requestedPaymentMethod = String(customerDetails.paymentMethod || "online");
    const paymentMethod = ["online", "upi", "cod"].includes(requestedPaymentMethod)
      ? requestedPaymentMethod
      : "online";

    const now = new Date();
    const estimated = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const order = await db.insert("orders", {
      id: `IKSHA-${randomUUID().slice(0, 8).toUpperCase()}`,
      user_id: user.id,
      amount: finalTotal,
      subtotal_amount: priced.total,
      discount_amount: coupon.discount,
      coupon_code: coupon.code || null,
      currency: "INR",
      items: priced.lines,
      status: "order_placed",
      payment_status: "pending",
      payment_method: paymentMethod,
      customer_name: safeString(customerDetails.name, 120),
      customer_phone: normalizeMobile(customerDetails.mobile),
      shipping_address: shippingAddress,
      pin_code: pinCode,
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

    await deductProductStock(priced.lines);
    await db.upsert("carts", { user_id: user.id, items: [] }, "user_id");
    await sendOrderPlacedEmail(order, user);
    json(res, 201, { order });
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMITED") return;
    json(res, 400, { error: error instanceof Error ? error.message : "Order request failed." });
  }
}
