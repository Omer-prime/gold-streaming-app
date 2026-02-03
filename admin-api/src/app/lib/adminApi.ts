// admin-api/src/lib/adminApi.ts
type Json = Record<string, any>;

function normalizeBase(raw: string) {
  return raw.trim().replace(/\/+$/, "");
}

function isAbsoluteUrl(v: string) {
  return /^https?:\/\//i.test(v);
}

function ensureLeadingSlash(path: string) {
  if (!path) return "/";
  return path.startsWith("/") ? path : `/${path}`;
}

function getBaseUrl() {
  const raw =
    (process.env.NEXT_PUBLIC_ADMIN_API_URL ??
      process.env.NEXT_PUBLIC_API_URL ??
      process.env.NEXT_PUBLIC_API_BASE_URL ??
      "").trim();

  // Default: same-origin (best when using Next.js route handlers under /api)
  if (!raw) return "";

  // If we're on production domain but env mistakenly points to localhost => fallback to same-origin
  if (typeof window !== "undefined") {
    const siteHost = window.location.hostname;
    const isProdSite = siteHost && !["localhost", "127.0.0.1"].includes(siteHost);
    const isLocalBase = /localhost|127\.0\.0\.1/i.test(raw);

    if (isProdSite && isLocalBase) return "";
  }

  return normalizeBase(raw);
}

async function parseError(res: Response) {
  const contentType = res.headers.get("content-type") ?? "";
  const text = await res.text().catch(() => "");

  // Try JSON error shape first
  if (contentType.includes("application/json") && text) {
    try {
      const j = JSON.parse(text);
      if (typeof j?.error === "string") return j.error;
      if (typeof j?.message === "string") return j.message;
      return text;
    } catch {
      return text || `HTTP ${res.status}`;
    }
  }

  return text || `HTTP ${res.status}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const base = getBaseUrl();

  // If caller passed absolute URL, respect it
  const finalPath = isAbsoluteUrl(path) ? path : ensureLeadingSlash(path);

  // If base is set, prefix. Otherwise keep same-origin.
  const url = isAbsoluteUrl(finalPath) ? finalPath : base ? `${base}${finalPath}` : finalPath;

  const res = await fetch(url, {
    ...init,
    credentials: "include", // keep cookies (your admin seems cookie-auth based)
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  // Handle 204 No Content
  if (res.status === 204) return undefined as unknown as T;

  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    return (await res.json()) as T;
  }

  // Fallback if server returns text/html etc.
  return (await res.text()) as unknown as T;
}

export function apiGet<T>(path: string, init?: RequestInit) {
  return request<T>(path, { ...(init ?? {}), method: "GET" });
}

export function apiPost<T>(path: string, body?: Json, init?: RequestInit) {
  return request<T>(path, {
    ...(init ?? {}),
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function apiPut<T>(path: string, body?: Json, init?: RequestInit) {
  return request<T>(path, {
    ...(init ?? {}),
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function apiDelete<T>(path: string, init?: RequestInit) {
  return request<T>(path, { ...(init ?? {}), method: "DELETE" });
}
