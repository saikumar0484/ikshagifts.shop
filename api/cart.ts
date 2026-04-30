/* eslint-disable @typescript-eslint/no-explicit-any */

import { priceCart } from "./_lib/catalog.js";
import { db } from "./_lib/db.js";
import { json, method, readBody } from "./_lib/http.js";
import { assertSameOrigin, rateLimit, requireJson } from "./_lib/security.js";
import { requireUser } from "./_lib/session.js";

export default async function handler(req: any, res: any) {
  if (!method(req, res, ["GET", "POST"])) return;
  try {
    assertSameOrigin(req);
    await rateLimit(req, res, `cart:${req.method.toLowerCase()}`, 60, 15 * 60);
    const user = await requireUser(req);
    if (req.method === "GET") {
      const cart = await db.selectOne<{ items: unknown[] }>("carts", { user_id: user.id });
      json(res, 200, { items: cart?.items ?? [] });
      return;
    }
    requireJson(req);
    const body = await readBody(req);
    const priced = await priceCart(body.items ?? []);
    await db.upsert("carts", { user_id: user.id, items: body.items ?? [] }, "user_id");
    json(res, 200, { items: body.items ?? [], total: priced.total });
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMITED") return;
    json(res, 400, { error: error instanceof Error ? error.message : "Cart update failed." });
  }
}
