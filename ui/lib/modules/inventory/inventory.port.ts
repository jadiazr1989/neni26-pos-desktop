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

export type WarehouseStockParams = { warehouseId: string; limit?: number; cursor?: string | null };

export interface InventoryPort {
  adjust(input: InventoryAdjustInput): Promise<InventoryAdjustResponse>;
  previewAdjustment(input: InventoryAdjustInput): Promise<InventoryPreviewResponse>;
  requestAdjustment(input: InventoryAdjustInput): Promise<InventoryAdjustmentRequestResponse>;
  approveAdjustment(id: string): Promise<InventoryAdjustmentReviewResponse>;
  rejectAdjustment(id: string, reason?: string | null): Promise<InventoryAdjustmentReviewResponse>;

  getWarehouseStock(params: WarehouseStockParams): Promise<GetWarehouseStockResponse>;
  getVariantStock(variantId: string): Promise<GetVariantStockResponse>;
  listMovements(q: ListMovementsQuery): Promise<ListMovementsResponse>;
  getMyWarehouseStock(opts?: { limit?: number; cursor?: string | null }): Promise<GetWarehouseStockResponse>;
}
