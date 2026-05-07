import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { db } from "./db.js";
import { safeString } from "./security.js";

type IntegrationRow = {
  key: string;
  provider: string;
  enabled: boolean;
  public_config: Record<string, unknown>;
  encrypted_secrets: Record<string, string>;
  updated_at: string;
};

export type IntegrationView = {
  key: "email" | "whatsapp";
  label: string;
  provider: string;
  enabled: boolean;
  status: "ready" | "needs_setup" | "manual";
  publicConfig: Record<string, unknown>;
  secrets: Record<string, { configured: boolean; masked: string }>;
  updatedAt: string | null;
};

const defaultIntegrations: Record<IntegrationView["key"], Omit<IntegrationView, "secrets">> = {
  email: {
    key: "email",
    label: "Email OTP and order emails",
    provider: "resend",
    enabled: false,
    status: "needs_setup",
    publicConfig: {
      fromName: "iksha gifts",
      fromEmail: "hello@ikshagifts.shop",
      replyTo: "hello@ikshagifts.shop",
    },
    updatedAt: null,
  },
  whatsapp: {
    key: "whatsapp",
    label: "WhatsApp customer updates",
    provider: "manual",
    enabled: true,
    status: "manual",
    publicConfig: {
      businessPhone: "",
      defaultCountryCode: "+91",
      orderTemplate:
        "Hi {{name}}, your iksha gifts order {{orderId}} is now {{status}}. Thank you for supporting handmade gifts.",
    },
    updatedAt: null,
  },
};

function secretKey() {
  return createHash("sha256")
    .update(
      process.env.INTEGRATION_SECRET || process.env.SESSION_SECRET || "replace-integration-secret",
    )
    .digest();
}

function encrypt(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", secretKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}.${tag.toString("base64")}.${encrypted.toString("base64")}`;
}

function decrypt(value: string) {
  const [ivRaw, tagRaw, encryptedRaw] = value.split(".");
  if (!ivRaw || !tagRaw || !encryptedRaw) return "";
  const decipher = createDecipheriv("aes-256-gcm", secretKey(), Buffer.from(ivRaw, "base64"));
  decipher.setAuthTag(Buffer.from(tagRaw, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedRaw, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

function mask(value: string) {
  if (!value) return "";
  if (value.length <= 10) return "configured";
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function maskSecrets(secrets: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(secrets || {}).map(([key, value]) => {
      const decrypted = decrypt(value);
      return [key, { configured: Boolean(decrypted), masked: mask(decrypted) }];
    }),
  );
}

function normalizePublicConfig(key: IntegrationView["key"], body: Record<string, unknown>) {
  if (key === "email") {
    return {
      fromName: safeString(body.fromName, 80) || "iksha gifts",
      fromEmail: safeString(body.fromEmail, 160),
      replyTo: safeString(body.replyTo, 160),
    };
  }

  return {
    businessPhone: safeString(body.businessPhone, 30),
    defaultCountryCode: safeString(body.defaultCountryCode || "+91", 8),
    orderTemplate: safeString(body.orderTemplate, 500),
  };
}

function statusFor(
  key: IntegrationView["key"],
  enabled: boolean,
  provider: string,
  secrets: Record<string, string>,
) {
  if (!enabled) return "needs_setup";
  if (key === "whatsapp" && provider === "manual") return "manual";
  return Object.values(secrets || {}).some(Boolean) ? "ready" : "needs_setup";
}

export async function listIntegrations() {
  const rows = await db.list<IntegrationRow>("integration_settings");
  const byKey = new Map(rows.map((row) => [row.key, row]));

  return (Object.keys(defaultIntegrations) as IntegrationView["key"][]).map((key) => {
    const defaults = defaultIntegrations[key];
    const row = byKey.get(key);
    const provider = row?.provider || defaults.provider;
    const enabled = row?.enabled ?? defaults.enabled;
    const publicConfig = { ...defaults.publicConfig, ...(row?.public_config || {}) };
    const encryptedSecrets = row?.encrypted_secrets || {};
    return {
      ...defaults,
      provider,
      enabled,
      status: statusFor(key, enabled, provider, encryptedSecrets),
      publicConfig,
      secrets: maskSecrets(encryptedSecrets),
      updatedAt: row?.updated_at || null,
    };
  });
}

export async function getIntegrationSecrets(key: IntegrationView["key"]) {
  const row = await db.selectOne<IntegrationRow>("integration_settings", { key });
  const secrets = row?.encrypted_secrets || {};
  return Object.fromEntries(Object.entries(secrets).map(([name, value]) => [name, decrypt(value)]));
}

export async function saveIntegration(body: Record<string, unknown>) {
  const key = safeString(body.key, 40) as IntegrationView["key"];
  if (key !== "email" && key !== "whatsapp") throw new Error("Unknown integration.");

  const existing = await db.selectOne<IntegrationRow>("integration_settings", { key });
  const provider = safeString(body.provider || defaultIntegrations[key].provider, 40);
  const publicConfig = normalizePublicConfig(
    key,
    (body.publicConfig || {}) as Record<string, unknown>,
  );
  const inputSecrets = (body.secrets || {}) as Record<string, unknown>;
  const encryptedSecrets = { ...(existing?.encrypted_secrets || {}) };

  Object.entries(inputSecrets).forEach(([name, raw]) => {
    const value = String(raw || "").trim();
    if (!value || value === "__KEEP__") return;
    encryptedSecrets[safeString(name, 50)] = encrypt(value);
  });

  const row = await db.upsert<IntegrationRow>(
    "integration_settings",
    {
      key,
      provider,
      enabled: Boolean(body.enabled),
      public_config: publicConfig,
      encrypted_secrets: encryptedSecrets,
      updated_at: new Date().toISOString(),
    },
    "key",
  );

  const [view] = (await listIntegrations()).filter((item) => item.key === row.key);
  return view;
}
