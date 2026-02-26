// src/modules/admin/dashboard/sections/DashboardCashSection.tsx
"use client";

import * as React from "react";
import { Receipt } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { AdminDashboardDataV2 } from "@/lib/modules/admin/dashboard/admin-dashboard.dto";
import { EmptyBlock } from "../ui/EmptyBlock";
import { SectionTitle } from "../ui/SectionTitle";
import { RowKV2 } from "../ui/RowKV2";
import { normalizeRangeLabelShort } from "../utils/rangeLabelShort";

export function DashboardCashSection(props: {
  data: AdminDashboardDataV2 | null;
  loading: boolean;
  money: (s: string) => string;
  rangeLabelShort: string;
}) {
  const d = props.data;

  return (
    <Card className="rounded-xl border-border/60">
      <CardHeader className="pb-2">
        <SectionTitle title={`Caja · ${normalizeRangeLabelShort(props.rangeLabelShort)}`} subtitle="Resumen rápido" />
      </CardHeader>
      <CardContent className="px-4 py-3">
        {!d ? (
          <EmptyBlock loading={props.loading} label="Cargando caja..." />
        ) : (
          <div className="rounded-md border border-border/60 px-3">
            <RowKV2
              left={
                <div className="flex items-center gap-2">
                  <Receipt className="size-4 text-muted-foreground" />
                  Sesión activa
                </div>
              }
              right={d.cash.hasActiveSession ? "Sí" : "No"}
            />
            <RowKV2 left="Neto del período" right={props.money(d.cash.netCashBaseMinor)} />
            <RowKV2 left="Ventas en efectivo" right={props.money(d.cash.cashSalesBaseMinor)} />
            <RowKV2 left="Devoluciones en efectivo" right={props.money(d.cash.cashRefundsBaseMinor)} />
            <RowKV2 left="Gastos" right={props.money(d.cash.expensesBaseMinor)} last />
          </div>
        )}
      </CardContent>
    </Card>
  );
}