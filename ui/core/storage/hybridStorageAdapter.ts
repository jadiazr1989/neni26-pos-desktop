// src/core/storage/hybridStorageAdapter.ts
import type { StoragePort } from "./storagePort";

export class HybridStorageAdapter implements StoragePort {
  constructor(
    private readonly primary: StoragePort,
    private readonly fallback: StoragePort,
    private readonly isPrimaryReady: () => boolean
  ) {}

  async get(key: string): Promise<string | null> {
    if (this.isPrimaryReady()) {
      const v = await this.primary.get(key);
      if (v != null) return v;
    }
    return await this.fallback.get(key);
  }

  async set(key: string, value: string): Promise<void> {
    // escribe en ambos para que haya valor aunque el bridge falle al inicio
    await this.fallback.set(key, value);
    if (this.isPrimaryReady()) await this.primary.set(key, value);
  }

  async remove(key: string): Promise<void> {
    await this.fallback.remove(key);
    if (this.isPrimaryReady()) await this.primary.remove(key);
  }
}
