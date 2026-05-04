/* eslint-disable @typescript-eslint/no-explicit-any */

import { createHmac, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { db } from "./db.js";

export type CustomerRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  password_hash: string;
  salt: string;
  email_verified: boolean;
  phone_verified: boolean;
  created_at: string;
};

type SessionRow = {
  token: string;
  user_id: string;
  created_at: string;
  expires_at: string;
};

const COOKIE_NAME = "iksha_session";
const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;

function secret() {
  return process.env.SESSION_SECRET || "replace-this-session-secret-before-live";
}

export function hashPassword(password: string, salt: string = randomUUID()) {
  return {
    salt,
    passwordHash: scryptSync(password, salt, 64).toString("hex"),
  };
}

export async function getUserByEmail(email: string) {
  return db.selectOne<CustomerRow>("customers", { email: email.trim().toLowerCase() });
}

export async function getUserByPhone(phone: string) {
  return db.selectOne<CustomerRow>("customers", { phone });
}

export async function createVerifiedUser(input: {
  id?: string;
  name: string;
  email: string;
  phone: string | null;
  passwordHash: string;
  salt: string;
}) {
  const existingEmail = await getUserByEmail(input.email);
  if (existingEmail) throw new Error("An account already exists for this email.");

  if (input.phone) {
    const existingPhone = await getUserByPhone(input.phone);
    if (existingPhone) throw new Error("An account already exists for this phone number.");
  }

  const user = await db.insert<CustomerRow>("customers", {
    id: input.id || randomUUID(),
    name: input.name,
    email: input.email,
    phone: input.phone,
    password_hash: input.passwordHash,
    salt: input.salt,
    email_verified: true,
    phone_verified: true,
  });
  return publicUser(user);
}

export async function verifyUser(email: string, password: string) {
  const user = await getUserByEmail(email);
  if (!user) throw new Error("Invalid email or password.");
  const { passwordHash } = hashPassword(password, user.salt);
  const expected = Buffer.from(user.password_hash, "hex");
  const actual = Buffer.from(passwordHash, "hex");
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    throw new Error("Invalid email or password.");
  }
  return publicUser(user);
}

export function publicUser(user: CustomerRow) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    emailVerified: user.email_verified,
    phoneVerified: user.phone_verified,
  };
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

function getCookie(req: any, name: string) {
  const cookie = String(req.headers.cookie || "");
  const match = cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : "";
}

export async function setSession(res: any, userId: string) {
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString();
  await db.insert<SessionRow>("customer_sessions", {
    token,
    user_id: userId,
    expires_at: expiresAt,
  });
  const value = `${token}.${sign(token)}`;
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=${SESSION_TTL_SECONDS}`,
  );
}

export async function clearSession(req: any, res: any) {
  const value = getCookie(req, COOKIE_NAME);
  const [token] = value.split(".");
  if (token) {
    await db.delete("customer_sessions", { token }).catch(() => undefined);
  }
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0`);
}

export async function getSessionUser(req: any) {
  const value = getCookie(req, COOKIE_NAME);
  const [token, tokenSignature] = value.split(".");
  if (!token || !tokenSignature || sign(token) !== tokenSignature) return null;

  const session = await db.selectOne<SessionRow>("customer_sessions", { token });
  if (!session || new Date(session.expires_at).getTime() < Date.now()) return null;

  const user = await db.selectOne<CustomerRow>("customers", { id: session.user_id });
  return user ? publicUser(user) : null;
}

export async function requireUser(req: any) {
  const user = await getSessionUser(req);
  if (!user) throw new Error("Please log in to continue.");
  return user;
}
