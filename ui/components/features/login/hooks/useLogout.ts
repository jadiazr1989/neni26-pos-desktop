"use client";

import { apiFetch } from "@/lib/api/fetch";
import { useRouter } from "next/navigation";

import { useCashStore } from "@/stores/cash.store";
import { useSessionStore } from "@/stores/session.store";

export function useLogout() {
  const router = useRouter();

  const setUser = useSessionStore((s) => s.setUser);
  const setStatus = useSessionStore((s) => s.setStatus);

  const setCashActive = useCashStore((s) => s.setActive);

  return async function logout(): Promise<void> {
    try {
      await apiFetch("/api/v1/auth/logout", { method: "POST" });
    } catch {
      // no-op
    } finally {
      // ✅ limpiar sesión, NO terminal
      setUser(null);
      setStatus("unauthenticated");

      await setCashActive(null);

      router.replace("/login");
    }
  };
}
