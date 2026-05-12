/* eslint-disable @typescript-eslint/no-explicit-any */

import { createHmac, randomInt, randomUUID } from "node:crypto";
import nodemailer from "nodemailer";
import { db } from "./db.js";
import { getIntegrationSecrets, listIntegrations } from "./integrations.js";
import { hashPassword } from "./session.js";

export type PendingSignup = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  password_hash: string;
  salt: string;
  email_otp_hash: string;
  phone_otp_hash: string;
  attempts: number;
  expires_at: string;
  created_at: string;
};

function otpSecret() {
  return process.env.OTP_SECRET || process.env.SESSION_SECRET || "replace-this-otp-secret";
}

export function normalizePhone(phone: string) {
  const trimmed = phone.trim().replace(/\s+/g, "");
  if (!/^\+?[1-9]\d{9,14}$/.test(trimmed)) {
    throw new Error("Enter a valid phone number with country code, for example +919876543210.");
  }
  return trimmed.startsWith("+") ? trimmed : `+91${trimmed}`;
}

export function normalizeEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new Error("Enter a valid email address.");
  }
  return normalized;
}

export function normalizeOptionalPhone(phone: string) {
  const trimmed = phone.trim();
  return trimmed ? normalizePhone(trimmed) : null;
}

export function normalizeSignupInput(body: any) {
  const name = String(body.name || "").trim();
  const email = normalizeEmail(String(body.email || ""));
  const phone = normalizeOptionalPhone(String(body.phone || ""));
  const password = randomUUID();

  if (!name) throw new Error("Customer name is required.");

  return { name, email, phone, password };
}

export function createOtp() {
  return String(randomInt(100000, 999999));
}

export function hashOtp(otp: string, scope: string, channel: string) {
  return createHmac("sha256", otpSecret()).update(`${scope}:${channel}:${otp}`).digest("hex");
}

export async function createPendingSignup(input: {
  name: string;
  email: string;
  phone: string | null;
  password: string;
  emailOtp?: string;
  phoneOtp: string;
}) {
  const pendingId = randomUUID();
  const passwordData = hashPassword(input.password);
  const emailOtp = input.emailOtp || input.phoneOtp;
  await db.insert<PendingSignup>("pending_signups", {
    id: pendingId,
    name: input.name,
    email: input.email,
    phone: input.phone,
    password_hash: passwordData.passwordHash,
    salt: passwordData.salt,
    email_otp_hash: hashOtp(emailOtp, pendingId, "email"),
    phone_otp_hash: hashOtp(input.phoneOtp, pendingId, "phone"),
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  });
  return pendingId;
}

