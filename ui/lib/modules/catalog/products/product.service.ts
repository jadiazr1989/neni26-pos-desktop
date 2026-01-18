// src/lib/modules/catalog/products/product.service.ts
import type { ProductPort, ListParams } from "./product.port";
import { ProductHttpAdapter } from "./product.http";
import type {
  ProductDTO,
  ProductVariantDTO,
  CreateProductInput,
  UpdateProductInput,
  CreateVariantInput,
  UpdateVariantInput,
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

  async create(input: CreateProductInput): Promise<string> {
    const res = await this.port.create(input);
    return res.productId;
  }

  async update(id: string, patch: UpdateProductInput): Promise<void> {
    await this.port.update(id, patch);
  }

  async remove(id: string): Promise<void> {
    await this.port.remove(id);
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

  /**
   * Útil para tu Dialog: crear variante + subir imagen (si aplica)
   * - Si tu CreateVariantInput ya exige imageUrl, entonces NO uses esto.
   * - Si tu backend: createVariant crea sin imagen y luego subes file -> usa esto.
   */
  async createVariantWithImage(
    productId: string,
    input: CreateVariantInput,
    imageFile: File,
  ): Promise<string> {
    const variantId = await this.createVariant(productId, input);
    await this.uploadVariantImage(variantId, imageFile);
    return variantId;
  }
}

export const productService = new ProductService(new ProductHttpAdapter());
