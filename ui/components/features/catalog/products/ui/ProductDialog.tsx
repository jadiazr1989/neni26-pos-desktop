"use client";

import * as React from "react";
import type { ProductDTO, VariantUnit } from "@/lib/modules/catalog/products/product.dto";
import { productService } from "@/lib/modules/catalog/products/product.service";
import { submitProduct, type ProductServicePort } from "@/lib/modules/catalog/products/product.submit";
import { useBrandOptions } from "../hooks/useBrandOptions";
import { useCategoryOptions } from "../hooks/useCategoryOptions";
import { useProductForm } from "../hooks/useProductForm";
import { ProductDialogView } from "./ui/ProductDialog.view";
import { isApiHttpError } from "@/lib/api/envelope";
import { notify } from "@/lib/notify/notify";

export function ProductDialog(props: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: ProductDTO | null;
  onSaved: (productId: string) => Promise<void> | void;
  service?: ProductServicePort;
}) {
  const mode = props.initial ? "edit" : "create";
  const service = props.service ?? productService;

  const [submitting, setSubmitting] = React.useState(false);

  const brands = useBrandOptions({ take: 50 });
  const categories = useCategoryOptions({ take: 50 });

  const form = useProductForm({ open: props.open, initial: props.initial, mode });

  async function onSubmit() {
    form.setError(null);

    const v = form.validate();
    if (!v.ok) {
      notify.warning({ title: "Revisa el formulario", description: v.error });
      form.setError(v.error);
      return;
    }

    setSubmitting(true);
    try {
      const out = await submitProduct({
        mode,
        productId: mode === "edit" ? props.initial!.id : null,
        value: v.value,
        service,
      });

      notify.success({
        title: mode === "create" ? "Producto creado" : "Producto actualizado",
        description: `ID: ${out.productId}`,
      });

      await props.onSaved(out.productId);
      props.onOpenChange(false);
    } catch (e: unknown) {
      if (isApiHttpError(e)) {
        // 409 = conflicto de negocio (friendly warning)
        if (e.status === 409) {
          notify.warning({ title: "No se pudo guardar", description: e.message });
          form.setError(e.message);
          return;
        }

        // resto = error real
        notify.error({ title: "Error guardando producto", description: e.message });
        form.setError(e.message);
        return;
      }

      const msg = e instanceof Error ? e.message : "No se pudo guardar el producto.";
      notify.error({ title: "Error guardando producto", description: msg });
      form.setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ProductDialogView
      open={props.open}
      onOpenChange={props.onOpenChange}
      title={mode === "create" ? "Nuevo producto" : "Editar producto"}
      submitting={submitting}
      error={form.error}
      mode={mode}
      name={form.state.name}
      barcode={form.state.barcode}
      description={form.state.description}
      brandId={form.state.brandId}
      categoryId={form.state.categoryId}
      baseUnit={form.state.baseUnit}
      onNameChange={(x) => form.patch({ name: x })}
      onBarcodeChange={(x) => form.patch({ barcode: x })}
      onDescriptionChange={(x) => form.patch({ description: x })}
      onBrandChange={(x) => form.patch({ brandId: x })}
      onCategoryChange={(x) => form.patch({ categoryId: x })}
      onBaseUnitChange={(u: VariantUnit) => form.patch({ baseUnit: u })}
      onSubmit={() => void onSubmit()}
      brandOptions={{
        loadState: brands.loadState,
        loadError: brands.loadError,
        items: brands.items.map((b) => ({ value: b.id, label: b.name })),
        search: brands.search,
        setSearch: brands.setSearch,
        ensureLoaded: brands.ensureLoaded,
      }}
      categoryOptions={{
        loadState: categories.loadState,
        loadError: categories.loadError,
        items: categories.items.map((c) => ({ value: c.id, label: c.slugPath ?? c.name })),
        search: categories.search,
        setSearch: categories.setSearch,
        ensureLoaded: categories.ensureLoaded,
      }}
    />
  );
}
