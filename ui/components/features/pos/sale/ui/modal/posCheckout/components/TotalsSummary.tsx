"use client";

import * as React from "react";
import type { JSX } from "react";
import { cn } from "@/lib/utils";
import { MoneyDisplay } from "@/components/shared/MoneyDisplay";

type PayState = "OK" | "DUE" | "CHANGE";

function resolvePayState(dueMinor: number, changeMinor: number): PayState {
  if (dueMinor > 0) return "DUE";
  if (changeMinor > 0) return "CHANGE";
  return "OK";
}

function badgeStyles(state: PayState) {
  switch (state) {
    case "OK":
      return {
        panel: "border-emerald-200 bg-emerald-50",
        badge: "bg-emerald-100 text-emerald-900 border-emerald-200",
        badgeText: "CUADRADO",
        accent: "text-emerald-900",
      };
    case "DUE":
      return {
        panel: "border-rose-200 bg-rose-50",
        badge: "bg-rose-100 text-rose-900 border-rose-200",
        badgeText: "FALTA",
        accent: "text-rose-900",
      };
    case "CHANGE":
      return {
        panel: "border-amber-200 bg-amber-50",
        badge: "bg-amber-100 text-amber-900 border-amber-200",
        badgeText: "VUELTO",
        accent: "text-amber-900",
      };
  }
}

function CardHeader(props: { title: string; rightSlot?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center justify-between gap-3", props.className)}>
      <div className="text-sm text-muted-foreground">{props.title}</div>
      {props.rightSlot ? <div className="shrink-0">{props.rightSlot}</div> : <div className="h-7" />}
    </div>
  );
}

function Badge(props: { text: string; className: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold", props.className)}>
      {props.text}
    </span>
  );
}

export function TotalsSummary(props: {
  totalMinor: number;
  paidMinor: number; // entregado
  dueMinor: number;
  changeMinor: number;
}): JSX.Element {
  const state = resolvePayState(props.dueMinor, props.changeMinor);
  const b = badgeStyles(state);

  const primaryMinor = state === "DUE" ? props.dueMinor : state === "CHANGE" ? props.changeMinor : 0;

  return (
    <div className="rounded-2xl border bg-card p-6">
      {/* TOTAL */}
      <div className="text-xs tracking-widest text-muted-foreground">TOTAL A COBRAR</div>
      <div className="mt-3">
        <MoneyDisplay minor={props.totalMinor} variant="hero" showCents hideZeroCents />
      </div>

      {/* Two cards aligned */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-3">
        {/* Entregado */}
        <div className="rounded-2xl border px-5 py-5 min-w-0">
          <CardHeader title="Entregado" />
          <div className="mt-4">
            <MoneyDisplay
              minor={props.paidMinor}
              variant="card"
              size="auto"
              minSize="xl"
              maxSize="4xl"
              showCents
              hideZeroCents
              className="font-semibold text-foreground"   // ✅ baja peso visual
            />
          </div>
        </div>

        {/* Estado */}
        {/* Estado */}
        <div className={cn("rounded-2xl border px-5 py-4 min-w-0", b.panel)}>
          <CardHeader
            title="Estado"
            rightSlot={<Badge text={b.badgeText} className={b.badge} />}
            className={cn("text-sm font-semibold", b.accent)}
          />

          <div className="mt-4 min-h-[56px] flex items-center">
            {state === "OK" ? (
              <div className={cn("text-sm font-semibold tracking-tight", b.accent)}>
                Cobro exacto
              </div>
            ) : (
              <MoneyDisplay
                minor={primaryMinor}
                variant="card"
                size="auto"
                minSize="xl"
                maxSize="3xl"
                showCents
                hideZeroCents
                className={cn("font-bold", b.accent)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}