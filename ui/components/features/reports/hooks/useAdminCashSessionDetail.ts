"use client";

import * as React from "react";
import { notify } from "@/lib/notify/notify";
import { adminReportsService } from "@/lib/modules/admin/reports";
import { cashService } from "@/lib/modules/cash/cash.service";
import type { CashSessionAdminDetailDTO } from "@/lib/modules/admin/reports";

type Opts = {
  // para refrescar la lista después (opcional)
  onLoaded?: (detail: CashSessionAdminDetailDTO) => void;
};

export function useAdminCashSessionDetail(opts: Opts = {}) {
  const [open, setOpen] = React.useState(false);
  const [cashSessionId, setCashSessionId] = React.useState<string | null>(null);

  const [loading, setLoading] = React.useState(false);
  const [detail, setDetail] = React.useState<CashSessionAdminDetailDTO | null>(null);

  const [exportingCsv, setExportingCsv] = React.useState(false);
  const [exportingPdf, setExportingPdf] = React.useState(false);

  const show = React.useCallback(async (id: string) => {
    if (!id) return;
    if (loading) return;

    setOpen(true);
    setCashSessionId(id);
    setDetail(null);

    setLoading(true);
    try {
      const d = await adminReportsService.cashSessionDetail(id);
      setDetail(d);
      opts.onLoaded?.(d);
    } catch (e: unknown) {
      notify.error({ title: "Error cargando detalle", description: e instanceof Error ? e.message : "Unexpected error" });
    } finally {
      setLoading(false);
    }
  }, [loading, opts]);

  const close = React.useCallback(() => {
    setOpen(false);
    setCashSessionId(null);
    setDetail(null);
  }, []);

  const downloadCsv = React.useCallback(async () => {
    if (!cashSessionId) return;
    if (exportingCsv) return;

    setExportingCsv(true);
    try {
      const csv = await cashService.zReportCsv(cashSessionId, { pretty: true, money: "decimal" });

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `z-report_${cashSessionId}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);

      notify.success({ title: "Export listo", description: "CSV descargado." });
    } catch (e: unknown) {
      notify.error({ title: "No se pudo exportar CSV", description: e instanceof Error ? e.message : "Unexpected error" });
    } finally {
      setExportingCsv(false);
    }
  }, [cashSessionId, exportingCsv]);

  const downloadPdf = React.useCallback(async () => {
    if (!cashSessionId) return;
    if (exportingPdf) return;

    setExportingPdf(true);
    try {
      const pdfBlob = await cashService.zReportPdf(cashSessionId);

      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `z-report_${cashSessionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);

      notify.success({ title: "Export listo", description: "PDF descargado." });
    } catch (e: unknown) {
      notify.error({ title: "No se pudo exportar PDF", description: e instanceof Error ? e.message : "Unexpected error" });
    } finally {
      setExportingPdf(false);
    }
  }, [cashSessionId, exportingPdf]);

  return {
    open,
    detail,
    cashSessionId,
    loading,

    show,
    close,

    exportingCsv,
    exportingPdf,
    downloadCsv,
    downloadPdf,
  };
}
