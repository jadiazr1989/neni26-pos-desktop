import { Card, CardContent, CardHeader } from "@/components/ui";
import { cn } from "@/lib";
import type { LucideIcon } from "lucide-react";

export type KpiTone = "default" | "neutral" | "success" | "warning";

export function KpiCard(props: {
  title: string;
  value: string;
  hint: string;
  tone?: KpiTone;
  icon?: LucideIcon;
  badge?: string; // ej: "Hoy", "Cerradas", "Últ. 7 días"
}) {
  const ring =
    props.tone === "success"
      ? "ring-1 ring-emerald-500/20"
      : props.tone === "warning"
        ? "ring-1 ring-amber-500/25"
        : "ring-1 ring-border/60";

  const Icon = props.icon;

  return (
    <Card className={cn("rounded-2xl", ring)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-xs font-medium tracking-wide text-muted-foreground truncate">
              {props.title}
            </div>
            <div className="text-xl font-semibold tabular-nums">{props.value}</div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {props.badge ? (
              <span className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground">
                {props.badge}
              </span>
            ) : null}

            {Icon ? (
              <span className="grid place-items-center size-9 rounded-xl border border-border bg-muted/30">
                <Icon className="size-4 text-muted-foreground" />
              </span>
            ) : null}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="text-xs text-muted-foreground">{props.hint}</div>
      </CardContent>
    </Card>
  );
}
