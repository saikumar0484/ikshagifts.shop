/* eslint-disable @typescript-eslint/no-explicit-any */

import { db } from "../_lib/db.js";
import { json, method, readBody } from "../_lib/http.js";
import { hashOtp, type PendingSignup } from "../_lib/otp.js";
import { assertSameOrigin, rateLimit, requireJson } from "../_lib/security.js";
import { createVerifiedUser, setSession } from "../_lib/session.js";

export default async function handler(req: any, res: any) {
  if (!method(req, res, ["POST"])) return;
  try {
    assertSameOrigin(req);
    requireJson(req);
    await rateLimit(req, res, "auth:verify-otp", 10, 15 * 60);
    const body = await readBody(req);
    const pendingId = String(body.pendingId || "");
    const emailOtp = String(body.emailOtp || "");
    const phoneOtp = String(body.phoneOtp || "");
    const pending = await db.selectOne<PendingSignup>("pending_signups", { id: pendingId });

    if (!pending) throw new Error("OTP expired. Please request a new code.");
    if (new Date(pending.expires_at).getTime() < Date.now()) {
      await db.delete("pending_signups", { id: pendingId });
      throw new Error("OTP expired. Please request a new code.");
    }
    if (pending.attempts >= 5) {
      await db.delete("pending_signups", { id: pendingId });
      throw new Error("Too many OTP attempts. Please request a new code.");
    }

    const emailMatches = hashOtp(emailOtp, pendingId, "email") === pending.email_otp_hash;
    const phoneMatches = hashOtp(phoneOtp, pendingId, "phone") === pending.phone_otp_hash;
    if (!emailMatches || !phoneMatches) {
      await db.update("pending_signups", { id: pendingId }, { attempts: pending.attempts + 1 });
      throw new Error("One or both OTP codes are incorrect.");
    }

    const user = await createVerifiedUser({
      name: pending.name,
      email: pending.email,
      phone: pending.phone,
      passwordHash: pending.password_hash,
      salt: pending.salt,
    });
    await db.delete("pending_signups", { id: pendingId });
    await setSession(res, user.id);
    json(res, 201, { user });
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMITED") return;
    json(res, 400, { error: error instanceof Error ? error.message : "OTP verification failed." });
  }
}
