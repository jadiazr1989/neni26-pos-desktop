import { cookies } from "next/headers";
import "server-only";

import type { MeResponse, MeUser } from "@/lib/cash.types";
import { ApiEnvelope } from "../api/envelope";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

async function buildCookieHeader(): Promise<string> {
  const cookieStore = await cookies(); // 👈 await obligatorio
  const all = cookieStore.getAll();

  return all.map((c) => `${c.name}=${c.value}`).join("; ");
}

export async function getServerSession(): Promise<MeUser | null> {
  const cookieHeader = await buildCookieHeader();

  if (!cookieHeader) return null;

  const res = await fetch(`${API_BASE}/api/v1/auth/me`, {
    method: "GET",
    headers: {
      Cookie: cookieHeader,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const json = (await res.json()) as ApiEnvelope<MeResponse>;

  if (!res.ok || json.ok === false) return null;

  return json.data.user ?? null;
}
