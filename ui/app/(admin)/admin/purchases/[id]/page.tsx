// src/app/catalog/products/[id]/page.tsx

import { PurchaseDetailScreen } from "@/components/features";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  return <PurchaseDetailScreen purchaseId={id} />;
}
