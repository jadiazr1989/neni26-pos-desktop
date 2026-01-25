// src/lib/modules/inventory/warehouses/warehouse.dto.ts

export type WarehouseDTO = {
  id: string;
  storeId?: string;
  code: string | null;
  name: string;
  location: string | null;
  isActive: boolean;

  isSystem: boolean; // ✅ NEW

  createdAt: string; // ISO
  updatedAt: string; // ISO
};

export type WarehouseListRow = {
  id: string;
  storeId?: string;
  code: string | null;
  name: string;
  location: string | null;
  isActive: boolean;

  isSystem: boolean; // ✅ NEW

  updatedAt: string; // ISO
};


// ADMIN list (requiere storeId)
export type WarehouseListQuery = {
  storeId?: string;
  search?: string | null;
  isActive?: boolean | null;
  limit?: number;
  cursor?: string | null;
};

// MY list (storeId viene del terminal)
export type MyWarehouseListQuery = {
  search?: string | null;
  isActive?: boolean | null;
  limit?: number;
  cursor?: string | null;
};

export type ListWarehousesResponse = {
  rows: WarehouseListRow[];
  nextCursor: string | null;
};

export type CreateWarehouseInput = {
  storeId?: string;
  name: string;
  code?: string | null;
  location?: string | null;
};

export type UpdateWarehouseInput = {
  name?: string;
  code?: string | null;
  location?: string | null;
};
