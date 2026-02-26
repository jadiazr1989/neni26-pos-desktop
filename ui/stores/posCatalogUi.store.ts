import { create } from "zustand";

type PosCatalogUiState = {
  rev: number;
  bump: () => void;
};

export const usePosCatalogUi = create<PosCatalogUiState>((set) => ({
  rev: 0,
  bump: () => set((s) => ({ rev: s.rev + 1 })),
}));
