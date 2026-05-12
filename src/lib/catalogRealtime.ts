import { supabase } from "@/lib/supabaseClient";

type CatalogChangeHandler = () => void;

const browserChannelName = "iksha-catalog-sync";
const storageKey = "iksha-catalog-sync-at";
const fallbackPollMs = 10_000;

function canUseRealtime() {
  return Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
}

function debounced(handler: CatalogChangeHandler) {
  let timeoutId = 0;
  return () => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(handler, 120);
  };
}

export function notifyCatalogChange() {
  if (typeof window === "undefined") return;
  const changedAt = String(Date.now());

  window.dispatchEvent(new CustomEvent(browserChannelName, { detail: changedAt }));
  window.localStorage.setItem(storageKey, changedAt);

  if ("BroadcastChannel" in window) {
    const channel = new BroadcastChannel(browserChannelName);
    channel.postMessage({ changedAt });
    channel.close();
  }

  if (!canUseRealtime()) return;

  const channel = supabase.channel(`${browserChannelName}-admin-${changedAt}`);
  channel.subscribe((status) => {
    if (status !== "SUBSCRIBED") return;
    channel
      .send({
        type: "broadcast",
        event: "products_changed",
        payload: { changedAt },
      })
      .finally(() => {
        window.setTimeout(() => supabase.removeChannel(channel), 500);
      });
  });
}

export function subscribeToCatalogChanges(onChange: CatalogChangeHandler) {
  if (typeof window === "undefined") return () => undefined;

  const triggerChange = debounced(onChange);
  const onLocalChange = () => triggerChange();
  const onStorageChange = (event: StorageEvent) => {
    if (event.key === storageKey) triggerChange();
  };
  const browserChannel =
    "BroadcastChannel" in window ? new BroadcastChannel(browserChannelName) : null;

  window.addEventListener(browserChannelName, onLocalChange);
  window.addEventListener("storage", onStorageChange);
  browserChannel?.addEventListener("message", onLocalChange);

  const pollId = window.setInterval(triggerChange, fallbackPollMs);
  const realtimeChannel = canUseRealtime()
    ? supabase
        .channel(browserChannelName)
        .on("broadcast", { event: "products_changed" }, triggerChange)
        .on("postgres_changes", { event: "*", schema: "public", table: "products" }, triggerChange)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "catalog_versions" },
          (payload) => {
            const record = payload.new as { key?: string } | null;
            if (record?.key === "products") triggerChange();
          },
        )
        .subscribe()
    : null;

  return () => {
    window.clearInterval(pollId);
    window.removeEventListener(browserChannelName, onLocalChange);
    window.removeEventListener("storage", onStorageChange);
    browserChannel?.close();
    if (realtimeChannel) supabase.removeChannel(realtimeChannel);
  };
}
