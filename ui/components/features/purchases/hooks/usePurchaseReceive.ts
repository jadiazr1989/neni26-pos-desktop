// src/modules/purchases/ui/hooks/usePurchaseReceive.ts
"use client";

import * as React from "react";
import { notify } from "@/lib/notify/notify";
import { purchaseService } from "@/lib/modules/purchases/purchase.service";
import type { PurchaseWithItemsDTO } from "@/lib/modules/purchases/purchase.dto";
import { errDesc, friendlyReceiveError } from "./purchaseDetail.helpers";

type Opts = {
  purchaseId: string;
  purchase: PurchaseWithItemsDTO | null;
  setPurchase: (p: PurchaseWithItemsDTO) => void;

  loading: boolean;
  setLoading: (v: boolean) => void;

  dirty: boolean;
  onReceived?: (p: PurchaseWithItemsDTO) => void;
};

export function usePurchaseReceive({
  purchaseId,
  purchase,
  setPurchase,
  setLoading,
  dirty,
  onReceived,
}: Opts) {
  const canReceive = purchase?.status === "ORDERED";
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [receiving, setReceiving] = React.useState(false); // ✅ nuevo

  const request = React.useCallback(() => {
    if (!canReceive) {
      notify.warning({ title: "No se puede recibir", description: "Solo se puede recibir una compra en ORDERED." });
      return;
    }
    if (dirty) {
      notify.warning({ title: "Cambios sin guardar", description: "Guarda los items antes de recibir." });
      return;
    }
    setConfirmOpen(true);
  }, [canReceive, dirty]);

  const cancel = React.useCallback(() => setConfirmOpen(false), []);

  const confirm = React.useCallback(async () => {
    if (!canReceive) return;
    if (receiving) return;

    setReceiving(true);
    setLoading(true);
    try {
      const updated = await purchaseService.receive(purchaseId, { notes: "received" });
      setPurchase(updated);
      setConfirmOpen(false);
      onReceived?.(updated);
      notify.success({ title: "Compra recibida", description: "Inventario aplicado y compra cerrada (RECEIVED)." });
    } catch (e: unknown) {
      notify.error({ title: "Compra Rechazada", description: friendlyReceiveError(e) });
    } finally {
      setLoading(false);
      setReceiving(false);
    }
  }, [canReceive, receiving, purchaseId, setLoading, setPurchase, onReceived]);

  return {
    canReceive: Boolean(canReceive),
    confirmOpen,
    request,
    cancel,
    confirm,
    receiving, // ✅ export
  };
}
