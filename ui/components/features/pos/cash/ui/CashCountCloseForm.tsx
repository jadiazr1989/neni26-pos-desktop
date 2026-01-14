"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calculator, Lock, X } from "lucide-react";

import { ButtonSpinner } from "@/components/ui/button-spinner";

type CashMode = "COUNT" | "CLOSE";

export function CashCountCloseForm(props: {
  mode: CashMode;
  loading: boolean;
  error: string | null;

  cup: string;
  usd: string;
  onCup: (v: string) => void;
  onUsd: (v: string) => void;

  onSubmit: () => void;          // ✅ submit ya valida en panel
  onCancel: () => void;
}): React.JSX.Element {
  const isClose = props.mode === "CLOSE";

  return (
    <Card className="rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">
            {isClose ? "Cierre de caja (Z)" : "Arqueo de caja (COUNT)"}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {isClose
              ? "Ingresa lo contado y confirma. Esto cierra la sesión."
              : "Ingresa lo contado. Esto NO cierra la caja."}
          </div>
        </div>

        <Button
          variant="ghost"
          className="h-9 w-9 p-0 rounded-xl"
          type="button"
          onClick={props.onCancel}
          disabled={props.loading}
          aria-label="Cerrar"
        >
          <X className="size-4" />
        </Button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="cup">Contado (CUP)</Label>
          <Input
            id="cup"
            inputMode="decimal"
            value={props.cup}
            onChange={(e) => props.onCup(e.target.value)}
            disabled={props.loading}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="usd">Contado (USD)</Label>
          <Input
            id="usd"
            inputMode="decimal"
            value={props.usd}
            onChange={(e) => props.onUsd(e.target.value)}
            disabled={props.loading}
            className="h-11"
          />
        </div>
      </div>

      {props.error && (
        <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {props.error}
        </div>
      )}

      <div className="mt-5 flex items-center justify-end gap-2">
        <Button variant="secondary" type="button" onClick={props.onCancel} disabled={props.loading}>
          Volver
        </Button>

        <ButtonSpinner
          type="button"
          onClick={props.onSubmit}
          busy={props.loading}
          icon={isClose ? <Lock className="size-4" /> : <Calculator className="size-4" />}
          className={isClose ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
        >
          {props.loading ? "Procesando..." : isClose ? "Cerrar caja" : "Guardar arqueo"}
        </ButtonSpinner>
      </div>
    </Card>
  );
}
