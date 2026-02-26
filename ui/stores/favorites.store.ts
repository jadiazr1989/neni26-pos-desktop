import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { zustandPersistStorage, seedPersistMemory } from "@/core/storage/zustandPersistStorage";
import { hydratePersistedKey } from "@/core/storage/hydratePersistedStore";

type FavoritesState = {
  ids: Record<string, true>;
  hydrated: boolean;
  rev: number;

  isFav: (id: string) => boolean;
  toggle: (id: string) => void;

  hydrate: () => Promise<void>;
};

const STORAGE_KEY = "pos:favorites";

type PersistShape = {
  state?: { ids?: Record<string, true> };
  version?: number;
};

function norm(id: string): string {
  return (id ?? "").trim(); // si quieres: .toLowerCase()
}

export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids: {},
      hydrated: false,
      rev: 0,

      isFav: (id) => Boolean(get().ids[norm(id)]),

      toggle: (id) =>
        set((s) => {
          const key = norm(id);
          if (!key) return s;

          const next = { ...s.ids };
          if (next[key]) delete next[key];
          else next[key] = true;

          return { ids: next, hydrated: true, rev: s.rev + 1 }; // ✅ hydrated true
        }),

      hydrate: async () => {
        const raw = await hydratePersistedKey(STORAGE_KEY);

        // seed memoria para que persist “vea” el mismo raw
        seedPersistMemory(STORAGE_KEY, raw);

        if (!raw) {
          set((s) => ({ hydrated: true, rev: s.rev + 1 }));
          return;
        }

        try {
          const parsed = JSON.parse(raw) as PersistShape;
          const ids = parsed?.state?.ids ?? {};
          set((s) => ({ ids, hydrated: true, rev: s.rev + 1 }));
        } catch {
          set((s) => ({ hydrated: true, rev: s.rev + 1 }));
        }
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => zustandPersistStorage),
      partialize: (s) => ({ ids: s.ids }), // rev/hydrated no se persisten
    }
  )
);
