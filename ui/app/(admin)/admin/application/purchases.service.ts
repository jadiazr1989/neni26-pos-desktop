import { injectable, inject } from "tsyringe";
import type {
  PurchaseRepository,
  CreatePurchaseInput,
  AddPurchaseItemsInput,
  ReceivePurchaseInput,
  ListPurchasesParams,
  PurchaseSnapshot,
  AddPurchaseItemAnyInput,
} from "../domain/purchases.repo.js";
import { Errors } from "../../../shared/errors/error.factory.js";

function assertPurchaseId(purchaseId: string) {
  if (String(purchaseId ?? "").trim() === "") {
    throw Errors.validation("PURCHASE_ID_REQUIRED", "purchaseId required", { field: "purchaseId" });
  }
}

function isLegacyItem(it: AddPurchaseItemAnyInput): it is AddPurchaseItemAnyInput & { quantity: number } {
  return typeof (it as { quantity?: unknown }).quantity === "number";
}

@injectable()
export class PurchaseService {
  constructor(@inject("PurchaseRepository") private repo: PurchaseRepository) { }

  async create(input: CreatePurchaseInput) {
    if (String(input.warehouseId ?? "").trim() === "") {
      throw Errors.validation("WAREHOUSE_ID_REQUIRED", "warehouseId required", { field: "warehouseId" });
    }
    return this.repo.createPurchase(input);
  }

  async items(input: AddPurchaseItemsInput) {
    assertPurchaseId(input.purchaseId);

    if (!Array.isArray(input.items) || input.items.length === 0) {
      throw Errors.validation("PURCHASE_ITEMS_REQUIRED", "items required", { field: "items" });
    }
    if (input.items.length > 200) {
      throw Errors.validation("PURCHASE_ITEMS_TOO_MANY", "too many items", { field: "items", max: 200 });
    }

    for (const [i, it] of input.items.entries()) {
      if (it == null) {
        throw Errors.validation("PURCHASE_ITEM_REQUIRED", "item required", { field: `items[${i}]` });
      }
      if (String((it as { productVariantId?: unknown }).productVariantId ?? "").trim() === "") {
        throw Errors.validation("VARIANT_ID_REQUIRED", "productVariantId required", {
          field: `items[${i}].productVariantId`,
        });
      }

      const unitCost = (it as { unitCostBaseMinor?: unknown }).unitCostBaseMinor;
      if (typeof unitCost !== "number" || !Number.isFinite(unitCost) || unitCost < 0) {
        throw Errors.validation("UNIT_COST_INVALID", "unitCostBaseMinor must be >= 0", {
          field: `items[${i}].unitCostBaseMinor`,
        });
      }

      const up = (it as { unitPriceBaseMinor?: unknown }).unitPriceBaseMinor;
      if (up !== undefined && up !== null) {
        if (typeof up !== "number" || !Number.isFinite(up) || up < 0) {
          throw Errors.validation("UNIT_PRICE_INVALID", "unitPriceBaseMinor must be >= 0", {
            field: `items[${i}].unitPriceBaseMinor`,
          });
        }
      }

      // ✅ legacy quantity
      if (isLegacyItem(it)) {
        if (!Number.isFinite(it.quantity) || it.quantity <= 0) {
          throw Errors.validation("QUANTITY_INVALID", "quantity must be > 0", {
            field: `items[${i}].quantity`,
          });
        }
        continue;
      }

      // ✅ new: qtyInput + unitInput
      const qtyInput = (it as { qtyInput?: unknown }).qtyInput;
      const unitInput = (it as { unitInput?: unknown }).unitInput;

      if (qtyInput === undefined || qtyInput === null) {
        throw Errors.validation("QTY_INPUT_REQUIRED", "qtyInput required", { field: `items[${i}].qtyInput` });
      }
      if (typeof qtyInput !== "string" && typeof qtyInput !== "number") {
        throw Errors.validation("QTY_INPUT_INVALID", "qtyInput must be string|number", {
          field: `items[${i}].qtyInput`,
        });
      }
      if (typeof unitInput !== "string" || unitInput.trim() === "") {
        throw Errors.validation("UNIT_INPUT_REQUIRED", "unitInput required", { field: `items[${i}].unitInput` });
      }
    }

    return this.repo.addItems(input);
  }

  async receive(input: ReceivePurchaseInput) {
    assertPurchaseId(input.purchaseId);
    return this.repo.receive(input);
  }

  async getById(purchaseId: string) {
    assertPurchaseId(purchaseId);
    const out = await this.repo.getById(purchaseId);
    if (!out) throw Errors.notFound("PURCHASE_NOT_FOUND", "Purchase not found", { purchaseId });
    return out;
  }

  async list(params?: ListPurchasesParams) {
    return this.repo.list(params);
  }

  async order(purchaseId: string): Promise<PurchaseSnapshot> {
    assertPurchaseId(purchaseId);
    return this.repo.order(purchaseId);
  }

  async cancel(purchaseId: string, reason?: string | null): Promise<PurchaseSnapshot> {
    assertPurchaseId(purchaseId);
    return this.repo.cancel(purchaseId, reason);
  }
}
