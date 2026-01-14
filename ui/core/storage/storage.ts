// core/storage/storage.ts
import type { StoragePort } from "./storagePort";
import { ElectronStoreAdapter } from "./electronStore.adapter";
import { LocalStorageAdapter } from "./localStorageAdapter";

function isElectronRenderer(): boolean {
  if (typeof window === "undefined") return false;
  // @ts-expect-error bridge
  return Boolean(window.pos?.storeGet && window.pos?.storeSet && window.pos?.storeRemove);
}

let cached: StoragePort | null = null;

export function getStorage(): StoragePort {
  if (cached) return cached;
  cached = isElectronRenderer() ? new ElectronStoreAdapter() : new LocalStorageAdapter();
  return cached;
}
