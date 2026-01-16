import { slugify } from "@/lib/slugify";

// src/lib/utils/categorySlug.ts
export function buildCategorySlug(params: {
  name: string;
  parentSlug?: string | null;
}): string {
  const self = slugify(params.name);
  if (!params.parentSlug) return self;
  return `${params.parentSlug}/${self}`;
}
