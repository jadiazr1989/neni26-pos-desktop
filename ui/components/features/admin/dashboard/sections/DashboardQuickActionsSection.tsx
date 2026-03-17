"use client";

import * as React from "react";
import { Package, Plus, Wallet, ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuickAction } from "../ui/QuickAction";

export function DashboardQuickActionsSection(props: { onNav: (path: string) => void }) {
  return (
    <Card className="rounded-2xl border-border/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Acciones rápidas</CardTitle>
        <div className="text-xs text-muted-foreground">
          Atajos operativos para mantener el POS saludable.
        </div>
      </CardHeader>

      <CardContent className="grid gap-2">
        <QuickAction
          icon={Plus}
          title="Crear producto"
          subtitle="Alta rápida en catálogo / variantes"
          meta="Catálogo"
          onClick={() => props.onNav("/admin/products")}
        />

        <QuickAction
          icon={Package}
          title="Ajustar inventario"
          subtitle="Preview → solicitud → aprobación → aplicar"
          meta="Control"
          onClick={() => props.onNav("/admin/adjustments")}
        />

        <QuickAction
          icon={Wallet}
          title="Caja"
          subtitle="Sesiones, cierres X/Z y arqueos"
          meta="Cash"
          onClick={() => props.onNav("/admin/reports")}
        />

        <QuickAction
          icon={ClipboardList}
          title="Compras"
          subtitle="Órdenes abiertas / recepciones"
          meta="Supply"
          onClick={() => props.onNav("/admin/purchases")}
        />
      </CardContent>
    </Card>
  );
}