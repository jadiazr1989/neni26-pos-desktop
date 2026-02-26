"use client";

import * as React from "react";

export type DirtySnapshot = { qty: string; notes: string; reason: string };

export function useDirtySnapshot(args: {
  open: boolean;
  snapshotKey: string; // ej: row?.variantId
  qty: string;
  notes: string;
  reason: string;
}) {
  const [initial, setInitial] = React.useState<DirtySnapshot | null>(null);

  React.useEffect(() => {
    if (!args.open) {
      setInitial(null);
      return;
    }

    setInitial({
      qty: args.qty ?? "",
      notes: args.notes ?? "",
      reason: args.reason ?? "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [args.open, args.snapshotKey]);

  const isDirty = React.useMemo(() => {
    if (!args.open) return false;
    if (!initial) return false;

    const qty = (args.qty ?? "").trim();
    const notes = (args.notes ?? "").trim();
    const reason = (args.reason ?? "").trim();

    const iqty = (initial.qty ?? "").trim();
    const inotes = (initial.notes ?? "").trim();
    const ireason = (initial.reason ?? "").trim();

    return qty !== iqty || notes !== inotes || reason !== ireason;
  }, [args.open, initial, args.qty, args.notes, args.reason]);

  const reset = React.useCallback(() => {
    setInitial({
      qty: args.qty ?? "",
      notes: args.notes ?? "",
      reason: args.reason ?? "",
    });
  }, [args.qty, args.notes, args.reason]);

  return { isDirty, reset };
}