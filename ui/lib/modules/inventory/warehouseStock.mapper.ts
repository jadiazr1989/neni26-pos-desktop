// src/lib/modules/inventory/mappers/warehouseStock.mapper.ts

import type {
  WarehouseStockRowDTO,
  WarehouseStockRowUI,
} from "@/lib/modules/inventory/inventory.dto";

import { formatStockDisplay } from "@/lib/quantity/sellUnit";

export function mapWarehouseStockRow(dto: WarehouseStockRowDTO): WarehouseStockRowUI {
  const qty = dto.quantity;
  const reserved = dto.reservedQuantity;

  // ✅ evita negativos si algo falla en backend
  const available = Math.max(0, qty - reserved);

  const v = dto.variant;

  const baseUnit = v.baseUnit;
  const pricingUnit = v.pricingUnit;
  const unitFactor = v.unitFactor;

  return {
    variantId: dto.variantId,
    sku: v.sku,
    title: v.title ?? null,
    barcode: v.barcode ?? null,

    qtyBaseMinor: qty,
    reservedBaseMinor: reserved,
    availableBaseMinor: available,

    isActive: v.isActive,
    imageUrl: v.imageUrl ?? null,
    productName: v.product?.name ?? null,

    baseUnit,
    pricingUnit,
    unitFactor,
 
    // ✅ NEW (clave para Purchases picker)
    priceBaseMinor: v.priceBaseMinor ?? 0,
    costBaseMinor: v.costBaseMinor ?? 0,

    // ✅ UI display
    qtyDisplay: formatStockDisplay({
      qtyBaseMinor: qty,
      baseUnit,
      pricingUnit,
      unitFactor,
    }),

    reservedDisplay: formatStockDisplay({
      qtyBaseMinor: reserved,
      baseUnit,
      pricingUnit,
      unitFactor,
    }),

    availableDisplay: formatStockDisplay({
      qtyBaseMinor: available,
      baseUnit,
      pricingUnit,
      unitFactor,
    }),
  };
}
