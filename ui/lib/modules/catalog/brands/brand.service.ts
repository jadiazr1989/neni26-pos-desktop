// src/lib/modules/catalog/brands/brand.service.ts
import type { BrandPort, ListBrandsQuery } from "./brand.port";
import { BrandHttpAdapter } from "./brand.http";
import type { BrandDTO, CreateBrandInput, UpdateBrandInput } from "./brand.dto";

class BrandService {
  constructor(private readonly port: BrandPort) {}

  list(q: ListBrandsQuery): Promise<BrandDTO[]> {
    return this.port.list(q);
  }
  async create(input: CreateBrandInput): Promise<string> {
    const res = await this.port.create(input);
    return res.id;
  }
  update(id: string, patch: UpdateBrandInput): Promise<void> {
    return this.port.update(id, patch);
  }
  remove(id: string): Promise<void> {
    return this.port.remove(id);
  }

  // si NO tienes endpoint real, no lo uses.
  uploadImage(id: string, file: File): Promise<void> {
    if (!this.port.uploadImage) throw new Error("Brand image upload not supported by API.");
    return this.port.uploadImage(id, file);
  }
}

export const brandService = new BrandService(new BrandHttpAdapter());
