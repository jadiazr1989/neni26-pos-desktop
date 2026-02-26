// domain/stock.policy.ts
export type StockPolicy = {
  criticalBelow: number;         // ej: 5
  lowBelow: number;              // ej: 10
  showExactQtyCritical: boolean; // true
  showExactQtyLow: boolean;      // true (o false => "Bajo")
};

export const DEFAULT_STOCK_POLICY: StockPolicy = {
  criticalBelow: 5,
  lowBelow: 10,
  showExactQtyCritical: true,
  showExactQtyLow: true,
};
