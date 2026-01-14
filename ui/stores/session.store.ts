import { create } from "zustand";
import type { MeUser } from "@/lib/api.types";

type SessionState = {
  user: MeUser | null;
  status: "unknown" | "authenticated" | "unauthenticated";
  setUser: (u: MeUser | null) => void;
  setStatus: (s: SessionState["status"]) => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  status: "unknown",
  setUser: (user) => set({ user }),
  setStatus: (status) => set({ status }),
}));
