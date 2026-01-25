// src/components/app/TerminalHydrator.tsx
"use client";

import { useEffect, useRef } from "react";
import { useTerminalStore } from "@/stores";

export function TerminalHydrator() {
  const once = useRef(false);

  useEffect(() => {
    if (once.current) return;
    once.current = true;

    void useTerminalStore.getState().hydrate();
  }, []);

  return null;
}
