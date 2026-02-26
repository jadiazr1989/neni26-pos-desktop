// src/lib/modules/sales/sale.dto.ts

export type SaleStatus = "OPEN" | "PAID" | "VOID" | "HELD";

export type Currency = "CUP" | "USD" | "EUR";
export type PaymentMethod = "CASH" | "CARD" | "TRANSFER" | "OTHER";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "VOID";

export type SellUnit = "UNIT" | "G" | "KG" | "LB" | "ML" | "L";

// ✅ BigInt-safe: server devuelve string para baseMinor
export type MoneyStr = string;

export type SaleDTO = {
  id: string;
  status: SaleStatus;
  warehouseId: string;
  terminalId: string | null;

  subtotalBaseMinor: MoneyStr;
  taxBaseMinor: MoneyStr;
  discountBaseMinor: MoneyStr;
  totalBaseMinor: MoneyStr;
  paidBaseMinor: MoneyStr;

  tenderedBaseMinor: MoneyStr;
  changeBaseMinor: MoneyStr;

  cashSessionId: string | null;

  issuedAt: string | null;
  receiptNumber: string | null;
};

export type PaymentDTO = {
  id: string;
  saleId: string;
  status: PaymentStatus;
  method: PaymentMethod;
  currency: Currency;

  amountMinor: number;
  fxRate: string | null;

  // ✅ BigInt-safe
  amountBaseMinor: MoneyStr;
  appliedBaseMinor: MoneyStr;
  changeBaseMinor: MoneyStr;

  provider: string | null;
  reference: string | null;

  createdById: string | null;
  createdAt: string;
};

// ====== CREATE ======
export type CreateSaleInput = {
  customerId?: string | null;
  notes?: string | null;
};

export type CreateSaleResponseData = {
  saleId: string;
};

// ====== ITEMS ======
export type SetSaleItemsInput = {
  items: Array<{
    variantId: string;
    qtyInput: string;
    unitInput: SellUnit;
    unitPriceBaseMinor?: number | null; // (int) por 1 pricingUnit
  }>;
};

export type SetSaleItemsResponseData = {
  id: string;
  status: SaleStatus;
};

// ====== HOLD ======
export type HoldSaleInput = { minutes?: number };
export type HoldSaleResponseData = { id: string; status: SaleStatus };
export type ReleaseHoldResponseData = { id: string; status: SaleStatus };

// ====== PAY ======
export type PaySaleInput = {
  cashSessionId: string;
  payments: Array<{
    method: PaymentMethod;
    currency: Currency;
    tenderMinor: number;
    fxRate?: string | null;
    provider?: string | null;
    reference?: string | null;
  }>;
};

export type PaySaleResponseData = {
  sale: {
    id: string;
    cashSessionId: string;
    status: SaleStatus;

    // ✅ BigInt-safe
    tenderedBaseMinor: MoneyStr;
    changeBaseMinor: MoneyStr;

    openDrawer: boolean;
  };
  payments: PaymentDTO[];
};

// ====== VOID ======
export type VoidSaleInput = { reason?: string | null };
export type VoidSaleResponseData = { id: string; status: SaleStatus };

// ====== GET ======
export type GetSaleResponseData = { sale: SaleDTO };

// ====== VALIDATE ======
export type ValidateSaleInput = {
  applyFix?: boolean;
  includeUpdatedSale?: boolean;
};

export type ValidateInsufficientItem = {
  variantId: string;
  label: string;

  requested: number; // baseMinor (server) - sigue number porque es qtyBaseMinor (int)
  available: number; // baseMinor (server)
  action: "REMOVE" | "CLAMP";
  newQty: number; // baseMinor (server)

  unit: SellUnit;
  requestedDisplay: string;
  availableDisplay: string;
  newQtyDisplay: string;
};

export type ValidateSaleUpdatedItemDTO = {
  variantId: string;
  qtyBaseMinor: number;
  unit: SellUnit;
  qtyDisplay: string;
};

export type ValidateSaleUpdatedDTO = {
  totals: { totalBaseMinor: MoneyStr }; // ✅ BigInt-safe
  items: ValidateSaleUpdatedItemDTO[];
};

export type ValidateSaleResult =
  | { status: "OK"; saleId: string; totals?: { totalBaseMinor: MoneyStr } }
  | {
      status: "INSUFFICIENT_STOCK";
      saleId: string;
      insufficient: ValidateInsufficientItem[];
      updated?: ValidateSaleUpdatedDTO;
    };