// src/components/shared/gate/useAppGate.ts
"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useSessionStore } from "@/stores/session.store";
import { useTerminalStore } from "@/stores/terminal.store";

type Area = "admin" | "pos";
type Role = "ADMIN" | "MANAGER" | "CASHIER" | string;

type GateAction = { type: "allow" } | { type: "redirect"; to: string };

type Phase =
  | "booting"           // iniciando
  | "waiting_session"   // no authenticated aún
  | "hydrating_terminal"
  | "checking"
  | "redirecting"
  | "allowed";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function useAppGate(opts: { area: Area; minMs?: number }) {
  const minMs = opts.minMs ?? 1200;
  const pathname = usePathname();

  const sessionStatus = useSessionStore((s) => s.status);
  const role = (useSessionStore((s) => s.user?.role ?? "CASHIER") as Role) ?? "CASHIER";

  const xTerminalId = useTerminalStore((s) => s.xTerminalId);
  const hydrated = useTerminalStore((s) => s.hydrated);
  const hydrateTerminal = useTerminalStore((s) => s.hydrate);

  const isAdmin = role === "ADMIN" || role === "MANAGER";

  const allowWithoutTerminal = useMemo(() => {
    if (pathname.startsWith("/admin/dashboard")) return true;
    if (pathname.startsWith("/terminal-required")) return true;
    return false;
  }, [pathname]);

  const [phase, setPhase] = useState<Phase>("booting");
  const [action, setAction] = useState<GateAction>({ type: "allow" });

  // 1) Hidratar terminal (external sync)
  useEffect(() => {
    void hydrateTerminal();
  }, [hydrateTerminal]);

  // 2) Máquina de decisión (sin setState sync “innecesario”)
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      // A) Si no hay sesión, espera
      if (sessionStatus !== "authenticated") {
        if (!cancelled) {
          setPhase("waiting_session");
          setAction({ type: "allow" });
        }
        return;
      }

      // B) Espera hydrate terminal
      if (!hydrated) {
        if (!cancelled) {
          setPhase("hydrating_terminal");
          setAction({ type: "allow" });
        }
        return;
      }

      // C) Ya puedo chequear
      if (!cancelled) setPhase("checking");

      // UX: mínimo delay SOLO cuando estamos en modo “checking”
      await sleep(minMs);
      if (cancelled) return;

      // D) Si hay terminal => allow
      if (xTerminalId) {
        setAction({ type: "allow" });
        setPhase("allowed");
        return;
      }

      // E) Si ruta allowlisted => allow
      if (allowWithoutTerminal) {
        setAction({ type: "allow" });
        setPhase("allowed");
        return;
      }

      // F) Sin terminal => redirect
      const to = !isAdmin ? "/terminal-required" : "/admin/dashboard";
      setAction({ type: "redirect", to });
      setPhase("redirecting");
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [sessionStatus, hydrated, xTerminalId, allowWithoutTerminal, isAdmin, minMs]);

  const busy = phase !== "allowed";
  const subtitle = useMemo(() => {
    switch (phase) {
      case "waiting_session":
        return "Loading session…";
      case "hydrating_terminal":
        return "Loading device…";
      case "checking":
        return "Verifying access…";
      case "redirecting":
        return "Redirecting…";
      case "allowed":
        return "Ready";
      default:
        return "Preparing…";
    }
  }, [phase]);

  return { busy, subtitle, action, sessionStatus, phase };
}
