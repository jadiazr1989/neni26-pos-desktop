// src/modules/admin/dashboard/sections/DashboardInventorySection.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  PackageCheck,
  PackageX,
  AlertTriangle,
  TrendingDown,
  Ban,
  SlidersHorizontal,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { AdminDashboardDataV2 } from "@/lib/modules/admin/dashboard/admin-dashboard.dto";
import { EmptyBlock } from "../ui/EmptyBlock";
import { SectionTitle } from "../ui/SectionTitle";
import { normalizeRangeLabelShort } from "../utils/rangeLabelShort";

// -------------------------------------
// helpers
// -------------------------------------
type StatTone = "neutral" | "warn" | "bad";

function safeInt(n: unknown): number {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.trunc(v));
}

function toneFromCount(count: number, warnAt: number, badAt: number): StatTone {
  if (!Number.isFinite(count) || count <= 0) return "neutral";
  if (count >= badAt) return "bad";
  if (count >= warnAt) return "warn";
  return "neutral";
}

function toneClasses(tone: StatTone): { border: string; text: string } {
  switch (tone) {
    case "bad":
      return { border: "border-destructive/40", text: "text-destructive" };
    case "warn":
      return { border: "border-amber-500/35", text: "text-amber-600" };
    default:
      return { border: "border-border/60", text: "" };
  }
}

// -------------------------------------
// StatCardAction (clean, no any)
// -------------------------------------
type StatCardActionProps = {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone?: StatTone;
  hint?: string;

  as: "link" | "button";
  href?: string;
  onClick?: () => void;

  className?: string;
  ariaLabel?: string;
};

function StatCardAction(p: StatCardActionProps) {
  const tone = p.tone ?? "neutral";
  const cls = toneClasses(tone);

  const shell =
    "rounded-lg border p-3 transition-colors text-left w-full " +
    "hover:bg-accent/30 cursor-pointer " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50";

  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="text-muted-foreground">{p.icon}</div>
          <div className="text-xs text-muted-foreground">{p.label}</div>
        </div>
        <div className={`text-lg font-semibold tabular-nums ${cls.text}`}>{p.value}</div>
      </div>

      {p.hint ? <div className="mt-1 text-[11px] text-muted-foreground">{p.hint}</div> : null}
    </>
  );

  return (
    <div className={`${shell} ${cls.border} ${p.className ?? ""}`}>
      {p.as === "link" ? (
        <Link href={p.href ?? "#"} className="block w-full" aria-label={p.ariaLabel ?? p.label}>
          {content}
        </Link>
      ) : (
        <button
          type="button"
          onClick={p.onClick}
          className="block w-full text-left"
          aria-label={p.ariaLabel ?? p.label}
        >
          {content}
        </button>
      )}
    </div>
  );
}

