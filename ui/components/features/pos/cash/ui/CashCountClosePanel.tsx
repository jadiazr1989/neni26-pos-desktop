"use client";

import type { JSX } from "react";
import * as React from "react";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { buildCounted } from "../utils";
import { CashCountCloseForm } from "./CashCountCloseForm";
import { CashCountCloseSummary } from "./CashCountCloseSummary";
import type { CashCounted, CashCountReportDTO, CashMode } from "@/lib/modules/cash/cash.dto";

export function CashCountClosePanel(props: {
  mode: CashMode;
  onClose: () => void;
  onCount: (counted: CashCounted) => Promise<{ report: CashCountReportDTO }>;
  onCloseCash: (counted: CashCounted) => Promise<void>;
}): JSX.Element {
  const [cup, setCup] = React.useState("0");
  const [usd, setUsd] = React.useState("0");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [report, setReport] = React.useState<CashCountReportDTO | null>(null);
  const [confirmCloseOpen, setConfirmCloseOpen] = React.useState(false);

  const title = props.mode === "COUNT" ? "Arqueo de caja" : "Cierre de caja";

  const run = React.useCallback(async () => {

    if (loading) {
      return;
    }

    const { counted: rebuilt, error: err } = buildCounted(cup, usd);
    if (err) {
      setError(err);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      if (props.mode === "COUNT") {
        const resp = await props.onCount(rebuilt);
        setReport(resp.report);
        return;
      }

      await props.onCloseCash(rebuilt);
      props.onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo completar la operación.");
    } finally {
      setLoading(false);
    }
  }, [cup, usd, loading, props.mode, props.onClose, props.onCloseCash, props.onCount]);

  const submit = React.useCallback(() => {

    if (props.mode === "CLOSE") {
      setConfirmCloseOpen(true);
      return;
    }
    void run();
  }, [props.mode, run]);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        props.onClose();
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (props.mode === "CLOSE" && !e.ctrlKey) return;
        void submit();
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [props.mode, props.onClose, submit]);

  return (
    <div className="h-full w-full flex flex-col">
      <div className="px-6 py-4 border-b border-border bg-card/60 backdrop-blur">
        <div className="font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground">Esc: volver · Enter: confirmar · (CLOSE: Ctrl+Enter)</div>
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

      <ConfirmDialog
        open={confirmCloseOpen}
        onOpenChange={setConfirmCloseOpen}
        title="Cerrar caja (Z)"
        description="Vas a cerrar caja y generar Z. ¿Continuar?"
        confirmText="Cerrar caja"
        cancelText="Cancelar"
        destructive
        busy={loading}
        onConfirm={async () => {
          setConfirmCloseOpen(false);
          await run();
        }}
      />
    </div>
  );
}
