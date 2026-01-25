// src/lib/modules/inventory/warehouses/warehouse.port.ts
import type {
  WarehouseDTO,
  WarehouseListQuery,
  MyWarehouseListQuery,
  ListWarehousesResponse,
  CreateWarehouseInput,
  UpdateWarehouseInput,
} from "./warehouse.dto";

export interface WarehousePort {
  // ADMIN
  list(params: WarehouseListQuery): Promise<ListWarehousesResponse>;

  // CONTEXT (por terminal)
  listMy(params?: MyWarehouseListQuery): Promise<ListWarehousesResponse>;
  listMyActive(params?: Omit<MyWarehouseListQuery, "isActive">): Promise<ListWarehousesResponse>;

  getById(id: string): Promise<WarehouseDTO>;
  create(input: CreateWarehouseInput): Promise<WarehouseDTO>;
  update(id: string, input: UpdateWarehouseInput): Promise<WarehouseDTO>;
  activate(id: string): Promise<WarehouseDTO>;
  deactivate(id: string): Promise<WarehouseDTO>;
}
