// src/modules/purchases/ui/ui/detail/ScreenError.tsx
"use client";

import * as React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ScreenError(props: { error: string | null }) {
  if (!props.error) return null;
  return (
    <Alert>
      <AlertDescription>{props.error}</AlertDescription>
    </Alert>
  );
}
