"use client";

import * as React from "react";
import { LayoutGrid, LogOut, ArrowRightLeft, UserRound, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSessionStore } from "@/stores/session.store";
import { useRouter } from "next/navigation";
import { useLogout } from "../../login/hooks";

export function ShellTopBar({ area }: { area: "pos" | "admin" }) {
  const router = useRouter();
  const user = useSessionStore((s) => s.user);
  const logout = useLogout();

  const areaLabel = area === "admin" ? "Administración" : "Punto de venta";

  return (
    <header className="relative h-14 border-b border-border bg-card flex items-center px-6 justify-between">
      {/* Accent bar (marca sutil) */}
      <div className="absolute inset-x-0 top-0 h-1 bg-accent" />

      {/* Left: Brand */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-9 w-9 rounded-xl border border-border bg-accent/30 grid place-items-center shrink-0">
          <span className="text-sm font-extrabold text-foreground">N</span>
        </div>

        <div className="leading-tight min-w-0">
          <div className="text-sm font-semibold truncate">Neni26 POS</div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <LayoutGrid className="size-3" />
            <span className="truncate">{areaLabel}</span>
          </div>
        </div>
      </div>

      {/* Right: User + Actions */}
      <div className="flex items-center gap-3">
        {/* User */}
        <div className="hidden sm:flex items-center gap-3 text-right leading-tight">
          <div className="grid place-items-center size-9 rounded-xl border border-border bg-muted/40">
            <UserRound className="size-4 text-muted-foreground" />
          </div>

          <div>
            <div className="text-sm font-medium">{user?.username ?? "—"}</div>
            <div className="text-xs text-muted-foreground inline-flex items-center gap-1">
              <Shield className="size-3" />
              {user?.role ?? "—"}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {area === "admin" && (
            <Button
              variant="secondary"
              className="h-10"
              onClick={() => router.push("/pos")}
            >
              <ArrowRightLeft className="mr-2 size-4" />
              Ir al POS
            </Button>
          )}

          <Button
            variant="outline"
            className="h-10"
            onClick={() => void logout()}
          >
            <LogOut className="mr-2 size-4" />
            Salir
          </Button>
        </div>
      </div>
    </header>
  );
}
