import { Card, CardContent, CardHeader } from "@/components/ui";
import { cn } from "@/lib";

export function KpiCard(props: {
  title: string;
  value: string;
  hint: string;
  tone?: "default" | "success" | "warning";
}) {
  const ring =
    props.tone === "success"
      ? "ring-1 ring-emerald-500/20"
      : props.tone === "warning"
        ? "ring-1 ring-amber-500/25"
        : "ring-1 ring-border/60";

  return (
    <Card className={cn("rounded-2xl", ring)}>
      <CardHeader className="pb-2">
        <div className="text-xs text-muted-foreground">{props.title}</div>
        <div className="text-xl font-semibold tabular-nums">{props.value}</div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-xs text-muted-foreground">{props.hint}</div>
      </CardContent>
    </Card>
  );
}
