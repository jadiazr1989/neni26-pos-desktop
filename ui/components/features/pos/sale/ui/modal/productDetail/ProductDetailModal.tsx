"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import type { ProductDetailModalProps } from "./productDetail.types";
import {
  clampInt,
  money,
  stepMinor,
  toQtyMinor,
  minQtyMinor,
  maxQtyMinor,
  normalizeQtyForConfirm,
  helperText,
  formatQty,
  resolveScaleFromUnits,
} from "./productDetail.quantity";

import type { LineItemOptionSnapshot } from "../../../types";

/**
 * Convierte snapshot inicial -> selected map
 */
function buildSelected(
  initial: LineItemOptionSnapshot[] | undefined
): Record<string, string[]> {
  const base: Record<string, string[]> = {};

  for (const s of initial ?? []) {
    const prev = base[s.groupId] ?? [];
    base[s.groupId] = [...prev, s.optionId];
  }

  return base;
}

/**
 * OUTER
 * Solo controla visibilidad y remount.
 * NO hooks complejos → evita violar reglas.
 */
export function ProductDetailModal(props: ProductDetailModalProps) {
  const product = props.product;
  const isVisible = props.open && !!product;

  if (!isVisible || !product) return null;

  return (
    <ProductDetailModalInner
      key={product.variantId} // 🔥 reset automático al cambiar variante
      {...props}
      product={product}
    />
  );
}

/**
 * INNER
 * Hooks siempre en orden.
 * Sin effects que copien props → state.
 */
