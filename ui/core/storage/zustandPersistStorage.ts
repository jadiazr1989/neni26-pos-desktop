// core/storage/zustandPersistStorage.ts
import type { StateStorage } from "zustand/middleware";
import { getStorage } from "./storage";

const memory = new Map<string, string | null>();

export function seedPersistMemory(key: string, value: string | null) {
  memory.set(key, value);
}

export const zustandPersistStorage: StateStorage = {
  getItem: (name) => {
    return memory.get(name) ?? null;
  },

  setItem: (name, value) => {
    memory.set(name, value);
    void getStorage().set(name, value);
  },

  removeItem: (name) => {
    memory.delete(name);
    void getStorage().remove(name);
  },
};
