// src/lib/modules/sales/sale.service.ts
import type { SalePort } from "./sale.port";
import { SaleHttpAdapter } from "./sale.http";

import type {
  CreateSaleInput,
  PaySaleInput,
  PaySaleResponseData,
  SaleDTO,
  SetSaleItemsInput,
  SaleStatus,
  ValidateSaleInput,
  ValidateSaleResult,
} from "./sale.dto";

class SaleService {
  constructor(private readonly port: SalePort) {}

  async create(input: CreateSaleInput): Promise<{ saleId: string }> {
    const res = await this.port.create(input);
    return { saleId: res.saleId };
  }

  async getById(id: string): Promise<SaleDTO> {
    const res = await this.port.getById(id);
    return res.sale;
  }

  async setItems(saleId: string, input: SetSaleItemsInput): Promise<{ id: string; status: SaleStatus }> {
    const res = await this.port.setItems(saleId, input);
    return { id: res.id, status: res.status };
  }

  async hold(saleId: string, minutes?: number): Promise<{ id: string; status: SaleStatus }> {
    const res = await this.port.hold(saleId, minutes ? { minutes } : {});
    return { id: res.id, status: res.status };
  }

  async releaseHold(saleId: string): Promise<{ id: string; status: SaleStatus }> {
    const res = await this.port.releaseHold(saleId);
    return { id: res.id, status: res.status };
  }

  // ✅ BigInt-safe: retorna exactamente el DTO (MoneyStr)
  async pay(
    saleId: string,
    input: PaySaleInput,
    opts?: { idempotencyKey?: string | null }
  ): Promise<PaySaleResponseData> {
    console.log("pay URL", `/api/v1/sales/${saleId}/pay`, { saleId }, input, opts);
    return this.port.pay(saleId, input, opts);
  }

  async voidSale(saleId: string, reason?: string | null): Promise<{ id: string; status: SaleStatus }> {
    const res = await this.port.voidSale(saleId, { reason: reason ?? null });
    return { id: res.id, status: res.status };
  }

  async validate(saleId: string, input?: ValidateSaleInput): Promise<ValidateSaleResult> {
    return this.port.validate(saleId, input);
  }
}

export const saleService = new SaleService(new SaleHttpAdapter());