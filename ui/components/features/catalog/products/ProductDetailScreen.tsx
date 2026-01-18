// src/modules/catalog/products/ui/ProductDetailScreen.tsx
"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import type { ProductVariantDTO } from "@/lib/modules/catalog/products/product.dto";
import { useProductDetail } from "./hooks/useProductDetail";
import { VariantDialog } from "./ui/VariantDialog";
import { VariantsTable } from "./ui/VariantsTable";

export function ProductDetailScreen(props: { productId: string }) {
  const router = useRouter();
  const d = useProductDetail(props.productId);

  const [dlgOpen, setDlgOpen] = React.useState(false);
  const [dlgMode, setDlgMode] = React.useState<"create" | "edit">("create");
  const [selected, setSelected] = React.useState<ProductVariantDTO | null>(null);

  const product = d.product;

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
          <Button variant="secondary" onClick={() => void d.load()} disabled={d.state === "loading"}>
            <RefreshCw className="mr-2 size-4" />
            Refrescar
          </Button>

          <Button
            onClick={() => {
              setDlgMode("create");
              setSelected(null);
              setDlgOpen(true);
            }}
            disabled={!product}
            variant="outline"
          >
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
            loading={d.state === "loading"}
            onEdit={(v) => {
              setDlgMode("edit");
              setSelected(v);
              setDlgOpen(true);
            }}
            onChanged={async () => {
              await d.load();
            }}
          />
        </CardContent>
      </Card>

      <VariantDialog
        open={dlgOpen}
        mode={dlgMode}
        productId={props.productId}
        initial={selected}
        onOpenChange={(v) => {
          setDlgOpen(v);
          if (!v) setSelected(null);
        }}
        onSaved={async () => {
          await d.load();
        }}
      />
    </div>
  );
}
