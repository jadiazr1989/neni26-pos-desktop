"use client";

import * as React from "react";

export function useCheckoutHotkeys(params: {
  enabled: boolean;
  onClose: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
  onToggleAdvanced: () => void;
  onQuickCash: () => void;
}): void {
  React.useEffect(() => {
    if (!params.enabled) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        params.onClose();
        return;
      }

      if (e.key === "F2") {
        e.preventDefault();
        params.onToggleAdvanced();
        return;
      }

      if (e.key === "F4") {
        e.preventDefault();
        params.onQuickCash();
        return;
      }

      if (e.key === "Enter") {
        if (!params.canSubmit) return;
        // No bloquear Enter cuando el usuario está en input, pero aquí queremos “POS Enter”
        e.preventDefault();
        params.onSubmit();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [params.enabled, params.onClose, params.onSubmit, params.canSubmit, params.onToggleAdvanced, params.onQuickCash]);
}
