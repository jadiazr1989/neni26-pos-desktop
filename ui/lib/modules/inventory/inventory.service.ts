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
} from "./inventory.dto";

class InventoryService {
  constructor(private readonly port: InventoryPort) { }

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

  getWarehouseStock(warehouseId: string, opts?: { limit?: number; cursor?: string | null }): Promise<GetWarehouseStockResponse> {
    return this.port.getWarehouseStock({ warehouseId, ...opts });
  }

  getVariantStock(variantId: string): Promise<GetVariantStockResponse> {
    return this.port.getVariantStock(variantId);
  }

  listMovements(q: ListMovementsQuery): Promise<ListMovementsResponse> {
    return this.port.listMovements(q);
  }

  async getMyWarehouseStock(opts?: { limit?: number; cursor?: string | null }): Promise<GetWarehouseStockResponse> {
    return this.port.getMyWarehouseStock(opts);
  }

}

export const inventoryService = new InventoryService(new InventoryHttpAdapter());
