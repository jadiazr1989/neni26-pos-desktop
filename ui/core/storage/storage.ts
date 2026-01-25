// src/core/storage/storage.ts
import type { StoragePort } from "./storagePort";
import { LocalStorageAdapter } from "./localStorageAdapter";
import { HybridStorageAdapter } from "./hybridStorageAdapter";
import { ElectronStoreAdapter } from "./electronStore.adapter";

let singleton: StoragePort | null = null;

export function getStorage(): StoragePort {
  if (singleton) return singleton;

  const local = new LocalStorageAdapter();
  const electron = new ElectronStoreAdapter();

  // ✅ híbrido: si pos no está listo al inicio, igual lee de localStorage
  singleton = new HybridStorageAdapter(
    electron,
    local,
    () => ElectronStoreAdapter.isReady()
  );

  return singleton;
}
