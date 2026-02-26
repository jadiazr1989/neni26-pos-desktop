"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Product } from "../types";
import { VariantUnit } from "@/lib/modules/catalog/products/product.dto";

type Props = {
  open: boolean;
  product: Product | null;
  initialQty?: number; // puede ser 0 cuando editas
  title?: string;
  onClose: () => void;
  onConfirm: (qty: number) => void; // qty entero si UNIT, decimal si measure
};

function money(minor: number): string {
  const v = Number(minor ?? 0);
  const safe = Number.isFinite(v) ? v : 0;
  return (safe / 100).toFixed(2);
}

function clampInt(n: number, min: number, max: number): number {
  const x = Number(n);
  if (!Number.isFinite(x)) return min;
  return Math.max(min, Math.min(max, Math.trunc(x)));
}

/** ===== Qty minor helpers (sin floats) ===== */
function unitScale(unit: VariantUnit): 0 | 2 {
  return unit === "UNIT" ? 0 : 2; // 2 decimales para LB/KG/L/ML
}

// qty -> qtyMinor (entero)
function toQtyMinor(qty: number, scale: 0 | 2): number {
  const f = Number(qty);
  if (!Number.isFinite(f)) return 0;
  return Math.round(f * 10 ** scale);
}

// delta -> deltaMinor (permite negativos)
function toDeltaMinor(delta: number, scale: 0 | 2): number {
  const f = Number(delta);
  if (!Number.isFinite(f)) return 0;
  return Math.round(f * 10 ** scale);
}

function fromQtyMinor(qtyMinor: number, scale: 0 | 2): number {
  return qtyMinor / 10 ** scale;
}

function formatQty(unit: VariantUnit, qtyMinor: number): string {
  const scale = unitScale(unit);
  const q = fromQtyMinor(qtyMinor, scale);
  return scale === 0 ? String(Math.trunc(q)) : q.toFixed(scale);
}

// Aquí decides los límites
function minQtyMinor(): number {
  return 0; // ✅ como pediste: baja hasta 0, nunca negativo
}

function maxQtyMinor(unit: VariantUnit): number {
  return unit === "UNIT" ? 999_999 : 99_999_999; // 999,999.99 con scale=2
}

function normalizeQtyForConfirm(unit: VariantUnit, qtyMinor: number): number {
  const scale = unitScale(unit);
  const q = fromQtyMinor(qtyMinor, scale);

  if (unit === "UNIT") return Math.max(0, Math.trunc(q));

  // decimal estable con scale fijo
  return Number(q.toFixed(scale));
}

/** Parse input string (permite escribir mientras) */
function sanitizeInput(raw: string, unit: VariantUnit): string {
  const s = raw.trim();

  // permite vacío mientras teclea
  if (s === "") return "";

  if (unit === "UNIT") {
    // solo dígitos
    const onlyDigits = s.replace(/[^\d]/g, "");
    return onlyDigits;
  }

  // medidas: dígitos + un punto
  //  - quita letras
  //  - deja un solo '.'
  const cleaned = s.replace(/[^\d.]/g, "");
  const parts = cleaned.split(".");
  if (parts.length === 1) return parts[0];
  return `${parts[0]}.${parts.slice(1).join("")}`; // une el resto sin más puntos
}

function parseInputToMinor(input: string, unit: VariantUnit): number | null {
  if (input === "") return null;
  const n = Number(input);
  if (!Number.isFinite(n)) return null;
  const scale = unitScale(unit);
  return toQtyMinor(n, scale);
}

