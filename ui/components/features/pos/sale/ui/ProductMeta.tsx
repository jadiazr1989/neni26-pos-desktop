"use client";

import type { JSX, ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Product } from "../types";
import React from "react";
import { resolveStockUi } from "../domain/lowStock";
import { DEFAULT_STOCK_POLICY } from "../domain/stock.policy";
import { ProductImage } from "@/components/shared/ProductImage";
import { MoneyDisplay } from "@/components/shared/MoneyDisplay";

function unitLabel(u: Product["pricingUnit"]): string {
  switch (u) {
    case "UNIT":
      return "u";
    case "LB":
      return "lb";
    case "KG":
      return "kg";
    case "L":
      return "l";
    case "ML":
      return "ml";
    default:
      return "u";
  }
}

function PillBadge(props: {
  label: string;
  className: string;
  ariaLabel: string;
  side: "left" | "right";
}) {
  return (
    <span
      aria-label={props.ariaLabel}
      className={cn(
        "absolute bottom-2",
        props.side === "left" ? "left-2" : "right-2",
        "inline-flex items-center justify-center",
        "h-7 px-2.5 rounded-full text-xs font-bold shadow-sm",
        props.className
      )}
    >
      {props.label}
    </span>
  );
}

const STOCK_POLICY = DEFAULT_STOCK_POLICY; // luego lo inyectas por settings

export function ProductMeta(props: { product: Product; rightSlot?: ReactNode }): JSX.Element {
  const { product, rightSlot } = props;

  const stockUi = React.useMemo(
    () => resolveStockUi(product.availableQty ?? 0, STOCK_POLICY),
    [product.availableQty]
  );

  const showStockBadge = stockUi.level !== "OK";
  return (
    <div className="relative flex h-full flex-col">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 px-3 pt-3">
        <MoneyDisplay
          minor={product.pricePerUnitMinor ?? 0}
          variant="card"
          align="left"
          showCents
          hideZeroCents={false}
          size="xl"
          className="text-red-600"
        />
        <div className="shrink-0">{rightSlot}</div>
      </div>

      {/* Image */}
      <div className="mt-2 px-3">
        <ProductImage
          src={product.imageUrl ?? null}
          alt={product.name}
        />
      </div>

      {/* Text */}
      {/* Text */}
      <div className="flex flex-1 flex-col gap-1 px-3 pt-3 pb-10">
        <div className="text-sm font-semibold leading-snug line-clamp-2">{product.name}</div>

        {/* ✅ Unidad abajo-izquierda (overlay) */}
        <PillBadge
          side="left"
          label={unitLabel(product.pricingUnit ?? product.baseUnit)}
          ariaLabel={`Unidad ${unitLabel(product.pricingUnit ?? product.baseUnit)}`}
          className="bg-white/90 text-foreground border border-border"
        />

        {/* ✅ Stock abajo-derecha (overlay) */}
        {showStockBadge ? (
          <PillBadge
            side="right"
            label={stockUi.label}
            ariaLabel={stockUi.ariaLabel}
            className={cn(
              stockUi.className,
              "border border-black/5 shadow-sm" // mejora legibilidad
            )}
          />
        ) : null}

      </div>

    </div>
  );
}

