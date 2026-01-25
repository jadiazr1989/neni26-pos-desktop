// src/core/storage/electronStoreAdapter.ts
import type { StoragePort } from "./storagePort";

type PosBridge = {
  storeGet: (key: string, fallback?: string | null) => Promise<string | null>;
  storeSet: (key: string, value: string) => Promise<void>;
  storeRemove?: (key: string) => Promise<void>;
};

function getPosBridge(): PosBridge | null {
  if (typeof window === "undefined") return null;

  const w = window as unknown as { pos?: unknown };
  const pos = w.pos;

  if (!pos || typeof pos !== "object") return null;

  const p = pos as Partial<PosBridge>;
  if (typeof p.storeGet !== "function") return null;
  if (typeof p.storeSet !== "function") return null;

  return p as PosBridge;
}

export class ElectronStoreAdapter implements StoragePort {
  static isReady(): boolean {
    return getPosBridge() != null;
  }

  async get(key: string): Promise<string | null> {
    const p = getPosBridge();
    if (!p) return null;
    return await p.storeGet(key, null);
  }

  async set(key: string, value: string): Promise<void> {
    const p = getPosBridge();
    if (!p) return;
    await p.storeSet(key, value);
  }

  async remove(key: string): Promise<void> {
    const p = getPosBridge();
    if (!p?.storeRemove) return;
    await p.storeRemove(key);
  }
}
