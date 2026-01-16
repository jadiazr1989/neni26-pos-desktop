// src/lib/api/fetch.ts
import { apiClient } from "./apiClient";

type FetchInit = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  headers?: HeadersInit;
  body?: string;
};

export async function apiFetch<T>(
  path: string,
  init: FetchInit = {}
): Promise<T> {
  let body: unknown = undefined;

  if (init.body !== undefined) {
    try {
      body = JSON.parse(init.body);
    } catch {
      body = init.body;
    }
  }

  return apiClient.json<T>(path, {
    method: init.method,
    headers: init.headers,
    body,
  });
}

export async function apiFetchEnvelope<T>(
  path: string,
  init: FetchInit = {}
): Promise<{ data: T; headers: Headers }> {
  let body: unknown = undefined;

  if (init.body !== undefined) {
    try {
      body = JSON.parse(init.body);
    } catch {
      body = init.body;
    }
  }

  return apiClient.jsonWithHeaders<T>(path, {
    method: init.method,
    headers: init.headers,
    body,
  });
}
