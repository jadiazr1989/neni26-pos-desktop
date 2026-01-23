// src/lib/modules/inventory/inventory.http.ts
import { apiClient } from "@/lib/api/apiClient";
import type { InventoryPort, WarehouseStockParams } from "./inventory.port";
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

function toQuery(params?: { limit?: number; cursor?: string | null }): string {
  if (!params) return "";
  const qs = new URLSearchParams();
  if (typeof params.limit === "number") qs.set("limit", String(params.limit));
  if (params.cursor) qs.set("cursor", params.cursor);
  const s = qs.toString();
  return s ? `?${s}` : "";
}

function toMovementsQuery(q?: ListMovementsQuery): string {
  if (!q) return "";
  const qs = new URLSearchParams();
  if (q.warehouseId) qs.set("warehouseId", q.warehouseId);
  if (q.variantId) qs.set("variantId", q.variantId);
  if (q.type) qs.set("type", q.type);
  if (q.dateFrom) qs.set("dateFrom", q.dateFrom);
  if (q.dateTo) qs.set("dateTo", q.dateTo);
  if (typeof q.limit === "number") qs.set("limit", String(q.limit));
  if (q.cursor) qs.set("cursor", q.cursor);
  const s = qs.toString();
  return s ? `?${s}` : "";
}

export class InventoryHttpAdapter implements InventoryPort {
  adjust(input: InventoryAdjustInput): Promise<InventoryAdjustResponse> {
    return apiClient.json(`/api/v1/inventory/adjust`, { method: "POST", body: input });
  }

  previewAdjustment(input: InventoryAdjustInput): Promise<InventoryPreviewResponse> {
    return apiClient.json(`/api/v1/inventory/adjustments/preview`, { method: "POST", body: input });
  }

  requestAdjustment(input: InventoryAdjustInput): Promise<InventoryAdjustmentRequestResponse> {
    return apiClient.json(`/api/v1/inventory/adjustments/request`, { method: "POST", body: input });
  }

  approveAdjustment(id: string): Promise<InventoryAdjustmentReviewResponse> {
    return apiClient.json(`/api/v1/inventory/adjustments/${id}/approve`, { method: "POST", body: {} });
  }

  rejectAdjustment(id: string, reason?: string | null): Promise<InventoryAdjustmentReviewResponse> {
    return apiClient.json(`/api/v1/inventory/adjustments/${id}/reject`, {
      method: "POST",
      body: { reason: reason ?? null },
    });
  }

  // ✅ terminal warehouse (NO warehouseId param)
  getMyWarehouseStock(opts?: { limit?: number; cursor?: string | null }): Promise<GetWarehouseStockResponse> {
    return apiClient.json(`/api/v1/inventory/warehouse${toQuery(opts)}`, { method: "GET" });
  }

  // admin explicit warehouse
  getWarehouseStock(params: WarehouseStockParams): Promise<GetWarehouseStockResponse> {
    const { warehouseId, ...rest } = params;
    return apiClient.json(`/api/v1/inventory/warehouse/${warehouseId}${toQuery(rest)}`, { method: "GET" });
  }

  getVariantStock(variantId: string): Promise<GetVariantStockResponse> {
    return apiClient.json(`/api/v1/inventory/variants/${variantId}`, { method: "GET" });
  }

  listMovements(q: ListMovementsQuery): Promise<ListMovementsResponse> {
    return apiClient.json(`/api/v1/inventory/movements${toMovementsQuery(q)}`, { method: "GET" });
  }
}
