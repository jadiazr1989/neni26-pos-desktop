// src/modules/admin/reports/AdminCashReportsDetailsScreen.tsx
"use client";

import * as React from "react";
import {
  ArrowLeft,
  Download,
  RefreshCw,
  Clipboard,
  CheckCircle2,
  AlertTriangle,
  Clock3,
  ShieldAlert,
  Users,
  BadgeDollarSign,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useAdminCashSessionDetail } from "./hooks/useAdminCashSessionDetail";
import { formatBaseMinorCUP } from "@/lib/money/formatBaseMoney";

import type {
  PaymentMethodCode,
  PaymentMixDTO,
  CurrencyCode,
  UserLiteDTO,
  CashSessionOperatorDTO,
} from "@/lib/modules/admin/reports";

// ---------- helpers (NO any) ----------
type MixRow = {
  method: PaymentMethodCode;
  label: string;
  pctBps: number; // 0..10000
  totalBaseMinor: string; // MoneyStr
};

type CountRow = {
  currency: CurrencyCode;
  openingMinor: number;
  expectedMinor: number;
  countedMinor: number;
  diffMinor: number;
};

function clampBps(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(10000, Math.floor(n)));
}

function fmtPctFromBps(bps: number): string {
  const x = clampBps(bps);
  const whole = Math.floor(x / 100);
  const frac = String(x % 100).padStart(2, "0");
  return `${whole}.${frac}%`;
}

function labelForMethod(m: PaymentMethodCode): string {
  switch (m) {
    case "CASH":
      return "Efectivo";
    case "CARD":
      return "Tarjeta";
    case "TRANSFER":
      return "Transferencia";
    case "OTHER":
      return "Otros";
    default:
      return m;
  }
}

function moneyStrToSafeBigInt(v: string): bigint {
  try {
    return BigInt(String(v ?? "0"));
  } catch {
    return 0n;
  }
}

function bigintToMoneyStr(v: bigint): string {
  return v.toString();
}

function buildMixRowsFromPaymentsMix(paymentsMix: PaymentMixDTO[]): MixRow[] {
  const methods: PaymentMethodCode[] = ["CASH", "CARD", "TRANSFER", "OTHER"];
  const totals = new Map<PaymentMethodCode, bigint>(methods.map((m) => [m, 0n]));

  for (const p of paymentsMix) {
    const m = p.method;
    if (!methods.includes(m)) continue;
    const prev = totals.get(m) ?? 0n;
    totals.set(m, prev + moneyStrToSafeBigInt(p.amountBaseMinor));
  }

  let grand = 0n;
  for (const m of methods) grand += totals.get(m) ?? 0n;

  const rows: MixRow[] = methods.map((m) => {
    const t = totals.get(m) ?? 0n;
    const pct = grand > 0n ? clampBps(Number((t * 10000n) / grand)) : 0;

    return { method: m, label: labelForMethod(m), pctBps: pct, totalBaseMinor: bigintToMoneyStr(t) };
  });

  rows.sort((a, b) => b.pctBps - a.pctBps);
  return rows;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" });
}

function shortHash(h: string): string {
  const s = String(h ?? "");
  if (s.length <= 18) return s;
  return `${s.slice(0, 10)}…${s.slice(-6)}`;
}

