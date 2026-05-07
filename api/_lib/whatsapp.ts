/* eslint-disable @typescript-eslint/no-explicit-any */

import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { db } from "./db.js";
import { getIntegrationSecrets, listIntegrations } from "./integrations.js";
import { safeString } from "./security.js";

type CustomerRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
};

type OrderRow = {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  items: Array<{ name: string; quantity: number; lineTotal: number }>;
  status: string;
  payment_status: string;
  payment_method?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  shipping_address?: string | null;
  pin_code?: string | null;
  tracking_number: string | null;
  estimated_delivery: string | null;
  created_at: string;
};

type SupportAgentRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
};

type ConversationRow = {
  id: string;
  customer_id: string | null;
  wa_id: string;
  customer_name: string;
  customer_phone: string;
  status: "open" | "pending" | "resolved";
  assigned_agent_id: string | null;
  unread_count: number;
  last_message_preview: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
};

type MessageRow = {
  id: string;
  conversation_id: string;
  wa_message_id: string | null;
  direction: "inbound" | "outbound";
  message_type: string;
  body: string;
  template_name: string | null;
  status: string;
  raw_payload: Record<string, unknown>;
  sent_by_admin_id: string | null;
  created_at: string;
};

type TemplateRow = {
  id: string;
  key: string;
  label: string;
  category: string;
  body: string;
  whatsapp_template_name: string | null;
  language_code: string;
  enabled: boolean;
};

type NoteRow = {
  id: string;
  conversation_id: string;
  admin_user_id: string | null;
  body: string;
  created_at: string;
};

function nowIso() {
  return new Date().toISOString();
}

export function normalizePhone(phone: string) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

function preview(value: string) {
  return safeString(value.replace(/\s+/g, " ").trim(), 180);
}

