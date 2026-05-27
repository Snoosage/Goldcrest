type QueryValue = string | string[] | undefined;

type ApiRequest = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  query: Record<string, QueryValue>;
};

type ApiResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
  send: (body: string) => void;
};

declare const process: {
  env: Record<string, string | undefined>;
};

type KankaListResponse = {
  data?: unknown[];
  links?: Record<string, unknown>;
  meta?: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

const KANKA_BASE_URL = "https://api.kanka.io/1.0";
const MAX_AUTO_PAGES = 25;

function getSingle(value: QueryValue): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function buildKankaUrl(req: ApiRequest, cleanPath: string, page?: number) {
  const url = new URL(`${KANKA_BASE_URL}/${cleanPath}`);

  for (const [key, value] of Object.entries(req.query)) {
    if (key === "path") continue;
    if (key === "page" && page !== undefined) continue;

    if (Array.isArray(value)) {
      for (const item of value) url.searchParams.append(key, String(item));
    } else if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }

  // Kanka caps large collections, but the app currently asks for limit=100.
  // Keep that limit and walk every page server-side so the frontend gets all data.
  if (!url.searchParams.has("limit")) url.searchParams.set("limit", "100");
  if (page !== undefined) url.searchParams.set("page", String(page));

  return url;
}

async function fetchKanka(url: URL, token: string) {
  const upstream = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": "GoldcrestArchive/1.0",
    },
  });

  const text = await upstream.text();
  const contentType = upstream.headers.get("content-type") || "application/json";

  if (!upstream.ok) {
    return { ok: false as const, status: upstream.status, contentType, text };
  }

  try {
    return { ok: true as const, status: upstream.status, contentType, json: JSON.parse(text) as KankaListResponse, text };
  } catch {
    return { ok: true as const, status: upstream.status, contentType, json: undefined, text };
  }
}

async function fetchAllPages(req: ApiRequest, cleanPath: string, token: string) {
  const first = await fetchKanka(buildKankaUrl(req, cleanPath, 1), token);
  if (!first.ok) return first;
  if (!first.json || !Array.isArray(first.json.data)) return first;

  const lastPage = Number(first.json.meta?.last_page || 1);
  if (!Number.isFinite(lastPage) || lastPage <= 1) return first;

  const cappedLastPage = Math.min(lastPage, MAX_AUTO_PAGES);
  const allData = [...first.json.data];

  // Fetch sequentially to be kinder to Kanka's rate limit.
  for (let page = 2; page <= cappedLastPage; page += 1) {
    const next = await fetchKanka(buildKankaUrl(req, cleanPath, page), token);
    if (!next.ok) return next;
    if (next.json && Array.isArray(next.json.data)) {
      allData.push(...next.json.data);
    }
  }

  return {
    ok: true as const,
    status: first.status,
    contentType: first.contentType,
    json: {
      ...first.json,
      data: allData,
      meta: {
        ...first.json.meta,
        current_page: cappedLastPage,
        loaded_pages: cappedLastPage,
        requested_last_page: lastPage,
        total_loaded: allData.length,
      },
    },
    text: "",
  };
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const rawAuthHeader = req.headers.authorization;
  const authHeader = Array.isArray(rawAuthHeader) ? rawAuthHeader[0] : rawAuthHeader;
  const tokenFromHeader = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : undefined;
  const token = process.env.KANKA_API_TOKEN || tokenFromHeader;

  if (!token) {
    return res.status(401).json({ error: "Missing Kanka API token. Set KANKA_API_TOKEN in Vercel or pass a Bearer token." });
  }

  const path = getSingle(req.query.path);
  if (!path) {
    return res.status(400).json({ error: "Missing Kanka API path." });
  }

  const cleanPath = path.replace(/^\/+/, "");

  try {
    const response = await fetchAllPages(req, cleanPath, token);

    res.status(response.status);
    res.setHeader("Content-Type", response.contentType);

    if (response.ok && response.json) {
      res.send(JSON.stringify(response.json));
    } else {
      res.send(response.text);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown proxy error";
    res.status(502).json({ error: message });
  }
}
