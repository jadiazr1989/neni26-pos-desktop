// src/lib/api/apiClient.ts
import { ApiHttpError, type ApiEnvelope } from "./envelope";
import { getStorage } from "@/core/storage/storage";
import { storageKeys } from "@/core/storage/storageKeys";

const DEFAULT_API = "http://localhost:4000";

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

type JsonInit = {
  method?: HttpMethod;
  headers?: HeadersInit;
  body?: unknown;
};


function resolveBaseUrl(): string {
  if (typeof window === "undefined") {
    return (
      process.env.API_BASE_URL ??
      process.env.NEXT_PUBLIC_API_BASE_URL ??
      DEFAULT_API
    );
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API;
}

async function buildHeaders(init?: { headers?: HeadersInit }): Promise<Headers> {
  const h = new Headers(init?.headers);

  const storage = getStorage();
  const xTerminalId = await storage.get(storageKeys.xTerminalId);
  if (xTerminalId && !h.has("x-terminal-id")) {
    h.set("x-terminal-id", xTerminalId);
  }

  return h;
}

async function safeJson<T>(res: Response): Promise<T | null> {
  const ct = res.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) return null;
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function toHttpError(
  res: Response,
  env: ApiEnvelope<unknown> | null
): ApiHttpError {
  
  if (env && env.ok === false) {
    const message =
    env?.error?.message ??
    `HTTP ${res.status}`;
    return new ApiHttpError({
      message: message,
      status: res.status,
      code: env.error.code,
      reason: env.error.reason,
      requestId: env.error.requestId,
    });
  }
  

  return new ApiHttpError({
    message: `HTTP ${res.status} ${res.statusText || ""}`.trim(),
    status: res.status,
  });
}


export class ApiClient {
  private readonly baseUrl = resolveBaseUrl();

  async json<T>(path: string, init: JsonInit = {}): Promise<T> {
    const headers = await buildHeaders({ headers: init.headers });
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      method: init.method ?? "GET",
      headers,
      credentials: "include",
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });

    const env = await safeJson<ApiEnvelope<T>>(res);

    if (!res.ok || (env !== null && env.ok === false)) {
      throw toHttpError(res, env);
    }
    if (!env) {
      throw new ApiHttpError({
        message: "Invalid JSON envelope",
        status: res.status,
      });
    }

    return env.data;
  }

  async jsonWithHeaders<T>(
    path: string,
    init: JsonInit = {}
  ): Promise<{ data: T; headers: Headers }> {
    const headers = await buildHeaders({ headers: init.headers });
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      method: init.method ?? "GET",
      headers,
      credentials: "include",
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });

    const env = await safeJson<ApiEnvelope<T>>(res);

    if (!res.ok || (env !== null && env.ok === false)) {
      throw toHttpError(res, env);
    }
    if (!env) {
      throw new ApiHttpError({
        message: "Invalid JSON envelope",
        status: res.status,
      });
    }

    return { data: env.data, headers: res.headers };
  }

  async form<T>(
    path: string,
    formData: FormData,
    init: { method?: HttpMethod; headers?: HeadersInit } = {}
  ): Promise<T> {
    const headers = await buildHeaders({ headers: init.headers });
    // ❌ NO Content-Type aquí

    const res = await fetch(`${this.baseUrl}${path}`, {
      method: init.method ?? "POST",
      headers,
      credentials: "include",
      body: formData,
    });

    const env = await safeJson<ApiEnvelope<T>>(res);

    if (!res.ok || (env !== null && env.ok === false)) {
      throw toHttpError(res, env);
    }
    if (!env) {
      throw new ApiHttpError({
        message: "Invalid JSON envelope",
        status: res.status,
      });
    }

    return env.data;
  }
}

export const apiClient = new ApiClient();
