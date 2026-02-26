// src/modules/admin/dashboard/ui/SectionTitle.tsx
"use client";
import * as React from "react";

export function SectionTitle(props: { title: string; subtitle?: string }) {
  return (
    <div className="min-w-0">
      <div className="text-base font-semibold leading-none">{props.title}</div>
      {props.subtitle ? <div className="mt-1 text-xs text-muted-foreground">{props.subtitle}</div> : null}
    </div>
  );
}