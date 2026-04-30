/* eslint-disable @typescript-eslint/no-explicit-any */

import { db } from "./db.js";
import { json } from "./http.js";

type RateLimitRow = {
  key: string;
  count: number;
  reset_at: string;
};

export function getClientIp(req: any) {
  const forwarded = String(req.headers["x-forwarded-for"] || "");
  return forwarded.split(",")[0]?.trim() || String(req.socket?.remoteAddress || "unknown");
}

export function assertSameOrigin(req: any) {
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") return;

  const host = String(req.headers.host || "");
  const origin = String(req.headers.origin || "");
  const referer = String(req.headers.referer || "");
  const allowed = new Set(
    [
      host,
      ...(process.env.APP_ORIGIN || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ]
      .map((item) => item.replace(/^https?:\/\//, "").replace(/\/$/, ""))
      .filter(Boolean),
  );

  const source = origin || referer;
  if (!source) return;

  const sourceHost = new URL(source).host;
  if (!allowed.has(sourceHost)) {
    throw new Error("Request origin is not allowed.");
  }
}

export function requireJson(req: any) {
  if (!["POST", "PATCH", "PUT"].includes(req.method)) return;
  const contentType = String(req.headers["content-type"] || "");
  if (!contentType.includes("application/json")) {
    throw new Error("Content-Type must be application/json.");
  }
}

export async function rateLimit(
  req: any,
  res: any,
  scope: string,
  limit: number,
  windowSeconds: number,
) {
  const key = `${scope}:${getClientIp(req)}`.slice(0, 180);
  const now = Date.now();
  const reset = new Date(now + windowSeconds * 1000).toISOString();
  const existing = await db.selectOne<RateLimitRow>("rate_limits", { key });

  if (!existing || new Date(existing.reset_at).getTime() <= now) {
    await db.upsert("rate_limits", { key, count: 1, reset_at: reset }, "key");
    return;
  }

  if (existing.count >= limit) {
    res.setHeader(
      "Retry-After",
      String(Math.max(1, Math.ceil((new Date(existing.reset_at).getTime() - now) / 1000))),
    );
    json(res, 429, { error: "Too many requests. Please try again later." });
    throw new Error("RATE_LIMITED");
  }

  await db.update("rate_limits", { key }, { count: existing.count + 1 });
}

export function safeString(value: unknown, maxLength: number) {
  return String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, maxLength);
}
