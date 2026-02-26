"use client";

import * as React from "react";

export function useAutofocusOnOpen(params: {
  open: boolean;
  focusRef: React.RefObject<HTMLInputElement | null>;
  delayMs?: number;
}): void {
  React.useEffect(() => {
    if (!params.open) return;
    const t = window.setTimeout(() => {
      const el = params.focusRef.current;
      el?.focus();
      el?.select();
    }, params.delayMs ?? 0);
    return () => window.clearTimeout(t);
  }, [params.open, params.focusRef, params.delayMs]);
}
