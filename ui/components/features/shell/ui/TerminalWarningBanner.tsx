"use client";

import { useDeviceTerminal } from "@/components/shared/hooks/useDeviceTerminal";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

export function TerminalWarningBanner(): React.ReactNode {
  const router = useRouter();
  const { hydrated, hasTerminal } = useDeviceTerminal();

  if (!hydrated) return null;
  if (hasTerminal) return null;

  return (
    <div className="w-full border-b bg-yellow-50 text-yellow-950">
      <div className="px-6 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm min-w-0">
          <AlertTriangle className="size-4 shrink-0" />
          <span className="truncate">
            <b>Terminal no configurado.</b> Sin terminal este dispositivo no puede vender ni ejecutar operaciones del POS.
          </span>
        </div>

        <Button className="h-9" onClick={() => router.push("/admin/settings")}>
          Configurar terminal
        </Button>
      </div>
    </div>
  );
}
