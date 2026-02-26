// src/modules/admin/dashboard/sections/DashboardPaymentsSection.tsx
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SectionTitle } from "../ui/SectionTitle";
import { PaymentsTable } from "../ui/PaymentsTable";
import { EmptyBlock } from "../ui/EmptyBlock";
import { normalizeRangeLabelShort } from "../utils/rangeLabelShort";

type PaymentMethodCode = "CASH" | "CARD" | "TRANSFER" | "OTHER";

export function DashboardPaymentsSection(props: {
  loading: boolean;
  rangeLabelShort: string;
  rows: Array<{ method: PaymentMethodCode; count: number; pctBps: number; amountBaseMinor: string }>;
}) {
  return (
    <Card className="rounded-xl border-border/60">
      <CardHeader className="pb-2">
        <SectionTitle title={`Mix de pagos · ${normalizeRangeLabelShort(props.rangeLabelShort)}`} subtitle="Resumen rápido" />
      </CardHeader>
      <CardContent className="px-4 py-4">
        {props.loading ? (
          <EmptyBlock loading label="Cargando pagos..." />
        ) : (
          <PaymentsTable loading={false} rows={props.rows} />
        )}
      </CardContent>
    </Card>
  );
}