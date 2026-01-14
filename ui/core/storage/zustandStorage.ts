import { getStorage } from "./storage";

export const zustandStorage = {
  getItem: async (name: string) => await getStorage().get(name),
  setItem: async (name: string, value: string) => await getStorage().set(name, value),
  removeItem: async (name: string) => await getStorage().remove(name),
} as const;
