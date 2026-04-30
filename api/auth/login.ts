/* eslint-disable @typescript-eslint/no-explicit-any */

import { createHmac } from "node:crypto";
import { json, method, readBody } from "../_lib/http.js";
import { assertSameOrigin, rateLimit, requireJson } from "../_lib/security.js";
import { createOtp, hashOtp, normalizePhone, sendPhoneOtp } from "../_lib/otp.js";
import { getUserByPhone, setSession } from "../_lib/session.js";

const LOGIN_COOKIE = "iksha_login_challenge";
const LOGIN_TTL_SECONDS = 10 * 60;

function secret() {
  return process.env.SESSION_SECRET || "replace-this-session-secret-before-live";
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

function getCookie(req: any, name: string) {
  const cookie = String(req.headers.cookie || "");
  const match = cookie
    .split(";")
    .map((part: string) => part.trim())
    .find((part: string) => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : "";
}

function setChallenge(res: any, phone: string, otp: string) {
  const expiresAt = new Date(Date.now() + LOGIN_TTL_SECONDS * 1000).toISOString();
  const payload = Buffer.from(
    JSON.stringify({
      phone,
      otpHash: hashOtp(otp, phone, "login"),
      expiresAt,
    }),
  ).toString("base64url");
  const value = `${payload}.${sign(payload)}`;
  res.setHeader(
    "Set-Cookie",
    `${LOGIN_COOKIE}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=${LOGIN_TTL_SECONDS}`,
  );
}

function clearChallenge(res: any) {
  res.setHeader(
    "Set-Cookie",
    `${LOGIN_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0`,
  );
}

function readChallenge(req: any) {
  const value = getCookie(req, LOGIN_COOKIE);
  const [payload, signature] = value.split(".");
  if (!payload || !signature || sign(payload) !== signature) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      phone: string;
      otpHash: string;
      expiresAt: string;
    };
  } catch {
    return null;
  }
}

export default async function handler(req: any, res: any) {
  if (!method(req, res, ["POST"])) return;
  try {
    assertSameOrigin(req);
    requireJson(req);
    await rateLimit(req, res, "auth:login", 8, 15 * 60);
    const body = await readBody(req);
    const phone = normalizePhone(String(body.phone || ""));
    const otp = String(body.otp || "");
    const user = await getUserByPhone(phone);

    if (!user) {
      throw new Error("No customer account exists for this mobile number yet.");
    }

    if (!otp) {
      const generatedOtp = createOtp();
      await sendPhoneOtp(phone, generatedOtp);
      setChallenge(res, phone, generatedOtp);
      json(res, 200, { otpRequested: true, expiresInSeconds: LOGIN_TTL_SECONDS });
      return;
    }

    const challenge = readChallenge(req);
    if (!challenge || challenge.phone !== phone) {
      throw new Error("Please request a fresh OTP and try again.");
    }
    if (new Date(challenge.expiresAt).getTime() < Date.now()) {
      clearChallenge(res);
      throw new Error("OTP expired. Please request a new code.");
    }
    if (hashOtp(otp, phone, "login") !== challenge.otpHash) {
      throw new Error("The OTP code is incorrect.");
    }

    await setSession(res, user.id);
    clearChallenge(res);
    json(res, 200, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        emailVerified: user.email_verified,
        phoneVerified: user.phone_verified,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMITED") return;
    json(res, 401, { error: error instanceof Error ? error.message : "Login failed." });
  }
}

