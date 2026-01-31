// src/app/catalog/products/[id]/page.tsx

import { AdminCashReportsDetailsScreen } from "@/components/features";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  return <AdminCashReportsDetailsScreen cashSessionId={id} />;
}
