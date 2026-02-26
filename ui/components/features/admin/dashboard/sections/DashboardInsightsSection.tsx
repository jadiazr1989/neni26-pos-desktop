// src/modules/admin/dashboard/sections/DashboardInsightsSection.tsx
"use client";

import * as React from "react";
import { ArrowRight, AlertTriangle, BadgePercent, Coins, Users } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import type { AdminDashboardDataV2 } from "@/lib/modules/admin/dashboard/admin-dashboard.dto";

import { SectionTitle } from "../ui/SectionTitle";

type InsightsTab = "products" | "operators";
type ProductMode = "profit" | "margin" | "risk";

type Profitability = NonNullable<AdminDashboardDataV2["profitability"]>;
type ProductRow = Profitability["topProfitProducts"][number];

function sameText(a: string, b: string): boolean {
  return String(a ?? "").trim().toLowerCase() === String(b ?? "").trim().toLowerCase();
}

function formatPctBps(bps: number, digits = 1): string {
  if (!Number.isFinite(bps)) return "—";
  const pct = bps / 100;
  return `${pct.toFixed(digits)}%`;
}

function formatSold(p: ProductRow): string {
  const qty = String(p.qtyDisplay ?? "").trim();
  const unit = String(p.displayUnit ?? "").trim();

  if (qty !== "" && unit !== "") return `${qty} ${unit}`;
  if (qty !== "") return qty;

  const raw = String(p.qtyBaseMinor ?? "").trim();
  return raw !== "" ? raw : "0";
}

type MarginTone = "good" | "warn" | "bad" | "neutral";

function toneByMarginPctBps(marginPctBps: number): MarginTone {
  if (!Number.isFinite(marginPctBps)) return "neutral";
  if (marginPctBps < 0) return "bad";
  if (marginPctBps < 500) return "warn"; // <5%
  return "good";
}

function clsByMarginTone(t: MarginTone): string {
  if (t === "bad") return "text-destructive";
  if (t === "warn") return "text-amber-600";
  if (t === "good") return "text-emerald-600";
  return "";
}

function pickOperatorRisk(o: AdminDashboardDataV2["operators"][number]): {
  label: string;
  tone: "neutral" | "warning" | "critical";
} {
  const voidRate = o.voidRateBps ?? 0;
  const refundRate = o.refundRateBps ?? 0;
  const discountRate = o.discountRateBps ?? 0;

  const signals = [
    { key: "Voids", bps: voidRate, warn: 500, crit: 1000 },
    { key: "Refund", bps: refundRate, warn: 800, crit: 1500 },
    { key: "Discount", bps: discountRate, warn: 1000, crit: 2000 },
  ];

  const worst = signals.reduce((acc, s) => (s.bps > acc.bps ? s : acc), signals[0]);

  const tone =
    worst.bps >= worst.crit ? "critical" : worst.bps >= worst.warn ? "warning" : "neutral";

  return { label: `${worst.key} ${formatPctBps(worst.bps, 1)}`, tone };
}

