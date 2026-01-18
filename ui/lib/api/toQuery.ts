import { ListParams } from "../modules/catalog/categories/category.port";

// src/lib/api/toQuery.ts
export function toQueryString(obj?: Record<string, unknown>): string {
  if (!obj) return "";
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    qs.set(k, v === null ? "null" : String(v));
  }
  const s = qs.toString();
  return s ? `?${s}` : "";
}


export function toQueryCategoryParent(params?: ListParams): string {
  if (!params) return "";
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.parentId !== undefined) qs.set("parentId", params.parentId === null ? "null" : params.parentId);
  if (typeof params.take === "number") qs.set("take", String(params.take));
  if (typeof params.skip === "number") qs.set("skip", String(params.skip));
  const s = qs.toString();
  return s ? `?${s}` : "";
}