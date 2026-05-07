/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  processWhatsAppWebhook,
  verifyWebhookSignature,
  verifyWebhookToken,
} from "../_lib/whatsapp.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function rawBody(req: any, maxBytes = 512 * 1024) {
  if (typeof req.body === "string") return req.body;
  if (req.body && typeof req.body === "object") return JSON.stringify(req.body);
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > maxBytes) throw new Error("Webhook payload is too large.");
    chunks.push(buffer);
  }
  return Buffer.concat(chunks).toString("utf8");
}

function queryValue(req: any, key: string) {
  const direct = req.query?.[key];
  if (direct) return String(Array.isArray(direct) ? direct[0] : direct);
  return new URL(req.url || "/api/whatsapp/webhook", "https://ikshagifts.shop").searchParams.get(
    key,
  );
}

export default async function handler(req: any, res: any) {
  try {
    if (req.method === "GET") {
      const challenge = await verifyWebhookToken(
        queryValue(req, "hub.mode") || "",
        queryValue(req, "hub.verify_token") || "",
        queryValue(req, "hub.challenge") || "",
      );
      res.status(200).setHeader("Content-Type", "text/plain").end(challenge);
      return;
    }

    if (req.method !== "POST") {
      res.setHeader("Allow", "GET, POST");
      res.status(405).json({ error: "Method not allowed." });
      return;
    }

    const raw = await rawBody(req);
    const validSignature = await verifyWebhookSignature(
      String(req.headers["x-hub-signature-256"] || ""),
      raw,
    );
    if (!validSignature) {
      res.status(401).json({ error: "Invalid WhatsApp webhook signature." });
      return;
    }

    const payload = raw ? JSON.parse(raw) : {};
    await processWhatsAppWebhook(payload);
    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "WhatsApp webhook failed.",
    });
  }
}
