// ui/components/features/admin/dashboard/ui/AdminQuickActions.tsx
"use client";

import { JSX } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Boxes, ClipboardList, FileText, Plus, Settings, Wallet } from "lucide-react";

export function AdminQuickActions(props: {
  onCreateProduct: () => void;
  onInventory: () => void;
  onSales: () => void;
  onCash: () => void;
  onReports: () => void;
  onSettings: () => void;
}): JSX.Element {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Acciones rápidas</CardTitle>
        <p className="text-xs text-muted-foreground">
          Lo esencial del admin: productos, inventario, caja, reportes.
        </p>
      </CardHeader>

      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <ActionBtn label="Crear producto" icon={<Plus className="size-4" />} onClick={props.onCreateProduct} emphasis />
        <ActionBtn label="Inventario" icon={<Boxes className="size-4" />} onClick={props.onInventory} />
        <ActionBtn label="Ventas" icon={<ClipboardList className="size-4" />} onClick={props.onSales} />
        <ActionBtn label="Caja" icon={<Wallet className="size-4" />} onClick={props.onCash} />
        <ActionBtn label="Reportes" icon={<FileText className="size-4" />} onClick={props.onReports} />
        <ActionBtn label="Configuración" icon={<Settings className="size-4" />} onClick={props.onSettings} />
      </CardContent>
    </Card>
  );
}

function ActionBtn(props: { label: string; icon: JSX.Element; onClick: () => void; emphasis?: boolean }) {
  return (
    <Button
      type="button"
      onClick={props.onClick}
      className={[
        "h-12 justify-start gap-3 rounded-2xl",
        props.emphasis ? "ring-2 ring-[color:var(--warning)]/30" : "",
      ].join(" ")}
      variant={props.emphasis ? "default" : "secondary"}
    >
      {props.icon}
      {props.label}
    </Button>
  );
}
