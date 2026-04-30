/* eslint-disable @typescript-eslint/no-explicit-any */

import { randomUUID } from "node:crypto";
import { priceCart } from "./_lib/catalog.js";
import { db } from "./_lib/db.js";
import { json, method, readBody } from "./_lib/http.js";
import { assertSameOrigin, rateLimit, requireJson } from "./_lib/security.js";
import { requireUser } from "./_lib/session.js";

const firstStatus = {
  status: "order_placed",
  label: "Order placed",
  note: "We received your handmade order request.",
};

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
    const user = await requireUser(req);

    if (req.method === "GET") {
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
    const priced = await priceCart(body.items ?? []);
    if (priced.total <= 0) throw new Error("Your cart is empty.");

    const now = new Date();
    const estimated = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const order = await db.insert("orders", {
      id: `IKSHA-${randomUUID().slice(0, 8).toUpperCase()}`,
      user_id: user.id,
      amount: priced.total,
      currency: "INR",
      items: priced.lines,
      status: "order_placed",
      payment_status: "pending",
      tracking_number: null,
      estimated_delivery: estimated.toISOString().slice(0, 10),
      status_history: [{ ...firstStatus, at: now.toISOString() }],
    });

    await db.upsert("carts", { user_id: user.id, items: [] }, "user_id");
    json(res, 201, { order });
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMITED") return;
    json(res, 400, { error: error instanceof Error ? error.message : "Order request failed." });
  }
}
