"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { TrendingDown, TrendingUp } from "lucide-react";

import type { AdminDashboardData } from "@/lib/modules/admin/dashboard/admin-dashboard.dto";

import { DashboardHeader } from "./ui/DashboardHeader";
import { DashboardScopeBadges } from "./ui/DashboardScopeBadges";

import { formatMoneyFromBaseMinorStr } from "./utils/dashboardMoney";
import { formatPctBpsSigned, moneyToneByDelta } from "./utils/dashboardDeltas";

import { ComparisonToolbar } from "./ui/ComparisonToolbar";
import { DeltaChip } from "./ui/DeltaChip";
import { OperationalBannerCompact } from "./ui/OperationalBannerCompact";

import { DashboardKpisSection } from "./sections/DashboardKpisSection";
import { DashboardAttentionSection } from "./sections/DashboardAttentionSection";
import { DashboardTrendSection } from "./sections/DashboardTrendSection";
import { DashboardInsightsSection } from "./sections/DashboardInsightsSection";

import { DashboardQuickActionsSection } from "./sections/DashboardQuickActionsSection";
import { DashboardCashSection } from "./sections/DashboardCashSection";

import { DashboardInventorySection } from "./sections/DashboardInventorySection";
import { DashboardPaymentsSection } from "./sections/DashboardPaymentsSection";
import { DashboardOperationSection } from "./sections/DashboardOperationSection";
import { DashboardStockCoverageCard } from "./sections/DashboardStockCoverageCard";

import { useAdminDashboard } from "./hooks/useAdminDashboard";
import { DashboardHealthCard } from "./sections/DashboardHealthCard";

export function AdminDashboardScreen() {
  const router = useRouter();

  const {
    data,
    loading,
    error,
    refresh,
    range,
    rangeLabel,
    rangeLabelShort,
    setRange,
  } = useAdminDashboard("today");

  const money = React.useCallback(
    (baseMinorStr: string) => formatMoneyFromBaseMinorStr(baseMinorStr, "es-CU", "CUP"),
    []
  );

  const scopeNode = React.useMemo(() => {
    if (!data) return null;
    return (
      <DashboardScopeBadges
        storeId={data.scope.storeId}
        warehouseId={data.scope.warehouseId}
      />
    );
  }, [data]);

  const netPct = data
    ? formatPctBpsSigned(data.comparison.netSalesDeltaPctBps)
    : { label: "—", tone: "neutral" as const };

  const netDeltaTone = data
    ? moneyToneByDelta(data.comparison.netSalesDeltaBaseMinor)
    : "neutral";

  const avgDeltaTone = data
    ? moneyToneByDelta(data.comparison.avgTicketDeltaBaseMinor)
    : "neutral";

  const refundsDeltaTone = data
    ? moneyToneByDelta(data.comparison.refundsDeltaBaseMinor)
    : "neutral";

  type ProfitRow = AdminDashboardData["profitability"]["topProfitProducts"][number];

  const onTopProductClick = React.useCallback(
    (p: ProfitRow) => {
      void p;
      router.push("/admin/inventory");
    },
    [router]
  );

  const paymentsSorted = React.useMemo(() => {
    if (!data) return [];
    return [...data.paymentsByMethod].sort((a, b) => (b.pctBps ?? 0) - (a.pctBps ?? 0));
  }, [data]);

  return (
    <div className="space-y-5">
      <DashboardHeader
        range={range}
        onRangeChange={setRange}
        onRefresh={() => void refresh()}
        loading={loading}
        onReports={() => router.push("/admin/reports")}
        onGoProducts={() => router.push("/admin/products")}
        component={scopeNode}
      />

      <DashboardKpisSection
        data={data}
        money={money}
        netDeltaTone={netDeltaTone}
        avgDeltaTone={avgDeltaTone}
        rangeLabelShort={rangeLabelShort}
      />

      <ComparisonToolbar
        left={
          <div className="-mx-4 overflow-x-auto px-4">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="mr-1 text-xs text-muted-foreground">Comparación</span>

              <DeltaChip
                label={`Net ${netPct.label}`}
                tone={netPct.tone}
                icon={
                  netPct.tone === "good" ? (
                    <TrendingUp className="size-3" />
                  ) : netPct.tone === "bad" ? (
                    <TrendingDown className="size-3" />
                  ) : null
                }
              />
              <DeltaChip
                label={`Δ Net ${data ? money(data.comparison.netSalesDeltaBaseMinor) : "—"}`}
                tone={netPct.tone}
              />
              <DeltaChip
                label={`Δ Avg ${data ? money(data.comparison.avgTicketDeltaBaseMinor) : "—"}`}
                tone={avgDeltaTone}
              />
              <DeltaChip
                label={`Δ Devol. ${data ? money(data.comparison.refundsDeltaBaseMinor) : "—"}`}
                tone={refundsDeltaTone}
              />
            </div>
          </div>
        }
        right={
          <>
            Período: {rangeLabelShort} · Zona horaria: {data?.period.tz ?? "—"}
          </>
        }
      />

      <OperationalBannerCompact
        alerts={data?.alerts ?? []}
        loading={loading}
        onGo={() => router.push("/admin/inventory")}
      />

      <DashboardAttentionSection data={data} onNav={(p) => router.push(p)} />

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-8">
          <DashboardTrendSection
            data={data}
            loading={loading}
            error={error}
            range={range}
            rangeLabelShort={rangeLabelShort}
          />

          <DashboardInsightsSection
            data={data}
            loading={loading}
            rangeLabel={rangeLabel}
            money={money}
            onGoReports={() => router.push("/admin/reports")}
            onTopProductClick={onTopProductClick}
          />

          <DashboardInventorySection
            data={data}
            loading={loading}
            rangeLabelShort={rangeLabelShort}
            onNav={(p) => router.push(p)}
          />
        </div>

        <div className="space-y-5 lg:col-span-4">
          <DashboardHealthCard
            data={data}
            loading={loading}
            rangeLabelShort={rangeLabelShort}
            onGo={(p) => router.push(p)}
          />

          <DashboardQuickActionsSection
            onNav={(p) => router.push(p)}
          />

          <DashboardCashSection
            data={data}
            loading={loading}
            money={money}
            rangeLabelShort={rangeLabelShort}
          />

          <DashboardPaymentsSection
            loading={loading || !data}
            rangeLabelShort={rangeLabelShort}
            rows={paymentsSorted.map((p) => ({
              method: p.method,
              count: p.count,
              pctBps: p.pctBps ?? 0,
              amountBaseMinor: p.amountBaseMinor,
            }))}
          />

          <DashboardStockCoverageCard
            data={data}
            loading={loading}
            rangeLabelShort={rangeLabelShort}
          />
        </div>
      </div>

      <DashboardOperationSection
        data={data}
        loading={loading}
        rangeLabelShort={rangeLabelShort}
        money={money}
      />
    </div>
  );
}