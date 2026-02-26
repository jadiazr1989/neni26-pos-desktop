// stores/posSale.store.ts
import { create } from "zustand";
import { notify } from "@/lib/notify/notify";
import { saleService } from "@/lib/modules/sales/sale.service";
import type { MoneyStr, SellUnit, ValidateSaleResult, SaleDTO } from "@/lib/modules/sales/sale.dto";
import { isApiHttpError } from "@/lib/api/envelope";

import type { QtyScale } from "./helpers/posSale.helpers";
import {
  getErrorInfo,
  uuid,
  isInt,
  clampInt,
  normalizeQty,
  clampQtyBaseMinor,
  fromQtyBaseMinor,
  maxQtyBaseMinorForScale,
  toQtyBaseMinor,
} from "./helpers/posSale.helpers";

import type {
  PosSaleState,
  SaleLine,
  TicketAdjustment,
  InsufficientStockDetails,
  PayLineInput,
  LastCheckout,
} from "./helpers/posSale.store.types";

import {
  isValidateSaleInsufficient,
  calcTotals,
  mergeAll,
  toSaleItemsPayload,
  emptyServer,
  applySaleSnapshotToServer,
  parseQtyDisplayToNumber,
  inferScaleFromQtyDisplay,
  formatQtyInput,
  inferUnitInputFromLabel,
  moneyStrToIntSafe,
  bigIntMoneyToLabelCUP,
} from "./helpers/posSale.store.utils";

function notifyMissingVariant() {
  notify.error({
    title: "Producto inválido",
    description: "Falta la variante (variantId). No se puede agregar al ticket.",
  });
}

function notifyMissingCashSession() {
  notify.error({
    title: "Caja no disponible",
    description: "Falta el cashSessionId. Abre la caja antes de cobrar.",
  });
}

// -----------------------------
// strict unwrap helpers (no any)
// -----------------------------
function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function hasSaleDTO(v: unknown): v is { sale: SaleDTO } {
  return isObject(v) && "sale" in v && isObject((v as Record<string, unknown>)["sale"]);
}

function unwrapSaleDTO(res: unknown): SaleDTO {
  if (hasSaleDTO(res)) return res.sale;
  // si llega directo como SaleDTO
  return res as SaleDTO;
}

function hasSaleId(v: unknown): v is { saleId: string } {
  return isObject(v) && typeof v["saleId"] === "string";
}

