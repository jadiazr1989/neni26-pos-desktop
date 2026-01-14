import { create } from "zustand";
import { getStorage } from "@/core/storage/storage";
import { storageKeys } from "@/core/storage/storageKeys";

type CashSessionRef = { id: string } | null;
export type CashStatus = "unknown" | "open" | "closed";

export type CashState = {
  status: CashStatus;
  active: CashSessionRef;
  hydrate: () => Promise<void>;
  setActive: (cash: CashSessionRef) => Promise<void>;
  clear: () => Promise<void>;
};

export const useCashStore = create<CashState>((set) => ({
  status: "unknown",
  active: null,

  hydrate: async () => {
    const storage = getStorage();
    const id = await storage.get(storageKeys.cashActiveId);
    if (id && id.length > 5) set({ active: { id }, status: "open" });
    else set({ active: null, status: "closed" });
  },

  setActive: async (cash) => {
    const storage = getStorage();
    if (cash?.id) await storage.set(storageKeys.cashActiveId, cash.id);
    else await storage.remove(storageKeys.cashActiveId);

    set({ active: cash, status: cash ? "open" : "closed" });
  },

  clear: async () => {
    const storage = getStorage();
    await storage.remove(storageKeys.cashActiveId);
    set({ active: null, status: "closed" });
  },
}));
