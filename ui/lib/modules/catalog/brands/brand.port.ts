// src/lib/modules/catalog/brands/brand.port.ts
import type { CreateBrandInput, UpdateBrandInput, CreateBrandResponse, BrandDTO } from "./brand.dto";

export type ListBrandsQuery = {
  search?: string;
  take?: number;
  skip?: number;
};

export interface BrandPort {
  list(q: ListBrandsQuery): Promise<BrandDTO[]>;
  create(input: CreateBrandInput): Promise<CreateBrandResponse>;
  update(id: string, patch: UpdateBrandInput): Promise<void>;
  remove(id: string): Promise<void>;

  // si no existe endpoint de upload, déjalo fuera.
  uploadImage?: (id: string, file: File) => Promise<void>;
}
