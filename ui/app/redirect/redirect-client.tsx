"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTerminalStore } from "@/stores/terminal.store";

type Role = "ADMIN" | "MANAGER" | "CASHIER" | string;

export default function RedirectClient({ role }: { role: Role }) {
  const router = useRouter();

  const xTerminalId = useTerminalStore((s) => s.xTerminalId);
  const hydrate = useTerminalStore((s) => s.hydrate);

  // 1) Primero: cargar terminalId 
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // 2) Luego: decidir
  useEffect(() => {
    // Admin / Manager => Admin Home (si aún no existe, apunta a setup)
    if (role === "ADMIN" || role === "MANAGER") {
      router.replace("/admin"); // (o /admin/setup si aún no tienes /admin)
      return;
    }

    // Cashier => si hay terminal listo => POS, si no => Boot
    if (xTerminalId) router.replace("/pos");
    else router.replace("/boot");
  }, [role, xTerminalId, router]);

  return null;
}
