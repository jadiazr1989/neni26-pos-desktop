// src/lib/modules/catalog/products/product.service.ts
import type { ProductPort, ListParams } from "./product.port";
import { ProductHttpAdapter } from "./product.http";
import type {
  ProductDTO,
  ProductVariantDTO,
  CreateProductInput,
  CreateProductResponse,
  UpdateProductInput,
  UpdateProductResponse,
  DeleteProductResponse,
  CreateVariantInput,
  UpdateVariantInput,
  ListPosCatalogQuery,
  ListPosCatalogResponse,
} from "./product.dto";

export type ListProductsQuery = ListParams;

class ProductService {
  constructor(private readonly port: ProductPort) {}

  async list(q: ListProductsQuery = {}): Promise<ProductDTO[]> {
    const res = await this.port.list(q);
    return res.products;
  }

  async get(id: string): Promise<ProductDTO> {
    const res = await this.port.getById(id);
    return res.product;
  }

  // ✅ mantiene tu forma actual, pero tipada con el DTO real
  async create(input: CreateProductInput): Promise<CreateProductResponse> {
    const res = await this.port.create(input);
    return { productId: res.productId, baseVariantId: res.baseVariantId };
  }

  // ✅ CAMBIO CLAVE: no es void, retorna lo que retorna el port
  async update(id: string, patch: UpdateProductInput): Promise<UpdateProductResponse> {
    return this.port.update(id, patch);
  }

  // ✅ recomendado: también retornar el response real (si lo necesitas luego)
  async remove(id: string): Promise<DeleteProductResponse> {
    return this.port.remove(id);
  }

  async createVariant(productId: string, input: CreateVariantInput): Promise<string> {
    const res = await this.port.createVariant(productId, input);
    return res.variant.id;
  }

  async updateVariant(variantId: string, patch: UpdateVariantInput): Promise<void> {
    await this.port.updateVariant(variantId, patch);
  }

  async setVariantActive(variantId: string, active: boolean): Promise<void> {
    await this.port.setVariantActive(variantId, active);
  }

  async resolve(code: string): Promise<ProductVariantDTO> {
    const res = await this.port.resolveVariant(code);
    return res.variant;
  }

  async uploadVariantImage(variantId: string, file: File): Promise<void> {
    await this.port.uploadVariantImage(variantId, file);
  }

  async createVariantWithImage(productId: string, input: CreateVariantInput, imageFile: File): Promise<string> {
    const variantId = await this.createVariant(productId, input);
    await this.uploadVariantImage(variantId, imageFile);
    return variantId;
  }

  // ✅ POS catalog
  async listPosCatalog(q: ListPosCatalogQuery = {}): Promise<ListPosCatalogResponse> {
    const payload: ListPosCatalogQuery = {
      inStock: q.inStock ?? true,
      limit: q.limit ?? 8,
      categoryId: q.categoryId ?? "all",
      q: q.q ?? "",
      cursor: q.cursor ?? null,
    };

    return this.port.listPosCatalog(payload);
  }
}

export const productService = new ProductService(new ProductHttpAdapter());
