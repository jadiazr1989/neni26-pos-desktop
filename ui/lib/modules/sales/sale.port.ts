// src/lib/modules/sales/sale.port.ts
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

export interface SalePort {
  create(input: CreateSaleInput): Promise<CreateSaleResponseData>;
  getById(id: string): Promise<GetSaleResponseData>;

  setItems(saleId: string, input: SetSaleItemsInput): Promise<SetSaleItemsResponseData>;

  hold(saleId: string, input?: HoldSaleInput): Promise<HoldSaleResponseData>;
  releaseHold(saleId: string): Promise<ReleaseHoldResponseData>;

  pay(saleId: string, input: PaySaleInput, opts?: { idempotencyKey?: string | null }): Promise<PaySaleResponseData>;

  voidSale(saleId: string, input?: VoidSaleInput): Promise<VoidSaleResponseData>;

  validate(saleId: string, input?: ValidateSaleInput): Promise<ValidateSaleResult>;
}
