// src/lib/modules/inventory/inventory.service.ts
import type { InventoryPort } from "./inventory.port";
import { InventoryHttpAdapter } from "./inventory.http";
import type {
  InventoryAdjustInput,
  InventoryAdjustResponse,
  InventoryPreviewResponse,
  InventoryAdjustmentRequestResponse,
  InventoryAdjustmentReviewResponse,
  GetWarehouseStockResponse,
  GetVariantStockResponse,
  ListMovementsQuery,
  ListMovementsResponse,
  WarehouseStockRowUI,
} from "./inventory.dto";
import { mapWarehouseStockRow } from "./warehouseStock.mapper";

export type GetWarehouseStockUIResponse = {
  rows: WarehouseStockRowUI[];
  nextCursor: string | null;
};

class InventoryService {
  constructor(private readonly port: InventoryPort) {}

  adjust(input: InventoryAdjustInput): Promise<InventoryAdjustResponse> {
    return this.port.adjust(input);
  }
  previewAdjustment(input: InventoryAdjustInput): Promise<InventoryPreviewResponse> {
    return this.port.previewAdjustment(input);
  }
  requestAdjustment(input: InventoryAdjustInput): Promise<InventoryAdjustmentRequestResponse> {
    return this.port.requestAdjustment(input);
  }
  approveAdjustment(id: string): Promise<InventoryAdjustmentReviewResponse> {
    return this.port.approveAdjustment(id);
  }
  rejectAdjustment(id: string, reason?: string | null): Promise<InventoryAdjustmentReviewResponse> {
    return this.port.rejectAdjustment(id, reason);
  }
  getVariantStock(variantId: string): Promise<GetVariantStockResponse> {
    return this.port.getVariantStock(variantId);
  }
  listMovements(q: ListMovementsQuery): Promise<ListMovementsResponse> {
    return this.port.listMovements(q);
  }

  // ✅ aquí se aplica el mapper
  async getMyWarehouseStock(opts?: { limit?: number; cursor?: string | null }): Promise<GetWarehouseStockUIResponse> {
    const res: GetWarehouseStockResponse = await this.port.getMyWarehouseStock(opts);
    return { rows: res.rows.map(mapWarehouseStockRow), nextCursor: res.nextCursor };
  }
}

export const inventoryService = new InventoryService(new InventoryHttpAdapter());
