"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "../types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function QuantityModal(props: {
  open: boolean;
  product: Product | null;
  initialQty?: number;      // ✅
  title?: string;           // ✅
  onClose: () => void;
  onConfirm: (qty: number) => void;

}) {
  const [qty, setQty] = useState<number>(() => props.initialQty ?? 1);


  // Mantén qty accesible sin re-suscribir listener
  const qtyRef = useRef(qty);
  useEffect(() => {
    qtyRef.current = qty;
  }, [qty]);

  useEffect(() => {
    if (!props.open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") props.onClose();
      if (e.key === "Enter") {
        e.preventDefault();
        props.onConfirm(Number(qtyRef.current.toFixed(3)));
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [props.open, props.onClose, props.onConfirm]); // ✅ sin qty

  const total = useMemo(() => {
    if (!props.product) return 0;
    return qty * props.product.pricePerUnit;
  }, [qty, props.product]);

  if (!props.open || !props.product) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6">
      <Card className="w-full max-w-lg rounded-2xl p-5">
        <div className="flex items-center justify-between gap-3">
          <button type="button" className="text-sm font-semibold hover:underline" onClick={props.onClose}>
            ← Atrás
          </button>
          <div className="text-base font-semibold">{props.title ?? "Cantidad"}</div>

          <div className="w-10" />
        </div>

        <div className="mt-4 text-xs text-muted-foreground">
          Precio: ${props.product.pricePerUnit.toFixed(2)} / {props.product.unit}
        </div>

        <div className="mt-4">
          <label className="text-xs text-muted-foreground">Cantidad ({props.product.unit})</label>
          <input
            className="mt-2 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm font-mono outline-none focus:ring-2 focus:ring-ring"
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            inputMode="decimal"
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {[-0.25, -0.1, 0.1, 0.25].map((d) => (
            <Button
              key={d}
              variant="secondary"
              className="h-9"
              type="button"
              onClick={() => setQty((v) => Number(Math.max(0, v + d).toFixed(3)))}
            >
              {d > 0 ? `+${d}` : `${d}`}
            </Button>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-border bg-card p-3 flex items-center justify-between">
          <div className="text-sm font-semibold">Total</div>
          <div className="text-sm font-semibold">${total.toFixed(2)}</div>
        </div>

        <Button
          className="mt-4 h-12 w-full"
          type="button"
          onClick={() => props.onConfirm(Number(qty.toFixed(3)))}
        >
          Agregar al ticket
        </Button>
      </Card>
    </div>
  );
}
