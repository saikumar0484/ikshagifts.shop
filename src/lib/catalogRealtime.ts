type CatalogChangeHandler = () => void;

type RealtimeMessage = {
  event?: string;
  payload?: {
    data?: {
      table?: string;
      record?: {
        key?: string;
      };
    };
  };
};

const heartbeatMs = 25_000;

function envValue(key: string) {
  return String(
    (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.[key] || "",
  );
}

export function subscribeToCatalogChanges(onChange: CatalogChangeHandler) {
  const supabaseUrl = envValue("VITE_SUPABASE_URL").replace(/\/$/, "");
  const anonKey = envValue("VITE_SUPABASE_ANON_KEY");
  if (!supabaseUrl || !anonKey || typeof WebSocket === "undefined") return () => undefined;

  let socket: WebSocket | null = null;
  let closed = false;
  let ref = 1;
  let heartbeatId = 0;
  let reconnectId = 0;
  const topic = "realtime:public:catalog_versions";
  const wsUrl = `${supabaseUrl.replace(/^http/i, "ws")}/realtime/v1/websocket?apikey=${encodeURIComponent(
    anonKey,
  )}&vsn=1.0.0`;

  const send = (event: string, payload: unknown, targetTopic = topic) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify({ topic: targetTopic, event, payload, ref: String(ref++) }));
  };

  const connect = () => {
    socket = new WebSocket(wsUrl);

    socket.addEventListener("open", () => {
      send("phx_join", {
        config: {
          broadcast: { self: false },
          presence: { key: "" },
          postgres_changes: [{ event: "*", schema: "public", table: "catalog_versions" }],
        },
        access_token: anonKey,
      });
      window.clearInterval(heartbeatId);
      heartbeatId = window.setInterval(() => send("heartbeat", {}, "phoenix"), heartbeatMs);
    });

    socket.addEventListener("message", (event) => {
      const message = JSON.parse(String(event.data || "{}")) as RealtimeMessage;
      const table = message.payload?.data?.table;
      const key = message.payload?.data?.record?.key;
      if (
        message.event === "postgres_changes" &&
        table === "catalog_versions" &&
        key === "products"
      ) {
        onChange();
      }
    });

    socket.addEventListener("close", () => {
      window.clearInterval(heartbeatId);
      if (!closed) reconnectId = window.setTimeout(connect, 3000);
    });

    socket.addEventListener("error", () => socket?.close());
  };

  connect();

  return () => {
    closed = true;
    window.clearInterval(heartbeatId);
    window.clearTimeout(reconnectId);
    socket?.close();
  };
}
