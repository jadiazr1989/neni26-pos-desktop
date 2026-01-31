// src/stores/ui.store.ts
import { create } from "zustand";
import { getStorage } from "@/core/storage/storage";
import { storageKeys } from "@/core/storage/storageKeys";

export type FontSize = "s" | "m" | "l";

type UiState = {
  font: FontSize;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setFont: (v: FontSize) => Promise<void>;
};

function applyFont(v: FontSize): void {
  document.documentElement.dataset.font = v;
}

export const useUiStore = create<UiState>((set, get) => ({
  font: "m",
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;
    const storage = getStorage();
    const v = await storage.get(storageKeys.uiFont);
    const font: FontSize = v === "s" || v === "m" || v === "l" ? v : "m";
    applyFont(font);
    set({ font, hydrated: true });
  },

  setFont: async (v) => {
    const storage = getStorage();
    await storage.set(storageKeys.uiFont, v);
    applyFont(v);
    set({ font: v, hydrated: true });
  },
}));
