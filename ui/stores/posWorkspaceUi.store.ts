// ui/components/features/pos/sales/stores/posWorkspaceUi.store.ts
import { create } from "zustand";

export type PosWorkspaceUiState = {
  categoryId: string;
  categoryLabel: string;
  query: string;

  setCategory: (payload: { id: string; label: string }) => void;
  setQuery: (query: string) => void;

  reset: () => void;
};

export const usePosWorkspaceUi = create<PosWorkspaceUiState>((set) => ({
  categoryId: "all",
  categoryLabel: "Todas",
  query: "",

  setCategory: ({ id, label }) => set({ categoryId: id, categoryLabel: label }),
  setQuery: (query) => set({ query }),

  reset: () => set({ categoryId: "all", categoryLabel: "Todas", query: "" }),
}));
