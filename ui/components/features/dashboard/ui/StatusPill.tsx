"use client";

import * as React from "react";
import { StatusChip } from "@/components/features/shell/ui/StatusChip";

export function StatusPill(props: { label: string; tone?: "success" | "warning" | "danger" | "info" | "neutral" }) {
  return <StatusChip tone={props.tone}>{props.label}</StatusChip>;
}
