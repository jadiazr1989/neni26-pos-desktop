// src/modules/purchases/hooks/usePurchaseDetailScreen.ts
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { purchaseService } from "@/lib/modules/purchases/purchase.service";
import type { PurchaseWithItemsDTO } from "@/lib/modules/purchases/purchase.dto";
import { notify } from "@/lib/notify/notify";

import { draftTotals, errDesc, purchaseItemsCount } from "./purchaseDetail.helpers";
import type { PurchaseDetailVm, PurchaseFlags } from "./purchaseDetail.types";
import { usePurchaseItemsEditor } from "./usePurchaseItemsEditor";
import { usePurchaseReceive } from "./usePurchaseReceive";
import { usePurchaseOrderCancel } from "./usePurchaseOrderCancel";

export function usePurchaseDetailScreen(purchaseId: string): PurchaseDetailVm {
  const router = useRouter();

  const [purchase, setPurchase] = React.useState<PurchaseWithItemsDTO | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const goBack = React.useCallback(() => router.back(), [router]);

  const editor = usePurchaseItemsEditor({
    purchaseId,
    purchase,
    setPurchase,
    loading,
    setLoading,
  });

  const receive = usePurchaseReceive({
    purchaseId,
    purchase,
    setPurchase,
    loading,
    setLoading,
    dirty: editor.dirty,
  });

  const order = usePurchaseOrderCancel({
    purchaseId,
    purchase,
    setPurchase,
    setLoading,
  });

  // ✅ stable sync fn (no metas `editor` en deps)
  const syncRef = React.useRef(editor.syncFromPurchase);
  React.useEffect(() => {
    syncRef.current = editor.syncFromPurchase;
  }, [editor.syncFromPurchase]);

  // ✅ evita doble fetch (StrictMode / re-renders)
  const inFlightRef = React.useRef(false);

  const reload = React.useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    setLoading(true);
    setError(null);

    try {
      const p = await purchaseService.getById(purchaseId);
      setPurchase(p);
      syncRef.current(p);
    } catch (e: unknown) {
      const msg = errDesc(e);
      setError(msg);
      notify.error({ title: "No se pudo cargar", description: msg });
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  }, [purchaseId]);

  React.useEffect(() => {
    void reload();
  }, [reload]);

  const flags: PurchaseFlags = React.useMemo(() => {
    const status = purchase?.status ?? "DRAFT";
    const dirty = editor.dirty;

    const live = draftTotals(editor.lines);
    const serverItemsCount = purchaseItemsCount(purchase);

    const itemsCount = status === "DRAFT" ? live.items : serverItemsCount;

    const canSaveItems = status === "DRAFT" && dirty;
    const canOrder = status === "DRAFT" && itemsCount > 0 && !dirty;
    const canReceive = status === "ORDERED" && itemsCount > 0 && !dirty;
    const canCancel = status !== "RECEIVED";
    const showEmptyItemsWarning = (status === "DRAFT" || status === "ORDERED") && itemsCount === 0;

    return { status, itemsCount, canSaveItems, canOrder, canReceive, canCancel, showEmptyItemsWarning };
  }, [purchase, editor.dirty, editor.lines]);

  return {
    purchaseId,
    purchase,
    loading,
    error,
    goBack,
    reload,
    flags,
    editor,
    receive,
    order,
  };
}