function htmlEscape(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

type EmailConfig = {
  enabled: boolean;
  provider: string;
  fromName: string;
  fromEmail: string;
  replyTo: string;
  resendApiKey: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPass: string;
};

async function emailConfig(): Promise<EmailConfig> {
  const integrations = await listIntegrations().catch(() => []);
  const emailIntegration = integrations.find((item) => item.key === "email");
  const emailSecrets: Record<string, string> = await getIntegrationSecrets("email").catch(
    () => ({}),
  );
  const publicConfig = (emailIntegration?.publicConfig || {}) as Record<string, string>;
  const provider = process.env.EMAIL_PROVIDER || emailIntegration?.provider || "resend";
  const fromName = process.env.SMTP_FROM_NAME || publicConfig.fromName || "iksha gifts";
  const smtpUser = process.env.SMTP_USER || emailSecrets.smtpUser || "";
  const fromEmail =
    process.env.SMTP_FROM || process.env.OTP_EMAIL_FROM || publicConfig.fromEmail || smtpUser;

  return {
    enabled: Boolean(emailIntegration?.enabled) || Boolean(process.env.RESEND_API_KEY || smtpUser),
    provider,
    fromName,
    fromEmail,
    replyTo: process.env.SMTP_REPLY_TO || publicConfig.replyTo || fromEmail,
    resendApiKey: process.env.RESEND_API_KEY || emailSecrets.resendApiKey || "",
    smtpHost: process.env.SMTP_HOST || publicConfig.smtpHost || "",
    smtpPort: Number(process.env.SMTP_PORT || publicConfig.smtpPort || 465),
    smtpSecure: String(process.env.SMTP_SECURE ?? publicConfig.smtpSecure ?? "true") !== "false",
    smtpUser: smtpUser || fromEmail,
    smtpPass: process.env.SMTP_PASS || emailSecrets.smtpPass || "",
  };
}

async function sendSmtpEmail(input: {
  config: EmailConfig;
  to: string;
  subject: string;
  text: string;
  html: string;
}) {
  const { config } = input;
  const host = config.smtpHost;
  const user = config.smtpUser;
  const pass = config.smtpPass;
  const fromEmail = config.fromEmail || user;

  if (!host || !user || !pass || !fromEmail) return false;

  const transporter = nodemailer.createTransport({
    host,
    port: config.smtpPort,
    secure: config.smtpSecure,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: `"${config.fromName.replaceAll('"', "")}" <${fromEmail}>`,
    to: input.to,
    replyTo: config.replyTo || undefined,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });
  return true;
}

async function sendSmtpOtp(config: EmailConfig, email: string, otp: string, name = "there") {
  const safeName = htmlEscape(name);
  const safeOtp = htmlEscape(otp);
  return sendSmtpEmail({
    config,
    to: email,
    subject: "Welcome to iksha gifts - verify your account",
    text: `Welcome to iksha gifts, ${name}. Your OTP is ${otp}. This code expires in 10 minutes.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#241f1a">
        <h2 style="margin:0 0 12px">Welcome to iksha gifts, ${safeName}</h2>
        <p>Thank you for creating your account. Use this OTP to finish your signup:</p>
        <p style="font-size:28px;font-weight:700;letter-spacing:6px;margin:18px 0">${safeOtp}</p>
        <p>This code expires in 10 minutes. If you did not request it, you can ignore this email.</p>
      </div>
    `,
  });
}

export async function sendStoreEmail(input: {
  to: string;
  subject: string;
  text: string;
  html: string;
}) {
  const config = await emailConfig();
  if (!config.enabled) return false;

  const sentBySmtp = await sendSmtpEmail({ config, ...input });
  if (sentBySmtp) return true;

  if (!config.resendApiKey) return false;
  const fromEmail = config.fromEmail || "onboarding@resend.dev";
  const from = fromEmail.includes("<") ? fromEmail : `${config.fromName} <${fromEmail}>`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      reply_to: config.replyTo || undefined,
      subject: input.subject,
      text: input.text,
      html: input.html,
    }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Store email could not be sent.");
  }
  return true;
}

export async function sendEmailOtp(email: string, otp: string, name = "there") {
  const config = await emailConfig();
  if (!config.enabled) {
    throw new Error("Email is disabled. Enable Email in Admin > Integrations.");
  }

  const sentBySmtp = await sendSmtpOtp(config, email, otp, name);
  if (sentBySmtp) return;

  const apiKey = config.resendApiKey;
  const fromName = config.fromName;
  const fromEmail = config.fromEmail || "onboarding@resend.dev";
  const from = fromEmail.includes("<") ? fromEmail : `${fromName} <${fromEmail}>`;
  if (!apiKey) {
    throw new Error(
      `Email sender is almost ready for ${config.fromEmail}. Add the Gmail app password in Admin > Integrations > Email > SMTP password/app password.`,
    );
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      reply_to: config.replyTo || undefined,
      subject: "Your iksha gifts verification code",
      html: `<p>Hi ${htmlEscape(name)},</p><p>Your iksha gifts email OTP is <strong>${htmlEscape(
        otp,
      )}</strong>.</p><p>This code expires in 10 minutes.</p>`,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Email OTP could not be sent.");
  }
}

export async function sendPhoneOtp(phone: string, otp: string) {
  const integrations = await listIntegrations().catch(() => []);
  const whatsappIntegration = integrations.find((item) => item.key === "whatsapp");
  if (whatsappIntegration?.provider === "manual") {
    throw new Error(
      "Automated WhatsApp OTP is not configured. Manual WhatsApp links work for order support, but OTP sending needs WhatsApp Cloud API, AiSensy, Twilio, or another approved provider.",
    );
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_PHONE;
  if (!accountSid || !authToken || !from) {
    throw new Error("SMS OTP provider is not configured. Set Twilio SMS environment variables.");
  }

  const body = new URLSearchParams({
    To: phone,
    From: from,
    Body: `Your iksha gifts phone OTP is ${otp}. It expires in 10 minutes.`,
  });

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    },
  );

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Phone OTP could not be sent.");
  }
}
