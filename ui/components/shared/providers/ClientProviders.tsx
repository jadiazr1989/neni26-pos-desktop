"use client";

import { ServiceProvider } from "@/di";
import { useCashStore, useTerminalStore } from "@/stores";
import { useFavorites } from "@/stores/favorites.store";
import { useEffect, useRef } from "react";

export default function ClientProviders({ children }: { readonly children: React.ReactNode }) {
  const didHydrate = useRef(false);

  useEffect(() => {
    if (didHydrate.current) return;
    didHydrate.current = true;

    void useFavorites.getState().hydrate();
    void useTerminalStore.getState().hydrate();
    void useCashStore.getState().hydrate();
  }, []);

  return <ServiceProvider>{children}</ServiceProvider>;
}
