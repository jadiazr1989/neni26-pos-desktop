import { getStorage } from "@/core/storage/storage";
import { storageKeys } from "@/core/storage/storageKeys";
import type { ApiEnvelope } from "./api.types";
import { ApiHttpError, envelopeErrorParts } from "./api.errors";

const DEFAULT_API = "http://localhost:4000";

const API_BASE =
  typeof window === "undefined"
    ? (process.env.API_BASE_URL ?? DEFAULT_API)
    : DEFAULT_API;

async function buildHeaders(init?: RequestInit): Promise<Headers> {
  const h = new Headers(init?.headers);
  if (!h.has("Content-Type")) h.set("Content-Type", "application/json");

  const storage = getStorage();
  const xTerminalId = await storage.get(storageKeys.xTerminalId);
  if (xTerminalId && !h.has("x-terminal-id")) h.set("x-terminal-id", xTerminalId);

  return h;
}

async function safeJson<T>(res: Response): Promise<T | null> {
  const ct = res.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) return null;
  try { return (await res.json()) as T; } catch { return null; }
}

function toErr(res: Response, env: ApiEnvelope<unknown> | null): ApiHttpError {
  const parts = envelopeErrorParts(env);
  return new ApiHttpError({
    message: parts.message ?? `HTTP ${res.status} ${res.statusText || ""}`.trim(),
    status: res.status,
    code: parts.code,
    reason: parts.reason,
    requestId: parts.requestId,
  });
}

export async function apiFetch<TData>(path: string, init: RequestInit & { body?: string } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: await buildHeaders(init),
    credentials: "include",
  });

  const env = await safeJson<ApiEnvelope<TData>>(res);
  if (!res.ok || (env !== null && env.ok === false)) throw toErr(res, env);
  if (!env) throw new Error("Invalid server response (expected JSON)");
  return env.data;
}

export async function apiFetchEnvelope<TData>(path: string, init: RequestInit & { body?: string } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: await buildHeaders(init),
    credentials: "include",
  });

  const env = await safeJson<ApiEnvelope<TData>>(res);
  if (!res.ok || (env !== null && env.ok === false)) throw toErr(res, env);
  if (!env) throw new Error("Invalid server response (expected JSON)");
  return { data: env.data, headers: res.headers };
}
