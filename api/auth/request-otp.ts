/* eslint-disable @typescript-eslint/no-explicit-any */

import { json, method, readBody } from "../_lib/http.js";
import {
  createOtp,
  createPendingSignup,
  normalizeSignupInput,
  sendEmailOtp,
} from "../_lib/otp.js";
import { assertSameOrigin, rateLimit, requireJson } from "../_lib/security.js";
import { getUserByEmail, getUserByPhone } from "../_lib/session.js";

export default async function handler(req: any, res: any) {
  if (!method(req, res, ["POST"])) return;
  try {
    assertSameOrigin(req);
    requireJson(req);
    await rateLimit(req, res, "auth:request-otp", 3, 15 * 60);
    const body = await readBody(req);
    const input = normalizeSignupInput(body);
    const existingEmail = await getUserByEmail(input.email);
    if (existingEmail) throw new Error("An account already exists for this email.");
    if (input.phone) {
      const existingPhone = await getUserByPhone(input.phone);
      if (existingPhone) throw new Error("An account already exists for this phone number.");
    }

    const emailOtp = createOtp();
    const pendingId = await createPendingSignup({ ...input, emailOtp, phoneOtp: emailOtp });

    await sendEmailOtp(input.email, emailOtp);

    json(res, 200, {
      pendingId,
      email: input.email,
      expiresInSeconds: 600,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMITED") return;
    json(res, 400, { error: error instanceof Error ? error.message : "Unable to send OTP." });
  }
}
