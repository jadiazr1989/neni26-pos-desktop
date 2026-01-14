import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

const toneClasses: Record<Tone, string> = {
  success: "bg-[color:var(--success)] text-[color:var(--success-foreground)]",
  warning: "bg-[color:var(--warning)] text-[color:var(--warning-foreground)]",
  danger: "bg-destructive text-destructive-foreground",
  info: "bg-[color:var(--info)] text-[color:var(--info-foreground)]",
  neutral: "bg-secondary text-secondary-foreground",
};

export function StatusChip({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2",
        "whitespace-nowrap select-none",
        "rounded-full px-3 py-1",
        "text-xs font-semibold leading-none",
        "border border-border shadow-sm",
        toneClasses[tone],
        className
      )}
    >
      <span className="size-2 rounded-full bg-current opacity-80" />
      {children}
    </span>
  );
}
