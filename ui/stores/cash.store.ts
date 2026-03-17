import { create } from "zustand";
import { getStorage } from "@/core/storage/storage";
import { storageKeys } from "@/core/storage/storageKeys";
import type {
  CashSessionCloseReason,
  CashSessionDTO,
  CashSessionOpenReason,
  CashSessionStatus,
} from "@/lib/modules/cash/cash.dto";

export type CashSessionRef = {
  id: string;
  warehouseId?: string | null;
  terminalId?: string | null;
  openedAt?: string | null;
  closedAt?: string | null;
  businessDay?: string | null;
  status?: CashSessionStatus | null;
  openReason?: CashSessionOpenReason | null;
  closeReason?: CashSessionCloseReason | null;
  shiftLabel?: string | null;
  openedById?: string | null;
  closedById?: string | null;
} | null;

export type CashStatus = "unknown" | "open" | "closed";

export type CashState = {
  status: CashStatus;
  active: CashSessionRef;
  hydrate: () => Promise<void>;
  setActive: (cash: CashSessionRef) => Promise<void>;
  setFromSession: (session: CashSessionDTO | null) => Promise<void>;
  clear: () => Promise<void>;
};

function toCashSessionRef(session: CashSessionDTO | null): CashSessionRef {
  if (!session?.id) return null;

  return {
    id: session.id,
    warehouseId: session.warehouseId ?? null,
    terminalId: session.terminalId ?? null,
    openedAt: session.openedAt ?? null,
    closedAt: session.closedAt ?? null,
    businessDay: session.businessDay ?? null,
    status: session.status ?? null,
    openReason: session.openReason ?? null,
    closeReason: session.closeReason ?? null,
    shiftLabel: session.shiftLabel ?? null,
    openedById: session.openedById ?? null,
    closedById: session.closedById ?? null,
  };
}

export const useCashStore = create<CashState>((set) => ({
  status: "unknown",
  active: null,

  hydrate: async () => {
    const storage = getStorage();

    const id = await storage.get(storageKeys.cashActiveId);
    const raw = await storage.get(`${storageKeys.cashActiveId}:snapshot`);

    let snapshot: CashSessionRef = null;

    if (raw) {
      try {
        const parsed = JSON.parse(raw) as CashSessionRef;
        if (parsed?.id && parsed.id.length > 5) {
          snapshot = parsed;
        }
      } catch {
        snapshot = null;
      }
    }

    if (snapshot?.id) {
      set({
        active: snapshot,
        // ✅ no afirmar "open" todavía solo por storage
        status: "unknown",
      });
      return;
    }

    if (id && id.length > 5) {
      set({
        active: { id },
        // ✅ backend confirmará si realmente sigue abierta
        status: "unknown",
      });
      return;
    }

    set({
      active: null,
      status: "closed",
    });
  },

  setActive: async (cash) => {
    const storage = getStorage();

    if (cash?.id) {
      await storage.set(storageKeys.cashActiveId, cash.id);
      await storage.set(`${storageKeys.cashActiveId}:snapshot`, JSON.stringify(cash));
    } else {
      await storage.remove(storageKeys.cashActiveId);
      await storage.remove(`${storageKeys.cashActiveId}:snapshot`);
    }

    set({
      active: cash,
      status: cash ? (cash.status === "CLOSED" ? "closed" : "open") : "closed",
    });
  },

  setFromSession: async (session) => {
    const ref = toCashSessionRef(session);
    const storage = getStorage();

    if (ref?.id) {
      await storage.set(storageKeys.cashActiveId, ref.id);
      await storage.set(`${storageKeys.cashActiveId}:snapshot`, JSON.stringify(ref));
    } else {
      await storage.remove(storageKeys.cashActiveId);
      await storage.remove(`${storageKeys.cashActiveId}:snapshot`);
    }

    set({
      active: ref,
      status: ref ? (ref.status === "CLOSED" ? "closed" : "open") : "closed",
    });
  },

  clear: async () => {
    const storage = getStorage();
    await storage.remove(storageKeys.cashActiveId);
    await storage.remove(`${storageKeys.cashActiveId}:snapshot`);

    set({
      active: null,
      status: "closed",
    });
  },
}));