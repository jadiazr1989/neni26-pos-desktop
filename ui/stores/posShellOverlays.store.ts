import { create } from "zustand";

export type CashMode = "COUNT" | "CLOSE";

type State = {
  cashModalOpen: boolean;
  cashMode: CashMode;

  openCashModal: (mode: CashMode) => void;
  closeCashModal: () => void;
};

export const usePosShellOverlays = create<State>((set) => ({
  cashModalOpen: false,
  cashMode: "COUNT",

  openCashModal: (mode) => set({ cashModalOpen: true, cashMode: mode }),
  closeCashModal: () => set({ cashModalOpen: false }),
}));
