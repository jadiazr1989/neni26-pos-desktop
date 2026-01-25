// src/modules/catalog/products/ui/hooks/useProductDetailScreen.ts
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import type { ProductVariantDTO } from "@/lib/modules/catalog/products/product.dto";
import { useProductDetail } from "../hooks/useProductDetail";
import { productService } from "@/lib/modules/catalog/products/product.service";
import { notify } from "@/lib/notify/notify";
import { isApiHttpError } from "@/lib/api/envelope";
import { useVariantControls } from "./useVariantControls";

type VariantDialogMode = "create" | "edit";

type PendingActive = {
  id: string;
  label: string;
  nextActive: boolean;
};

function errMsg(e: unknown) {
  return isApiHttpError(e) ? e.message : e instanceof Error ? e.message : "Ocurrió un error inesperado.";
}

export function useProductDetailScreen(productId: string) {
  const router = useRouter();
  const d = useProductDetail(productId);

  const product = d.product;
  const loading = d.state === "loading";
  const variants = product?.variants ?? [];

  // dialogs
  const [dlgOpen, setDlgOpen] = React.useState(false);
  const [dlgMode, setDlgMode] = React.useState<VariantDialogMode>("create");
  const [selected, setSelected] = React.useState<ProductVariantDTO | null>(null);

  // confirm active
  const [confirmActive, setConfirmActive] = React.useState<PendingActive | null>(null);
  const [toggling, setToggling] = React.useState(false);

  // controls
  const controls = useVariantControls(variants);

  const reload = React.useCallback(
    async (showToast?: boolean) => {
      try {
        await d.load();
        if (showToast) notify.success({ title: "Actualizado", description: "Datos refrescados." });
      } catch (e: unknown) {
        notify.error({ title: "Error", description: errMsg(e) });
      }
    },
    [d]
  );

  const goBack = React.useCallback(() => {
    router.push("/admin/products");
  }, [router]);

  const openCreate = React.useCallback(() => {
    setDlgMode("create");
    setSelected(null);
    setDlgOpen(true);
  }, []);

  const openEdit = React.useCallback((v: ProductVariantDTO) => {
    setDlgMode("edit");
    setSelected(v);
    setDlgOpen(true);
  }, []);

  const onOpenChangeDialog = React.useCallback((v: boolean) => {
    setDlgOpen(v);
    if (!v) setSelected(null);
  }, []);

  // paso 1 (tabla) => abre confirm
  const requestToggleActive = React.useCallback((v: ProductVariantDTO, nextActive: boolean) => {
    const label = v.title?.trim() ? `${v.title} (${v.sku})` : v.sku;
    setConfirmActive({ id: v.id, label, nextActive });
  }, []);

  // paso 2 confirm
  const confirmToggleActive = React.useCallback(async () => {
    if (!confirmActive || toggling) return;

    setToggling(true);
    try {
      await productService.setVariantActive(confirmActive.id, confirmActive.nextActive);

      notify.success({
        title: confirmActive.nextActive ? "Variante activada" : "Variante desactivada",
        description: confirmActive.label,
      });

      await reload(false);
    } catch (e: unknown) {
      notify.error({ title: "Error", description: errMsg(e) });
    } finally {
      setToggling(false);
      setConfirmActive(null);
    }
  }, [confirmActive, toggling, reload]);

  const onCancelConfirmActive = React.useCallback(() => setConfirmActive(null), []);

  const onSavedVariant = React.useCallback(async () => {
    notify.success({
      title: dlgMode === "create" ? "Variante creada" : "Variante actualizada",
      description: "Cambios guardados correctamente.",
    });
    await reload(false);
  }, [dlgMode, reload]);

  return {
    // router actions
    goBack,

    // data
    d,
    product,
    productId,
    loading,

    // controls
    controls,

    // table wiring
    openEdit,
    requestToggleActive,

    // dialogs
    dlgOpen,
    dlgMode,
    selected,
    openCreate,
    onOpenChangeDialog,
    onSavedVariant,

    // confirm
    confirmActive,
    toggling,
    confirmToggleActive,
    onCancelConfirmActive,

    // refresh
    reload,
  };
}
