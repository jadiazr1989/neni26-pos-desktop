import type { StoragePort } from "./storagePort";

type PosBridge = {
  storeGet: (key: string, fallback?: string | null) => Promise<string | null>;
  storeSet: (key: string, value: string) => Promise<void>;
  storeRemove?: (key: string) => Promise<void>; // opcional si lo agregas
};

export class ElectronStoreAdapter implements StoragePort {
  private pos(): PosBridge | null {
    if (typeof window === "undefined") return null;
    // @ts-expect-error bridge
    return window.pos ?? null;
  }

  async get(key: string): Promise<string | null> {
    const p = this.pos();
    if (!p?.storeGet) return null;
    return await p.storeGet(key, null);
  }

  async set(key: string, value: string): Promise<void> {
    const p = this.pos();
    if (!p?.storeSet) return;
    await p.storeSet(key, value);
  }

  async remove(key: string): Promise<void> {
    const p = this.pos();
    if (!p?.storeRemove) return;
    await p.storeRemove(key);
  }

}
