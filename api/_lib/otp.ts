/* eslint-disable @typescript-eslint/no-explicit-any */

import { createHmac, randomInt, randomUUID } from "node:crypto";
import { db } from "./db.js";
import { getIntegrationSecrets, listIntegrations } from "./integrations.js";
import { hashPassword } from "./session.js";

export type PendingSignup = {
  id: string;
  name: string;
  email: string;
  phone: string;
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

export function normalizeSignupInput(body: any) {
  const name = String(body.name || "").trim();
  const phone = normalizePhone(String(body.phone || ""));
  const email = `${phone.replace(/[^\d]/g, "")}@mobile.ikshagifts.shop`;
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
  phone: string;
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

export async function sendEmailOtp(email: string, otp: string) {
  const integrations = await listIntegrations().catch(() => []);
  const emailIntegration = integrations.find((item) => item.key === "email");
  const emailSecrets: Record<string, string> = await getIntegrationSecrets("email").catch(
    () => ({}),
  );
  const apiKey = process.env.RESEND_API_KEY || emailSecrets.resendApiKey;
  const fromName = String(emailIntegration?.publicConfig.fromName || "iksha gifts");
  const fromEmail = String(
    process.env.OTP_EMAIL_FROM ||
      emailIntegration?.publicConfig.fromEmail ||
      "onboarding@resend.dev",
  );
  const from = fromEmail.includes("<") ? fromEmail : `${fromName} <${fromEmail}>`;
  if (!apiKey) throw new Error("Email OTP provider is not configured. Set RESEND_API_KEY.");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Your iksha gifts verification code",
      html: `<p>Your iksha gifts email OTP is <strong>${otp}</strong>.</p><p>This code expires in 10 minutes.</p>`,
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
