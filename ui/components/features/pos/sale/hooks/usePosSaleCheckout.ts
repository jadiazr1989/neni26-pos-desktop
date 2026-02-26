"use client";

import * as React from "react";
import { notify } from "@/lib/notify/notify";
import { usePosSaleStore } from "@/stores/posSale.store";
import type { Currency, PaymentMethod, PaymentDTO, MoneyStr } from "@/lib/modules/sales/sale.dto";
import { SyncStatus } from "@/stores/helpers/posSale.store.types";

type PayLineDraft = {
  id: string;
  method: PaymentMethod;
  currency: Currency;
  tenderMinor: number;
  fxRate: string | null;
  provider: string | null;
  reference: string | null;
};

export type CheckoutState =
  | { status: "idle" }
  | { status: "editing"; message?: string }
  | { status: "submitting" }
  | {
      status: "success";
      saleId: string;
      payments: PaymentDTO[];
      // ✅ BigInt-safe (server devuelve string)
      tenderedBaseMinor: MoneyStr;
      changeBaseMinor: MoneyStr;
      openDrawer: boolean;
    }
  | { status: "error"; message: string };

type UsePosSaleCheckoutArgs = {
  cashSessionId: string | null;
  onPaid?: () => void | Promise<void>;
};

function uuid(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isInt(n: number): boolean {
  return Number.isFinite(n) && Math.trunc(n) === n;
}

function clampInt(n: number, min: number, max: number): number {
  const x = Number(n);
  if (!Number.isFinite(x)) return min;
  return Math.max(min, Math.min(max, Math.trunc(x)));
}

function normalizeFxRate(v: string | null): string | null {
  const s = (v ?? "").trim();
  return s ? s : null;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;

  if (isRecord(e)) {
    const msg = e["message"];
    if (typeof msg === "string" && msg.trim()) return msg;

    const err = e["error"];
    if (isRecord(err)) {
      const m2 = err["message"];
      if (typeof m2 === "string" && m2.trim()) return m2;
    }
  }

  return "No se pudo completar el cobro.";
}

// ✅ helper UI: baseMinor(string) -> "CUP 0.00"
function moneyLabelBaseMinor(v: MoneyStr): string {
  // baseMinor son "centavos" (minor) en moneda base.
  // Para UI simple usamos Number solo para formato; si te preocupa overflow,
  // crea formatter BigInt (más abajo te dejo opción).
  const n = Number(v);
  if (!Number.isFinite(n)) return `${v} (minor)`;
  return `${(n / 100).toFixed(2)} CUP`;
}

function moneyLabel(minor: number): string {
  return `${(minor / 100).toFixed(2)} CUP`;
}

/**
 * ✅ Validación UX:
 * - Procesa en orden.
 * - Non-cash CUP NO puede exceder lo que falta.
 * - Cash CUP sí puede exceder (cambio).
 * - Para USD/EUR pide fxRate
 *
 * NOTA: esto es UX con tenderMinor/totalMinor (int) y está OK.
 * El backend calcula baseMinor real con fxRate.
 */
function validatePaymentsAgainstTotal(
  lines: PayLineDraft[],
  totalMinor: number
): { ok: true } | { ok: false; message: string } {
  if (lines.length === 0) return { ok: false, message: "Debes agregar al menos un método de pago." };
  if (!isInt(totalMinor) || totalMinor <= 0) return { ok: false, message: "Total inválido. Revisa el ticket." };

  let remaining = totalMinor;

  for (let i = 0; i < lines.length; i++) {
    const p = lines[i];

    if (!isInt(p.tenderMinor) || p.tenderMinor <= 0) {
      return { ok: false, message: `El pago #${i + 1} tiene un monto inválido.` };
    }

    if (p.currency !== "CUP") {
      const fx = normalizeFxRate(p.fxRate);
      if (!fx) return { ok: false, message: `El pago #${i + 1} requiere tasa (fxRate) para ${p.currency}.` };
      const fxNum = Number(fx);
      if (!Number.isFinite(fxNum) || fxNum <= 0) {
        return { ok: false, message: `El pago #${i + 1} tiene una tasa (fxRate) inválida.` };
      }
    }

    const isCashCup = p.method === "CASH" && p.currency === "CUP";

    if (!isCashCup && p.currency === "CUP" && p.tenderMinor > remaining) {
      return {
        ok: false,
        message: `El pago #${i + 1} excede lo que falta. Solo efectivo (CUP) puede exceder para dar cambio.`,
      };
    }

    const applied = Math.min(remaining, p.tenderMinor);
    remaining -= applied;

    if (remaining === 0 && i < lines.length - 1) {
      return { ok: false, message: "Ya está cubierto el total. Elimina líneas de pago extra." };
    }
  }

  if (remaining !== 0) {
    return { ok: false, message: `Falta pagar ${moneyLabel(remaining)}.` };
  }

  return { ok: true };
}

export function usePosSaleCheckout(args: UsePosSaleCheckoutArgs) {
  const { cashSessionId, onPaid } = args;

  // ====== Store ======
  const totals = usePosSaleStore((s) => s.totals);
  const canPay = usePosSaleStore((s) => s.canPay);
  const checkout = usePosSaleStore((s) => s.checkout);

  const syncStatus = usePosSaleStore((s) => s.syncStatus) as SyncStatus;
  const syncErrorMessage = usePosSaleStore((s) => s.syncError?.message ?? null);

  const checkoutStatus = usePosSaleStore((s) => s.checkoutStatus);
  const lastCheckout = usePosSaleStore((s) => s.lastCheckout);

  // ====== Local state ======
  const [isOpen, setIsOpen] = React.useState(false);
  const [state, setState] = React.useState<CheckoutState>({ status: "idle" });
  const [lines, setLines] = React.useState<PayLineDraft[]>([]);

  const devBypassSync = process.env.NODE_ENV === "development";

  // ====== Helpers ======
  const defaultLine = React.useCallback(
    (over?: Partial<PayLineDraft>): PayLineDraft => ({
      id: uuid(),
      method: "CASH",
      currency: "CUP",
      tenderMinor: clampInt(totals.totalMinor, 0, 9_999_999_999),
      fxRate: null,
      provider: null,
      reference: null,
      ...over,
    }),
    [totals.totalMinor]
  );

  const paidMinor = React.useMemo(
    () => lines.reduce((acc, p) => acc + (Number.isFinite(p.tenderMinor) ? p.tenderMinor : 0), 0),
    [lines]
  );

  const dueMinor = React.useMemo(() => Math.max(0, totals.totalMinor - paidMinor), [totals.totalMinor, paidMinor]);
  const changeMinorUx = React.useMemo(() => Math.max(0, paidMinor - totals.totalMinor), [paidMinor, totals.totalMinor]);

  // ====== Actions ======
  const openCheckout = React.useCallback(() => {
    if (!canPay()) {
      notify.warning({ title: "No se puede cobrar", description: "Agrega productos con precio válido." });
      return;
    }
    if (!isInt(totals.totalMinor) || totals.totalMinor <= 0) {
      notify.warning({
        title: "Total inválido",
        description: "El total es 0 o inválido. Revisa precios del catálogo.",
      });
      return;
    }
    if (!cashSessionId) {
      notify.error({ title: "Caja no disponible", description: "Abre la caja antes de cobrar." });
      return;
    }

    setLines([defaultLine()]);
    setState({ status: "editing" });
    setIsOpen(true);
  }, [canPay, totals.totalMinor, cashSessionId, defaultLine]);

  const close = React.useCallback(() => {
    setIsOpen(false);
    setState({ status: "idle" });
    setLines([]);
  }, []);

  const addPaymentLine = React.useCallback(() => {
    setLines((prev) => [
      ...prev,
      defaultLine({
        tenderMinor: clampInt(dueMinor, 1, 9_999_999_999),
        method: "CASH",
        currency: "CUP",
        fxRate: null,
      }),
    ]);
  }, [defaultLine, dueMinor]);

  const removePaymentLine = React.useCallback((id: string) => {
    setLines((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const updatePaymentLine = React.useCallback((id: string, patch: Partial<Omit<PayLineDraft, "id">>) => {
    setLines((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const next: PayLineDraft = { ...p, ...patch };
        next.tenderMinor = clampInt(next.tenderMinor, 0, 9_999_999_999);
        next.fxRate = normalizeFxRate(next.fxRate);
        if (next.currency === "CUP") next.fxRate = null;
        return next;
      })
    );
  }, []);

  const setQuickCash = React.useCallback(() => {
    setLines([
      defaultLine({
        method: "CASH",
        currency: "CUP",
        tenderMinor: clampInt(totals.totalMinor, 1, 9_999_999_999),
      }),
    ]);
  }, [defaultLine, totals.totalMinor]);

  const submit = React.useCallback(async () => {
    if (!isOpen) return;

    if (!cashSessionId) {
      const msg = "No hay caja activa (cashSessionId).";
      setState({ status: "error", message: msg });
      notify.error({ title: "No se pudo cobrar", description: msg });
      return;
    }

    // ✅ NO cobrar si no está sincronizado (excepto DEV)
    if (!devBypassSync && syncStatus !== "ready") {
      const msg = syncErrorMessage || "La venta no está sincronizada aún. Espera o revisa conexión.";
      setState({ status: "editing", message: msg });
      notify.warning({ title: "No sincronizado", description: msg });
      return;
    }

    if (checkoutStatus === "paying") {
      notify.warning({ title: "Procesando", description: "Espera un momento…" });
      return;
    }

    const v = validatePaymentsAgainstTotal(lines, totals.totalMinor);
    if (!v.ok) {
      setState({ status: "editing", message: v.message });
      notify.warning({ title: "Revisa los pagos", description: v.message });
      return;
    }

    setState({ status: "submitting" });
    try {
      const out = await checkout({
        cashSessionId,
        payments: lines.map((p) => ({
          method: p.method,
          currency: p.currency,
          tenderMinor: clampInt(p.tenderMinor, 1, 9_999_999_999),
          fxRate: normalizeFxRate(p.fxRate),
          provider: (p.provider ?? "").trim() || null,
          reference: (p.reference ?? "").trim() || null,
        })),
      });

      // ✅ Asegura strings (MoneyStr) aunque algo venga number accidentalmente
      const tenderedBaseMinor = String(out.tenderedBaseMinor) as MoneyStr;
      const changeBaseMinor = String(out.changeBaseMinor) as MoneyStr;

      setState({
        status: "success",
        saleId: out.saleId,
        payments: out.payments,
        tenderedBaseMinor,
        changeBaseMinor,
        openDrawer: out.openDrawer,
      });

      setIsOpen(false);

      // (opcional) log UX friendly
      // console.log("PAID", moneyLabelBaseMinor(tenderedBaseMinor), "CHANGE", moneyLabelBaseMinor(changeBaseMinor));

      await onPaid?.();
    } catch (e: unknown) {
      const msg = getErrorMessage(e);

      setState({ status: "editing", message: msg });

      notify.error({
        title: "No se pudo cobrar",
        description: msg,
      });
    }
  }, [
    isOpen,
    cashSessionId,
    devBypassSync,
    syncStatus,
    syncErrorMessage,
    checkoutStatus,
    lines,
    totals.totalMinor,
    checkout,
    onPaid,
  ]);

  return {
    isOpen,
    open: openCheckout,
    close,

    state,
    syncStatus,
    syncErrorMessage,
    lastCheckout,

    totals,
    lines,
    paidMinor,
    dueMinor,
    changeMinor: changeMinorUx,

    addPaymentLine,
    removePaymentLine,
    updatePaymentLine,
    setQuickCash,
    submit,
  };
}