export function QuantityModal(props: Props) {
  const product = props.product;
  const unit: VariantUnit = product?.pricingUnit ?? "UNIT";
  const scale = unitScale(unit);

  const min = minQtyMinor();
  const max = maxQtyMinor(unit);

  // Estado interno en minor
  const [qtyMinor, setQtyMinor] = useState<number>(() => {
    const init = props.initialQty ?? 1;
    const base = toQtyMinor(init, scale);
    return clampInt(base, min, max);
  });

  // Input text controlado (para UX decente)
  const [input, setInput] = useState<string>(() => formatQty(unit, qtyMinor));

  // Sync input cuando cambia qtyMinor (por botones)
  useEffect(() => {
    setInput(formatQty(unit, qtyMinor));
  }, [qtyMinor, unit]);

  // Ref estable para Enter
  const qtyMinorRef = useRef<number>(qtyMinor);
  useEffect(() => {
    qtyMinorRef.current = qtyMinor;
  }, [qtyMinor]);

  const totalMinor = useMemo(() => {
    if (!product) return 0;
    const unitMinor = product.pricePerUnitMinor ?? 0;

    // total = unitMinor * (qtyMinor / 10^scale)
    const qtyFactor = qtyMinor / 10 ** scale;
    return Math.round(unitMinor * qtyFactor);
  }, [product, qtyMinor, scale]);

  const confirm = () => {
    const q = normalizeQtyForConfirm(unit, qtyMinorRef.current);
    props.onConfirm(q);
  };

  useEffect(() => {
    if (!props.open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        props.onClose();
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        confirm();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [props.open, props.onClose]);

  if (!props.open || !product) return null;

  const quickDeltas: number[] =
    unit === "UNIT" ? [-1, +1, +5, +10] : [-0.25, -0.1, +0.1, +0.25];

  const applyDelta = (delta: number) => {
    const dMinor = toDeltaMinor(delta, scale);
    setQtyMinor((v) => clampInt(v + dMinor, min, max));
  };

  const onInputChange = (raw: string) => {
    const sanitized = sanitizeInput(raw, unit);
    setInput(sanitized);

    const nextMinor = parseInputToMinor(sanitized, unit);
    if (nextMinor === null) return; // vacío mientras
    setQtyMinor(clampInt(nextMinor, min, max));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 sm:p-6">
      <Card className="w-full max-w-lg rounded-2xl p-5 sm:p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
            onClick={props.onClose}
          >
            ← Atrás
          </button>

          <div className="text-base font-semibold">
            {props.title ?? "Cantidad"}
          </div>

          <div className="w-10" />
        </div>

        {/* Meta */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            Precio
            <span className="ml-2 font-medium text-foreground">
              ${money(product.pricePerUnitMinor)}
            </span>
            <span className="ml-2 text-muted-foreground">/ {product.pricingUnit}</span>
          </div>

          <div className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            {unit === "UNIT" ? "Enteros" : `${scale} decimales`}
          </div>
        </div>

        {/* Qty input + stepper */}
        <div className="mt-5 rounded-2xl border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground">Cantidad</div>

          <div className="mt-2 flex items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              className="h-12 w-12 rounded-xl text-lg"
              onClick={() => applyDelta(unit === "UNIT" ? -1 : -0.1)}
              disabled={qtyMinor <= min}
            >
              −
            </Button>

            <input
              className="h-12 flex-1 rounded-xl border border-border bg-background px-3 text-center font-mono text-lg outline-none focus:ring-2 focus:ring-ring"
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              inputMode={unit === "UNIT" ? "numeric" : "decimal"}
              placeholder="0"
            />

            <Button
              type="button"
              variant="secondary"
              className="h-12 w-12 rounded-xl text-lg"
              onClick={() => applyDelta(unit === "UNIT" ? +1 : +0.1)}
              disabled={qtyMinor >= max}
            >
              +
            </Button>
          </div>

          {/* Quick buttons */}
          <div className="mt-3 flex flex-wrap gap-2">
            {quickDeltas.map((d) => (
              <Button
                key={String(d)}
                type="button"
                variant="outline"
                className="h-9 rounded-xl"
                onClick={() => applyDelta(d)}
                disabled={
                  (d < 0 && qtyMinor <= min) || (d > 0 && qtyMinor >= max)
                }
              >
                {d > 0 ? `+${d}` : `${d}`}
              </Button>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="mt-4 rounded-2xl border border-border bg-card px-4 py-3 flex items-center justify-between">
          <div className="text-sm font-semibold">Total</div>
          <div className="text-sm font-semibold">${money(totalMinor)}</div>
        </div>

        {/* Footer actions (NO AZUL) */}
        <div className="mt-5 flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-12 flex-1 rounded-xl"
            onClick={props.onClose}
          >
            Cancelar
          </Button>

          <Button
            type="button"
            variant="secondary"
            className="h-12 flex-1 rounded-xl font-semibold"
            onClick={confirm}
          >
            Guardar
          </Button>
        </div>

        <div className="mt-2 text-[11px] text-muted-foreground">
          Tip: Enter para guardar · Esc para cerrar
        </div>
      </Card>
    </div>
  );
}
