// stores/posSale.store.types.ts
import type {
  PaymentMethod,
  Currency,
  PaymentDTO,
  ValidateInsufficientItem,
  ValidateSaleResult,
  SellUnit,
  SaleStatus,
  MoneyStr,
} from "@/lib/modules/sales/sale.dto";
import { QtyScale, SoldBy } from "./posSale.helpers";


export type SaleOptionSnapshot = {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  priceDeltaMinor: number;
};

export type SaleLine = {
  id: string;
  productId: string;
  variantId: string;

  nameSnapshot: string;

  soldBy: SoldBy;
  unitLabelSnapshot: string;

  unitInput: SellUnit;
  qtyInput: string;

  qtyBaseMinor: number;
  qtyScale: QtyScale;
  qty: number;

  pricePerUnitMinor: number;
  optionsSnapshot: SaleOptionSnapshot[];

  skuSnapshot?: string | null;
};

export type TicketTotals = {
  subtotalMinor: number;
  taxMinor: number;
  discountMinor: number;
  totalMinor: number;
};

export type SyncStatus = "idle" | "syncing" | "ready" | "error";
export type CheckoutStatus = "idle" | "paying";

export type SyncError = { code: string; message: string; details?: unknown } | null;

export type SaleItemsPayload = {
  items: Array<{
    variantId: string;
    qtyInput: string;
    unitInput: SellUnit;
    unitPriceBaseMinor?: number | null;
  }>;
};

export type PayLineInput = {
  method: PaymentMethod;
  currency: Currency;
  tenderMinor: number;
  fxRate?: string | null;
  provider?: string | null;
  reference?: string | null;
};

export type CheckoutArgs = {
  cashSessionId: string;
  payments?: PayLineInput[];
};

export type LastCheckout = {
  saleId: string;
  payments: PaymentDTO[];
  tenderedBaseMinor: MoneyStr;
  changeBaseMinor: MoneyStr;
  openDrawer: boolean;
};

export type ServerSnapshot = {
  status: SaleStatus | null;

  subtotalBaseMinor: MoneyStr | null;
  taxBaseMinor: MoneyStr | null;
  discountBaseMinor: MoneyStr | null;
  totalBaseMinor: MoneyStr | null;
  paidBaseMinor: MoneyStr | null;
};

export type TicketAdjustment = {
  variantId: string;
  label: string;
  action: "REMOVE" | "CLAMP";
  unit: string;
  requestedDisplay: string;
  availableDisplay: string;
  newQtyDisplay: string;
};

export type PosSaleState = {
  items: SaleLine[];
  totals: TicketTotals;

  server: ServerSnapshot;
  saleId: string | null;

  version: number;
  lastSyncedVersion: number;
  syncStatus: SyncStatus;
  syncError: SyncError;

  checkoutStatus: CheckoutStatus;
  lastCheckout: LastCheckout | null;

  lastTouchedLineId: string | null;
  adjustmentsOpen: boolean;
  lastAdjustments: TicketAdjustment[];

  openAdjustments: () => void;
  closeAdjustments: () => void;
  clearAdjustments: () => void;

  addLine: (
    line: Omit<SaleLine, "id" | "qtyBaseMinor" | "qtyScale" | "qty" | "qtyInput" | "unitInput"> & {
      qty: number;
      unitInput?: SellUnit | null;
      qtyInput?: string | null;
    }
  ) => void;

  changeQty: (lineId: string, qty: number) => void;
  updateLine: (
    lineId: string,
    patch: { qty?: number; optionsSnapshot?: SaleOptionSnapshot[]; unitInput?: SellUnit }
  ) => void;

  removeLine: (lineId: string) => void;
  clear: () => void;

  canPay: () => boolean;

  ensureSale: () => Promise<string>;
  sync: (opts?: { force?: boolean; silent?: boolean }) => Promise<void>;
  checkout: (args: CheckoutArgs) => Promise<LastCheckout>;

  validateBeforeCheckout: () => Promise<"OK" | "FIXED">;
};

export type InsufficientStockDetails = {
  variantId: string;
  requested: number;
  available: number;
  quantity: number;
  reservedQuantity: number;
};

export type {
  PaymentDTO,
  ValidateInsufficientItem,
  ValidateSaleResult,
  SellUnit,
  SaleStatus,
  MoneyStr,
  SoldBy,
  QtyScale,
};