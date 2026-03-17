"use client";

import type { JSX } from "react";
import { CashCountClosePanel } from "./CashCountClosePanel";
import type { CashCounted, CashCountReportDTO, CashMode } from "@/lib/modules/cash/cash.dto";

export function CashCountCloseModal(props: {
  open: boolean;
  mode: CashMode;
  forceCloseRequired?: boolean;
  onClose: () => void;
  onCount: (counted: CashCounted) => Promise<{ report: CashCountReportDTO }>;
  onCloseCash: (counted: CashCounted) => Promise<void>;
}): JSX.Element | null {
  if (!props.open) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-black/40">
      <div className="absolute inset-0 bg-background">
        <CashCountClosePanel
          key={`${props.mode}:${props.open ? "open" : "closed"}:${props.forceCloseRequired ? "forced" : "normal"}`}
          mode={props.mode}
          forceCloseRequired={props.forceCloseRequired ?? false}
          onClose={props.onClose}
          onCount={props.onCount}
          onCloseCash={props.onCloseCash}
        />
      </div>
    </div>
  );
}