// -------------------------------------
// Section
// -------------------------------------
export function DashboardInventorySection(props: {
  data: AdminDashboardDataV2 | null;
  loading: boolean;
  rangeLabelShort: string;
  onNav: (path: string) => void;
}) {
  const d = props.data;

  const kpis = d?.inventory.kpis;
  const weaknesses = d?.inventory.weaknesses;

  const lowStockTop = React.useMemo(() => (d ? d.inventory.lowStock.slice(0, 3) : []), [d]);

  const totalVariants = safeInt(kpis?.variantsCount);
  const onHand = safeInt(kpis?.onHandCount);
  const outOfStock = safeInt(kpis?.outOfStockCount);
  const lowStock = safeInt(kpis?.lowStockCount);

  const ruptures = safeInt(weaknesses?.rupturesCount);
  const slowMoving = safeInt(weaknesses?.slowMovingCount);
  const badThresholds = safeInt(weaknesses?.badThresholdsCount);

  return (
    <Card className="rounded-xl border-border/60">
      <CardHeader className="pb-2">
        <SectionTitle
          title={`Inventario · ${normalizeRangeLabelShort(props.rangeLabelShort)}`}
          subtitle="Resumen operativo (conteos), sin mezclar unidades con peso/volumen."
        />
      </CardHeader>

      <CardContent className="px-4 py-4">
        {!d ? (
          <EmptyBlock loading={props.loading} label="Cargando inventario..." />
        ) : (
          // ✅ full width layout
          <div className="space-y-4">
            {/* KPI grid */}
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <StatCardAction
                as="link"
                href="/admin/inventory"
                icon={<Boxes className="size-4" />}
                label="Variantes"
                value={totalVariants}
                hint="Total de variantes activas."
              />

              <StatCardAction
                as="link"
                href="/admin/inventory"
                icon={<PackageCheck className="size-4" />}
                label="Con stock"
                value={onHand}
                tone={outOfStock > 0 ? "warn" : "neutral"}
                hint="Available > 0."
              />

              <StatCardAction
                as="button"
                onClick={() => props.onNav("/admin/inventory")}
                icon={<PackageX className="size-4" />}
                label="Agotadas"
                value={outOfStock}
                tone={toneFromCount(outOfStock, 1, 3)}
                hint="Available <= 0."
              />

              <StatCardAction
                as="button"
                onClick={() => props.onNav("/admin/inventory")}
                icon={<AlertTriangle className="size-4" />}
                label="Bajo umbral"
                value={lowStock}
                tone={toneFromCount(lowStock, 1, 5)}
                hint="Available < threshold."
              />
            </div>

            {/* Weaknesses */}
            <div className="rounded-lg border border-border/60 p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold">Lectura rápida</div>

                <Link
                  href="/admin/adjustments"
                  className="inline-flex items-center gap-2 rounded-md border border-border px-2 py-1 text-xs hover:bg-accent/30 transition-colors"
                >
                  Ajustes <SlidersHorizontal className="size-3" />
                </Link>
              </div>

              <div className="mt-1 text-xs text-muted-foreground">
                Señales de riesgo para accionar (reposición, umbrales, rotación).
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <StatCardAction
                  as="link"
                  href="/admin/inventory"
                  icon={<Ban className="size-4" />}
                  label="Rupturas"
                  value={ruptures}
                  tone={toneFromCount(ruptures, 1, 3)}
                  hint="Available <= 0."
                />

                <StatCardAction
                  as="link"
                  href="/admin/inventory"
                  icon={<TrendingDown className="size-4" />}
                  label="Rotación lenta"
                  value={slowMoving}
                  tone={toneFromCount(slowMoving, 1, 5)}
                  hint="Ventas bajas vs stock."
                />

                <StatCardAction
                  as="link"
                  href="/admin/settings/inventory"
                  icon={<AlertTriangle className="size-4" />}
                  label="Umbrales dudosos"
                  value={badThresholds}
                  tone={toneFromCount(badThresholds, 1, 3)}
                  hint="Thresholds mal calibrados."
                />
              </div>
            </div>

            {/* Low stock list header */}
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold flex items-center gap-2">
                <Boxes className="size-4 text-muted-foreground" />
                Stock bajo (top)
              </div>
              <div className="text-xs text-muted-foreground">{lowStock} variantes</div>
            </div>

            {/* Low stock list */}
            {d.inventory.lowStock.length === 0 ? (
              <div className="grid gap-3 lg:grid-cols-2">
                <div className="rounded-lg border border-border/60 p-4">
                  <div className="text-sm font-semibold">Sin alertas de stock</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    No hay variantes por debajo del umbral en este período.
                  </div>

                  <div className="mt-3 text-xs text-muted-foreground space-y-1">
                    <div>
                      <span className="font-medium text-foreground">Umbrales:</span>{" "}
                      revisa calibración si ves rupturas o rotación lenta.
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Acción:</span>{" "}
                      valida reservas, compras abiertas y ajustes pendientes.
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => props.onNav("/admin/inventory")}
                      className="text-xs text-muted-foreground hover:underline"
                    >
                      Ver inventario completo
                    </button>
                  </div>
                </div>

                <div className="rounded-lg border border-border/60 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold">Reglas de lectura rápida</div>
                    <button
                      type="button"
                      onClick={() => props.onNav("/admin/settings/inventory")}
                      className="inline-flex items-center gap-2 rounded-md border border-border px-2 py-1 text-xs hover:bg-accent/30 transition-colors"
                    >
                      Ajustes <SlidersHorizontal className="size-3" />
                    </button>
                  </div>

                  <div className="mt-3 grid gap-2 text-xs">
                    <MiniKV label="Lookback" value={`${d.inventory.weaknessesConfig.lookbackDays} días`} />
                    <MiniKV label="Overstock ≥" value={`${d.inventory.weaknessesConfig.overstockThreshold}`} />
                    <MiniKV label="Rotación lenta <" value={`${d.inventory.weaknessesConfig.slowMovingSoldThreshold} vendidos`} />
                  </div>

                  <div className="mt-3 text-[11px] text-muted-foreground">
                    Estas reglas determinan “Rupturas / Overstock / Rotación lenta / Umbrales dudosos”.
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-md border border-border/60">
                {lowStockTop.map((r, idx) => (
                  <div
                    key={r.variantId}
                    className={`px-3 py-2 flex items-center justify-between gap-3 ${idx === lowStockTop.length - 1 ? "" : "border-b border-border/60"
                      }`}
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{r.title || r.productName}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {r.productName} · {r.sku}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Disponible {r.available} · Umbral {r.threshold}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="shrink-0 inline-flex items-center gap-2 rounded-md border border-border px-2 py-1 text-xs hover:bg-accent/30 transition-colors"
                      onClick={() => props.onNav("/admin/inventory")}
                    >
                      Ver <ArrowRight className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-1">
              <Link href="/admin/inventory" className="text-xs text-muted-foreground hover:underline">
                Ver inventario completo
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MiniKV(props: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border/60 px-3 py-2">
      <div className="text-muted-foreground">{props.label}</div>
      <div className="font-semibold tabular-nums">{props.value}</div>
    </div>
  );
}