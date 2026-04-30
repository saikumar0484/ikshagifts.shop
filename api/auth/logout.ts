/* eslint-disable @typescript-eslint/no-explicit-any */

import { json, method } from "../_lib/http.js";
import { assertSameOrigin, rateLimit } from "../_lib/security.js";
import { clearSession } from "../_lib/session.js";

export default async function handler(req: any, res: any) {
  if (!method(req, res, ["POST"])) return;
  try {
    assertSameOrigin(req);
    await rateLimit(req, res, "auth:logout", 20, 15 * 60);
    await clearSession(req, res);
    json(res, 200, { ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMITED") return;
    json(res, 400, { error: error instanceof Error ? error.message : "Logout failed." });
  }
}
