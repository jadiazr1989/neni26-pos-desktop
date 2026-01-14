// core/storage/hydratePersistedStore.ts
import { getStorage } from "./storage";

/**
 * Lee el RAW persistido por zustand/persist (string JSON).
 * Devuelve null si no existe.
 */
export async function hydratePersistedKey(key: string): Promise<string | null> {
  const s = getStorage();
  const raw = await s.get(key);

  if (!raw) return null;

  // Si tu ElectronStoreAdapter fallback hace set("", ""), esto limpia casos legacy
  if (raw === "") return null;

  return raw;
}
