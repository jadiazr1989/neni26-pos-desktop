"use client";

import * as React from "react";
import { notify } from "@/lib/notify/notify";
import { purchaseService } from "@/lib/modules/purchases/purchase.service";
import type { PurchaseWithItemsDTO } from "@/lib/modules/purchases/purchase.dto";
import { errDesc } from "./purchaseDetail.helpers";
import type { PurchaseOrderCancelVm } from "./purchaseDetail.types";

export function usePurchaseOrderCancel(opts: {
  purchaseId: string;
  purchase: PurchaseWithItemsDTO | null;
  setPurchase: (p: PurchaseWithItemsDTO) => void;
  setLoading: (v: boolean) => void;
}): PurchaseOrderCancelVm {
  const status = opts.purchase?.status;

  const order = React.useCallback(async () => {
    if (status !== "DRAFT") {
      notify.warning({ title: "No se puede ordenar", description: "Solo puedes ordenar una compra en DRAFT." });
      return;
    }

    opts.setLoading(true);
    try {
      await purchaseService.order(opts.purchaseId);
      const full = await purchaseService.getById(opts.purchaseId);
      opts.setPurchase(full);

      notify.success({ title: "Compra ordenada", description: "La compra pasó a estado ORDERED." });
    } catch (e: unknown) {
      notify.error({ title: "No se pudo ordenar", description: errDesc(e) });
    } finally {
      opts.setLoading(false);
    }
  }, [opts, status]);

  const cancel = React.useCallback(
    async (reason?: string) => {
      if (status === "RECEIVED") {
        notify.warning({ title: "No se puede cancelar", description: "No puedes cancelar una compra RECEIVED." });
        return;
      }

      const r = reason?.trim();
      const input = r ? { reason: r } : undefined;

      opts.setLoading(true);
      try {
        await purchaseService.cancel(opts.purchaseId, input);
        const full = await purchaseService.getById(opts.purchaseId);
        opts.setPurchase(full);

        notify.success({ title: "Compra cancelada", description: "Estado: CANCELLED." });
      } catch (e: unknown) {
        notify.error({ title: "No se pudo cancelar", description: errDesc(e) });
      } finally {
        opts.setLoading(false);
      }
    },
    [opts, status],
  );

  return { order, cancel };
}
