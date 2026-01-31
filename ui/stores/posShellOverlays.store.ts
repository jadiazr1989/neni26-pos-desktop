// stores/posShellOverlays.store.ts
import { create } from "zustand";

export type CashOverlayMode = "COUNT" | "CLOSE";

type State = {
  cashModalOpen: boolean;
  cashMode: CashOverlayMode;

  openCashModal: (mode: CashOverlayMode) => void;
  closeCashModal: () => void;
};

export const usePosShellOverlays = create<State>((set) => ({
  cashModalOpen: false,
  cashMode: "COUNT",

  openCashModal: (mode) => set({ cashModalOpen: true, cashMode: mode }),
  closeCashModal: () => set({ cashModalOpen: false }),
}));
