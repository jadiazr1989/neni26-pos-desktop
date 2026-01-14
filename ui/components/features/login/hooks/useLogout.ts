"use client";

import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

import { useSessionStore } from "@/stores/session.store";
import { useTerminalStore } from "@/stores/terminal.store";
import { useCashStore } from "@/stores/cash.store";

export function useLogout() {
  const router = useRouter();

  const setUser = useSessionStore((s) => s.setUser);
  const setStatus = useSessionStore((s) => s.setStatus);

  const clearTerminal = useTerminalStore((s) => s.clear);
  const clearCash = useCashStore((s) => s.setActive);

  return async function logout(): Promise<void> {
    try {
      // best effort: server logout
      await apiFetch("/api/v1/auth/logout", { method: "POST" });
    } catch {
      // no-op: igual seguimos
    } finally {
      // limpiar estado local
      setUser(null);
      setStatus("unauthenticated");

      clearCash(null);
      clearTerminal();

      router.replace("/login");
    }
  };
}

export function useLogin(){
  
}
