// src/lib/modules/catalog/products/product.http.ts
import { apiClient } from "@/lib/api/apiClient";
import type { ProductPort, ListParams } from "./product.port";
import type {
  CreateProductInput,
  CreateProductResponse,
  DeleteProductResponse,
  GetProductResponse,
  ListProductsResponse,
  UpdateProductInput,
  UpdateProductResponse,
  CreateVariantInput,
  CreateVariantResponse,
  UpdateVariantInput,
  UpdateVariantResponse,
  ProductVariantDTO,
} from "./product.dto";

function toQuery(params?: ListParams): string {
  if (!params) return "";
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (typeof params.take === "number") qs.set("take", String(params.take));
  if (typeof params.skip === "number") qs.set("skip", String(params.skip));
  const s = qs.toString();
  return s ? `?${s}` : "";
}

export class ProductHttpAdapter implements ProductPort {
  // products
  list(params?: ListParams): Promise<ListProductsResponse> {
    return apiClient.json(`/api/v1/products${toQuery(params)}`, { method: "GET" });
  }

  getById(id: string): Promise<GetProductResponse> {
    return apiClient.json(`/api/v1/products/${id}`, { method: "GET" });
  }

  create(input: CreateProductInput): Promise<CreateProductResponse> {
    return apiClient.json(`/api/v1/products`, { method: "POST", body: input });
  }

  update(id: string, patch: UpdateProductInput): Promise<UpdateProductResponse> {
    return apiClient.json(`/api/v1/products/${id}`, { method: "PATCH", body: patch });
  }

  remove(id: string): Promise<DeleteProductResponse> {
    return apiClient.json(`/api/v1/products/${id}`, { method: "DELETE" });
  }

  // variants
  createVariant(productId: string, input: CreateVariantInput): Promise<CreateVariantResponse> {
    return apiClient.json(`/api/v1/products/${productId}/variants`, { method: "POST", body: input });
  }

  updateVariant(variantId: string, patch: UpdateVariantInput): Promise<UpdateVariantResponse> {
    return apiClient.json(`/api/v1/products/variants/${variantId}`, { method: "PATCH", body: patch });
  }

  async setVariantActive(variantId: string, active: boolean): Promise<void> {
    await apiClient.json(`/api/v1/products/variants/${variantId}/active?active=${active ? "true" : "false"}`, {
      method: "POST",
    });
  }

  resolveVariant(code: string): Promise<{ variant: ProductVariantDTO }> {
    const qs = new URLSearchParams({ code }).toString();
    return apiClient.json(`/api/v1/products/variants/resolve?${qs}`, { method: "GET" });
  }

  async uploadVariantImage(variantId: string, file: File): Promise<void> {
    const fd = new FormData();
    fd.append("image", file);
    await apiClient.form(`/api/v1/products/variants/${variantId}/image`, fd, { method: "POST" });
  }
}