function newest<T extends { created_at: string }>(items: T[]) {
  return [...items].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

async function listSupportTables() {
  const [conversations, messages, agents, templates, notes, customers, orders] = await Promise.all([
    db.list<ConversationRow>("whatsapp_conversations", { order: "last_message_at.desc" }),
    db.list<MessageRow>("whatsapp_messages", { order: "created_at.asc" }),
    db.list<SupportAgentRow>("support_agents", { order: "name.asc" }),
    db.list<TemplateRow>("support_message_templates", { order: "category.asc,label.asc" }),
    db.list<NoteRow>("support_notes", { order: "created_at.desc" }),
    db.list<CustomerRow>("customers", { order: "created_at.desc" }),
    db.list<OrderRow>("orders", { order: "created_at.desc" }),
  ]);
  return { conversations, messages, agents, templates, notes, customers, orders };
}

function customerForPhone(customers: CustomerRow[], phone: string) {
  const normalized = normalizePhone(phone);
  return (
    customers.find((customer) => normalizePhone(customer.phone || "") === normalized) ||
    customers.find((customer) => normalized.endsWith(normalizePhone(customer.phone || ""))) ||
    null
  );
}

function hydrateConversation(
  conversation: ConversationRow,
  context: Awaited<ReturnType<typeof listSupportTables>>,
) {
  const customer = conversation.customer_id
    ? context.customers.find((item) => item.id === conversation.customer_id)
    : customerForPhone(context.customers, conversation.customer_phone);
  const customerOrders = customer
    ? context.orders.filter((order) => order.user_id === customer.id)
    : context.orders.filter(
        (order) =>
          normalizePhone(order.customer_phone || "") ===
          normalizePhone(conversation.customer_phone),
      );
  return {
    ...conversation,
    customer: customer || null,
    agent: context.agents.find((agent) => agent.id === conversation.assigned_agent_id) || null,
    messages: context.messages.filter((message) => message.conversation_id === conversation.id),
    notes: context.notes.filter((note) => note.conversation_id === conversation.id),
    orders: newest(customerOrders).slice(0, 8),
  };
}

export async function listSupportWorkspace() {
  const context = await listSupportTables();
  return {
    conversations: context.conversations.map((conversation) =>
      hydrateConversation(conversation, context),
    ),
    agents: context.agents,
    templates: context.templates.filter((template) => template.enabled),
    unreadCount: context.conversations.reduce(
      (sum, conversation) => sum + Number(conversation.unread_count || 0),
      0,
    ),
  };
}

export async function getSupportConversation(conversationId: string) {
  const id = safeString(conversationId, 80);
  if (!id) throw new Error("Conversation id is required.");
  const context = await listSupportTables();
  const conversation = context.conversations.find((item) => item.id === id);
  if (!conversation) throw new Error("Conversation not found.");
  return hydrateConversation(conversation, context);
}

export async function updateSupportConversation(body: Record<string, unknown>) {
  const id = safeString(body.id, 80);
  if (!id) throw new Error("Conversation id is required.");
  const patch: Partial<ConversationRow> = {
    updated_at: nowIso(),
  } as Partial<ConversationRow>;
  if (body.status) {
    const status = safeString(body.status, 30);
    if (!["open", "pending", "resolved"].includes(status)) throw new Error("Unknown status.");
    patch.status = status as ConversationRow["status"];
  }
  if ("assignedAgentId" in body || "assigned_agent_id" in body) {
    patch.assigned_agent_id =
      safeString(body.assignedAgentId || body.assigned_agent_id, 80) || null;
  }
  if (body.markRead) patch.unread_count = 0;
  await db.update<ConversationRow>("whatsapp_conversations", { id }, patch);
  return getSupportConversation(id);
}

export async function addSupportNote(body: Record<string, unknown>) {
  const conversationId = safeString(body.conversationId || body.conversation_id, 80);
  const note = safeString(body.body, 1000);
  if (!conversationId || !note) throw new Error("Conversation and note are required.");
  await db.insert<NoteRow>("support_notes", {
    conversation_id: conversationId,
    admin_user_id: null,
    body: note,
  });
  return getSupportConversation(conversationId);
}

async function whatsappConfig() {
  const integrations = await listIntegrations().catch(() => []);
  const integration = integrations.find((item) => item.key === "whatsapp");
  const secrets: Record<string, string> = await getIntegrationSecrets("whatsapp").catch(() => ({}));
  const publicConfig = (integration?.publicConfig || {}) as Record<string, string>;
  return {
    enabled: Boolean(integration?.enabled),
    provider: integration?.provider || "manual",
    graphVersion: process.env.WHATSAPP_GRAPH_VERSION || publicConfig.graphVersion || "v23.0",
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || secrets.apiToken || "",
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || secrets.senderId || "",
    appSecret: process.env.WHATSAPP_APP_SECRET || secrets.appSecret || "",
    verifyToken:
      process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || secrets.verifyToken || "iksha-whatsapp-webhook",
  };
}

async function callWhatsAppApi(path: string, body: unknown) {
  const config = await whatsappConfig();
  if (!config.enabled || config.provider !== "whatsapp_cloud") {
    throw new Error("WhatsApp Cloud API is not enabled in Integrations.");
  }
  if (!config.accessToken || !config.phoneNumberId) {
    throw new Error("Set WhatsApp access token and phone number ID in Integrations.");
  }
  const response = await fetch(
    `https://graph.facebook.com/${config.graphVersion}/${config.phoneNumberId}${path}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error?.message || "WhatsApp message could not be sent.");
  }
  return data;
}

export async function sendSupportMessage(body: Record<string, unknown>) {
  const conversationId = safeString(body.conversationId || body.conversation_id, 80);
  const messageBody = safeString(body.body, 4000);
  const templateId = safeString(body.templateId || body.template_id, 80);
  const conversation = await getSupportConversation(conversationId);
  let payload: Record<string, unknown>;
  let templateName: string | null = null;
  let bodyText = messageBody;

  if (templateId) {
    const templates = await db.list<TemplateRow>("support_message_templates");
    const template = templates.find((item) => item.id === templateId || item.key === templateId);
    if (!template || !template.whatsapp_template_name) {
      throw new Error("Choose a WhatsApp-approved template.");
    }
    templateName = template.whatsapp_template_name;
    bodyText = template.body;
    payload = {
      messaging_product: "whatsapp",
      to: conversation.wa_id,
      type: "template",
      template: {
        name: template.whatsapp_template_name,
        language: { code: template.language_code || "en_US" },
      },
    };
  } else {
    if (!messageBody) throw new Error("Reply message is required.");
    payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: conversation.wa_id,
      type: "text",
      text: { preview_url: false, body: messageBody },
    };
  }

  const response = await callWhatsAppApi("/messages", payload);
  const waMessageId = response?.messages?.[0]?.id || randomUUID();
  await db.insert<MessageRow>("whatsapp_messages", {
    conversation_id: conversation.id,
    wa_message_id: waMessageId,
    direction: "outbound",
    message_type: templateName ? "template" : "text",
    body: bodyText,
    template_name: templateName,
    status: "sent",
    raw_payload: response,
    sent_by_admin_id: null,
  });
  await db.update<ConversationRow>(
    "whatsapp_conversations",
    { id: conversation.id },
    {
      status: "pending",
      unread_count: 0,
      last_message_preview: preview(bodyText),
      last_message_at: nowIso(),
      updated_at: nowIso(),
    },
  );
  return getSupportConversation(conversation.id);
}

export async function suggestSupportReplies(conversationId: string) {
  const conversation = await getSupportConversation(conversationId);
  const latestInbound = newest(
    conversation.messages.filter((message) => message.direction === "inbound"),
  )[0];
  const latestOrder = conversation.orders[0];
  const name = conversation.customer?.name || conversation.customer_name || "there";
  const orderText = latestOrder
    ? `Your order ${latestOrder.id} is currently ${latestOrder.status.replaceAll("_", " ")}.`
    : "Please share your order ID so we can check this for you.";
  const body = (latestInbound?.body || "").toLowerCase();
  const replies = [
    `Hi ${name}, thanks for messaging iksha gifts. ${orderText}`,
    `Hi ${name}, we received your message and will help you with this shortly.`,
    `Hi ${name}, thank you for supporting handmade gifts. We are checking the details now.`,
  ];
  if (body.includes("delivery") || body.includes("track")) {
    replies.unshift(
      latestOrder?.tracking_number
        ? `Hi ${name}, your tracking number is ${latestOrder.tracking_number}. ${orderText}`
        : `Hi ${name}, ${orderText} We will share tracking details as soon as it is shipped.`,
    );
  }
  if (body.includes("price") || body.includes("custom")) {
    replies.unshift(
      `Hi ${name}, yes, we can help with a custom gift. Please share the occasion, budget, and preferred colors.`,
    );
  }
  return replies.slice(0, 4);
}

export async function verifyWebhookToken(mode: string, token: string, challenge: string) {
  const config = await whatsappConfig();
  if (mode === "subscribe" && token === config.verifyToken) return challenge;
  throw new Error("WhatsApp webhook verification failed.");
}

export async function verifyWebhookSignature(signature: string, rawBody: string) {
  const config = await whatsappConfig();
  if (!config.appSecret) return true;
  const expected = `sha256=${createHmac("sha256", config.appSecret).update(rawBody).digest("hex")}`;
  const left = Buffer.from(signature || "");
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

async function upsertConversationFromInbound(message: any, contact: any) {
  const waId = normalizePhone(message.from || contact?.wa_id || "");
  if (!waId) throw new Error("Inbound WhatsApp message did not include a sender.");
  const profileName = safeString(
    contact?.profile?.name || contact?.name || "WhatsApp customer",
    120,
  );
  const customers = await db.list<CustomerRow>("customers").catch(() => []);
  const customer = customerForPhone(customers, waId);
  const text =
    message.text?.body ||
    message.button?.text ||
    message.interactive?.button_reply?.title ||
    message.interactive?.list_reply?.title ||
    `[${safeString(message.type || "message", 40)} message]`;
  const current = await db.selectOne<ConversationRow>("whatsapp_conversations", { wa_id: waId });
  const payload = {
    customer_id: customer?.id || current?.customer_id || null,
    wa_id: waId,
    customer_name: customer?.name || profileName,
    customer_phone: waId,
    status: "open",
    unread_count: Number(current?.unread_count || 0) + 1,
    last_message_preview: preview(text),
    last_message_at: message.timestamp
      ? new Date(Number(message.timestamp) * 1000).toISOString()
      : nowIso(),
    updated_at: nowIso(),
  };
  const conversation = current
    ? await db.update<ConversationRow>("whatsapp_conversations", { id: current.id }, payload)
    : await db.upsert<ConversationRow>(
        "whatsapp_conversations",
        { ...payload, created_at: nowIso() },
        "wa_id",
      );
  if (!conversation) throw new Error("WhatsApp conversation could not be saved.");
  await db.upsert<MessageRow>(
    "whatsapp_messages",
    {
      conversation_id: conversation.id,
      wa_message_id: safeString(message.id || randomUUID(), 160),
      direction: "inbound",
      message_type: safeString(message.type || "text", 40),
      body: safeString(text, 4000),
      template_name: null,
      status: "received",
      raw_payload: message,
      sent_by_admin_id: null,
      created_at: payload.last_message_at,
    },
    "wa_message_id",
  );
  return conversation;
}

async function updateMessageStatus(status: any) {
  const waMessageId = safeString(status.id, 160);
  if (!waMessageId) return;
  const row = await db.selectOne<MessageRow>("whatsapp_messages", { wa_message_id: waMessageId });
  if (!row) return;
  await db.update<MessageRow>(
    "whatsapp_messages",
    { id: row.id },
    {
      status: safeString(status.status || row.status, 40),
      raw_payload: { ...(row.raw_payload || {}), latest_status: status },
    },
  );
}

export async function processWhatsAppWebhook(payload: any) {
  const changes = (payload.entry || []).flatMap((entry: any) => entry.changes || []);
  for (const change of changes) {
    const value = change.value || {};
    const contacts = value.contacts || [];
    for (const message of value.messages || []) {
      const contact = contacts.find((item: any) => item.wa_id === message.from) || contacts[0];
      await upsertConversationFromInbound(message, contact);
    }
    for (const status of value.statuses || []) {
      await updateMessageStatus(status);
    }
  }
  return { ok: true };
}
