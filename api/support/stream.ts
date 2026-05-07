/* eslint-disable @typescript-eslint/no-explicit-any */

import { requireAdmin } from "../_lib/admin.js";
import { listSupportWorkspace } from "../_lib/whatsapp.js";

function writeEvent(res: any, event: string, data: unknown) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  try {
    await requireAdmin(req);
  } catch {
    res.status(401).json({ error: "Admin access required." });
    return;
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });

  let lastSnapshot = "";
  let active = true;
  req.on?.("close", () => {
    active = false;
  });

  const startedAt = Date.now();
  while (active && Date.now() - startedAt < 28_000) {
    try {
      const workspace = await listSupportWorkspace();
      const snapshot = JSON.stringify({
        unreadCount: workspace.unreadCount,
        latest: workspace.conversations[0]?.last_message_at || null,
        count: workspace.conversations.length,
      });
      if (snapshot !== lastSnapshot) {
        lastSnapshot = snapshot;
        writeEvent(res, "support_update", JSON.parse(snapshot));
      } else {
        writeEvent(res, "ping", { at: new Date().toISOString() });
      }
    } catch {
      writeEvent(res, "ping", { at: new Date().toISOString() });
    }
    await new Promise((resolve) => setTimeout(resolve, 4000));
  }

  res.end();
}
