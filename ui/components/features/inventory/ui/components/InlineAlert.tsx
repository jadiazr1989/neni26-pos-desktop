"use client";

import * as React from "react";

export function InlineAlert(props: { id?: string; children: React.ReactNode }) {
  return (
    <div
      id={props.id}
      className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-amber-950"
    >
      <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-md bg-amber-100 text-amber-900">
        !
      </span>
      <div className="text-xs leading-5">{props.children}</div>
    </div>
  );
}