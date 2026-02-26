"use client";

import * as React from "react";
import type { PurchaseStatus } from "@/lib/modules/purchases/purchase.dto";

export function PurchaseStatusBadge({ status }: { status: PurchaseStatus }) {
  const cls =
    status === "CANCELLED"
      ? "border-red-200 bg-red-50 text-red-700"
      : status === "RECEIVED"
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : status === "ORDERED"
          ? "border-amber-200 bg-amber-50 text-amber-800"
          : "border-zinc-200 bg-zinc-50 text-zinc-700"; // DRAFT

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}
