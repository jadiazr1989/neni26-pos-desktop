// src/modules/catalog/products/ui/ProductDetailScreen.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, RefreshCw } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { ProductVariantDTO } from "@/lib/modules/catalog/products/product.dto";
import { useProductDetail } from "./hooks/useProductDetail";
import { VariantsTable } from "./ui/VariantsTable";
import { VariantDialog } from "./ui/VariantDialog";

import { notify } from "@/lib/notify/notify";
import { isApiHttpError } from "@/lib/api/envelope";

type VariantDialogMode = "create" | "edit";

export function ProductDetailScreen(props: { productId: string }) {
  const router = useRouter();
  const d = useProductDetail(props.productId);

  const [dlgOpen, setDlgOpen] = React.useState(false);
  const [dlgMode, setDlgMode] = React.useState<VariantDialogMode>("create");
  const [selected, setSelected] = React.useState<ProductVariantDTO | null>(null);

  const product = d.product;
  const loading = d.state === "loading";

  async function reload(showToast?: boolean) {
    try {
      await d.load();
      if (showToast) notify.success({ title: "Actualizado", description: "Datos refrescados." });
    } catch (e: unknown) {
      const msg = isApiHttpError(e) ? e.message : e instanceof Error ? e.message : "No se pudo cargar el producto.";
      notify.error({ title: "Error", description: msg });
      // si tu hook ya setea d.error, no necesitas hacer nada más
    }
  }

  function openCreate() {
    setDlgMode("create");
    setSelected(null);
    setDlgOpen(true);
  }

  function openEdit(v: ProductVariantDTO) {
    setDlgMode("edit");
    setSelected(v);
    setDlgOpen(true);
  }

  function closeDialog(v: boolean) {
    setDlgOpen(v);
    if (!v) setSelected(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push("/admin/products")} title="Volver">
              <ArrowLeft className="size-4" />
            </Button>
            <h1 className="text-xl font-semibold">{product?.name ?? "Producto"}</h1>
          </div>

          <p className="text-sm text-muted-foreground">
            ID: <span className="font-mono text-xs">{props.productId}</span>
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => void reload(true)} disabled={loading}>
            <RefreshCw className="mr-2 size-4" />
            Refrescar
          </Button>

          <Button onClick={openCreate} disabled={!product || loading} variant="outline">
            <Plus className="mr-2 size-4" />
            Nueva variante
          </Button>
        </div>
      </div>

      {d.error && (
        <Alert>
          <AlertDescription>{d.error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Variantes</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <VariantsTable
            rows={product?.variants ?? []}
            loading={loading}
            onEdit={openEdit}
            onChanged={async () => {
              await reload(false);
            }}
          />
        </CardContent>
      </Card>

      <VariantDialog
        open={dlgOpen}
        mode={dlgMode}
        productId={props.productId}
        initial={selected}
        onOpenChange={closeDialog}
        onSaved={async () => {
          notify.success({
            title: dlgMode === "create" ? "Variante creada" : "Variante actualizada",
            description: "Cambios guardados correctamente.",
          });
          await reload(false);
        }}
      />
    </div>
  );
}
