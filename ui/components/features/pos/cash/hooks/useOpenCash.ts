"use client";

import { useCallback, useState } from "react";
import type { OpenCashRequestDTO } from "@/lib/api.types";
import { useCashStore } from "@/stores/cash.store";

import { openCashSessionOrThrow } from "../services/openCashSessionOrThrow";
import { getActiveCashSessionOrThrow } from "../services/getActiveCashSessionOrThrow";
import { authorizeOrThrow } from "../services/authorizeOrThrow";
import { isApiHttpError } from "@/lib/api.errors";

type Role = "ADMIN" | "MANAGER" | "CASHIER";

type SupervisorCreds = {
  username: string;
  password: string;
  reason?: string;
};

function shouldRecoverAsActiveCash(err: { status: number; reason?: string; message: string }): boolean {
  if (err.status === 409) return true; // ✅ clave: no dependas del reason
  const m = err.message.toLowerCase();
  return m.includes("already open");
}

export function useOpenCash(props: {
  terminalId: string | null;
  role: Role;
  onSuccess?: () => void;
}) {
  const setActive = useCashStore((s) => s.setActive);
  const [opening, setOpening] = useState(false);

  const submit = useCallback(
    async (payload: OpenCashRequestDTO, supervisor?: SupervisorCreds) => {
      const terminalId = props.terminalId;
      if (!terminalId) return;

      setOpening(true);
      try {
        // 1) intento directo
        const dto = await openCashSessionOrThrow({ terminalId, payload });
        setActive(dto.cashSession);
        props.onSuccess?.();
        return;
      } catch (err: unknown) {
        // si no es ApiHttpError, re-lanza
        if (!isApiHttpError(err)) throw err;

        // 2) si ya hay caja abierta => recuperar y seguir de largo
        if (shouldRecoverAsActiveCash({ status: err.status, reason: err.reason, message: err.message })) {
          const active = await getActiveCashSessionOrThrow({ terminalId });
          if (active.cashSession) {
            setActive(active.cashSession);
            props.onSuccess?.();
            return;
          }
          // si no vino, entonces sí, re-lanza el original
          throw err;
        }

        // 3) cashier sin autorización => pedir override -> reintentar open con authorizationId
        if (props.role === "CASHIER" && err.status === 403 && err.reason === "AUTHORIZATION_REQUIRED") {
          if (!supervisor) throw new Error("Supervisor credentials required");

          const auth = await authorizeOrThrow({
            terminalId,
            payload: {
              username: supervisor.username,
              password: supervisor.password,
              scope: "OPEN_CASH",
              reason: supervisor.reason ?? "Supervisor override",
            },
          });

          // 👇 importante: tu servicio debe devolver { authorization: {...} }
          const authorizationId = auth.authorization.id;

          const dto2 = await openCashSessionOrThrow({
            terminalId,
            payload: { ...payload, authorizationId },
          });

          setActive(dto2.cashSession);
          props.onSuccess?.();
          return;
        }

        // otro error => re-lanzar
        throw err;
      } finally {
        setOpening(false);
      }
    },
    [props.terminalId, props.role, props.onSuccess, setActive]
  );

  return { submit, opening };
}
