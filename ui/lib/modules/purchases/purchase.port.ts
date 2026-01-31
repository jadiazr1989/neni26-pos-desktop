// src/lib/modules/purchases/purchase.port.ts
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

export interface PurchasePort {
  list(q: ListPurchasesQuery): Promise<ListPurchasesResponse>;
  getById(id: string): Promise<GetPurchaseResponse>;
  create(input: CreatePurchaseInput): Promise<CreatePurchaseResponse>;
  setItems(purchaseId: string, input: SetPurchaseItemsInput): Promise<SetPurchaseItemsResponse>;
  receive(purchaseId: string, input?: ReceivePurchaseInput): Promise<ReceivePurchaseResponse>;
  order(purchaseId: string): Promise<OrderPurchaseResponse>;
  cancel(
    purchaseId: string,
    input?: CancelPurchaseInput,
  ): Promise<CancelPurchaseResponse>;
}
