"use client";

import { ArrowLeft, Download, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useAdminCashSessionDetail } from "./hooks/useAdminCashSessionDetail";
import { formatMoneyBaseMinor } from "@/lib/utils";

export function AdminCashReportsDetailsScreen(props: { cashSessionId: string }) {
  const router = useRouter();
  const vm = useAdminCashSessionDetail();

  React.useEffect(() => {
    void vm.show(props.cashSessionId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.cashSessionId]);

  const title = vm.detail?.cashSession?.terminalName
    ? `Sesión de caja — ${vm.detail.cashSession.terminalName}`
    : "Sesión de caja";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()} title="Volver">
              <ArrowLeft className="size-4" />
            </Button>
            <h1 className="text-xl font-semibold truncate">{title}</h1>
          </div>

          <div className="text-sm text-muted-foreground">
            ID: <span className="font-mono text-xs">{props.cashSessionId}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" disabled={vm.loading} onClick={() => void vm.show(props.cashSessionId)}>
            <RefreshCw className="mr-2 size-4" />
            Refrescar
          </Button>

          <Button
            variant="outline"
            disabled={!vm.detail || vm.exportingCsv}
            onClick={() => void vm.downloadCsv()}
            title="Descargar reporte en CSV"
          >
            <Download className="mr-2 size-4" />
            CSV
          </Button>

          <Button
            variant="outline"
            disabled={!vm.detail || vm.exportingPdf}
            onClick={() => void vm.downloadPdf()}
            title="Descargar reporte en PDF"
          >
            <Download className="mr-2 size-4" />
            PDF
          </Button>
        </div>
      </div>

      {!vm.detail && vm.loading ? (
        <Alert>
          <AlertDescription>Cargando detalle…</AlertDescription>
        </Alert>
      ) : null}

      {!vm.detail && !vm.loading ? (
        <Alert>
          <AlertDescription>No se pudo cargar el detalle.</AlertDescription>
        </Alert>
      ) : null}

      {vm.detail ? (
        <div className="grid grid-cols-12 gap-3">
          {/* Sesión */}
          <Card className="col-span-12 lg:col-span-5">
            <CardHeader className="pb-2">
              <CardTitle>Sesión</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row label="Almacén" value={vm.detail.cashSession.warehouseName} />
              <Row label="POS" value={vm.detail.cashSession.terminalName ?? "—"} />
              <Row label="Apertura" value={fmtDate(vm.detail.cashSession.openedAt)} />
              <Row
                label="Cierre"
                value={vm.detail.cashSession.closedAt ? fmtDate(vm.detail.cashSession.closedAt) : "ABIERTA"}
              />
              <Row label="Z firmado" value={vm.detail.zArtifact ? "Sí" : "No"} />
              {vm.detail.zArtifact ? (
                <>
                  <Row label="Hash" value={vm.detail.zArtifact.reportHash} mono />
                  <Row label="Hash anterior" value={vm.detail.zArtifact.previousHash ?? "—"} mono />
                </>
              ) : null}
            </CardContent>
          </Card>

          {/* Reporte X (KPIs) */}
          <Card className="col-span-12 lg:col-span-7">
            <CardHeader className="pb-2">
              <CardTitle>Reporte X (en vivo)</CardTitle>
              <div className="text-xs text-muted-foreground">
                Resumen operativo de la sesión (ventas, efectivo, devoluciones y gastos).
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <KpiMini title="Tickets" value={String(vm.detail.xReport.summary.ticketsCount)} hint="Cantidad de ventas" />

                <KpiMini
                  title="Ventas brutas"
                  value={formatMoneyBaseMinor(vm.detail.xReport.summary.grossSalesMinor)}
                  hint="Total antes de devoluciones/gastos"
                />

                <KpiMini
                  title="Ventas en efectivo"
                  value={formatMoneyBaseMinor(vm.detail.xReport.summary.cashSalesMinor)}
                  hint="Pagos en efectivo"
                />

                <KpiMini
                  title="Devoluciones"
                  value={formatMoneyBaseMinor(vm.detail.xReport.summary.refundsMinor)}
                  hint="Reembolsos realizados"
                  tone="warning"
                />

                <KpiMini
                  title="Gastos"
                  value={formatMoneyBaseMinor(vm.detail.xReport.summary.expensesMinor)}
                  hint="Salidas registradas"
                  tone="warning"
                />

                <KpiMini
                  title="Efectivo neto"
                  value={formatMoneyBaseMinor(vm.detail.xReport.summary.netCashMinor)}
                  hint="Efectivo final (neto)"
                  tone="success"
                />
              </div>
            </CardContent>
          </Card>

          {/* Conteos */}
          <Card className="col-span-12">
            <CardHeader className="pb-2">
              <CardTitle>Conteos</CardTitle>
              <div className="text-xs text-muted-foreground">
                Comparación por moneda: inicial vs esperado vs contado, con diferencia final.
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-12 border-b pb-2 text-xs text-muted-foreground">
                <div className="col-span-2">Moneda</div>
                <div className="col-span-2 text-right">Inicial</div>
                <div className="col-span-3 text-right">Esperado</div>
                <div className="col-span-3 text-right">Contado</div>
                <div className="col-span-2 text-right">Diferencia</div>
              </div>

              <div className="divide-y">
                {vm.detail.xReport.counts.map((c) => {
                  const diffTone =
                    c.diffMinor === 0
                      ? "text-muted-foreground"
                      : c.diffMinor > 0
                        ? "text-emerald-600"
                        : "text-red-600";

                  return (
                    <div key={c.currency} className="grid grid-cols-12 py-2 text-sm">
                      <div className="col-span-2 font-medium">{c.currency}</div>
                      <div className="col-span-2 text-right">{formatMoneyBaseMinor(c.openingMinor)}</div>
                      <div className="col-span-3 text-right">{formatMoneyBaseMinor(c.expectedMinor)}</div>
                      <div className="col-span-3 text-right">{formatMoneyBaseMinor(c.countedMinor)}</div>
                      <div className={`col-span-2 text-right font-mono ${diffTone}`}>
                        {formatMoneyBaseMinor(c.diffMinor)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

function Row(props: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-muted-foreground">{props.label}</div>
      <div className={props.mono ? "max-w-[70%] truncate font-mono text-xs" : "max-w-[70%] truncate"}>
        {props.value}
      </div>
    </div>
  );
}

function KpiMini(props: {
  title: string;
  value: string;
  hint: string;
  tone?: "default" | "success" | "warning";
}) {
  const ring =
    props.tone === "success"
      ? "ring-1 ring-emerald-500/20"
      : props.tone === "warning"
        ? "ring-1 ring-amber-500/25"
        : "ring-1 ring-border/60";

  return (
    <div className={`rounded-2xl bg-card p-4 ${ring}`}>
      <div className="text-xs text-muted-foreground">{props.title}</div>
      <div className="mt-1 text-xl font-semibold tabular-nums">{props.value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{props.hint}</div>
    </div>
  );
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" });
}
