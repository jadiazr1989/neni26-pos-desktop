// src/core/collections/uniqBy.ts
export function uniqBy<T, K extends string | number>(
  items: readonly T[],
  keyOf: (x: T) => K
): T[] {
  const seen = new Set<K>();
  const out: T[] = [];
  for (const it of items) {
    const k = keyOf(it);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(it);
  }
  return out;
}
