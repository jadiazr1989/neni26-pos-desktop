// src/app/catalog/products/[id]/page.tsx

import { ProductDetailScreen } from "@/components/features/catalog/products/ProductDetailScreen";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  return <ProductDetailScreen productId={id} />;
}
