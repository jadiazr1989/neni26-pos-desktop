"use client";

import type { JSX } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { OpenCashRequestDTO } from "@/lib/api.types";
import { useOpenCash } from "../hooks/useOpenCash";

type GateReason = "OFFLINE" | "NO_TERMINAL" | "NO_ACTIVE_CASH" | "CHECKING" | "OK";
type Role = "ADMIN" | "MANAGER" | "CASHIER";

type SupervisorCreds = { username: string; password: string };

function parseAmount(value: string): number {
  const trimmed = value.trim();
  if (trimmed.length === 0) return 0;
  const normalized = trimmed.replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function getTitle(reason: GateReason): string {
  switch (reason) {
    case "OFFLINE":
      return "Sin conexión";
    case "NO_TERMINAL":
      return "Terminal no asignado";
    case "CHECKING":
      return "Verificando...";
    default:
      return "Abrir caja";
  }
}

function getHelper(params: { reason: GateReason; role: Role }): string {
  const { reason, role } = params;

  if (reason === "OFFLINE") return "Necesitas conexión para abrir caja.";
  if (reason === "NO_TERMINAL") return "Asigna un terminal antes de abrir caja.";
  if (reason === "CHECKING") return "Esperando verificación...";
  if (reason === "OK") return "Caja lista.";

  if (role === "CASHIER") {
    return "Para abrir caja como cashier, requiere autorización de supervisor (admin/manager).";
  }
  return "Ingresa el monto inicial y abre la sesión de caja para vender.";
}

function isBlocked(reason: GateReason): boolean {
  return reason === "OFFLINE" || reason === "NO_TERMINAL" || reason === "CHECKING" || reason === "OK";
}

function canAttemptOpen(params: {
  open: boolean;
  canSubmit: boolean;
  blocked: boolean;
  opening: boolean;
  role: Role;
  supervisor?: SupervisorCreds;
}): boolean {
  const { open, canSubmit, blocked, opening, role, supervisor } = params;
  if (!open || !canSubmit || blocked || opening) return false;

  // Admin/Manager: directo
  if (role === "ADMIN" || role === "MANAGER") return true;

  // Cashier: necesita credenciales del supervisor
  return Boolean(supervisor?.username && supervisor?.password);
}

/**
 * CashOpenGateModal
 * - Admin/Manager: abre directo
 * - Cashier: solicita credenciales supervisor y hace override (via useOpenCash)
 * - SOLID: helpers puros (title/helper/blocked/canAttemptOpen) + UI composable (SupervisorFields)
 */
export function CashOpenGateModal(props: {
  open: boolean;
  reason: GateReason;
  canSubmit: boolean;
  terminalId: string | null;
  role: Role;
  onRefresh: () => void;
  onGoAdmin?: () => void;
}): JSX.Element | null {
  const { submit, opening } = useOpenCash({
    terminalId: props.terminalId,
    role: props.role,
    onSuccess: () => {},
  });

  // amounts
  const [cup, setCup] = useState("0");
  const [usd, setUsd] = useState("0");

  // supervisor (only for cashier)
  const [supUser, setSupUser] = useState("");
  const [supPass, setSupPass] = useState("");

  // keep refs in sync (future-proof if you later need stable values in handlers)
  const cupRef = useRef(cup);
  const usdRef = useRef(usd);
  useEffect(() => void (cupRef.current = cup), [cup]);
  useEffect(() => void (usdRef.current = usd), [usd]);

  const payload = useMemo<OpenCashRequestDTO>(() => {
    return {
      opening: {
        CUP: parseAmount(cup),
        USD: parseAmount(usd),
      },
    };
  }, [cup, usd]);

  const blocked = isBlocked(props.reason);
  const title = getTitle(props.reason);
  const helper = getHelper({ reason: props.reason, role: props.role });

  const supervisor: SupervisorCreds | undefined =
    props.role === "CASHIER" ? { username: supUser.trim(), password: supPass } : undefined;

  const canOpenNow = canAttemptOpen({
    open: props.open,
    canSubmit: props.canSubmit,
    blocked,
    opening,
    role: props.role,
    supervisor,
  });

  const onSubmit = useCallback(async () => {
    if (!canOpenNow) return;

    if (props.role === "CASHIER") {
      await submit(payload, {
        username: supervisor!.username,
        password: supervisor!.password,
        reason: "Supervisor override",
      });
      return;
    }

    await submit(payload);
  }, [canOpenNow, props.role, submit, payload, supervisor]);

  // keyboard: Enter submits, Escape blocked (modal is mandatory)
  useEffect(() => {
    if (!props.open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
      }
      if (e.key === "Enter") {
        e.preventDefault();
        void onSubmit();
      }
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [props.open, onSubmit]);

  if (!props.open) return null;

  const inputsDisabled = blocked || opening;
  const showSupervisorFields = props.role === "CASHIER" && !blocked;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-6">
      <Card className="w-full max-w-lg rounded-2xl p-5">
        <Header title={title} helper={helper} />

        <MoneyInputs
          cup={cup}
          usd={usd}
          onChangeCup={setCup}
          onChangeUsd={setUsd}
          disabled={inputsDisabled}
        />

        {showSupervisorFields && (
          <SupervisorFields
            username={supUser}
            password={supPass}
            onChangeUsername={setSupUser}
            onChangePassword={setSupPass}
            disabled={opening}
          />
        )}

        <Button className="mt-4 h-12 w-full" type="button" onClick={onSubmit} disabled={!canOpenNow}>
          {opening ? "Abriendo..." : "Abrir caja"}
        </Button>

        <Button variant="secondary" className="mt-2 h-11 w-full" type="button" onClick={props.onRefresh}>
          Reintentar / Actualizar
        </Button>

        {(props.role === "ADMIN" || props.role === "MANAGER") && props.onGoAdmin && (
          <Button variant="ghost" className="mt-2 h-11 w-full" type="button" onClick={props.onGoAdmin}>
            Ir a administración
          </Button>
        )}
      </Card>
    </div>
  );
}

/* ----------------------------- UI Pieces ----------------------------- */

function Header(props: { title: string; helper: string }): JSX.Element {
  return (
    <>
      <div className="text-base font-semibold">{props.title}</div>
      <div className="mt-1 text-xs text-muted-foreground">{props.helper}</div>
    </>
  );
}

function MoneyInputs(props: {
  cup: string;
  usd: string;
  disabled: boolean;
  onChangeCup: (v: string) => void;
  onChangeUsd: (v: string) => void;
}): JSX.Element {
  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label>Monto inicial (CUP)</Label>
        <Input
          value={props.cup}
          onChange={(e) => props.onChangeCup(e.target.value)}
          inputMode="decimal"
          disabled={props.disabled}
        />
      </div>

      <div className="space-y-2">
        <Label>Monto inicial (USD)</Label>
        <Input
          value={props.usd}
          onChange={(e) => props.onChangeUsd(e.target.value)}
          inputMode="decimal"
          disabled={props.disabled}
        />
      </div>
    </div>
  );
}

function SupervisorFields(props: {
  username: string;
  password: string;
  disabled: boolean;
  onChangeUsername: (v: string) => void;
  onChangePassword: (v: string) => void;
}): JSX.Element {
  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label>Supervisor username</Label>
        <Input
          value={props.username}
          onChange={(e) => props.onChangeUsername(e.target.value)}
          autoComplete="off"
          disabled={props.disabled}
        />
      </div>

      <div className="space-y-2">
        <Label>Supervisor password</Label>
        <Input
          type="password"
          value={props.password}
          onChange={(e) => props.onChangePassword(e.target.value)}
          autoComplete="new-password"
          disabled={props.disabled}
        />
      </div>
    </div>
  );
}
