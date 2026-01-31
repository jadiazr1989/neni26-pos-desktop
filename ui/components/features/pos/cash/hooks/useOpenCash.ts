// ui/components/features/pos/cash/hooks/useOpenCash.ts
"use client";

import * as React from "react";
import { useCashStore } from "@/stores/cash.store";
import { notify } from "@/lib/notify/notify";

import { cashService } from "@/lib/modules/cash/cash.service";
import type {
  AuthorizationScope,
  OpenCashRequest,
  UserRole,
} from "@/lib/modules/cash/cash.dto";

import { isApiHttpError } from "@/lib/api/envelope";

type Role = UserRole; // "ADMIN" | "MANAGER" | "CASHIER"

type SupervisorCreds = {
  username: string;
  password: string;
  reason?: string;
};

function shouldRecoverAsActiveCash(err: { status: number; message: string }): boolean {
  return err.status === 409; // ✅ no dependas del reason/message
}

function friendlyOpenCashError(e: unknown): string {
  if (!isApiHttpError(e)) return e instanceof Error ? e.message : "Error abriendo caja";

  if (e.reason === "AUTHORIZATION_REQUIRED") {
    return "Se requiere autorización de supervisor para abrir caja.";
  }

  if (e.status === 400) return "Solicitud inválida. Revisa los montos.";
  if (e.status === 401) return "Sesión expirada. Inicia sesión de nuevo.";
  if (e.status === 403) return "No tienes permisos para abrir caja.";
  if (e.status === 409) return "Ya hay una caja abierta en este terminal.";
  if (e.status >= 500) return "Error del servidor. Intenta de nuevo.";

  return e.message || "Error abriendo caja.";
}

export function useOpenCash(props: {
  role: Role;
  onSuccess?: () => void;
}) {
  const setActive = useCashStore((s) => s.setActive);
  const [opening, setOpening] = React.useState(false);

  const submit = React.useCallback(
    async (payload: OpenCashRequest, supervisor?: SupervisorCreds) => {
      if (opening) return;

      setOpening(true);
      try {
        // 1) intento directo
        const { cashSession } = await cashService.open(payload);
        setActive(cashSession);
        props.onSuccess?.();
        notify.success({ title: "Caja abierta", description: "La sesión de caja quedó activa." });
        return;
      } catch (err: unknown) {
        // si no es ApiHttpError, solo notifica
        if (!isApiHttpError(err)) {
          notify.error({ title: "No se pudo abrir caja", description: friendlyOpenCashError(err) });
          return;
        }

        // 2) ya hay una abierta => recuperar activa
        if (shouldRecoverAsActiveCash({ status: err.status, message: err.message })) {
          try {
            const active = await cashService.active();
            if (active) {
              setActive(active);
              props.onSuccess?.();
              notify.success({ title: "Caja ya estaba abierta", description: "Se cargó la caja activa." });
              return;
            }
            // si no vino active, cae al error abajo
          } catch {
            // cae al error abajo
          }

          notify.error({
            title: "No se pudo cargar la caja activa",
            description: "El servidor indicó que ya existía una caja abierta, pero no se pudo recuperar.",
          });
          return;
        }

        // 3) cashier sin autorización => pedir override y reintentar open con authorizationId
        if (props.role === "CASHIER" && err.status === 403 && err.reason === "AUTHORIZATION_REQUIRED") {
          if (!supervisor) {
            notify.warning({
              title: "Autorización requerida",
              description: "Necesitas credenciales de supervisor para abrir caja.",
            });
            return;
          }

          try {
            const auth = await cashService.authorize({
              username: supervisor.username,
              password: supervisor.password,
              scope: "OPEN_CASH" as AuthorizationScope,
              reason: supervisor.reason ?? "Supervisor override",
            });

            const { cashSession } = await cashService.open({
              ...payload,
              authorizationId: auth.id,
            });

            setActive(cashSession);
            props.onSuccess?.();
            notify.success({
              title: "Caja abierta con autorización",
              description: "Supervisor autorizó la apertura de caja.",
            });
            return;
          } catch (e2: unknown) {
            notify.error({
              title: "No se pudo autorizar / abrir caja",
              description: friendlyOpenCashError(e2),
            });
            return;
          }
        }

        // 4) otro error
        notify.error({ title: "No se pudo abrir caja", description: friendlyOpenCashError(err) });
        return;
      } finally {
        setOpening(false);
      }
    },
    [opening, props.role, props.onSuccess, setActive]
  );

  return { submit, opening };
}
