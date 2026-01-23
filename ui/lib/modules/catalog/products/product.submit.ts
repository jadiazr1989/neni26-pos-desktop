// src/lib/modules/catalog/products/product.submit.ts
import type { CreateProductInput, UpdateProductInput } from "./product.dto";

export type CreateProductResult = { productId: string; baseVariantId: string | null };

export type ProductServicePort = {
  create(input: CreateProductInput): Promise<CreateProductResult>;
  update(id: string, patch: UpdateProductInput): Promise<void>;
};

export type ProductSubmitMode = "create" | "edit";

export type ProductFormValue = {
  name: string;
  barcode: string | null;
  description: string | null;
  brandId: string | null;
  categoryId: string;            // required
  baseUnit: "UNIT" | "LB" | "KG" | "L" | "ML"; // required en create
};

export async function submitProduct(args: {
  mode: ProductSubmitMode;
  productId: string | null;
  value: ProductFormValue;
  service: ProductServicePort;
}): Promise<CreateProductResult> {
  if (args.mode === "create") {
    return args.service.create({
      name: args.value.name,
      barcode: args.value.barcode,
      description: args.value.description,
      brandId: args.value.brandId,
      categoryId: args.value.categoryId,
      baseUnit: args.value.baseUnit,
    });
  }

  if (!args.productId) throw new Error("productId requerido para editar");

  await args.service.update(args.productId, {
    name: args.value.name,
    barcode: args.value.barcode,
    description: args.value.description,
    brandId: args.value.brandId,
    categoryId: args.value.categoryId,
    // ⚠️ edit NO cambia baseUnit (por diseño)
  });

  return { productId: args.productId, baseVariantId: null };
}
