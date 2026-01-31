"use client";

import { ServiceProvider } from "@/di";
import { useCashStore, useTerminalStore } from "@/stores";
import { useFavorites } from "@/stores/favorites.store";
import { useEffect, useRef } from "react";
import { Toaster } from "@/components/ui/sonner";
import { useUiStore } from "@/stores/ui.store";

export default function ClientProviders({ children }: { readonly children: React.ReactNode }) {
  const didHydrateRef = useRef(false);

  useEffect(() => {
    if (didHydrateRef.current) return;
    didHydrateRef.current = true;

    void useUiStore.getState().hydrate();
    void useTerminalStore.getState().hydrate();
    void useCashStore.getState().hydrate();
    void useFavorites.getState().hydrate();
  }, []);

  return (
    <ServiceProvider>
      {children}
      <Toaster position="top-right" />
    </ServiceProvider>
  );
}
