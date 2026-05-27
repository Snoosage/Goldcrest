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

const KANKA_BASE_URL = "https://api.kanka.io/1.0";

function getSingle(value: QueryValue): string | undefined {
  return Array.isArray(value) ? value[0] : value;
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
  const url = new URL(`${KANKA_BASE_URL}/${cleanPath}`);

  for (const [key, value] of Object.entries(req.query)) {
    if (key === "path") continue;
    if (Array.isArray(value)) {
      for (const item of value) url.searchParams.append(key, String(item));
    } else if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }

  try {
    const upstream = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": "GoldcrestArchive/1.0",
      },
    });

    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader("Content-Type", upstream.headers.get("content-type") || "application/json");
    res.send(text);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown proxy error";
    res.status(502).json({ error: message });
  }
}
