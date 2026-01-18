// src/modules/catalog/categories/category.http.ts
import { apiClient } from "@/lib/api/apiClient";
import type { CategoryPort, ListParams } from "./category.port";
import type {
  CreateCategoryInput,
  CreateCategoryResponse,
  DeleteCategoryResponse,
  GetCategoryResponse,
  ListCategoriesResponse,
  UpdateCategoryInput,
  UpdateCategoryResponse,
} from "./category.dto";
import { toQueryCategoryParent } from "@/lib/api/toQuery";


export class CategoryHttpAdapter implements CategoryPort {
  list(params?: ListParams): Promise<ListCategoriesResponse> {
    return apiClient.json(`/api/v1/categories${toQueryCategoryParent(params)}`, { method: "GET" });
  }

  getById(id: string): Promise<GetCategoryResponse> {
    return apiClient.json(`/api/v1/categories/${id}`, { method: "GET" });
  }

  create(input: CreateCategoryInput): Promise<CreateCategoryResponse> {
    return apiClient.json(`/api/v1/categories`, { method: "POST", body: input });
  }

  update(id: string, patch: UpdateCategoryInput): Promise<UpdateCategoryResponse> {
    return apiClient.json(`/api/v1/categories/${id}`, { method: "PATCH", body: patch });
  }

  remove(id: string): Promise<DeleteCategoryResponse> {
    return apiClient.json(`/api/v1/categories/${id}`, { method: "DELETE" });
  }

  async uploadImage(id: string, file: File): Promise<void> {
    const fd = new FormData();
    fd.append("image", file);
    await apiClient.form(`/api/v1/categories/${id}/image`, fd, { method: "POST" });
  }
}
