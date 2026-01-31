// src/modules/catalog/categories/category.http.ts
import { apiClient } from "@/lib/api/apiClient";
import type { CategoryPort, ListParams, ListPosCategoriesParams } from "./category.port";
import type {
  CreateCategoryInput,
  CreateCategoryResponse,
  DeleteCategoryResponse,
  GetCategoryResponse,
  ListCategoriesResponse,
  ListPosCategoriesResponse,
  UpdateCategoryInput,
  UpdateCategoryResponse,
} from "./category.dto";
import { toQueryCategoryParent } from "@/lib/api/toQuery";

function toQuery(q?: ListPosCategoriesParams) {
  if (!q) return "";
  const p = new URLSearchParams();
  if (q.inStock !== undefined) p.set("inStock", String(q.inStock));
  if (q.limit) p.set("limit", String(q.limit));
  if (q.cursor) p.set("cursor", q.cursor);
  const s = p.toString();
  return s ? `?${s}` : "";
}

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

  listForPos(params: ListPosCategoriesParams): Promise<ListPosCategoriesResponse> {
    return apiClient.json(
      `/api/v1/categories/pos${toQuery(params)}`,
      { method: "GET" },
    );
  }
}
