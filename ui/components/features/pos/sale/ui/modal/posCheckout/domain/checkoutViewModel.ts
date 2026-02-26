import type { Currency, PaymentMethod, PaymentDTO, MoneyStr } from "@/lib/modules/sales/sale.dto";

export type SyncStatus = "idle" | "syncing" | "ready" | "error";

export type CheckoutState =
  | { status: "idle" }
  | { status: "editing"; message?: string }
  | { status: "submitting" }
  | {
      status: "success";
      saleId: string;
      payments: PaymentDTO[];
      // ✅ BigInt-safe
      tenderedBaseMinor: MoneyStr;
      changeBaseMinor: MoneyStr;
      openDrawer: boolean;
    }
  | { status: "error"; message: string };

export type PayLineDraft = {
  id: string;
  method: PaymentMethod;
  currency: Currency;
  tenderMinor: number;
  fxRate: string | null;
  provider: string | null;
  reference: string | null;
};

export function isCashCup(p: Pick<PayLineDraft, "method" | "currency">): boolean {
  return p.method === "CASH" && p.currency === "CUP";
}

export function getPrimaryLine(lines: PayLineDraft[]): PayLineDraft | null {
  return lines[0] ?? null;
}

export function computeDueAndChange(totalMinor: number, paidMinor: number): {
  dueMinor: number;
  changeMinor: number;
} {
  const t = Math.max(0, Number(totalMinor) || 0);
  const p = Math.max(0, Number(paidMinor) || 0);
  const due = Math.max(0, t - p);
  const change = Math.max(0, p - t);
  return { dueMinor: due, changeMinor: change };
}