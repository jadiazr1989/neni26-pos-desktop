// src/modules/admin/dashboard/sections/DashboardAttentionSection.tsx
"use client";

import * as React from "react";
import { AlertTriangle, Boxes, ClipboardList, ShoppingCart } from "lucide-react";
import type { AdminDashboardDataV2 } from "@/lib/modules/admin/dashboard/admin-dashboard.dto";
import { MiniAlert } from "../ui/MiniAlert";

export function DashboardAttentionSection(props: {
  data: AdminDashboardDataV2 | null;
  onNav: (path: string) => void;
}) {
  const d = props.data;

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <MiniAlert
        icon={Boxes}
        title="Stock bajo"
        value={d?.inventory.kpis.lowStockCount ?? 0}
        hint="Variantes por debajo del umbral"
        onClick={() => props.onNav("/admin/inventory")}
      />

      <MiniAlert
        icon={AlertTriangle}
        title="Ajustes pendientes"
        value={d?.adjustments.pendingCount ?? 0}
        hint="Solicitudes en espera de aprobación"
        onClick={() => props.onNav("/admin/adjustments")}
      />

      <MiniAlert
        icon={ShoppingCart}
        title="Compras ordenadas"
        value={d?.purchases.orderedCount ?? 0}
        hint="Órdenes pendientes de recepción"
        onClick={() => props.onNav("/admin/purchases?status=ORDERED")}
      />

      <MiniAlert
        icon={ClipboardList}
        title="Compras en borrador"
        value={d?.purchases.draftCount ?? 0}
        hint="Pendientes de confirmación"
        onClick={() => props.onNav("/admin/purchases?status=DRAFT")}
      />
    </div>
  );
}