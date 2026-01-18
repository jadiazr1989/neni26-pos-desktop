// src/lib/modules/catalog/brands/brand.http.ts
import { apiFetch } from "@/lib/api/fetch";
import type { BrandPort, ListBrandsQuery } from "./brand.port";
import type {
  BrandDTO,
  CreateBrandInput,
  CreateBrandResponse,
  ListBrandsResponse,
  UpdateBrandInput,
} from "./brand.dto";

export class BrandHttpAdapter implements BrandPort {
  async list(q: ListBrandsQuery): Promise<BrandDTO[]> {
    const params = new URLSearchParams();
    if (q.search) params.set("search", q.search);
    if (q.take != null) params.set("take", String(q.take));
    if (q.skip != null) params.set("skip", String(q.skip));

    const qs = params.toString();
    const res = await apiFetch<ListBrandsResponse>(`/api/v1/brands${qs ? `?${qs}` : ""}`);
    return res.brands;
  }

  async create(input: CreateBrandInput): Promise<CreateBrandResponse> {
    return await apiFetch<CreateBrandResponse>("/api/v1/brands", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  async update(id: string, patch: UpdateBrandInput): Promise<void> {
    await apiFetch(`/api/v1/brands/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
  }

  async remove(id: string): Promise<void> {
    await apiFetch(`/api/v1/brands/${id}`, { method: "DELETE" });
  }
}
