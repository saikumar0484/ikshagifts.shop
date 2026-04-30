/* eslint-disable @typescript-eslint/no-explicit-any */

import { createHmac, timingSafeEqual } from "node:crypto";
import { db } from "../_lib/db.js";
import { json, method, readBody } from "../_lib/http.js";
import { assertSameOrigin, rateLimit, requireJson } from "../_lib/security.js";
import { requireUser } from "../_lib/session.js";

function signaturesMatch(expected: string, actual: string) {
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(actual);
  return (
    expectedBuffer.length === actualBuffer.length && timingSafeEqual(expectedBuffer, actualBuffer)
  );
}

export default async function handler(req: any, res: any) {
  if (!method(req, res, ["POST"])) return;
  try {
    assertSameOrigin(req);
    requireJson(req);
    await rateLimit(req, res, "payments:verify", 10, 15 * 60);
    const user = await requireUser(req);
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      json(res, 501, { error: "Razorpay secret is not configured on the server." });
      return;
    }

    const body = await readBody(req);
    const order = await db.selectOne<{ user_id: string; status: string }>("orders", {
      id: body.orderId,
    });
    if (!order || order.user_id !== user.id) throw new Error("Order not found.");

    const generatedSignature = createHmac("sha256", keySecret)
      .update(`${body.orderId}|${body.paymentId}`)
      .digest("hex");

    if (!signaturesMatch(generatedSignature, body.signature)) {
      throw new Error("Payment signature verification failed.");
    }

    await db.update(
      "orders",
      { id: body.orderId },
      {
        status: "confirmed",
        payment_status: "paid",
        payment_id: body.paymentId,
        paid_at: new Date().toISOString(),
      },
    );
    await db.upsert("carts", { user_id: user.id, items: [] }, "user_id");

    json(res, 200, { ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMITED") return;
    json(res, 400, {
      error: error instanceof Error ? error.message : "Payment verification failed.",
    });
  }
}
