import type { CreateVariantInput, UpdateVariantInput, ProductVariantDTO } from "@/lib/modules/catalog/products/product.dto";

export type VariantFormValue = {
  sku: string;
  barcode: string | null;
  title: string | null;
  unit: CreateVariantInput["unit"];
  priceBaseMinor: number;
  costBaseMinor: number;
  imageFile: File | null;
};

export type VariantSubmitMode = "create" | "edit";

export type VariantServicePort = {
  createVariant: (productId: string, input: CreateVariantInput) => Promise<string>;
  updateVariant: (variantId: string, patch: UpdateVariantInput) => Promise<void>;
  uploadVariantImage: (variantId: string, file: File) => Promise<void>;
};

export async function submitVariant(args: {
  mode: VariantSubmitMode;
  productId: string;
  initial: Pick<ProductVariantDTO, "id"> | null;
  value: VariantFormValue;
  service: VariantServicePort;
}): Promise<{ variantId: string }> {
  if (args.mode === "create") {
    if (!args.value.imageFile) throw new Error("Imagen requerida para crear la variante.");

    const variantId = await args.service.createVariant(args.productId, {
      sku: args.value.sku,
      barcode: args.value.barcode,
      title: args.value.title,
      attributes: null, // ✅ si tu backend lo exige y aquí no lo capturas aún
      unit: args.value.unit,
      priceBaseMinor: args.value.priceBaseMinor,
      costBaseMinor: args.value.costBaseMinor,
      isActive: true,
    });

    await args.service.uploadVariantImage(variantId, args.value.imageFile);
    return { variantId };
  }

  if (!args.initial) throw new Error("initial requerido en modo edit");

  await args.service.updateVariant(args.initial.id, {
    sku: args.value.sku,
    barcode: args.value.barcode,
    title: args.value.title,
    attributes: null, // idem arriba
    unit: args.value.unit,
    priceBaseMinor: args.value.priceBaseMinor,
    costBaseMinor: args.value.costBaseMinor,
  });

  if (args.value.imageFile) {
    await args.service.uploadVariantImage(args.initial.id, args.value.imageFile);
  }

  return { variantId: args.initial.id };
}
