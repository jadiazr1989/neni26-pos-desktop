// src/modules/catalog/categories/category.service.ts
import type { CategoryPort } from "./category.port";
import { CategoryHttpAdapter } from "./category.http";
import type { CreateCategoryInput, UpdateCategoryInput, CategoryDTO } from "./category.dto";
import { apiFetch } from "@/lib/api/fetch";
export type ListCategoriesQuery = {
  search?: string;
  parentId?: string | null;
  take?: number;
  skip?: number;
};
class CategoryService {
  constructor(private readonly port: CategoryPort) {}

  async list(q: ListCategoriesQuery): Promise<CategoryDTO[]> {
    const params = new URLSearchParams();
    if (q.search) params.set("search", q.search);
    if (q.parentId !== undefined) params.set("parentId", q.parentId === null ? "null" : q.parentId);
    if (q.take != null) params.set("take", String(q.take));
    if (q.skip != null) params.set("skip", String(q.skip));

    const res = await apiFetch<{ categories: CategoryDTO[] }>(`/api/v1/categories?${params.toString()}`);
    return res.categories;
  }

  async create(input: CreateCategoryInput): Promise<string> {
    const res = await this.port.create(input); 
    return res.categoryId;
  }

  async update(id: string, patch: UpdateCategoryInput): Promise<void> {
    await this.port.update(id, patch);
  }

  async remove(id: string): Promise<void> {
    await this.port.remove(id);
  }

  async uploadImage(id: string, file: File): Promise<void> {
    await this.port.uploadImage(id, file);
  }
}

export const categoryService = new CategoryService(new CategoryHttpAdapter());