export const usePosSaleStore = create<PosSaleState>((set, get) => {
  let syncTimer: ReturnType<typeof setTimeout> | null = null;

  function bumpVersion() {
    set((s) => ({ version: s.version + 1 }));
  }

  function scheduleSync(ms = 450) {
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(() => {
      void get().sync({ silent: true }).catch(() => {});
    }, ms);
  }

  function setTouchedFromVariant(variantId: string) {
    const line = get().items.find((x) => x.variantId === variantId);
    set({ lastTouchedLineId: line?.id ?? null });
  }

  function applyInsufficientStockCorrection(details: InsufficientStockDetails) {
    set((s) => {
      const nextItems = s.items
        .map((li) => {
          if (li.variantId !== details.variantId) return li;

          const availableBase = clampQtyBaseMinor(
            toQtyBaseMinor(details.available, li.qtyScale),
            0,
            maxQtyBaseMinorForScale(li.qtyScale)
          );

          const nextBase = Math.min(li.qtyBaseMinor, availableBase);

          if (nextBase <= 0) return { ...li, qtyBaseMinor: 0, qty: 0, qtyInput: "0" };

          const display = fromQtyBaseMinor(nextBase, li.qtyScale);
          const qty = li.qtyScale === 0 ? Math.trunc(display) : Number(display.toFixed(li.qtyScale));

          return { ...li, qtyBaseMinor: nextBase, qty, qtyInput: formatQtyInput(qty, li.qtyScale) };
        })
        .filter((li) => li.qtyBaseMinor > 0);

      const merged = mergeAll(nextItems);
      return { items: merged, totals: calcTotals(merged) };
    });

    bumpVersion();
    scheduleSync(0);
  }

  function applyValidateFix(res: Extract<ValidateSaleResult, { status: "INSUFFICIENT_STOCK" }>) {
    const adjustments: TicketAdjustment[] = (res.insufficient ?? []).map((x) => ({
      variantId: x.variantId,
      label: x.label,
      action: x.action,
      unit: x.unit,
      requestedDisplay: x.requestedDisplay,
      availableDisplay: x.availableDisplay,
      newQtyDisplay: x.newQtyDisplay,
    }));

    if (res.updated?.items?.length) {
      set((s) => {
        const groups = new Map<string, SaleLine[]>();
        for (const li of s.items) {
          const arr = groups.get(li.variantId) ?? [];
          arr.push(li);
          groups.set(li.variantId, arr);
        }

        const desiredUiMinorByVariant = new Map<string, { desiredUiMinor: number; scale: QtyScale }>();

        for (const it of res.updated?.items ?? []) {
          const qty = parseQtyDisplayToNumber(it.qtyDisplay);
          const existing = groups.get(it.variantId) ?? [];
          const scale: QtyScale = existing.some((x) => x.qtyScale === 2) ? 2 : inferScaleFromQtyDisplay(it.qtyDisplay);

          const desiredUiMinor = clampQtyBaseMinor(
            toQtyBaseMinor(qty, scale),
            0,
            maxQtyBaseMinorForScale(scale)
          );

          desiredUiMinorByVariant.set(it.variantId, { desiredUiMinor, scale });
        }

        const next: SaleLine[] = [];

        for (const [variantId, lines] of groups.entries()) {
          const desired = desiredUiMinorByVariant.get(variantId);
          const desiredTotalUiMinor = desired?.desiredUiMinor ?? 0;
          const scale = desired?.scale ?? (lines.some((x) => x.qtyScale === 2) ? 2 : 0);

          if (desiredTotalUiMinor <= 0) continue;

          let remaining = desiredTotalUiMinor;

          for (const li of lines) {
            if (li.qtyScale !== scale) {
              const curUiMinor = clampQtyBaseMinor(
                toQtyBaseMinor(li.qty, scale),
                0,
                maxQtyBaseMinorForScale(scale)
              );

              const take = Math.min(curUiMinor, remaining);
              if (take > 0) {
                const display = fromQtyBaseMinor(take, scale);
                const qty2 = scale === 0 ? Math.trunc(display) : Number(display.toFixed(scale));

                next.push({
                  ...li,
                  qtyScale: scale,
                  qtyBaseMinor: take,
                  qty: qty2,
                  qtyInput: formatQtyInput(qty2, scale),
                });

                remaining -= take;
              }

              if (remaining <= 0) break;
              continue;
            }

            const take = Math.min(li.qtyBaseMinor, remaining);
            if (take > 0) {
              const display = fromQtyBaseMinor(take, scale);
              const qty2 = scale === 0 ? Math.trunc(display) : Number(display.toFixed(scale));

              next.push({
                ...li,
                qtyBaseMinor: take,
                qty: qty2,
                qtyInput: formatQtyInput(qty2, scale),
              });

              remaining -= take;
            }

            if (remaining <= 0) break;
          }

          if (remaining > 0 && lines.length > 0) {
            const base = lines[0];
            const take = remaining;

            const display = fromQtyBaseMinor(take, scale);
            const qty2 = scale === 0 ? Math.trunc(display) : Number(display.toFixed(scale));

            next.push({
              ...base,
              qtyScale: scale,
              qtyBaseMinor: take,
              qty: qty2,
              qtyInput: formatQtyInput(qty2, scale),
            });
          }
        }

        const merged = mergeAll(next).filter((x) => x.qtyBaseMinor > 0);

        const server2 =
          res.updated?.totals?.totalBaseMinor !== undefined
            ? { ...s.server, totalBaseMinor: res.updated.totals.totalBaseMinor }
            : s.server;

        const firstVar = adjustments[0]?.variantId ?? null;
        const touched = firstVar ? merged.find((x) => x.variantId === firstVar)?.id ?? null : null;

        return {
          items: merged,
          totals: calcTotals(merged),
          syncError: null,
          server: server2,
          lastAdjustments: adjustments,
          lastTouchedLineId: touched,
        };
      });

      bumpVersion();
      scheduleSync(0);
    } else {
      for (const it of res.insufficient) {
        const s = get();
        const anyLine = s.items.find((x) => x.variantId === it.variantId);
        const scale: QtyScale = anyLine?.qtyScale ?? inferScaleFromQtyDisplay(it.newQtyDisplay);

        const availableUI = parseQtyDisplayToNumber(it.newQtyDisplay);

        applyInsufficientStockCorrection({
          variantId: it.variantId,
          requested: it.requested,
          available: availableUI,
          quantity: it.newQty,
          reservedQuantity: 0,
        });
      }

      set({ lastAdjustments: adjustments });
      const firstVar = adjustments[0]?.variantId;
      if (firstVar) setTouchedFromVariant(firstVar);
    }

    const removed = adjustments.filter((a) => a.action === "REMOVE").length;
    const clamped = adjustments.filter((a) => a.action === "CLAMP").length;
    const severe = removed > 0 || adjustments.length >= 3;

    if (severe) set({ adjustmentsOpen: true });

    notify.warning({
      title: "Ticket ajustado por stock",
      description:
        removed > 0
          ? `${adjustments.length} productos ajustados (${removed} eliminados, ${clamped} reducidos).`
          : `${adjustments.length} productos ajustados.`,
      action: { label: "Ver", onClick: () => get().openAdjustments() },
    });
  }

  function getTotalMinorForPay() {
    const st = get();
    const serverTotal = st.server.totalBaseMinor !== null ? moneyStrToIntSafe(st.server.totalBaseMinor) : null;
    return serverTotal ?? st.totals.totalMinor;
  }

  return {
    items: [],
    totals: { subtotalMinor: 0, taxMinor: 0, discountMinor: 0, totalMinor: 0 },

    server: emptyServer(),
    saleId: null,

    version: 0,
    lastSyncedVersion: 0,
    syncStatus: "idle",
    syncError: null,

    checkoutStatus: "idle",
    lastCheckout: null,

    lastTouchedLineId: null,
    adjustmentsOpen: false,
    lastAdjustments: [],

    openAdjustments: () => set({ adjustmentsOpen: true }),
    closeAdjustments: () => set({ adjustmentsOpen: false }),
    clearAdjustments: () => set({ lastAdjustments: [], adjustmentsOpen: false }),

    addLine: (input) => {
      const variantId = String(input.variantId ?? "").trim();
      if (!variantId) return void notifyMissingVariant();

      const norm = normalizeQty(input.soldBy, input.qty);

      const unitInput: SellUnit =
        (input.unitInput as SellUnit | undefined) ??
        (inferUnitInputFromLabel(input.soldBy, input.unitLabelSnapshot) as SellUnit);

      const qtyInput = (input.qtyInput ?? null)?.trim() || formatQtyInput(norm.qty, norm.qtyScale);

      const li: SaleLine = {
        id: uuid(),
        productId: String(input.productId ?? "").trim(),
        variantId,
        nameSnapshot: String(input.nameSnapshot ?? ""),
        soldBy: input.soldBy,
        unitLabelSnapshot: String(input.unitLabelSnapshot ?? ""),
        unitInput,
        qtyInput,
        qtyBaseMinor: norm.qtyBaseMinor,
        qtyScale: norm.qtyScale,
        qty: norm.qty,
        pricePerUnitMinor: clampInt(input.pricePerUnitMinor, 0, 1_000_000_000),
        optionsSnapshot: input.optionsSnapshot ?? [],
        skuSnapshot: input.skuSnapshot ?? null,
      };

      set((s) => {
        const key = (x: SaleLine) =>
          `${x.variantId}|${x.unitInput}|${x.qtyScale}|${x.optionsSnapshot.map((o) => o.optionId).join(",")}`;

        const idx = s.items.findIndex((x) => key(x) === key(li));
        let touchedId = li.id;

        const next =
          idx >= 0
            ? s.items.map((x, i) => {
                if (i !== idx) return x;
                touchedId = x.id;

                const sumBase = x.qtyBaseMinor + li.qtyBaseMinor;
                const max = maxQtyBaseMinorForScale(x.qtyScale);
                const clampedBase = clampQtyBaseMinor(sumBase, 0, max);

                const display = fromQtyBaseMinor(clampedBase, x.qtyScale);
                const qty = x.qtyScale === 0 ? Math.trunc(display) : Number(display.toFixed(x.qtyScale));

                return { ...x, qtyBaseMinor: clampedBase, qty, qtyInput: formatQtyInput(qty, x.qtyScale) };
              })
            : [...s.items, li];

        const merged = mergeAll(next).filter((x) => x.qtyBaseMinor > 0);
        const exists = merged.some((x) => x.id === touchedId);
        const safeTouchedId = exists ? touchedId : merged.at(-1)?.id ?? null;

        return { items: merged, totals: calcTotals(merged), syncError: null, lastTouchedLineId: safeTouchedId };
      });

      bumpVersion();
      scheduleSync();
    },

    changeQty: (lineId, qty) => {
      set((s) => {
        const next = s.items
          .map((li) => {
            if (li.id !== lineId) return li;
            const norm = normalizeQty(li.soldBy, qty);
            return { ...li, ...norm, qtyInput: formatQtyInput(norm.qty, norm.qtyScale) };
          })
          .filter((li) => li.qtyBaseMinor > 0);

        const merged = mergeAll(next);
        return { items: merged, totals: calcTotals(merged), syncError: null, lastTouchedLineId: lineId };
      });

      bumpVersion();
      scheduleSync();
    },

    updateLine: (lineId, patch) => {
      set((s) => {
        const next = s.items
          .map((li) => {
            if (li.id !== lineId) return li;

            const qtyPatch = patch.qty !== undefined ? normalizeQty(li.soldBy, patch.qty) : null;
            const nextQtyInput = qtyPatch ? formatQtyInput(qtyPatch.qty, qtyPatch.qtyScale) : li.qtyInput;

            return {
              ...li,
              ...(qtyPatch ?? {}),
              qtyInput: nextQtyInput,
              ...(patch.unitInput ? { unitInput: patch.unitInput as SellUnit } : {}),
              ...(patch.optionsSnapshot ? { optionsSnapshot: patch.optionsSnapshot } : {}),
            };
          })
          .filter((li) => li.qtyBaseMinor > 0);

        const merged = mergeAll(next);
        return { items: merged, totals: calcTotals(merged), syncError: null, lastTouchedLineId: lineId };
      });

      bumpVersion();
      scheduleSync();
    },

    removeLine: (lineId) => {
      set((s) => {
        const next = s.items.filter((li) => li.id !== lineId);
        const merged = mergeAll(next);

        const nextTouched = s.lastTouchedLineId === lineId ? merged.at(-1)?.id ?? null : s.lastTouchedLineId;

        return { items: merged, totals: calcTotals(merged), syncError: null, lastTouchedLineId: nextTouched };
      });

      bumpVersion();
      scheduleSync();
    },

    clear: () => {
      if (syncTimer) clearTimeout(syncTimer);
      syncTimer = null;

      set({
        items: [],
        totals: { subtotalMinor: 0, taxMinor: 0, discountMinor: 0, totalMinor: 0 },
        server: emptyServer(),
        saleId: null,
        version: 0,
        lastSyncedVersion: 0,
        syncStatus: "idle",
        syncError: null,
        checkoutStatus: "idle",
        lastCheckout: null,
        lastTouchedLineId: null,
        adjustmentsOpen: false,
        lastAdjustments: [],
      });
    },

    canPay: () => {
      const s = get();
      const totalMinor = getTotalMinorForPay();
      return s.items.length > 0 && totalMinor > 0 && s.checkoutStatus !== "paying";
    },

    ensureSale: async () => {
      const s = get();
      if (s.saleId) return s.saleId;

      const created: unknown = await saleService.create({ customerId: null });
      if (!hasSaleId(created)) throw new Error("La API no devolvió saleId al crear la venta.");

      const saleId = created.saleId.trim();
      if (!saleId) throw new Error("La API devolvió saleId vacío.");

      set({ saleId });
      return saleId;
    },

    sync: async (opts?: { force?: boolean; silent?: boolean }) => {
      const force = Boolean(opts?.force);
      const silent = Boolean(opts?.silent);

      const s = get();

      if (!s.items.length) {
        set({
          syncStatus: "idle",
          syncError: null,
          saleId: null,
          server: emptyServer(),
          lastSyncedVersion: 0,
          version: 0,
        });
        return;
      }

      if (!force && s.lastSyncedVersion === s.version && s.syncStatus === "ready") return;

      set({ syncStatus: "syncing", syncError: null });

      try {
        const saleId = await get().ensureSale();

        await saleService.setItems(saleId, toSaleItemsPayload(get().items));

        let serverSnap = get().server;
        try {
          const res: unknown = await saleService.getById(saleId);
          const saleDto = unwrapSaleDTO(res);
          serverSnap = applySaleSnapshotToServer(saleDto);
        } catch {
          serverSnap = { ...serverSnap };
        }

        set((st) => ({
          lastSyncedVersion: st.version,
          syncStatus: "ready",
          syncError: null,
          server: serverSnap,
        }));
      } catch (e: unknown) {
        const info = getErrorInfo(e);
        set({
          syncStatus: "error",
          syncError: { code: info.code || "SYNC_FAILED", message: info.message, details: info.details },
        });

        if (!silent) notify.error({ title: "Error sincronizando la venta", description: info.message });
        throw e;
      }
    },

    validateBeforeCheckout: async () => {
      const s = get();
      if (!s.items.length) throw new Error("El ticket está vacío.");

      await get().sync({ force: true, silent: true });

      const saleId = await get().ensureSale();
      const res = await saleService.validate(saleId, { applyFix: true, includeUpdatedSale: true });

      if (res.status === "OK") return "OK";

      if (res.status === "INSUFFICIENT_STOCK") {
        const typed = isValidateSaleInsufficient(res)
          ? res
          : (res as Extract<ValidateSaleResult, { status: "INSUFFICIENT_STOCK" }>);

        applyValidateFix(typed);
        await get().sync({ force: true, silent: true });
        return "FIXED";
      }

      return "OK";
    },

    checkout: async ({ cashSessionId, payments }) => {
      const s = get();
      if (!s.items.length) return Promise.reject(new Error("El ticket está vacío."));

      const cs = String(cashSessionId ?? "").trim();
      if (!cs) {
        notifyMissingCashSession();
        return Promise.reject(new Error("cashSessionId requerido"));
      }

      set({ checkoutStatus: "paying" });

      try {
        await get().sync({ force: true, silent: true });
        await get().validateBeforeCheckout();

        const saleId = await get().ensureSale();

        // refresca snapshot antes de pagar
        try {
          const res: unknown = await saleService.getById(saleId);
          const saleDto = unwrapSaleDTO(res);
          set(() => ({ server: applySaleSnapshotToServer(saleDto) }));
        } catch {
          // seguimos con lo que hay
        }

        const stAfter = get();
        const uiTotalMinor = stAfter.totals.totalMinor;
        const serverTotalMinor =
          stAfter.server.totalBaseMinor !== null ? moneyStrToIntSafe(stAfter.server.totalBaseMinor) : null;

        if (serverTotalMinor !== null && serverTotalMinor !== uiTotalMinor) {
          const msg = `Total desincronizado. UI=${uiTotalMinor} vs Server=${serverTotalMinor}. Re-sincroniza el ticket.`;
          notify.error({ title: "Total desincronizado", description: msg });
          throw new Error(msg);
        }

        const totalMinor = getTotalMinorForPay();

        const payLines: PayLineInput[] =
          payments && payments.length > 0 ? payments : [{ method: "CASH", currency: "CUP", tenderMinor: totalMinor }];

        for (let i = 0; i < payLines.length; i++) {
          const p = payLines[i];
          if (!Number.isFinite(p.tenderMinor) || p.tenderMinor <= 0 || !isInt(p.tenderMinor)) {
            throw new Error(`El pago #${i + 1} tiene un monto inválido.`);
          }
          if (p.currency !== "CUP") {
            const fx = p.fxRate ?? null;
            if (fx === null || String(fx).trim() === "") {
              throw new Error(`El pago #${i + 1} requiere fxRate porque la moneda es ${p.currency}.`);
            }
          }
        }

        const idempotencyKey = uuid();

        const out = await saleService.pay(saleId, { cashSessionId: cs, payments: payLines }, { idempotencyKey });

        const result: LastCheckout = {
          saleId: out.sale.id,
          payments: out.payments,
          tenderedBaseMinor: out.sale.tenderedBaseMinor,
          changeBaseMinor: out.sale.changeBaseMinor,
          openDrawer: out.sale.openDrawer,
        };

        set({ lastCheckout: result });

        if (syncTimer) clearTimeout(syncTimer);
        syncTimer = null;

        set({
          items: [],
          totals: { subtotalMinor: 0, taxMinor: 0, discountMinor: 0, totalMinor: 0 },
          server: emptyServer(),
          saleId: null,
          version: 0,
          lastSyncedVersion: 0,
          syncStatus: "idle",
          syncError: null,
          checkoutStatus: "idle",
          lastCheckout: result,
          lastTouchedLineId: null,
          adjustmentsOpen: false,
          lastAdjustments: [],
        });

        const changeStr = result.changeBaseMinor as MoneyStr;
        let changeBi = 0n;
        try {
          changeBi = BigInt(changeStr);
        } catch {}

        notify.success({
          title: "Venta cobrada",
          description: changeBi > 0n ? `Cambio: ${bigIntMoneyToLabelCUP(changeStr)}.` : "Pago completado correctamente.",
        });

        return result;
      } catch (e: unknown) {
        set({ checkoutStatus: "idle" });

        if (isApiHttpError(e) && e.reason === "INSUFFICIENT_STOCK") {
          notify.error({
            title: "Stock insuficiente",
            description: e.message || "El stock cambió mientras cobrabas. Se debe revisar el ticket.",
          });
          throw new Error(e.message || "El stock cambió mientras cobrabas. Revisa el ticket y vuelve a intentar.");
        }

        const info = getErrorInfo(e);
        notify.error({ title: "Error al cobrar", description: info.message });
        throw e;
      }
    },
  };
});