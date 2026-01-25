// src/lib/modules/inventory/warehouses/warehouse.service.ts
import type { WarehousePort } from "./warehouse.port";
import { warehouseHttp } from "./warehouse.http";
import type { WarehouseListQuery, MyWarehouseListQuery, WarehouseListRow, WarehouseDTO } from "./warehouse.dto";

export class WarehouseService {
  constructor(private readonly port: WarehousePort) {}

  // ADMIN
  list(params: WarehouseListQuery) {
    return this.port.list(params);
  }

  async listActive(params: WarehouseListQuery): Promise<WarehouseListRow[]> {
    const res = await this.port.list({ ...params, isActive: true });
    return res.rows;
  }

  // CONTEXT (por terminal)
  listMy(params?: MyWarehouseListQuery) {
    return this.port.listMy(params);
  }

  async listMyActive(params?: Omit<MyWarehouseListQuery, "isActive">): Promise<WarehouseListRow[]> {
    const res = await this.port.listMyActive(params);
    return res.rows;
  }

  getById(id: string): Promise<WarehouseDTO> {
    return this.port.getById(id);
  }

  create(input: Parameters<WarehousePort["create"]>[0]) {
    return this.port.create(input);
  }

  update(id: string, input: Parameters<WarehousePort["update"]>[1]) {
    return this.port.update(id, input);
  }

  activate(id: string) {
    return this.port.activate(id);
  }

  deactivate(id: string) {
    return this.port.deactivate(id);
  }
}

export const warehouseService = new WarehouseService(warehouseHttp);
