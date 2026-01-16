// ui/components/features/pos/cash/hooks/useCashOpen.ts
"use client";

import type { ActiveCashResponseDTO, OpenCashRequestDTO, OpenCashResponseDTO } from "@/lib/cash.types";
import { useCashStore } from "@/stores/cash.store";
import { useCallback, useState } from "react";

import { isApiOk } from "@/lib/api.guards";
import { apiFetchEnvelope } from "@/lib/api/fetch";
import { ApiEnvelope } from "@/lib/api/envelope";

type UseCashOpenOptions = {
  terminalId: string | null;
  onSuccess?: () => void;
};

export function useCashOpen(opts: UseCashOpenOptions) {
  const setActive = useCashStore((s) => s.setActive);
  const [opening, setOpening] = useState(false);

  const submit = useCallback(
    async (payload: OpenCashRequestDTO) => {
      if (!opts.terminalId) return;
      setOpening(true);
      try {
        // 1) intentar abrir
        const openRes = await apiFetchEnvelope<ApiEnvelope<OpenCashResponseDTO>>(
          "/api/v1/cash-sessions/open",
          {
            method: "POST",
            headers: { "x-terminal-id": opts.terminalId },
            body: JSON.stringify(payload),
          }
        );
        const openEnv = openRes.data;

        if (isApiOk(openEnv)) {
          setActive(openEnv.data.cashSession);
          opts.onSuccess?.();
          return;
        }

        // Si viene como ApiError ok:false:
        const msg = openEnv.error.message.toLowerCase();
        if (msg.includes("already open")) {
          // 2) recuperar activa
          const activeRes = await apiFetchEnvelope<ApiEnvelope<ActiveCashResponseDTO>>(
            "/api/v1/cash-sessions/active",
            {
              method: "GET",
              headers: { "x-terminal-id": opts.terminalId },
            }
          );

          const activeEnv = activeRes.data;
          if (isApiOk(activeEnv) && activeEnv.data.cashSession) {
            setActive(activeEnv.data.cashSession);
            opts.onSuccess?.();
            return;
          }
        }

        alert(openEnv.error.message);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Error abriendo caja";
        const lower = msg.toLowerCase();

        // ✅ si el POST tiró 409 como throw, recupera la activa igual
        if (opts.terminalId && (lower.includes("already open") || lower.includes("409"))) {
          const activeRes = await apiFetchEnvelope<ApiEnvelope<ActiveCashResponseDTO>>(
            "/api/v1/cash-sessions/active",
            { method: "GET", headers: { "x-terminal-id": opts.terminalId } }
          );
          const activeEnv = activeRes.data;
          if (isApiOk(activeEnv) && activeEnv.data.cashSession) {
            setActive(activeEnv.data.cashSession);
            opts.onSuccess?.();
            return;
          }
        }

        alert(msg);
      } finally {
        setOpening(false);
      }
    },
    [opts, setActive]
  );

  return { opening, submit };
}
