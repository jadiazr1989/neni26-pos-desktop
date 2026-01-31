// src/modules/catalog/categories/category.service.ts
import type { CategoryPort, ListParams } from "./category.port";
import { CategoryHttpAdapter } from "./category.http";
import type { CreateCategoryInput, UpdateCategoryInput, CategoryDTO, PosCategoryDTO } from "./category.dto";

export type ListCategoriesQuery = ListParams;

class CategoryService {
  constructor(private readonly port: CategoryPort) { }

  async list(q: ListCategoriesQuery = {}): Promise<CategoryDTO[]> {
    const res = await this.port.list(q);
    return res.categories;
  }

  async get(id: string): Promise<CategoryDTO> {
    const res = await this.port.getById(id);
    return res.category;
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

  async listForPos(params: {
    inStock?: boolean;
    limit?: number;
    cursor?: string | null;
  }): Promise<{
    rows: PosCategoryDTO[];
    nextCursor: string | null;
  }> {
    return this.port.listForPos(params);
  }

}

export const categoryService = new CategoryService(new CategoryHttpAdapter());
