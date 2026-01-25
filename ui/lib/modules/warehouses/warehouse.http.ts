// src/lib/modules/inventory/warehouses/warehouse.http.ts
import { apiClient } from "@/lib/api/apiClient";
import type { WarehousePort } from "./warehouse.port";
import type {
  WarehouseDTO,
  WarehouseListQuery,
  MyWarehouseListQuery,
  ListWarehousesResponse,
  CreateWarehouseInput,
  UpdateWarehouseInput,
} from "./warehouse.dto";

function toAdminQuery(params: WarehouseListQuery): string {
  const qs = new URLSearchParams();
  qs.set("storeId", params.storeId);
  if (params.search !== undefined) qs.set("search", params.search ?? "");
  if (typeof params.isActive === "boolean") qs.set("isActive", params.isActive ? "true" : "false");
  if (typeof params.limit === "number") qs.set("limit", String(params.limit));
  if (params.cursor) qs.set("cursor", params.cursor);
  const s = qs.toString();
  return s ? `?${s}` : "";
}

function toMyQuery(params?: MyWarehouseListQuery): string {
  if (!params) return "";
  const qs = new URLSearchParams();
  if (params.search !== undefined) qs.set("search", params.search ?? "");
  if (typeof params.isActive === "boolean") qs.set("isActive", params.isActive ? "true" : "false");
  if (typeof params.limit === "number") qs.set("limit", String(params.limit));
  if (params.cursor) qs.set("cursor", params.cursor);
  const s = qs.toString();
  return s ? `?${s}` : "";
}

export class WarehouseHttpAdapter implements WarehousePort {
  // ADMIN
  list(params: WarehouseListQuery): Promise<ListWarehousesResponse> {
    return apiClient.json(`/api/v1/warehouses${toAdminQuery(params)}`, { method: "GET" });
  }

  // CONTEXT (por terminal)
  listMy(params?: MyWarehouseListQuery): Promise<ListWarehousesResponse> {
    return apiClient.json(`/api/v1/warehouses/my${toMyQuery(params)}`, { method: "GET" });
  }

  listMyActive(params?: Omit<MyWarehouseListQuery, "isActive">): Promise<ListWarehousesResponse> {
    // endpoint dedicado (más simple y estable)
    return apiClient.json(`/api/v1/warehouses/my/active${toMyQuery(params)}`, { method: "GET" });
  }

  getById(id: string): Promise<WarehouseDTO> {
    return apiClient.json(`/api/v1/warehouses/${id}`, { method: "GET" });
  }

  create(input: CreateWarehouseInput): Promise<WarehouseDTO> {
    return apiClient.json("/api/v1/warehouses", { method: "POST", body: input });
  }

  update(id: string, input: UpdateWarehouseInput): Promise<WarehouseDTO> {
    return apiClient.json(`/api/v1/warehouses/${id}`, { method: "PATCH", body: input });
  }

  activate(id: string): Promise<WarehouseDTO> {
    return apiClient.json(`/api/v1/warehouses/${id}/activate`, { method: "POST" });
  }

  deactivate(id: string): Promise<WarehouseDTO> {
    return apiClient.json(`/api/v1/warehouses/${id}/deactivate`, { method: "POST" });
  }
}

export const warehouseHttp = new WarehouseHttpAdapter();
