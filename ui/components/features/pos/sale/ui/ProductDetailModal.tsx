"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LineItemOptionSnapshot, Product } from "../types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Payload = { qty: number; optionsSnapshot: LineItemOptionSnapshot[] };

export function ProductDetailModal(props: {
  open: boolean;
  product: Product | null;
  initialQty?: number;
  initialOptionsSnapshot?: LineItemOptionSnapshot[];
  onClose: () => void;
  onConfirm: (payload: Payload) => void;
}) {
  const [qty, setQty] = useState<number>(() => props.initialQty ?? 1);
  // selected[groupId] = [optionId...]const [qty, setQty] = useState(() => props.initialQty ?? 1);
  const [selected, setSelected] = useState<Record<string, string[]>>(() => {
    const base: Record<string, string[]> = {};
    const snaps = props.initialOptionsSnapshot ?? [];
    for (const s of snaps) {
      base[s.groupId] = [...(base[s.groupId] ?? []), s.optionId];
    }
    return base;
  });


  const groups = props.product?.optionGroups ?? [];

  // reset al abrir/cambiar producto (para no heredar selecciones)


  const isValid = useMemo(() => {
    if (!props.product) return false;
    return groups.every((g) => {
      const count = selected[g.id]?.length ?? 0;
      return count >= g.min && count <= g.max;
    });
  }, [groups, props.product, selected]);

  const optionsSnapshot = useMemo<LineItemOptionSnapshot[]>(() => {
    if (!props.product) return [];

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
          priceDelta: opt.priceDelta,
        });
      }
    }

    return snaps;
  }, [groups, props.product, selected]);

  // Refs para listener estable
  const qtyRef = useRef(qty);
  const validRef = useRef(isValid);
  const snapRef = useRef(optionsSnapshot);

  useEffect(() => void (qtyRef.current = qty), [qty]);
  useEffect(() => void (validRef.current = isValid), [isValid]);
  useEffect(() => void (snapRef.current = optionsSnapshot), [optionsSnapshot]);

  useEffect(() => {
    if (!props.open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        return;
      }


      if (e.key === "Enter") {
        e.preventDefault();
        if (!validRef.current) return;
        props.onConfirm({ qty: qtyRef.current, optionsSnapshot: snapRef.current });
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [props.open, props.onClose, props.onConfirm]);

  const total = useMemo(() => {
    if (!props.product) return 0;
    const deltas = optionsSnapshot.reduce((a, o) => a + o.priceDelta, 0);
    return qty * (props.product.pricePerUnit + deltas);
  }, [props.product, qty, optionsSnapshot]);

  if (!props.open || !props.product) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl rounded-2xl p-5">
        <div className="flex items-center justify-between gap-3">
          <button type="button" className="text-sm font-semibold hover:underline" onClick={props.onClose}>
            ← Atrás
          </button>
          <div className="text-sm font-semibold truncate">{props.product.name}</div>
          <div className="w-10" />
        </div>

        <div className="mt-3 text-xs text-muted-foreground">
          Precio base: ${props.product.pricePerUnit.toFixed(2)} / {props.product.unit}
        </div>

        <div className="mt-4 space-y-4">
          {groups.map((g) => (
            <div key={g.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">{g.name}</div>
                <div className="text-xs text-muted-foreground">
                  {g.min > 0 ? `Obligatorio` : `Opcional`} · max {g.max}
                </div>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {g.options.map((o) => {
                  const picked = (selected[g.id] ?? []).includes(o.id);

                  const onToggle = () => {
                    setSelected((prev) => {
                      const current = prev[g.id] ?? [];

                      // radio: solo uno
                      if (g.display === "radio") return { ...prev, [g.id]: [o.id] };

                      // checkbox multi
                      if (!picked) {
                        if (current.length >= g.max) return prev;
                        return { ...prev, [g.id]: [...current, o.id] };
                      }
                      return { ...prev, [g.id]: current.filter((x) => x !== o.id) };
                    });
                  };

                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={onToggle}
                      className={[
                        "rounded-xl border px-3 py-2 text-left text-sm transition",
                        picked ? "border-primary bg-accent/30" : "border-border hover:bg-accent/20",
                      ].join(" ")}
                    >
                      <div className="font-semibold">{o.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {o.priceDelta ? `+$${o.priceDelta.toFixed(2)}` : "Sin costo"}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="rounded-2xl border border-border bg-card p-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">Cantidad</div>
              <div className="text-xs text-muted-foreground">Enter para agregar (si válido)</div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                className="h-10 px-4"
                type="button"
                onClick={() => setQty((v) => Math.max(1, v - 1))}
              >
                −
              </Button>
              <div className="w-14 text-center font-mono">{qty}</div>
              <Button
                variant="secondary"
                className="h-10 px-4"
                type="button"
                onClick={() => setQty((v) => v + 1)}
              >
                +
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 flex items-center justify-between">
            <div className="text-sm font-semibold">Total</div>
            <div className="text-sm font-semibold">${total.toFixed(2)}</div>
          </div>

          <Button
            className="h-12 w-full"
            disabled={!isValid}
            type="button"
            onClick={() => props.onConfirm({ qty, optionsSnapshot })}
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
