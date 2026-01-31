// src/modules/admin/dashboard/ui/charts/DashboardTrendChart.tsx
"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  Bar,
} from "recharts";

import type { TrendDatum } from "./dashboard-trend.types";
import { DashboardTrendTooltip } from "./DashboardTrendTooltip";

export function DashboardTrendChart(props: { data: TrendDatum[] }) {
  const { data } = props;

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.4} />

          <XAxis dataKey="date" tickMargin={8} />
          <YAxis yAxisId="left" tickMargin={8} />
          <YAxis yAxisId="right" orientation="right" tickMargin={8} />

          <Tooltip content={<DashboardTrendTooltip />} />

          {/* 🟡 Tickets (actividad) */}
          <Bar
            yAxisId="right"
            dataKey="tickets"
            fill="hsl(var(--accent))"
            radius={[6, 6, 0, 0]}
          />

          {/* 🟢 Ventas netas */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="netBaseMinor"
            stroke="hsl(var(--success))"
            strokeWidth={2.5}
            dot={false}
          />
        </ComposedChart>

      </ResponsiveContainer>
    </div>
  );
}
