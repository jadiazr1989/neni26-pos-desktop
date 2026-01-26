export function buildProductDetailHref(productId: string, opts?: { variantId?: string }) {
  const qs = new URLSearchParams();
  if (opts?.variantId) qs.set("variant", opts.variantId);
  const q = qs.toString();
  return `/admin/products/${productId}${q ? `?${q}` : ""}`;
}
