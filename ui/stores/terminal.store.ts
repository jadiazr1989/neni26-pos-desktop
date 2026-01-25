import { create } from "zustand";
import { getStorage } from "@/core/storage/storage";
import { storageKeys } from "@/core/storage/storageKeys";
import { setTerminalIdForRequests } from "@/core/terminal/terminalResolver";

export type TerminalState = {
  xTerminalId: string | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setXTerminalId: (id: string) => Promise<void>;
  clear: () => Promise<void>;
};

export const useTerminalStore = create<TerminalState>((set, get) => ({
  xTerminalId: null,
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;
    const storage = getStorage();
    const v = await storage.get(storageKeys.xTerminalId);
    const id = v && v.length > 5 ? v : null;

    setTerminalIdForRequests(id);              // ✅ clave
    set({ xTerminalId: id, hydrated: true });
  },

  setXTerminalId: async (id) => {
    const storage = getStorage();
    await storage.set(storageKeys.xTerminalId, id);

    setTerminalIdForRequests(id);              // ✅ clave
    set({ xTerminalId: id, hydrated: true });
  },

  clear: async () => {
    const storage = getStorage();
    await storage.remove(storageKeys.xTerminalId);
    await storage.remove("terminalId");

    setTerminalIdForRequests(null);            // ✅ clave
    set({ xTerminalId: null, hydrated: true });
  },
}));
