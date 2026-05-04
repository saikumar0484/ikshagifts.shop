/* eslint-disable @typescript-eslint/no-explicit-any */

import { createHmac } from "node:crypto";
import { json, method, readBody } from "../_lib/http.js";
import { assertSameOrigin, rateLimit, requireJson } from "../_lib/security.js";
import { createOtp, hashOtp, normalizeEmail, sendEmailOtp } from "../_lib/otp.js";
import { getUserByEmail, publicUser, setSession } from "../_lib/session.js";

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

function setChallenge(res: any, email: string, otp: string) {
  const expiresAt = new Date(Date.now() + LOGIN_TTL_SECONDS * 1000).toISOString();
  const payload = Buffer.from(
    JSON.stringify({
      email,
      otpHash: hashOtp(otp, email, "login"),
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
      email: string;
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
    const email = normalizeEmail(String(body.email || ""));
    const otp = String(body.otp || "");
    const user = await getUserByEmail(email);

    if (!user) {
      throw new Error("No customer account exists for this email yet.");
    }

    if (!otp) {
      const generatedOtp = createOtp();
      await sendEmailOtp(email, generatedOtp);
      setChallenge(res, email, generatedOtp);
      json(res, 200, { otpRequested: true, expiresInSeconds: LOGIN_TTL_SECONDS });
      return;
    }

    const challenge = readChallenge(req);
    if (!challenge || challenge.email !== email) {
      throw new Error("Please request a fresh OTP and try again.");
    }
    if (new Date(challenge.expiresAt).getTime() < Date.now()) {
      clearChallenge(res);
      throw new Error("OTP expired. Please request a new code.");
    }
    if (hashOtp(otp, email, "login") !== challenge.otpHash) {
      throw new Error("The OTP code is incorrect.");
    }

    await setSession(res, user.id);
    clearChallenge(res);
    json(res, 200, { user: publicUser(user) });
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMITED") return;
    json(res, 401, { error: error instanceof Error ? error.message : "Login failed." });
  }
}
