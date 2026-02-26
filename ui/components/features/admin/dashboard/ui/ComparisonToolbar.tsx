// src/modules/admin/dashboard/ui/ComparisonToolbar.tsx
"use client";
import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";

export function ComparisonToolbar(props: { left: React.ReactNode; right: React.ReactNode }) {
  return (
    <Card className="rounded-xl border-border/60">
      <CardContent className="px-4 py-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {props.left}
          <div className="text-xs text-muted-foreground">{props.right}</div>
        </div>
      </CardContent>
    </Card>
  );
}