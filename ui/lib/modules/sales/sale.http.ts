// src/lib/modules/sales/sale.http.ts
import { apiClient } from "@/lib/api/apiClient";
import type { SalePort } from "./sale.port";
import type {
  CreateSaleInput,
  CreateSaleResponseData,
  GetSaleResponseData,
  HoldSaleInput,
  HoldSaleResponseData,
  PaySaleInput,
  PaySaleResponseData,
  ReleaseHoldResponseData,
  SetSaleItemsInput,
  SetSaleItemsResponseData,
  ValidateSaleInput,
  ValidateSaleResult,
  VoidSaleInput,
  VoidSaleResponseData,
} from "./sale.dto";

export class SaleHttpAdapter implements SalePort {
  create(input: CreateSaleInput): Promise<CreateSaleResponseData> {
    return apiClient.json<CreateSaleResponseData>(`/api/v1/sales`, { method: "POST", body: input ?? {} });
  }

  getById(id: string): Promise<GetSaleResponseData> {
    return apiClient.json<GetSaleResponseData>(`/api/v1/sales/${id}`, { method: "GET" });
  }

  setItems(saleId: string, input: SetSaleItemsInput): Promise<SetSaleItemsResponseData> {
    return apiClient.json<SetSaleItemsResponseData>(`/api/v1/sales/${saleId}/items`, { method: "POST", body: input });
  }

  hold(saleId: string, input?: HoldSaleInput): Promise<HoldSaleResponseData> {
    return apiClient.json<HoldSaleResponseData>(`/api/v1/sales/${saleId}/hold`, { method: "POST", body: input ?? {} });
  }

  releaseHold(saleId: string): Promise<ReleaseHoldResponseData> {
    return apiClient.json<ReleaseHoldResponseData>(`/api/v1/sales/${saleId}/release-hold`, { method: "POST" });
  }

  pay(saleId: string, input: PaySaleInput, opts?: { idempotencyKey?: string | null }): Promise<PaySaleResponseData> {
    const headers: Record<string, string> = {};
    const key = opts?.idempotencyKey?.trim();
    if (key) headers["x-idempotency-key"] = key;

    return apiClient.json<PaySaleResponseData>(`/api/v1/sales/${saleId}/pay`, {
      method: "POST",
      body: input,
      headers,
    });
  }

  voidSale(saleId: string, input?: VoidSaleInput): Promise<VoidSaleResponseData> {
    return apiClient.json<VoidSaleResponseData>(`/api/v1/sales/${saleId}/void`, { method: "POST", body: input ?? {} });
  }

  validate(saleId: string, input?: ValidateSaleInput): Promise<ValidateSaleResult> {
    return apiClient.json<ValidateSaleResult>(`/api/v1/sales/${saleId}/validate`, { method: "POST", body: input ?? {} });
  }
}
