type SupabaseOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  prefer?: string;
  headers?: Record<string, string>;
};

export function supabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }
  return {
    url: url.replace(/\/$/, ""),
    key,
  };
}

async function request<T>(path: string, options: SupabaseOptions = {}) {
  const { url, key } = supabaseConfig();
  const response = await fetch(`${url}/rest/v1${path}`, {
    method: options.method ?? "GET",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(options.prefer ? { Prefer: options.prefer } : {}),
      ...(options.headers ?? {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(data?.message || data?.hint || "Supabase request failed.");
  }
  return data as T;
}

function filterQuery(filters: Record<string, string>) {
  const params = new URLSearchParams({ select: "*" });
  Object.entries(filters).forEach(([key, value]) => {
    params.set(key, `eq.${value}`);
  });
  return params.toString();
}

export const db = {
  async selectMany<T>(
    table: string,
    filters: Record<string, string>,
    extra: Record<string, string> = {},
  ) {
    const params = new URLSearchParams({ select: "*", ...extra });
    Object.entries(filters).forEach(([key, value]) => {
      params.set(key, `eq.${value}`);
    });
    return request<T[]>(`/${table}?${params.toString()}`);
  },

  async list<T>(table: string, extra: Record<string, string> = {}) {
    const params = new URLSearchParams({ select: "*", ...extra });
    return request<T[]>(`/${table}?${params.toString()}`);
  },

  async selectOne<T>(table: string, filters: Record<string, string>) {
    const rows = await request<T[]>(`/${table}?${filterQuery(filters)}&limit=1`);
    return rows[0] ?? null;
  },

  async insert<T>(table: string, body: unknown) {
    const rows = await request<T[]>(`/${table}`, {
      method: "POST",
      body,
      prefer: "return=representation",
    });
    return rows[0];
  },

  async upsert<T>(table: string, body: unknown, conflict: string) {
    const rows = await request<T[]>(`/${table}?on_conflict=${encodeURIComponent(conflict)}`, {
      method: "POST",
      body,
      prefer: "resolution=merge-duplicates,return=representation",
    });
    return rows[0];
  },

  async update<T>(table: string, filters: Record<string, string>, body: unknown) {
    const rows = await request<T[]>(`/${table}?${filterQuery(filters)}`, {
      method: "PATCH",
      body,
      prefer: "return=representation",
    });
    return rows[0] ?? null;
  },

  async delete(table: string, filters: Record<string, string>) {
    await request(`/${table}?${filterQuery(filters)}`, { method: "DELETE" });
  },
};

export async function uploadStorageObject(
  bucket: string,
  path: string,
  bytes: Uint8Array,
  contentType: string,
) {
  const { url, key } = supabaseConfig();
  const encodedPath = path
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  const response = await fetch(`${url}/storage/v1/object/${bucket}/${encodedPath}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": contentType,
      "x-upsert": "true",
    },
    body: Buffer.from(bytes),
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(data?.message || data?.error || "Image upload failed.");
  }
  return `${url}/storage/v1/object/public/${bucket}/${encodedPath}`;
}
