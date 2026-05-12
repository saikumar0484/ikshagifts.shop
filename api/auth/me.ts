/* eslint-disable @typescript-eslint/no-explicit-any */

import { db } from "../_lib/db.js";
import { json, method } from "../_lib/http.js";
import { readBody } from "../_lib/http.js";
import { assertSameOrigin, rateLimit, requireJson, safeString } from "../_lib/security.js";
import { getSessionUser, publicUser, requireUser, type CustomerRow } from "../_lib/session.js";

export default async function handler(req: any, res: any) {
  if (!method(req, res, ["GET", "PATCH"])) return;
  try {
    assertSameOrigin(req);
    await rateLimit(req, res, `auth:me:${req.method.toLowerCase()}`, 30, 15 * 60);
    if (req.method === "GET") {
      const user = await getSessionUser(req);
      if (String(req.query?.action || "") !== "account") {
        json(res, 200, { user });
        return;
      }
      if (!user) throw new Error("Please log in to continue.");
      const orders = await db.selectMany(
        "orders",
        { user_id: user.id },
        { order: "created_at.desc" },
      );
      json(res, 200, { user, orders });
      return;
    }

    requireJson(req);
    const user = await requireUser(req);
    const body = await readBody(req);
    const firstName = safeString(body.firstName, 80);
    if (firstName.length < 2) throw new Error("Enter a valid first name.");
    const updated = await db.update<CustomerRow>(
      "customers",
      { id: user.id },
      {
        name: firstName,
      },
    );
    await db.upsert(
      "users",
      {
        id: user.id,
        first_name: firstName,
        email: user.email,
      },
      "email",
    );
    json(res, 200, { user: updated ? publicUser(updated) : { ...user, name: firstName } });
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMITED") return;
    json(res, 400, { error: error instanceof Error ? error.message : "Account request failed." });
  }
}
