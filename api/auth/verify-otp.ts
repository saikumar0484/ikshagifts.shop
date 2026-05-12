/* eslint-disable @typescript-eslint/no-explicit-any */

import { randomUUID, timingSafeEqual } from "node:crypto";
import { db } from "../_lib/db.js";
import { json, method, readBody } from "../_lib/http.js";
import { hashOtp, normalizeEmail, type PendingSignup } from "../_lib/otp.js";
import { assertSameOrigin, rateLimit, requireJson, safeString } from "../_lib/security.js";
import {
  getUserByEmail,
  hashPassword,
  publicUser,
  setSession,
  type CustomerRow,
} from "../_lib/session.js";

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

async function getOrCreateEmailCustomer(input: {
  id?: string;
  firstName: string;
  email: string;
  passwordHash: string;
  salt: string;
}) {
  const existing = await getUserByEmail(input.email);
  if (existing) {
    const updated = await db.update<CustomerRow>(
      "customers",
      { id: existing.id },
      {
        name: input.firstName || existing.name,
        email_verified: true,
      },
    );
    await db.upsert(
      "users",
      {
        id: existing.id,
        first_name: input.firstName || existing.name,
        email: input.email,
      },
      "email",
    );
    return publicUser(updated || existing);
  }

  const passwordData =
    input.passwordHash && input.salt
      ? { passwordHash: input.passwordHash, salt: input.salt }
      : hashPassword(randomUUID());
  const user = await db.insert<CustomerRow>("customers", {
    id: input.id || randomUUID(),
    name: input.firstName,
    email: input.email,
    phone: null,
    password_hash: passwordData.passwordHash,
    salt: passwordData.salt,
    email_verified: true,
    phone_verified: false,
  });
  await db.upsert(
    "users",
    {
      id: user.id,
      first_name: input.firstName,
      email: input.email,
    },
    "email",
  );
  return publicUser(user);
}

export default async function handler(req: any, res: any) {
  if (!method(req, res, ["POST"])) return;
  try {
    assertSameOrigin(req);
    requireJson(req);
    await rateLimit(req, res, "auth:verify-email-otp", 10, 15 * 60);
    const body = await readBody(req);
    const pendingId = safeString(body.pendingId, 80);
    const email = normalizeEmail(String(body.email || ""));
    const otp = safeString(body.otp, 12).replace(/\D/g, "");
    if (!pendingId) throw new Error("Request a new OTP first.");
    if (otp.length < 4) throw new Error("Enter the OTP sent to your email.");

    const pending = await db.selectOne<PendingSignup>("pending_signups", { id: pendingId });
    if (!pending || pending.email !== email) throw new Error("OTP request was not found.");
    if (new Date(pending.expires_at).getTime() < Date.now()) {
      await db.delete("pending_signups", { id: pendingId }).catch(() => undefined);
      throw new Error("OTP expired. Please request a new code.");
    }
    if (pending.attempts >= 5) throw new Error("Too many incorrect OTP attempts.");

    const actualHash = hashOtp(otp, pending.id, "email");
    if (!safeCompare(actualHash, pending.email_otp_hash)) {
      await db.update("pending_signups", { id: pending.id }, { attempts: pending.attempts + 1 });
      throw new Error("Incorrect OTP. Check the latest email and try again.");
    }

    const firstName = safeString(body.firstName, 80) || pending.name;
    if (firstName.length < 2) throw new Error("Enter your first name.");

    const user = await getOrCreateEmailCustomer({
      id: pending.id,
      firstName,
      email,
      passwordHash: pending.password_hash,
      salt: pending.salt,
    });
    await db.delete("pending_signups", { id: pending.id }).catch(() => undefined);
    await setSession(res, user.id);
    json(res, 200, { user, redirectTo: "/account" });
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMITED") return;
    json(res, 400, { error: error instanceof Error ? error.message : "OTP verification failed." });
  }
}