export function DashboardInsightsSection(props: {
  data: AdminDashboardDataV2 | null;
  loading: boolean;
  rangeLabel: string;
  money: (s: string) => string;
  onGoReports: () => void;
  onTopProductClick: (p: ProductRow) => void;
}) {
  const [tab, setTab] = React.useState<InsightsTab>("products");
  const [mode, setMode] = React.useState<ProductMode>("profit");

  const subtitle = `Top del período: ${props.rangeLabel}`;

  const products = React.useMemo(() => {
    const prof = props.data?.profitability;

    // ✅ si profitability no viene aún (por cualquier razón), caemos a topProducts
    // pero SIN casts: solo devolvemos [] si no existe la estructura.
    if (!prof) return [] as ProductRow[];

    if (mode === "profit") return (prof.topProfitProducts ?? []).slice(0, 2);
    if (mode === "margin") return (prof.topMarginPctProducts ?? []).slice(0, 2);
    return (prof.highRevenueLowMargin ?? []).slice(0, 2);
  }, [props.data, mode]);

  const operatorsTop = React.useMemo(
    () => (props.data ? props.data.operators.slice(0, 2) : []),
    [props.data]
  );

  const productsTitle =
    mode === "profit" ? "Ganancia" : mode === "margin" ? "Margen %" : "Riesgo (alto ingreso, bajo margen)";

  return (
    <Card className="rounded-xl border-border/60">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <SectionTitle title="Insights" subtitle={subtitle} />

          <div className="flex items-center gap-2">
            <button
              type="button"
              className={`rounded-md border px-3 py-1 text-xs ${
                tab === "products" ? "bg-muted/50" : "hover:bg-accent/30"
              }`}
              onClick={() => setTab("products")}
            >
              Productos
            </button>

            <button
              type="button"
              className={`rounded-md border px-3 py-1 text-xs ${
                tab === "operators" ? "bg-muted/50" : "hover:bg-accent/30"
              }`}
              onClick={() => setTab("operators")}
            >
              Operadores
            </button>
          </div>
        </div>

        {tab === "products" ? (
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">Criterio:</span>

            <button
              type="button"
              className={`rounded-md border px-2 py-1 text-xs inline-flex items-center gap-1 ${
                mode === "profit" ? "bg-muted/50" : "hover:bg-accent/30"
              }`}
              onClick={() => setMode("profit")}
              title="Top por ganancia"
            >
              <Coins className="size-3 text-muted-foreground" />
              Ganancia
            </button>

            <button
              type="button"
              className={`rounded-md border px-2 py-1 text-xs inline-flex items-center gap-1 ${
                mode === "margin" ? "bg-muted/50" : "hover:bg-accent/30"
              }`}
              onClick={() => setMode("margin")}
              title="Top por margen %"
            >
              <BadgePercent className="size-3 text-muted-foreground" />
              Margen %
            </button>

            <button
              type="button"
              className={`rounded-md border px-2 py-1 text-xs inline-flex items-center gap-1 ${
                mode === "risk" ? "bg-muted/50" : "hover:bg-accent/30"
              }`}
              onClick={() => setMode("risk")}
              title="Alto ingreso, bajo margen"
            >
              <AlertTriangle className="size-3 text-muted-foreground" />
              Riesgo
            </button>

            <span className="text-xs text-muted-foreground ml-1">· {productsTitle}</span>
          </div>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="rounded-md border border-border/60">
          {props.loading ? (
            <>
              <SkeletonRow />
              <SkeletonRow />
            </>
          ) : tab === "products" ? (
            products.length === 0 ? (
              <>
                <PlaceholderRow text="Sin productos en este rango." />
                <PlaceholderRow text="" />
              </>
            ) : (
              products.map((p, idx) => {
                const productName = String(p.productName ?? "").trim();
                const variantTitle = String(p.title ?? "").trim();

                const primaryTitle = variantTitle ? variantTitle : productName;
                const showProductLine = productName && variantTitle && !sameText(productName, variantTitle);

                const mTone = toneByMarginPctBps(p.marginPctBps ?? 0);
                const marginCls = clsByMarginTone(mTone);

                const profitIsNeg = String(p.profitBaseMinor ?? "0").trim().startsWith("-");
                const profitCls = profitIsNeg ? "text-destructive" : "text-emerald-600";

                return (
                  <button
                    key={p.variantId}
                    type="button"
                    onClick={() => props.onTopProductClick(p)}
                    className={`w-full text-left px-3 py-2 hover:bg-accent/30 transition-colors ${
                      idx === products.length - 1 ? "" : "border-b border-border/60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold truncate">{primaryTitle}</div>
                      <ArrowRight className="size-4 text-muted-foreground shrink-0" />
                    </div>

                    <div className="text-xs text-muted-foreground truncate">
                      Vendidos {formatSold(p)} · Ingresos {props.money(p.revenueBaseMinor)} · Ganancia{" "}
                      <span className={profitCls}>{props.money(p.profitBaseMinor)}</span> · Margen{" "}
                      <span className={marginCls}>{formatPctBps(p.marginPctBps ?? 0, 1)}</span>
                    </div>
                  </button>
                );
              })
            )
          ) : operatorsTop.length === 0 ? (
            <>
              <PlaceholderRow text="Sin operadores en este rango." />
              <PlaceholderRow text="" />
            </>
          ) : (
            operatorsTop.map((o, idx) => {
              const risk = pickOperatorRisk(o);
              const riskCls =
                risk.tone === "critical"
                  ? "text-destructive"
                  : risk.tone === "warning"
                  ? "text-amber-600"
                  : "text-muted-foreground";

              return (
                <button
                  key={o.userId}
                  type="button"
                  onClick={props.onGoReports}
                  className={`w-full text-left px-3 py-2 hover:bg-accent/30 transition-colors ${
                    idx === operatorsTop.length - 1 ? "" : "border-b border-border/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold truncate flex items-center gap-2">
                      <Users className="size-4 text-muted-foreground" />
                      {o.username}
                    </div>
                    <div className="text-sm font-semibold tabular-nums">
                      {props.money(o.netSalesBaseMinor)}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground truncate">
                    Tickets {o.ticketsCount} · Brutas {props.money(o.grossSalesBaseMinor)} · Devol.{" "}
                    {props.money(o.refundsBaseMinor)} · <span className={riskCls}>{risk.label}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="pt-1 flex items-center justify-between">
          <button
            type="button"
            onClick={props.onGoReports}
            className="text-xs text-muted-foreground hover:underline"
          >
            Ver detalle completo
          </button>

          {tab === "products" && mode === "risk" ? (
            <span className="text-xs text-amber-600 flex items-center gap-1">
              <AlertTriangle className="size-3" />
              Requiere revisión
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function SkeletonRow() {
  return (
    <div className="px-3 py-2 border-b border-border/60">
      <div className="h-4 w-2/3 bg-muted animate-pulse rounded mb-2" />
      <div className="h-3 w-5/6 bg-muted animate-pulse rounded" />
    </div>
  );
}

function PlaceholderRow(props: { text: string }) {
  return (
    <div className="px-3 py-2 border-b border-border/60 text-sm text-muted-foreground">
      <div className="h-4 flex items-center">{props.text || "—"}</div>
      <div className="h-3 mt-1 opacity-40"> </div>
    </div>
  );
}