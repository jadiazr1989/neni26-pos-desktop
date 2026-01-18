// src/lib/modules/catalog/products/product.port.ts
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

export type ListParams = {
  search?: string;
  take?: number;
  skip?: number;
};

export interface ProductPort {
  // products
  list(params?: ListParams): Promise<ListProductsResponse>;
  getById(id: string): Promise<GetProductResponse>;
  create(input: CreateProductInput): Promise<CreateProductResponse>;
  update(id: string, patch: UpdateProductInput): Promise<UpdateProductResponse>;
  remove(id: string): Promise<DeleteProductResponse>;

  // variants
  createVariant(productId: string, input: CreateVariantInput): Promise<CreateVariantResponse>;
  updateVariant(variantId: string, patch: UpdateVariantInput): Promise<UpdateVariantResponse>;
  setVariantActive(variantId: string, active: boolean): Promise<void>;
  resolveVariant(code: string): Promise<{ variant: ProductVariantDTO }>;

  // upload image (tu endpoint)
  uploadVariantImage(variantId: string, file: File): Promise<void>;
}
