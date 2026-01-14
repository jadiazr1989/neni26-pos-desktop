// ui/components/features/pos/sales/types.ts
export type Money = number; // MVP (luego minor units)

export type UnitLabel = "lb" | "kg" | "unit";

export type SoldBy = "UNIT" | "MEASURE";

export type ProductOption = {
  id: string;
  name: string;
  priceDelta: Money; // puede ser 0
};

export type OptionGroup = {
  id: string;
  name: string;
  display: "radio" | "checkbox";
  min: number;
  max: number;
  options: ProductOption[];
};

export type Product = {
  id: string;
  name: string;
  description?: string | null;
  pricePerUnit: number;
  unit: string;
  soldBy: "MEASURE" | "UNIT";
  optionGroups?: OptionGroup[];
  imageUrl?: string | null;
  isFavorite?: boolean;
  categoryId: string;
};


export type LineItemOptionSnapshot = {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  priceDelta: number;
};

export type LineItem = {
  id: string;
  productId: string;
  nameSnapshot: string;

  soldBy: "UNIT" | "MEASURE";
  unitLabelSnapshot: string;

  qty: number;
  pricePerUnitSnapshot: number;

  optionsSnapshot: LineItemOptionSnapshot[];
};

export type ProductOptionGroup = {
  id: string;
  name: string;
  display: "radio" | "checkbox";
  min: number;
  max: number;
  options: ProductOption[];
};

export type Category = {
  id: string;
  name: string;
  imageUrl?: string | null;
};
