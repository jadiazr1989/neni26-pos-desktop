// src/lib/modules/purchases/purchase.http.ts
import { apiClient } from "@/lib/api/apiClient";
import type { PurchasePort } from "./purchase.port";
import type {
  CancelPurchaseInput,
  CancelPurchaseResponse,
  CreatePurchaseInput,
  CreatePurchaseResponse,
  GetPurchaseResponse,
  ListPurchasesQuery,
  ListPurchasesResponse,
  OrderPurchaseResponse,
  ReceivePurchaseInput,
  ReceivePurchaseResponse,
  SetPurchaseItemsInput,
  SetPurchaseItemsResponse,
} from "./purchase.dto";

function toPurchasesQuery(q?: ListPurchasesQuery): string {
  if (!q) return "";
  const qs = new URLSearchParams();

  const search = q.search?.trim();
  if (search) qs.set("search", search);

  if (q.status) qs.set("status", q.status);
  if (q.warehouseId) qs.set("warehouseId", q.warehouseId);

  if (q.from) qs.set("from", q.from);
  if (q.to) qs.set("to", q.to);

  if (typeof q.take === "number") qs.set("take", String(q.take));
  if (typeof q.skip === "number") qs.set("skip", String(q.skip));

  const s = qs.toString();
  return s ? `?${s}` : "";
}

export class PurchaseHttpAdapter implements PurchasePort {
  list(q: ListPurchasesQuery): Promise<ListPurchasesResponse> {
    return apiClient.json(`/api/v1/purchases${toPurchasesQuery(q)}`, { method: "GET" });
  }

  getById(id: string): Promise<GetPurchaseResponse> {
    return apiClient.json(`/api/v1/purchases/${id}`, { method: "GET" });
  }

  create(input: CreatePurchaseInput): Promise<CreatePurchaseResponse> {
    return apiClient.json(`/api/v1/purchases`, { method: "POST", body: input });
  }

  setItems(purchaseId: string, input: SetPurchaseItemsInput): Promise<SetPurchaseItemsResponse> {
    return apiClient.json(`/api/v1/purchases/${purchaseId}/items`, { method: "POST", body: input });
  }

  receive(purchaseId: string, input?: ReceivePurchaseInput): Promise<ReceivePurchaseResponse> {
    return apiClient.json(`/api/v1/purchases/${purchaseId}/receive`, {
      method: "POST",
      body: input ?? {},
    });
  }

  order(purchaseId: string): Promise<OrderPurchaseResponse> {
    return apiClient.json(`/api/v1/purchases/${purchaseId}/order`, { method: "POST" });
  }

  cancel(purchaseId: string, input?: CancelPurchaseInput): Promise<CancelPurchaseResponse> {
    return apiClient.json(`/api/v1/purchases/${purchaseId}/cancel`, { method: "POST", body: input ?? {} });
  }
}