function msToHhMm(ms: number): string {
  const x = Math.max(0, Math.floor(ms));
  const totalMin = Math.floor(x / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h <= 0) return `${m}m`;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

function safeNowMs(): number {
  return Date.now();
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function Badge(props: { children: React.ReactNode; tone?: "neutral" | "success" | "warning" | "critical" }) {
  const cls =
    props.tone === "success"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
      : props.tone === "warning"
        ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
        : props.tone === "critical"
          ? "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300"
          : "border-border bg-muted/30 text-muted-foreground";

  return <span className={`rounded-full border px-2.5 py-0.5 text-[11px] ${cls}`}>{props.children}</span>;
}

function Row(props: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-muted-foreground">{props.label}</div>
      <div className={props.mono ? "max-w-[70%] truncate font-mono text-xs" : "max-w-[70%] truncate"}>{props.value}</div>
    </div>
  );
}

function KpiMini(props: { title: string; value: string; hint: string; tone?: "default" | "success" | "warning" }) {
  const ring =
    props.tone === "success"
      ? "ring-1 ring-emerald-500/20"
      : props.tone === "warning"
        ? "ring-1 ring-amber-500/25"
        : "ring-1 ring-border/60";

  const bg =
    props.tone === "success"
      ? "bg-emerald-500/5"
      : props.tone === "warning"
        ? "bg-amber-500/5"
        : "bg-card";

  return (
    <div className={`rounded-2xl p-4 ${ring} ${bg}`}>
      <div className="text-xs text-muted-foreground">{props.title}</div>
      <div className="mt-1 text-xl font-semibold tabular-nums">{props.value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{props.hint}</div>
    </div>
  );
}

function MixChartCard(props: { rows: MixRow[]; moneyLabel: (baseMinorStr: string) => string }) {
  if (props.rows.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Mix de pagos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Sin pagos en la sesión.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Mix de pagos</CardTitle>
          <Badge>Base</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {props.rows.map((r) => (
          <div key={r.method} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="min-w-0">
                <div className="font-medium">{r.label}</div>
                <div className="text-xs text-muted-foreground tabular-nums">{props.moneyLabel(r.totalBaseMinor)}</div>
              </div>
              <div className="shrink-0 text-muted-foreground tabular-nums">{fmtPctFromBps(r.pctBps)}</div>
            </div>

            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-foreground/70"
                style={{ width: `${Math.max(0, Math.min(100, r.pctBps / 100))}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function fmtMinorCurrency(n: number, currency: string): string {
  return `${(n / 100).toFixed(2)} ${currency}`;
}

function userDisplay(u: UserLiteDTO | undefined): string {
  if (!u) return "—";
  const name = (u.displayName ?? "").trim();
  return name ? name : u.username;
}

function roleLabel(role: UserLiteDTO["role"]): string {
  switch (role) {
    case "ADMIN":
      return "Admin";
    case "MANAGER":
      return "Manager";
    case "CASHIER":
      return "Cashier";
    default:
      return role;
  }
}
function OperatorEnterpriseCard(props: {
  operators: CashSessionOperatorDTO[];
  usersById: Record<string, UserLiteDTO>;
  moneyLabel: (baseMinorStr: string) => string;
}) {
  const usersById = props.usersById ?? {};

  const normalized = React.useMemo(() => {
    const src = props.operators ?? [];
    const map = new Map<
      string,
      {
        userId: string;
        ticketsCount: number;
        gross: bigint;
        refunds: bigint;
        net: bigint;
      }
    >();

    for (const r of src) {
      const userId = String(r.userId ?? "").trim();
      if (!userId) continue;

      const prev = map.get(userId);
      const gross = moneyStrToSafeBigInt(r.grossSalesBaseMinor);
      const refunds = moneyStrToSafeBigInt(r.refundsBaseMinor);
      const net = moneyStrToSafeBigInt(r.netSalesBaseMinor);
      const tickets = Number(r.ticketsCount ?? 0);

      if (!prev) {
        map.set(userId, { userId, ticketsCount: tickets, gross, refunds, net });
        continue;
      }

      map.set(userId, {
        userId,
        ticketsCount: prev.ticketsCount + tickets,
        gross: prev.gross + gross,
        refunds: prev.refunds + refunds,
        net: prev.net + net,
      });
    }

    const out = Array.from(map.values()).map((x) => ({
      userId: x.userId,
      ticketsCount: x.ticketsCount,
      grossSalesBaseMinor: bigintToMoneyStr(x.gross),
      refundsBaseMinor: bigintToMoneyStr(x.refunds),
      netSalesBaseMinor: bigintToMoneyStr(x.net),
    }));

    // orden: quien más neto vendió arriba
    out.sort((a, b) => {
      const an = moneyStrToSafeBigInt(a.netSalesBaseMinor);
      const bn = moneyStrToSafeBigInt(b.netSalesBaseMinor);
      return bn > an ? 1 : bn < an ? -1 : 0;
    });

    return out;
  }, [props.operators]);

  const totalNet = React.useMemo(() => {
    let t = 0n;
    for (const o of normalized) t += moneyStrToSafeBigInt(o.netSalesBaseMinor);
    return t;
  }, [normalized]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-base">Operadores</CardTitle>
            <div className="text-xs text-muted-foreground">Quién vendió en esta sesión (por creador del ticket).</div>
          </div>
          <Badge tone="neutral">
            <span className="inline-flex items-center gap-1">
              <Users className="size-3.5" />
              {normalized.length}
            </span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {normalized.length === 0 ? (
          <div className="text-sm text-muted-foreground">Sin actividad registrada.</div>
        ) : (
          <div className="space-y-2">
            {normalized.map((o) => {
              const u = usersById[o.userId];
              const net = moneyStrToSafeBigInt(o.netSalesBaseMinor);
              const pctBps = totalNet > 0n ? clampBps(Number((net * 10000n) / totalNet)) : 0;

              return (
                <div key={o.userId} className="rounded-xl border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="truncate font-medium">{userDisplay(u)}</div>
                        {u ? <Badge tone="neutral">{roleLabel(u.role)}</Badge> : null}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        <span className="font-mono">{o.userId}</span>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <div className="text-sm font-semibold tabular-nums">{props.moneyLabel(o.netSalesBaseMinor)}</div>
                      <div className="text-xs text-muted-foreground tabular-nums">{fmtPctFromBps(pctBps)}</div>
                    </div>
                  </div>

                  <div className="mt-2 grid grid-cols-12 gap-2 text-xs text-muted-foreground">
                    <div className="col-span-6 sm:col-span-3">
                      <span className="font-medium">Tickets:</span> {o.ticketsCount}
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <span className="font-medium">Bruto:</span> {props.moneyLabel(o.grossSalesBaseMinor)}
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <span className="font-medium">Devol:</span> {props.moneyLabel(o.refundsBaseMinor)}
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <span className="font-medium">Neto:</span> {props.moneyLabel(o.netSalesBaseMinor)}
                    </div>
                  </div>

                  <div className="mt-2 h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-foreground/70"
                      style={{ width: `${Math.max(0, Math.min(100, pctBps / 100))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
type CountVerdict =
  | { kind: "PENDING"; label: "PENDIENTE"; tone: "neutral" }
  | { kind: "OK"; label: "OK"; tone: "success" }
  | { kind: "MISS"; label: "FALTA" | "SOBRA"; tone: "warning" | "critical" };

function countVerdictEnterprise(args: {
  isOpen: boolean;
  diffMinor: number;
  expectedMinor: number;
  countedMinor: number;
  thresholdMinor: number;
}): CountVerdict {
  // Heurística enterprise:
  // - Si la sesión está ABIERTA y todavía no hay conteo (counted=0) pero expected != 0,
  //   no alarmar: está pendiente.
  if (args.isOpen && args.countedMinor === 0 && args.expectedMinor !== 0) {
    return { kind: "PENDING", label: "PENDIENTE", tone: "neutral" };
  }

  if (args.diffMinor === 0) return { kind: "OK", label: "OK", tone: "success" };

  const abs = Math.abs(args.diffMinor);
  const big = abs >= args.thresholdMinor;

  if (args.diffMinor < 0) return { kind: "MISS", label: "FALTA", tone: big ? "critical" : "warning" };
  return { kind: "MISS", label: "SOBRA", tone: big ? "critical" : "warning" };
}

function CountsEnterpriseCard(props: { counts: CountRow[]; isOpen: boolean; thresholdMinor?: number }) {
  const thresholdMinor = Number(props.thresholdMinor ?? 5000); // 50.00
  const counts = props.counts ?? [];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle>Conteos</CardTitle>
            <div className="text-xs text-muted-foreground">
              Inicial + Cash − Devoluciones − Gastos = Esperado • Umbral: {(thresholdMinor / 100).toFixed(2)}
              {props.isOpen ? " • (sesión abierta: puede estar pendiente)" : ""}
            </div>
          </div>
          <Badge>Minor (moneda)</Badge>
        </div>
      </CardHeader>

      <CardContent>
        {counts.length === 0 ? (
          <div className="text-sm text-muted-foreground">Sin conteos.</div>
        ) : (
          <div className="space-y-2">
            {counts.map((c) => {
              const v = countVerdictEnterprise({
                isOpen: props.isOpen,
                diffMinor: c.diffMinor,
                expectedMinor: c.expectedMinor,
                countedMinor: c.countedMinor,
                thresholdMinor,
              });

              const abs = Math.abs(c.diffMinor);
              const outOfThreshold = abs >= thresholdMinor;

              const diffCls =
                v.kind === "PENDING"
                  ? "text-muted-foreground"
                  : c.diffMinor === 0
                    ? "text-muted-foreground"
                    : c.diffMinor > 0
                      ? "text-emerald-600"
                      : "text-red-600";

              return (
                <div key={c.currency} className="rounded-xl border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-semibold">{c.currency}</div>
                      <Badge tone={v.tone}>{v.label}</Badge>
                      {v.kind !== "PENDING" && outOfThreshold ? <Badge tone="critical">Fuera de umbral</Badge> : null}
                    </div>

                    <div className={`text-sm font-semibold tabular-nums ${diffCls}`}>
                      {v.kind === "PENDING" ? "Δ —" : `Δ ${fmtMinorCurrency(c.diffMinor, c.currency)}`}
                    </div>
                  </div>

                  <div className="mt-2 grid grid-cols-12 gap-2 text-xs text-muted-foreground">
                    <div className="col-span-6 sm:col-span-3">
                      <span className="font-medium">Inicial:</span> {fmtMinorCurrency(c.openingMinor, c.currency)}
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <span className="font-medium">Esperado:</span> {fmtMinorCurrency(c.expectedMinor, c.currency)}
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <span className="font-medium">Contado:</span>{" "}
                      {v.kind === "PENDING" ? "—" : fmtMinorCurrency(c.countedMinor, c.currency)}
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <span className="font-medium">Abs:</span> {v.kind === "PENDING" ? "—" : fmtMinorCurrency(abs, c.currency)}
                    </div>
                  </div>

                  {v.kind === "PENDING" ? (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Sesión abierta: el conteo final todavía no se ha registrado.
                    </div>
                  ) : c.diffMinor !== 0 ? (
                    <div className="mt-2 text-xs text-muted-foreground">
                      {c.diffMinor < 0 ? "Falta efectivo vs esperado." : "Sobra efectivo vs esperado."}
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-muted-foreground">Conteo cuadra con esperado.</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SessionEnterpriseCard(props: {
  cashSessionId: string;
  warehouseName: string;
  terminalName: string | null;
  openedAt: string;
  closedAt: string | null;

  openedBy: UserLiteDTO | null;
  closedBy: UserLiteDTO | null;

  hasZ: boolean;
  zNumber: string | null;
  zSignedAt: string | null;
  zHash: string | null;
  zPrevHash: string | null;
}) {
  const isOpen = !props.closedAt;

  const durationMs = React.useMemo(() => {
    const start = new Date(props.openedAt).getTime();
    const end = props.closedAt ? new Date(props.closedAt).getTime() : safeNowMs();
    return Math.max(0, end - start);
  }, [props.openedAt, props.closedAt]);

  // integridad:
  // - abierta: sin Z es normal
  // - cerrada + sin Z: warning (falta firmar)
  // - cerrada + Z: ok
  const integrity = React.useMemo(() => {
    if (isOpen) return { label: "En vivo", tone: "neutral" as const, icon: Clock3 };
    if (!props.hasZ) return { label: "Falta Z", tone: "warning" as const, icon: ShieldAlert };
    return { label: "Z firmado", tone: "success" as const, icon: CheckCircle2 };
  }, [isOpen, props.hasZ]);

  const IntegrityIcon = integrity.icon;

  const onCopyId = React.useCallback(async () => {
    await copyToClipboard(props.cashSessionId);
  }, [props.cashSessionId]);

  const onCopyHash = React.useCallback(async () => {
    if (!props.zHash) return;
    await copyToClipboard(props.zHash);
  }, [props.zHash]);

  const openedByName = userDisplay(props.openedBy ?? undefined);
  const closedByName = props.closedBy ? userDisplay(props.closedBy) : "—";

  return (
    <Card className="relative overflow-hidden">
      <div
        className={
          isOpen ? "absolute inset-x-0 top-0 h-1 bg-amber-500/60" : "absolute inset-x-0 top-0 h-1 bg-emerald-500/60"
        }
      />

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle>Sesión</CardTitle>
            <div className="mt-1 text-xs text-muted-foreground">
              {isOpen ? "ABIERTA" : "CERRADA"} • Duración: {msToHhMm(durationMs)}
            </div>
          </div>

          <Badge tone={integrity.tone}>
            <span className="inline-flex items-center gap-1">
              <IntegrityIcon className="size-3.5" />
              {integrity.label}
            </span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <Row label="Almacén" value={props.warehouseName} />
          <Row label="POS" value={props.terminalName ?? "—"} />
          <Row label="Apertura" value={fmtDate(props.openedAt)} />
          <Row label="Estado" value={props.closedAt ? fmtDate(props.closedAt) : "ABIERTA"} />
          <Row label="Abierta por" value={openedByName} />
          <Row label="Cerrada por" value={closedByName} />
        </div>

      </CardContent>
    </Card>
  );
}

// ---------- main ----------
export function AdminCashReportsDetailsScreen(props: { cashSessionId: string }) {
  const router = useRouter();
  const vm = useAdminCashSessionDetail();

  React.useEffect(() => {
    void vm.show(props.cashSessionId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.cashSessionId]);

  const title = vm.detail?.cashSession?.terminalName
    ? `Sesión de caja — ${vm.detail.cashSession.terminalName}`
    : "Sesión de caja";

  const mixRows = React.useMemo(() => {
    const mix = vm.detail?.xReport?.summary?.paymentsMix ?? [];
    return buildMixRowsFromPaymentsMix(mix);
  }, [vm.detail?.xReport?.summary?.paymentsMix]);

  const moneyLabel = React.useCallback((baseMinorStr: string) => formatBaseMinorCUP(baseMinorStr), []);

  const isOpen = vm.detail ? !vm.detail.cashSession.closedAt : false;

  const openedBy = React.useMemo(() => {
    if (!vm.detail?.cashSession.openedById) return null;
    return vm.detail.usersById?.[vm.detail.cashSession.openedById] ?? null;
  }, [vm.detail]);

  const closedBy = React.useMemo(() => {
    if (!vm.detail?.cashSession.closedById) return null;
    return vm.detail.usersById?.[vm.detail.cashSession.closedById] ?? null;
  }, [vm.detail]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()} title="Volver">
              <ArrowLeft className="size-4" />
            </Button>
            <h1 className="text-xl font-semibold truncate">{title}</h1>
          </div>

          <div className="text-sm text-muted-foreground">
            ID: <span className="font-mono text-xs">{props.cashSessionId}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" disabled={vm.loading} onClick={() => void vm.show(props.cashSessionId)}>
            <RefreshCw className="mr-2 size-4" />
            Refrescar
          </Button>

          <Button
            variant="outline"
            disabled={!vm.detail || vm.exportingCsv}
            onClick={() => void vm.downloadCsv()}
            title="Descargar reporte en CSV"
          >
            <Download className="mr-2 size-4" />
            CSV
          </Button>

          <Button
            variant="outline"
            disabled={!vm.detail || vm.exportingPdf}
            onClick={() => void vm.downloadPdf()}
            title="Descargar reporte en PDF"
          >
            <Download className="mr-2 size-4" />
            PDF
          </Button>
        </div>
      </div>

      {!vm.detail && vm.loading ? (
        <Alert>
          <AlertDescription>Cargando detalle…</AlertDescription>
        </Alert>
      ) : null}

      {!vm.detail && !vm.loading ? (
        <Alert>
          <AlertDescription>No se pudo cargar el detalle.</AlertDescription>
        </Alert>
      ) : null}

      {vm.detail ? (
        <div className="grid grid-cols-12 gap-3">
          {/* Row 1 */}
          <div className="col-span-12 lg:col-span-5">
            <SessionEnterpriseCard
              cashSessionId={vm.detail.cashSession.id}
              warehouseName={vm.detail.cashSession.warehouseName}
              terminalName={vm.detail.cashSession.terminalName}
              openedAt={vm.detail.cashSession.openedAt}
              closedAt={vm.detail.cashSession.closedAt}
              openedBy={openedBy}
              closedBy={closedBy}
              hasZ={!!vm.detail.zArtifact}
              zNumber={vm.detail.zArtifact?.labels?.zNumber ?? null}
              zSignedAt={vm.detail.zArtifact?.signedAt ?? null}
              zHash={vm.detail.zArtifact?.reportHash ?? null}
              zPrevHash={vm.detail.zArtifact?.previousHash ?? null}
            />
          </div>

          <Card className="col-span-12 lg:col-span-7">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle>Reporte X (en vivo)</CardTitle>
                  <div className="text-xs text-muted-foreground">
                    Resumen operativo de la sesión (ventas, efectivo, devoluciones y gastos).
                  </div>
                </div>
                <Badge tone={isOpen ? "warning" : "success"}>
                  <span className="inline-flex items-center gap-1">
                    <BadgeDollarSign className="size-3.5" />
                    {isOpen ? "En curso" : "Cerrada"}
                  </span>
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <KpiMini title="Tickets" value={String(vm.detail.xReport.summary.ticketsCount)} hint="Cantidad de ventas" />

                <KpiMini
                  title="Ventas brutas"
                  value={formatBaseMinorCUP(vm.detail.xReport.summary.grossSalesBaseMinor)}
                  hint="Total antes de devoluciones/gastos"
                />

                <KpiMini
                  title="Ventas en efectivo"
                  value={formatBaseMinorCUP(vm.detail.xReport.summary.cashSalesBaseMinor)}
                  hint="Pagos en efectivo"
                />

                <KpiMini
                  title="Devoluciones"
                  value={formatBaseMinorCUP(vm.detail.xReport.summary.refundsBaseMinor)}
                  hint="Reembolsos realizados"
                  tone="warning"
                />

                <KpiMini
                  title="Gastos"
                  value={formatBaseMinorCUP(vm.detail.xReport.summary.expensesBaseMinor)}
                  hint="Salidas registradas"
                  tone="warning"
                />

                <KpiMini
                  title="Efectivo neto"
                  value={formatBaseMinorCUP(vm.detail.xReport.summary.netCashBaseMinor)}
                  hint="Efectivo final (neto)"
                  tone="success"
                />
              </div>
            </CardContent>
          </Card>

          {/* Row 2: Mix + Operators (lado a lado en desktop) */}
          <div className="col-span-12 lg:col-span-7">
            <MixChartCard rows={mixRows} moneyLabel={moneyLabel} />
          </div>

          <div className="col-span-12 lg:col-span-5">
            <OperatorEnterpriseCard
              operators={vm.detail.operators ?? []}
              usersById={vm.detail.usersById ?? {}}
              moneyLabel={moneyLabel}
            />
          </div>

          {/* Row 3 */}
          <div className="col-span-12">
            <CountsEnterpriseCard counts={vm.detail.xReport.counts} isOpen={isOpen} thresholdMinor={5000} />
          </div>
        </div>
      ) : null}
    </div>
  );
}