"use client";

import { RefreshCw } from "lucide-react";
import * as React from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AdminCashSessionsTable } from "./ui/AdminCashSessionsTable";
import { AdminReportsFilter } from "./ui/AdminReportsFilter";
import { AdminReportsOverviewPanel } from "./ui/AdminReportsOverviewPanel"; // placeholder panel (abajo)

import { useAdminReportsQuery } from "./hooks/useAdminReportsQuery";

type TabKey = "overview" | "sessions";

export function AdminCashReportsScreen() {
    const [tab, setTab] = React.useState<TabKey>("overview");
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const q = useAdminReportsQuery({ setLoading });

    // load inicial (1 solo lugar)
    React.useEffect(() => {
        void (async () => {
            setError(null);
            try {
                await q.refreshAll();
            } catch (e: unknown) {
                setError(e instanceof Error ? e.message : "Unexpected error");
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onRefresh = React.useCallback(async () => {
        setError(null);
        try {
            await q.refreshAll();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Unexpected error");
        }
    }, [q]);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                    <h1 className="text-2xl font-semibold truncate">Reportes de Caja</h1>
                    <p className=" text-muted-foreground truncate">
                        Resumen y sesiones de caja (Z)
                    </p>

                </div>

                <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => void onRefresh()} disabled={loading} className="h-10 px-4 ">
                        <RefreshCw className="mr-2 size-5" />
                        Actualizar
                    </Button>

                </div>
            </div>

            {/* Error arriba */}
            {error ? (
                <Alert>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            ) : null}

            {/* Global filters */}
            <Card>

                <CardContent className="space-y-3">
                    <AdminReportsFilter
                        loading={loading}
                        warehouseOptions={q.warehouseOptions}
                        terminalOptions={q.terminalOptions}
                        warehouseId={q.draft.warehouseId}
                        terminalId={q.draft.terminalId}
                        status={q.draft.status}
                        preset={q.draft.preset}
                        from={q.draft.from}
                        to={q.draft.to}
                        onWarehouseChange={q.setWarehouseId}
                        onTerminalChange={q.setTerminalId}
                        onStatusChange={q.setStatus}
                        onPresetChange={q.setPreset}
                        onFromChange={q.setFrom}
                        onToChange={q.setTo}
                        onClear={() => q.clearDraft()}
                        onApply={() => void q.apply()}
                    />

                </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)} className="space-y-3">
                <TabsList className="h-10">
                    <TabsTrigger value="overview" className=" px-4">Resumen</TabsTrigger>
                    <TabsTrigger value="sessions" className=" px-4">Sesiones de caja</TabsTrigger>
                </TabsList>


                <TabsContent value="overview">
                    <AdminReportsOverviewPanel
                        loading={q.loadingOverview}
                        overview={q.overview}
                        dailyRows={q.dailyRows}
                    />
                </TabsContent>

                <TabsContent value="sessions">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="">Sesiones de Caja</CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-3">
                            <AdminCashSessionsTable
                                rows={q.list?.items ?? []}
                                loading={q.loadingList || q.loadingNext}
                                hasMore={Boolean(q.list?.nextCursor)}
                                loadMore={() => void q.loadNextPage()}
                                onOpen={q.onOpen} // ✅ hook decide la ruta
                                height={560}
                            />

                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

        </div>
    );
}
