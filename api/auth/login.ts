/* eslint-disable @typescript-eslint/no-explicit-any */

import { json, method, readBody } from "../_lib/http.js";
import { assertSameOrigin, rateLimit, requireJson } from "../_lib/security.js";
import { setSession, verifyUser } from "../_lib/session.js";

export default async function handler(req: any, res: any) {
  if (!method(req, res, ["POST"])) return;
  try {
    assertSameOrigin(req);
    requireJson(req);
    await rateLimit(req, res, "auth:login", 8, 15 * 60);
    const body = await readBody(req);
    const user = await verifyUser(body.email ?? "", body.password ?? "");
    await setSession(res, user.id);
    json(res, 200, { user });
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMITED") return;
    json(res, 401, { error: error instanceof Error ? error.message : "Login failed." });
  }
}
