import fs from "node:fs/promises";

async function loadEnvFile(file) {
  const text = await fs.readFile(file, "utf8").catch(() => "");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index);
    const value = trimmed.slice(index + 1).replace(/^"|"$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

await loadEnvFile(".env.vercel.local");
await loadEnvFile(".env.local");

const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
}

const products = [
  "bracelet",
  "couple-watches",
  "couple-bracelets",
  "women-watch",
  "men-watch",
  "small-bouquet",
  "large-bouquet",
  "small-hamper",
  "large-hamper",
  "magazine-gift",
  "women-couple-bracelet",
  "men-couple-bracelet",
  "women-couple-watches",
];

for (const id of products) {
  const response = await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      image_url: `/product-images/${id}.jpg`,
      updated_at: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to update ${id}: ${text}`);
  }

  console.log(`updated ${id}`);
}
