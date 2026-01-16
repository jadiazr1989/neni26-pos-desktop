"use client";

import type { CashCountReportDTO, CurrencyCode } from "@/lib/cash.types";
import type { JSX } from "react";
import * as React from "react";

import { buildCounted } from "../utils";
import { CashCountCloseForm } from "./CashCountCloseForm";
import { CashCountCloseSummary } from "./CashCountCloseSummary";

export type CashMode = "COUNT" | "CLOSE";

export function CashCountClosePanel(props: {
  mode: CashMode;
  onClose: () => void;
  onCount: (counted: Partial<Record<CurrencyCode, number>>) => Promise<{ report: CashCountReportDTO }>;
  onCloseCash: (counted: Partial<Record<CurrencyCode, number>>) => Promise<void>;
}): JSX.Element {
  const [cup, setCup] = React.useState("0");
  const [usd, setUsd] = React.useState("0");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const [report, setReport] = React.useState<CashCountReportDTO | null>(null);

  const title = props.mode === "COUNT" ? "Arqueo de caja" : "Cierre de caja";

  const submit = React.useCallback(async () => {
    if (loading) return;

    const { counted: rebuilt, error: err } = buildCounted(cup, usd);
    if (err) return setError(err);

    // confirm extra solo para CLOSE
    if (props.mode === "CLOSE") {
      const ok = window.confirm("¿Seguro? Esto genera Z y cierra la caja.");
      if (!ok) return;
    }

    setError(null);
    setLoading(true);

    try {
      if (props.mode === "COUNT") {
        const resp = await props.onCount(rebuilt);
        setReport(resp.report);
        // ✅ NO cerramos: dejamos el reporte visible
        return;
      }

      await props.onCloseCash(rebuilt);
      props.onClose(); // ✅ solo cerramos cuando fue CLOSE
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo completar la operación.");
    } finally {
      setLoading(false);
    }
  }, [cup, usd, loading, props]);

  // Hotkeys
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        props.onClose();
      }
      if (e.key === "Enter") {
        e.preventDefault();
        void submit();
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [props, submit]);

  return (
    <div className="h-full w-full flex flex-col">
      <div className="px-6 py-4 border-b border-border bg-card/60 backdrop-blur">
        <div className="text-base font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground">
          Esc: volver · Enter: confirmar
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full grid min-h-0" style={{ gridTemplateColumns: "1fr 420px" }}>
          <div className="min-h-0 overflow-y-auto p-6">
            <CashCountCloseForm
              mode={props.mode}
              loading={loading}
              error={error}
              cup={cup}
              usd={usd}
              onCup={setCup}
              onUsd={setUsd}
              onSubmit={submit}
              onCancel={props.onClose}
            />
          </div>

          <CashCountCloseSummary mode={props.mode} cup={cup} usd={usd} report={report} />
        </div>
      </div>
    </div>
  );
}