function ProductDetailModalInner(
  props: ProductDetailModalProps & {
    product: NonNullable<ProductDetailModalProps["product"]>;
  }
) {
  const product = props.product;
  const soldBy = product.soldBy;
  const groups = product.optionGroups ?? [];

  /**
   * Escala monetaria / qty
   */
  const scale = useMemo(
    () =>
      resolveScaleFromUnits(
        product.baseUnit,
        product.pricingUnit,
        soldBy
      ),
    [product.baseUnit, product.pricingUnit, soldBy]
  );

  const step = useMemo(() => stepMinor(scale), [scale]);

  /**
   * INIT STATE (sin effects)
   */
  const [qtyMinor, setQtyMinor] = useState<number>(() => {
    const initQty = props.initialQty ?? 1;
    const base = toQtyMinor(initQty, scale);

    return clampInt(base, minQtyMinor(scale), maxQtyMinor(scale));
  });

  const [selected, setSelected] = useState<Record<string, string[]>>(() =>
    buildSelected(props.initialOptionsSnapshot)
  );

  /**
   * Validación
   */
  const isValid = useMemo(() => {
    return groups.every((g) => {
      const count = selected[g.id]?.length ?? 0;
      return count >= g.min && count <= g.max;
    });
  }, [groups, selected]);

  /**
   * Snapshot opciones
   */
  const optionsSnapshot = useMemo<LineItemOptionSnapshot[]>(() => {
    const snaps: LineItemOptionSnapshot[] = [];

    for (const g of groups) {
      const optionIds = selected[g.id] ?? [];

      for (const optionId of optionIds) {
        const opt = g.options.find((o) => o.id === optionId);
        if (!opt) continue;

        snaps.push({
          groupId: g.id,
          groupName: g.name,
          optionId: opt.id,
          optionName: opt.name,
          priceDeltaMinor: clampInt(
            opt.priceDeltaMinor ?? 0,
            0,
            1_000_000_000
          ),
        });
      }
    }

    return snaps;
  }, [groups, selected]);

  /**
   * Refs para teclado sin rerenders
   */
  const qtyMinorRef = useRef(qtyMinor);
  const validRef = useRef(isValid);
  const snapRef = useRef(optionsSnapshot);

  useEffect(() => {
    qtyMinorRef.current = qtyMinor;
  }, [qtyMinor]);

  useEffect(() => {
    validRef.current = isValid;
  }, [isValid]);

  useEffect(() => {
    snapRef.current = optionsSnapshot;
  }, [optionsSnapshot]);

  /**
   * Keyboard UX (esto SI es correcto en effect → sistema externo)
   */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        props.onClose();
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();

        if (!validRef.current) return;

        const qty = normalizeQtyForConfirm(
          scale,
          qtyMinorRef.current
        );

        props.onConfirm({
          qty,
          optionsSnapshot: snapRef.current,
        });
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [props.onClose, props.onConfirm, scale]);

  /**
   * Total
   */
  const totalMinor = useMemo(() => {
    const deltasMinor = optionsSnapshot.reduce(
      (a, o) => a + (o.priceDeltaMinor ?? 0),
      0
    );

    const baseMinor = product.pricePerUnitMinor ?? 0;
    const qtyFactor = qtyMinor / 10 ** scale;

    return Math.round((baseMinor + deltasMinor) * qtyFactor);
  }, [product.pricePerUnitMinor, qtyMinor, scale, optionsSnapshot]);

  const min = minQtyMinor(scale);
  const max = maxQtyMinor(scale);

  /**
   * UI
   */
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl rounded-2xl p-5">
        {/* header */}
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            className="text-sm font-semibold hover:underline"
            onClick={props.onClose}
          >
            ← Atrás
          </button>

          <div className="text-sm font-semibold truncate">
            {product.name}
          </div>

          <div className="w-10" />
        </div>

        <div className="mt-3 text-xs text-muted-foreground">
          Precio base: ${money(product.pricePerUnitMinor)} /{" "}
          {product.pricingUnit}
        </div>

        <div className="mt-4 space-y-4">
          {/* OPTION GROUPS */}
          {groups.map((g) => (
            <div
              key={g.id}
              className="rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">{g.name}</div>

                <div className="text-xs text-muted-foreground">
                  {g.min > 0 ? "Obligatorio" : "Opcional"} · min{" "}
                  {g.min} · max {g.max}
                </div>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {g.options.map((o) => {
                  const picked = (
                    selected[g.id] ?? []
                  ).includes(o.id);

                  const onToggle = () => {
                    setSelected((prev) => {
                      const current = prev[g.id] ?? [];

                      if (g.display === "radio") {
                        return { ...prev, [g.id]: [o.id] };
                      }

                      if (!picked) {
                        if (current.length >= g.max) return prev;

                        return {
                          ...prev,
                          [g.id]: [...current, o.id],
                        };
                      }

                      return {
                        ...prev,
                        [g.id]: current.filter(
                          (x) => x !== o.id
                        ),
                      };
                    });
                  };

                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={onToggle}
                      className={[
                        "rounded-xl border px-3 py-2 text-left text-sm transition",
                        picked
                          ? "border-primary bg-accent/30"
                          : "border-border hover:bg-accent/20",
                      ].join(" ")}
                    >
                      <div className="font-semibold">{o.name}</div>

                      <div className="text-xs text-muted-foreground">
                        {o.priceDeltaMinor
                          ? `+$${money(o.priceDeltaMinor)}`
                          : "Sin costo"}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* QTY */}
          <div className="rounded-2xl border border-border bg-card p-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">Cantidad</div>
              <div className="text-xs text-muted-foreground">
                {helperText(scale)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={() =>
                  setQtyMinor((v) =>
                    clampInt(v - step, min, max)
                  )
                }
              >
                −
              </Button>

              <div className="min-w-[110px] text-center font-mono tabular-nums">
                {formatQty(qtyMinor, scale)}
              </div>

              <Button
                variant="secondary"
                onClick={() =>
                  setQtyMinor((v) =>
                    clampInt(v + step, min, max)
                  )
                }
              >
                +
              </Button>
            </div>
          </div>

          {/* TOTAL */}
          <div className="rounded-2xl border border-border bg-card p-4 flex items-center justify-between">
            <div className="text-sm font-semibold">Total</div>

            <div className="text-sm font-semibold tabular-nums">
              ${money(totalMinor)}
            </div>
          </div>

          {/* CTA */}
          <Button
            className="h-12 w-full"
            disabled={!isValid}
            onClick={() => {
              const qty = normalizeQtyForConfirm(
                scale,
                qtyMinor
              );

              props.onConfirm({
                qty,
                optionsSnapshot,
              });
            }}
          >
            Agregar al ticket
          </Button>

          {!isValid && (
            <div className="text-xs text-muted-foreground">
              Completa las opciones obligatorias antes de agregar.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
