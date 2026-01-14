import { create } from "zustand";
import { getStorage } from "@/core/storage/storage";
import { storageKeys } from "@/core/storage/storageKeys";

export type TerminalState = {
  xTerminalId: string | null;
  hydrate: () => Promise<void>;
  setXTerminalId: (id: string) => Promise<void>;
  clear: () => Promise<void>;
};

export const useTerminalStore = create<TerminalState>((set) => ({
  xTerminalId: null,

  hydrate: async () => {
    const storage = getStorage();
    const v = await storage.get(storageKeys.xTerminalId);
    set({ xTerminalId: v && v.length > 5 ? v : null });
  },

  setXTerminalId: async (id) => {
    const storage = getStorage();
    await storage.set(storageKeys.xTerminalId, id);
    set({ xTerminalId: id });
  },

  clear: async () => {
    const storage = getStorage();
    await storage.remove(storageKeys.xTerminalId);
    // legacy safety (si lo usaste antes)
    await storage.remove("terminalId");
    set({ xTerminalId: null });
  },
}));
