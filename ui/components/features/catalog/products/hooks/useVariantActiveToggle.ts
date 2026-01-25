"use client";

import * as React from "react";
import type { ProductVariantDTO } from "@/lib/modules/catalog/products/product.dto";
import type { VariantFilter } from "./useVariantControls";

type PendingActive = {
  id: string;
  label: string;
  nextActive: boolean;
};

export function useVariantActiveToggle(opts: {
  // DI: así puedes testear y no acoplas al service
  setActive: (variantId: string, active: boolean) => Promise<void>;
  reload: () => Promise<void>;
  toast: {
    success: (p: { title: string; description?: string }) => void;
    error: (p: { title: string; description?: string }) => void;
  };
  getErrorMessage: (e: unknown) => string;
}) {
  const [pending, setPending] = React.useState<PendingActive | null>(null);
  const [busy, setBusy] = React.useState(false);

  const request = React.useCallback((v: ProductVariantDTO, nextActive: boolean) => {
    const label = v.title?.trim() ? `${v.title} (${v.sku})` : v.sku;
    setPending({ id: v.id, label, nextActive });
  }, []);

  const confirm = React.useCallback(async () => {
    if (!pending) return;
    if (busy) return;

    setBusy(true);
    try {
      await opts.setActive(pending.id, pending.nextActive);

      opts.toast.success({
        title: pending.nextActive ? "Variante activada" : "Variante desactivada",
        description: pending.label,
      });

      await opts.reload();
    } catch (e: unknown) {
      opts.toast.error({ title: "Error", description: opts.getErrorMessage(e) });
    } finally {
      setBusy(false);
      setPending(null);
    }
  }, [pending, busy, opts]);

  const close = React.useCallback(() => setPending(null), []);

  return {
    pending,
    busy,
    request,
    confirm,
    close,
  };
}
