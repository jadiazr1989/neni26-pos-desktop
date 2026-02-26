// src/modules/admin/reports/hooks/useAdminCashSessionDetail.ts
"use client";

import * as React from "react";
import { notify } from "@/lib/notify/notify";
import { adminReportsService } from "@/lib/modules/admin/reports";
import { cashService } from "@/lib/modules/cash/cash.service";
import type { CashSessionAdminDetailDTO } from "@/lib/modules/admin/reports";

type Opts = {
  onLoaded?: (detail: CashSessionAdminDetailDTO) => void;
};

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : "Unexpected error";
}

export function useAdminCashSessionDetail(opts: Opts = {}) {
  const [cashSessionId, setCashSessionId] = React.useState<string | null>(null);

  const [loading, setLoading] = React.useState(false);
  const [detail, setDetail] = React.useState<CashSessionAdminDetailDTO | null>(null);

  const [exportingCsv, setExportingCsv] = React.useState(false);
  const [exportingPdf, setExportingPdf] = React.useState(false);

  // token cancel-by-staleness
  const tokenRef = React.useRef(0);

  const show = React.useCallback(
    async (id: string) => {
      const clean = String(id ?? "").trim();
      if (!clean) return;

      setCashSessionId(clean);
      setDetail(null);

      const myToken = ++tokenRef.current;

      setLoading(true);
      try {
        // ✅ Debe devolver CashSessionAdminDetailDTO con usersById/operators incluidos
        const d = await adminReportsService.cashSessionDetail(clean);
        if (myToken !== tokenRef.current) return;

        setDetail(d);
        opts.onLoaded?.(d);
      } catch (e: unknown) {
        if (myToken !== tokenRef.current) return;
        notify.error({ title: "Error cargando detalle", description: errMsg(e) });
      } finally {
        if (myToken === tokenRef.current) setLoading(false);
      }
    },
    [opts]
  );

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
      notify.error({ title: "No se pudo exportar CSV", description: errMsg(e) });
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
      notify.error({ title: "No se pudo exportar PDF", description: errMsg(e) });
    } finally {
      setExportingPdf(false);
    }
  }, [cashSessionId, exportingPdf]);

  return {
    detail,
    cashSessionId,
    loading,

    show,

    exportingCsv,
    exportingPdf,
    downloadCsv,
    downloadPdf,
  };
}