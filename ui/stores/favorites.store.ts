import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { zustandPersistStorage, seedPersistMemory } from "@/core/storage/zustandPersistStorage";
import { hydratePersistedKey } from "@/core/storage/hydratePersistedStore";

type FavoritesState = {
  ids: Record<string, true>;
  hydrated: boolean;

  isFav: (id: string) => boolean;
  toggle: (id: string) => void;

  // hydrate real desde storage (electron-store / localStorage)
  hydrate: () => Promise<void>;
};

const STORAGE_KEY = "pos:favorites";

type PersistShape = {
  state?: { ids?: Record<string, true> };
  version?: number;
};

export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids: {},
      hydrated: false,

      isFav: (id) => Boolean(get().ids[id]),

      toggle: (id) =>
        set((s) => {
          const next = { ...s.ids };
          if (next[id]) delete next[id];
          else next[id] = true;
          return { ids: next };
        }),

      hydrate: async () => {
        const raw = await hydratePersistedKey(STORAGE_KEY);

        // seed memoria para que persist “vea” el mismo raw
        seedPersistMemory(STORAGE_KEY, raw);

        if (!raw) {
          set({ hydrated: true });
          return;
        }

        try {
          const parsed = JSON.parse(raw) as PersistShape;
          const ids = parsed?.state?.ids ?? {};
          set({ ids, hydrated: true });
        } catch {
          set({ hydrated: true });
        }
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => zustandPersistStorage),
      partialize: (s) => ({ ids: s.ids }),
      // opcional: si quieres que al rehidratar markee hydrated (pero tú ya lo haces)
      // onRehydrateStorage: () => (state) => state && (state.hydrated = true),
    }
  )
);
