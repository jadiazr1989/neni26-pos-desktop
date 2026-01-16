"use client";

import type { CashCountReportDTO, CurrencyCode } from "@/lib/cash.types";
import type { JSX } from "react";
import { CashCountClosePanel } from "./CashCountClosePanel";

type CashMode = "COUNT" | "CLOSE";

export function CashCountCloseModal(props: {
  open: boolean;
  mode: CashMode;
  onClose: () => void;
  onCount: (
    counted: Partial<Record<CurrencyCode, number>>
  ) => Promise<{ report: CashCountReportDTO }>;
  onCloseCash: (counted: Partial<Record<CurrencyCode, number>>) => Promise<void>;
}): JSX.Element | null {
  if (!props.open) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-black/40">
      <div className="absolute inset-0 bg-background">
        <CashCountClosePanel
          key={`${props.mode}:${props.open ? "open" : "closed"}`}
          mode={props.mode}
          onClose={props.onClose}
          onCount={props.onCount}
          onCloseCash={props.onCloseCash}
        />
      </div>
    </div>
  );
}
