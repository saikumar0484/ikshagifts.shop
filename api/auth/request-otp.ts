/* eslint-disable @typescript-eslint/no-explicit-any */

import { randomUUID } from "node:crypto";
import { json, method, readBody } from "../_lib/http.js";
import { createOtp, createPendingSignup, normalizeEmail, sendEmailOtp } from "../_lib/otp.js";
import { assertSameOrigin, rateLimit, requireJson, safeString } from "../_lib/security.js";

export default async function handler(req: any, res: any) {
  if (!method(req, res, ["POST"])) return;
  try {
    assertSameOrigin(req);
    requireJson(req);
    await rateLimit(req, res, "auth:request-email-otp", 5, 15 * 60);
    const body = await readBody(req);
    const email = normalizeEmail(String(body.email || ""));
    const firstName = safeString(body.firstName, 80);
    if (firstName.length < 2) throw new Error("Enter your first name.");

    const otp = createOtp();
    const pendingId = await createPendingSignup({
      name: firstName,
      email,
      phone: null,
      password: randomUUID(),
      emailOtp: otp,
      phoneOtp: otp,
    });
    await sendEmailOtp(email, otp, firstName);
    json(res, 200, { email, pendingId, expiresInSeconds: 600 });
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMITED") return;
    json(res, 400, { error: error instanceof Error ? error.message : "Unable to send OTP." });
  }
}
