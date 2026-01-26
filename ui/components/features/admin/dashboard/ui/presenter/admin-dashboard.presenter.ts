import type {
  AdminDashboardData,
  AdminDashboardRange,
  DashboardTopProduct,
} from "@/lib/modules/admin/dashboard/admin-dashboard.dto";

export type DashboardKpiVM = {
  title: string;
  value: string;
  hint: string;
  tone?: "default" | "success" | "warning";
};

export type TrendPointVM = {
  date: string;
  netBaseMinor: number;
  tickets: number;
};

export type TopProductVM = DashboardTopProduct & {
  label: string; // display title
};

export type AdminDashboardVM = {
  range: AdminDashboardRange;
  scopeLabel: string;

  kpis: DashboardKpiVM[];
  trend: TrendPointVM[];

  paymentsByMethod: Array<{
    method: "CASH" | "CARD" | "TRANSFER" | "OTHER";
    amountLabel: string;
    count: number;
  }>;

  topProducts: TopProductVM[];

  alerts: {
    pendingAdjustments: number;
    purchasesDraft: number;
    purchasesOrdered: number;
  };

  cash: {
    label: string;
    hint: string;
    tone: "success" | "warning";
  };
};

export type MoneyFormatter = (v: number) => string;
export type DateTimeFormatter = (iso: string | null) => string;

export function makeMoneyFormatter(locale = "es-CU", currency: "CUP" | "USD" | "EUR" = "CUP"): MoneyFormatter {
  return (v: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(v);
}

export function makeDateTimeFormatter(locale = "es-ES"): DateTimeFormatter {
  return (iso: string | null) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString(locale, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
}

export function rangeLabel(r: AdminDashboardRange) {
  if (r === "today") return "Hoy";
  if (r === "7d") return "7 días";
  return "30 días";
}

export function buildDashboardVM(params: {
  data: AdminDashboardData;
  money: MoneyFormatter;
  dateTime: DateTimeFormatter;
}): AdminDashboardVM {
  const { data, money, dateTime } = params;

  const cashLabel = data.cash.hasActiveSession ? "Activa" : "Cerrada";
  const cashHint = data.cash.hasActiveSession
    ? `Abierta: ${dateTime(data.cash.openedAt)}`
    : "Abrir para vender";
  const cashTone = data.cash.hasActiveSession ? "success" : "warning";

  const scopeLabel = `store ${data.scope.storeId}${data.scope.warehouseId ? ` · warehouse ${data.scope.warehouseId}` : ""}`;

  const kpis: DashboardKpiVM[] = [
    {
      title: `Ventas netas (${rangeLabel(data.range)})`,
      value: money(data.kpis.salesNetBaseMinor),
      hint: `Brutas: ${money(data.kpis.salesGrossBaseMinor)} · Refunds: ${money(data.kpis.refundsBaseMinor)}`,
      tone: data.kpis.salesNetBaseMinor > 0 ? "success" : "default",
    },
    {
      title: `Tickets (${rangeLabel(data.range)})`,
      value: String(data.kpis.tickets),
      hint: "Ventas pagadas",
    },
    {
      title: "Ticket promedio",
      value: money(data.kpis.avgTicketBaseMinor),
      hint: "Net / tickets",
    },
    {
      title: "Caja",
      value: cashLabel,
      hint: cashHint,
      tone: cashTone,
    },
  ];

  const paymentsByMethod = data.paymentsByMethod.map((p) => ({
    method: p.method,
    amountLabel: money(p.amountBaseMinor),
    count: p.count,
  }));

  const topProducts: TopProductVM[] = data.topProducts.map((p) => ({
    ...p,
    label: `${p.productName}${p.title ? ` · ${p.title}` : ""}`,
  }));

  return {
    range: data.range,
    scopeLabel,
    kpis,
    trend: data.trend,
    paymentsByMethod,
    topProducts,
    alerts: {
      pendingAdjustments: data.adjustments.pending,
      purchasesDraft: data.purchases.draft,
      purchasesOrdered: data.purchases.ordered,
    },
    cash: { label: cashLabel, hint: cashHint, tone: cashTone },
  };
}
