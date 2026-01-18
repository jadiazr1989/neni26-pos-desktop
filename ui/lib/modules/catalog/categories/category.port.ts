// src/modules/catalog/categories/category.port.ts
import type {
  CreateCategoryInput,
  CreateCategoryResponse,
  DeleteCategoryResponse,
  GetCategoryResponse,
  ListCategoriesResponse,
  UpdateCategoryInput,
  UpdateCategoryResponse,
} from "./category.dto";

export type ListParams = {
  search?: string;
  parentId?: string | null;
  take?: number;
  skip?: number;
};

export interface CategoryPort {
  list(params?: ListParams): Promise<ListCategoriesResponse>;
  getById(id: string): Promise<GetCategoryResponse>;
  create(input: CreateCategoryInput): Promise<CreateCategoryResponse>;
  update(id: string, patch: UpdateCategoryInput): Promise<UpdateCategoryResponse>;
  remove(id: string): Promise<DeleteCategoryResponse>;
  uploadImage(id: string, file: File): Promise<void>;
}
