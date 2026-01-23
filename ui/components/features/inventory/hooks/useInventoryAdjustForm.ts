"use client";

import * as React from "react";
import type { InventoryAdjustLineInput, InventoryAdjustLineUI, ResolvedVariantUI } from "@/lib/modules/inventory/inventory.dto";

type State = {
  reason: string;
  referenceId: string;
  lines: InventoryAdjustLineUI[];
  error: string | null;
};

type ValidateOk = {
  ok: true;
  value: {
    reason: string | null;
    referenceId?: string;
    lines: InventoryAdjustLineInput[];
  };
};

type ValidateErr = { ok: false; error: string };

function uid(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeNotes(s: string): string | null {
  const t = s.trim();
  return t ? t : null;
}

function emptyLine(): InventoryAdjustLineUI {
  return {
    id: uid(),
    code: "",
    variantId: "",
    qtyDelta: "0",
    notes: "",
    variant: null,
    error: null,
  };
}

export function useInventoryAdjustForm(params: { open: boolean }) {
  const [state, setState] = React.useState<State>({
    reason: "",
    referenceId: "",
    lines: [emptyLine()],
    error: null,
  });

  function patch(p: Partial<State>) {
    setState((s) => ({ ...s, ...p }));
  }

  function setError(msg: string | null) {
    setState((s) => ({ ...s, error: msg }));
  }

  function reset() {
    setState({
      reason: "",
      referenceId: "",
      lines: [emptyLine()],
      error: null,
    });
  }

  React.useEffect(() => {
    if (!params.open) return;
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.open]);

  function addLine() {
    setState((s) => ({ ...s, lines: [...s.lines, emptyLine()] }));
  }

  function removeLine(lineId: string) {
    setState((s) => {
      const next = s.lines.filter((x) => x.id !== lineId);
      return { ...s, lines: next.length ? next : [emptyLine()] };
    });
  }

  function patchLine(lineId: string, p: Partial<InventoryAdjustLineUI>) {
    setState((s) => ({
      ...s,
      lines: s.lines.map((x) => (x.id === lineId ? { ...x, ...p } : x)),
    }));
  }

  function setResolvedVariant(lineId: string, v: ResolvedVariantUI) {
    patchLine(lineId, { variantId: v.id, variant: v, error: null });
  }

  function setLineError(lineId: string, msg: string) {
    patchLine(lineId, { variantId: "", variant: null, error: msg });
  }

  function clearResolvedVariant(lineId: string) {
    patchLine(lineId, { variantId: "", variant: null, error: null });
  }

  function validate(): ValidateOk | ValidateErr {
    const lines = state.lines;

    if (!lines.length) return { ok: false, error: "Debes agregar al menos 1 línea." };
    if (lines.length > 200) return { ok: false, error: "Demasiadas líneas (máximo 200)." };

    const parsed: InventoryAdjustLineInput[] = [];

    for (let i = 0; i < lines.length; i++) {
      const row = lines[i];

      const variantId = row.variantId.trim();
      if (!variantId) {
        const code = row.code.trim();
        return {
          ok: false,
          error: `Línea ${i + 1}: debes buscar/seleccionar una variante (${code ? `código: ${code}` : "sin código"}).`,
        };
      }

      const nRaw = Number(row.qtyDelta.trim());
      if (!Number.isFinite(nRaw) || !Number.isInteger(nRaw) || nRaw === 0) {
        return { ok: false, error: `Línea ${i + 1}: qtyDelta inválido (entero distinto de 0).` };
      }

      const notes = normalizeNotes(row.notes);

      parsed.push({
        variantId,
        qtyDelta: nRaw,
        ...(notes !== null ? { notes } : {}),
      });
    }

    const seen = new Set<string>();
    for (const l of parsed) {
      if (seen.has(l.variantId)) return { ok: false, error: "No repitas la misma variante en varias líneas. Combina los deltas." };
      seen.add(l.variantId);
    }

    const reason = state.reason.trim() ? state.reason.trim() : null;
    const referenceId = state.referenceId.trim() ? state.referenceId.trim() : undefined;

    return { ok: true, value: { reason, ...(referenceId ? { referenceId } : {}), lines: parsed } };
  }

  return {
    state,
    patch,
    setError,
    reset,
    addLine,
    removeLine,
    patchLine,
    setResolvedVariant,
    setLineError,
    clearResolvedVariant,
    validate,
  };
}
