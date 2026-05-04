/* eslint-disable @typescript-eslint/no-explicit-any */

import { db } from "./_lib/db.js";
import { json, method, readBody } from "./_lib/http.js";
import { assertSameOrigin, rateLimit, requireJson, safeString } from "./_lib/security.js";

function emailLike(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default async function handler(req: any, res: any) {
  if (!method(req, res, ["POST"])) return;
  try {
    assertSameOrigin(req);
    requireJson(req);
    await rateLimit(req, res, "inbox:message", 8, 15 * 60);
    const body = await readBody(req);
    const name = safeString(body.name, 120);
    const email = safeString(body.email, 180).toLowerCase();
    const message = safeString(body.message, 1200);

    if (!name) throw new Error("Name is required.");
    if (!emailLike(email)) throw new Error("Enter a valid email address.");
    if (!message || message.length < 10) throw new Error("Message must be at least 10 characters.");

    await db.insert("inbox_messages", {
      name,
      email,
      message,
      is_read: false,
    });
    json(res, 200, { ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMITED") return;
    json(res, 400, {
      error: error instanceof Error ? error.message : "Message could not be sent.",
    });
  }
}
