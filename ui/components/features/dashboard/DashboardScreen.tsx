"use client";

import { JSX, useCallback } from "react";
import { useRouter } from "next/navigation";

import { useSessionStore } from "@/stores/session.store";
import { useTerminalStore } from "@/stores/terminal.store";
import { useCashStore } from "@/stores/cash.store";

import { salesBlockReason, catalogBlockReason } from "./utils";
import { useApiConnectivity } from "./hooks/useApiConnectivity";
import { ActionGrid } from "./ui/ActionGrid";
import { StationPanel } from "../pos/shell/ui/StationPanel";

export function DashboardScreen(): JSX.Element {
  const router = useRouter();

  const user = useSessionStore((s) => s.user);
  const role = user?.role ?? null;

  const xTerminalId = useTerminalStore((s) => s.xTerminalId);
  const cashActive = useCashStore((s) => s.active);
  const cashStatus = useCashStore((s) => s.status);

  const { apiStatus, lastPingAt } = useApiConnectivity(15000);

  const canRefund = role === "ADMIN" || role === "MANAGER";

  const terminalReady = Boolean(xTerminalId);
  const cashOpen = Boolean(cashActive);

  const disableSales = !terminalReady || !cashOpen || apiStatus === "offline";
  const disableCatalog = !terminalReady || apiStatus === "offline";
  const disableCash = !terminalReady || apiStatus === "offline" || cashStatus === "unknown";

  const onNewSale = useCallback(() => router.push("/sales/new"), [router]);
  const onReturns = useCallback(() => router.push("/returns/new"), [router]);
  const onCatalog = useCallback(() => router.push("/catalog"), [router]);
  const onCash = useCallback(
    () => router.push(cashOpen ? "/cash/active" : "/cash/open"),
    [router, cashOpen]
  );

  // Botón principal “Abrir caja”
  const onOpenCash = useCallback(() => router.push("/cash/open"), [router]);

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="lg:col-span-7 xl:col-span-8 space-y-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Panel principal</h1>
          <p className="text-xs text-muted-foreground">
            Atajos: <span className="font-semibold text-foreground">F2</span> Venta ·{" "}
            <span className="font-semibold text-foreground">F4</span> Devolución ·{" "}
            <span className="font-semibold text-foreground">F6</span> Catálogo ·{" "}
            <span className="font-semibold text-foreground">F9</span> Caja
          </p>
        </div>

        <ActionGrid
          onNewSale={onNewSale}
          onReturns={onReturns}
          onCatalog={onCatalog}
          onCash={onCash}
          disableSales={disableSales}
          disableCatalog={disableCatalog}
          disableCash={disableCash}
          salesReason={salesBlockReason({ terminalReady, cashOpen, apiStatus })}
          catalogReason={catalogBlockReason({ terminalReady, apiStatus })}
          cashReason={!terminalReady ? "Se requiere terminal" : apiStatus === "offline" ? "Sin conexión" : null}
          returnsSubtitle={canRefund ? "Crear devolución / reembolso" : "Crear devolución (reembolso requiere manager)"}
          cashSubtitle={cashOpen ? "Ver sesión activa" : "Abrir sesión de caja"}
        />
      </div>

      <div className="lg:col-span-5 xl:col-span-4 space-y-4">
        <StationPanel
          userName={user?.username ?? "—"}
          role={role ?? "—"}
          terminalReady={terminalReady}
          xTerminalId={xTerminalId ?? null}
          apiStatus={apiStatus}
          lastPingAt={lastPingAt}
          cashOpen={cashOpen}
          onOpenCash={onOpenCash}
          onRefresh={() => window.location.reload()}
        />
      </div>
    </div>
  );
}
