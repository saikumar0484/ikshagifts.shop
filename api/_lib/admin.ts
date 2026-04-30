/* eslint-disable @typescript-eslint/no-explicit-any */

import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { db } from "./db.js";
import { hashPassword } from "./session.js";

const ADMIN_COOKIE = "iksha_admin";
const ADMIN_TTL_SECONDS = 12 * 60 * 60;

type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  salt: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
};

type AdminSessionRow = {
  token: string;
  admin_user_id: string;
  created_at: string;
  expires_at: string;
};

function secret() {
  return process.env.SESSION_SECRET || process.env.ADMIN_API_KEY || "replace-admin-secret";
}

function adminPasscode() {
  return process.env.ADMIN_PASSWORD || process.env.ADMIN_API_KEY || "";
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function getCookie(req: any, name: string) {
  const cookie = String(req.headers.cookie || "");
  const match = cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : "";
}

export function verifyAdminPasscode(passcode: string) {
  const expected = adminPasscode().trim();
  return Boolean(expected && safeEqual(passcode.trim(), expected));
}

export async function getPrimaryAdminUser() {
  const users = await db.list<AdminUserRow>("admin_users", { order: "created_at.asc" });
  return users.find((user) => user.is_active) || null;
}

export async function verifyAdminLogin(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await db.selectOne<AdminUserRow>("admin_users", { email: normalizedEmail });
  if (!user || !user.is_active) {
    throw new Error("Invalid owner email or password.");
  }
  const { passwordHash } = hashPassword(password, user.salt);
  const expected = Buffer.from(user.password_hash, "hex");
  const actual = Buffer.from(passwordHash, "hex");
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    throw new Error("Invalid owner email or password.");
  }
  return user;
}

export async function markAdminLogin(userId: string) {
  await db.update<AdminUserRow>(
    "admin_users",
    { id: userId },
    { last_login_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  );
}

export async function setAdminSession(res: any, userId: string) {
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + ADMIN_TTL_SECONDS * 1000).toISOString();
  await db.insert<AdminSessionRow>("admin_sessions", {
    token,
    admin_user_id: userId,
    expires_at: expiresAt,
  });
  const value = `${token}.${sign(token)}`;
  res.setHeader(
    "Set-Cookie",
    `${ADMIN_COOKIE}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=${ADMIN_TTL_SECONDS}`,
  );
}

export async function clearAdminSession(req: any, res: any) {
  const value = getCookie(req, ADMIN_COOKIE);
  const [token] = value.split(".");
  if (token) {
    await db.delete("admin_sessions", { token }).catch(() => undefined);
  }
  res.setHeader(
    "Set-Cookie",
    `${ADMIN_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0`,
  );
}

export async function isAdmin(req: any) {
  const headerKey = String(req.headers["x-admin-key"] || "");
  if (headerKey && verifyAdminPasscode(headerKey)) return true;

  const value = getCookie(req, ADMIN_COOKIE);
  const [token, tokenSignature] = value.split(".");
  if (!token || !tokenSignature || !safeEqual(sign(token), tokenSignature)) return false;

  const session = await db.selectOne<AdminSessionRow>("admin_sessions", { token });
  if (!session) return false;
  if (new Date(session.expires_at).getTime() < Date.now()) {
    await db.delete("admin_sessions", { token }).catch(() => undefined);
    return false;
  }

  const user = await db.selectOne<AdminUserRow>("admin_users", { id: session.admin_user_id });
  return Boolean(user?.is_active);
}

export async function requireAdmin(req: any) {
  if (!(await isAdmin(req))) {
    throw new Error("Admin access required.");
  }
}
