"use client";

import { createContext, useContext, useMemo } from "react";
import type { StoragePort } from "@/core/storage/storagePort";
import { getStorage } from "@/core/storage/storage";

type Services = {
  storage: StoragePort;
};

const ServicesCtx = createContext<Services | null>(null);

export function ServiceProvider({ children }: { readonly children: React.ReactNode }) {
  const services = useMemo<Services>(() => {
    return {
      storage: getStorage(), // 🔥 decide Electron vs Browser
    };
  }, []);

  return <ServicesCtx.Provider value={services}>{children}</ServicesCtx.Provider>;
}

export function useServices(): Services {
  const ctx = useContext(ServicesCtx);
  if (!ctx) throw new Error("useServices must be used within ServiceProvider");
  return ctx;
}
