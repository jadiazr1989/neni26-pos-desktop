import type { MeUser } from "@/lib/cash.types";
import { create } from "zustand";

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
