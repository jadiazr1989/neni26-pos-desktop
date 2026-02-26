// src/lib/modules/purchases/purchase.service.ts
import type { PurchasePort } from "./purchase.port";
import { PurchaseHttpAdapter } from "./purchase.http";
import type {
  CancelPurchaseInput,
  CreatePurchaseInput,
  ListPurchasesQuery,
  PurchaseDTO,
  PurchaseWithItemsDTO,
  ReceivePurchaseInput,
  SetPurchaseItemsInput,
} from "./purchase.dto";

class PurchaseService {
  constructor(private readonly port: PurchasePort) {}

  async list(q: ListPurchasesQuery): Promise<PurchaseDTO[]> {
    const res = await this.port.list(q);
    return res.purchases;
  }

  async getById(id: string): Promise<PurchaseWithItemsDTO> {
    const res = await this.port.getById(id);
    return res.purchase;
  }

  async create(input: CreatePurchaseInput): Promise<{ purchaseId: string; purchase: PurchaseDTO }> {
    const res = await this.port.create(input);
    return { purchaseId: res.purchaseId, purchase: res.purchase };
  }

  async setItems(purchaseId: string, input: SetPurchaseItemsInput): Promise<PurchaseWithItemsDTO> {
    const res = await this.port.setItems(purchaseId, input);
    return res.purchase;
  }

  async receive(purchaseId: string, input?: ReceivePurchaseInput): Promise<PurchaseWithItemsDTO> {
    const res = await this.port.receive(purchaseId, input);
    return res.purchase;
  }

  async order(purchaseId: string): Promise<PurchaseDTO> {
    const res = await this.port.order(purchaseId);
    return res.purchase;
  }

  async cancel(purchaseId: string, input?: CancelPurchaseInput): Promise<PurchaseDTO> {
    const res = await this.port.cancel(purchaseId, input);
    return res.purchase;
  }
}

export const purchaseService = new PurchaseService(new PurchaseHttpAdapter());