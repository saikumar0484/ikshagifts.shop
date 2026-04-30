/* eslint-disable @typescript-eslint/no-explicit-any */

import { json, method, readBody } from "../_lib/http.js";
import {
  createOtp,
  createPendingSignup,
  normalizeSignupInput,
  sendPhoneOtp,
} from "../_lib/otp.js";
import { assertSameOrigin, rateLimit, requireJson } from "../_lib/security.js";
import { getUserByPhone } from "../_lib/session.js";

export default async function handler(req: any, res: any) {
  if (!method(req, res, ["POST"])) return;
  try {
    assertSameOrigin(req);
    requireJson(req);
    await rateLimit(req, res, "auth:request-otp", 3, 15 * 60);
    const body = await readBody(req);
    const input = normalizeSignupInput(body);
    const existingPhone = await getUserByPhone(input.phone);
    if (existingPhone) throw new Error("An account already exists for this phone number.");

    const phoneOtp = createOtp();
    const pendingId = await createPendingSignup({ ...input, phoneOtp });

    await sendPhoneOtp(input.phone, phoneOtp);

    json(res, 200, {
      pendingId,
      phone: input.phone,
      expiresInSeconds: 600,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMITED") return;
    json(res, 400, { error: error instanceof Error ? error.message : "Unable to send OTP." });
  }
}
