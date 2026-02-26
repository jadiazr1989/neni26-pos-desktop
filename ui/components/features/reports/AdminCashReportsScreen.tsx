"use client";

import * as React from "react";
import { RefreshCw } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AdminCashSessionsTable } from "./ui/AdminCashSessionsTable";
import { AdminReportsFilter } from "./ui/AdminReportsFilter";
import { AdminReportsOverviewPanel } from "./ui/AdminReportsOverviewPanel";
import { useAdminReportsQuery } from "./hooks/useAdminReportsQuery";

type TabKey = "overview" | "sessions";

export function AdminCashReportsScreen() {
    const [tab, setTab] = React.useState<TabKey>("overview");
    const [error, setError] = React.useState<string | null>(null);

    const q = useAdminReportsQuery({ tab });

    const loading = q.loadingOverview || q.loadingAlerts || q.loadingList || q.loadingNext;
    const showStatus = tab === "sessions";

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
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                    <h1 className="text-2xl font-semibold truncate">Reportes de Caja</h1>
                    <p className="text-muted-foreground truncate">Resumen (LIVE) y sesiones (Z)</p>
                </div>

                <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => void onRefresh()} disabled={loading} className="h-10 px-4">
                        <RefreshCw className="mr-2 size-5" />
                        Actualizar
                    </Button>
                </div>
            </div>

            {error ? (
                <Alert>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            ) : null}

            <Card>
                <CardContent className="space-y-3">
                    <AdminReportsFilter
                        loading={loading}
                        warehouseOptions={q.warehouseOptions}
                        terminalOptions={q.terminalOptions}
                        warehouseId={q.filters.warehouseId}
                        terminalId={q.filters.terminalId}
                        preset={q.filters.preset}
                        from={q.filters.from}
                        to={q.filters.to}
                        onWarehouseChange={q.setWarehouseId}
                        onTerminalChange={q.setTerminalId}
                        onPresetChange={q.setPreset}
                        onFromChange={q.setFrom}
                        onToChange={q.setTo}
                        onClear={q.clearFilters}
                        // ✅ sessions-only
                        showStatus={showStatus}
                        status={q.sessionStatus}
                        onStatusChange={q.setSessionStatus}
                    />
                </CardContent>
            </Card>

            <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)} className="space-y-3">
                <TabsList className="h-10">
                    <TabsTrigger value="overview" className="px-4">
                        Resumen
                    </TabsTrigger>
                    <TabsTrigger value="sessions" className="px-4">
                        Sesiones de caja
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <AdminReportsOverviewPanel
                        loading={q.loadingOverview}
                        overview={q.overview}
                        dailyRows={q.dailyRows}
                        alerts={q.alerts}
                    />
                </TabsContent>

                <TabsContent value="sessions">
                    <Card>
                        <CardContent className="space-y-3 pt-6">
                            <AdminCashSessionsTable
                                rows={q.list?.items ?? []}
                                loading={q.loadingList || q.loadingNext}
                                hasMore={Boolean(q.list?.nextCursor)}
                                loadMore={() => void q.loadNextPage()}
                                onOpen={q.onOpen}
                                height={560}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}