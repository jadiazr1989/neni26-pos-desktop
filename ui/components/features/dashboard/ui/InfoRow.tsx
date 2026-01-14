import { JSX } from "react";
import { cn } from "@/lib/utils";

export function InfoRow(props: { label: string; value: string; mono?: boolean }): JSX.Element {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="text-xs text-muted-foreground">{props.label}</div>
      <div className={cn("text-xs text-right", props.mono && "font-mono")}>{props.value}</div>
    </div>
  );
}
