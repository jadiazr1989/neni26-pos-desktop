import { JSX } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ShoppingCart,
  RotateCcw,
  Search,
  Wallet,
  AlertTriangle,
} from "lucide-react";

type IconKey = "sale" | "returns" | "catalog" | "cash";

function ActionIcon({ kind }: { kind: IconKey }) {
  const cls = "size-5 text-muted-foreground";
  switch (kind) {
    case "sale":
      return <ShoppingCart className={cls} />;
    case "returns":
      return <RotateCcw className={cls} />;
    case "catalog":
      return <Search className={cls} />;
    case "cash":
      return <Wallet className={cls} />;
  }
}

export function ActionCard(props: {
  icon: IconKey;
  title: string;
  subtitle: string;
  hotkey?: string;
  disabled?: boolean;
  reason?: string | null;
  emphasis?: boolean;
  onOpen: () => void;
}): JSX.Element {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-4",
        "transition-colors",
        props.disabled ? "opacity-70" : "hover:bg-accent/15",
        props.emphasis ? "ring-2 ring-ring/40" : ""
      )}
    >
      {/* Top */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="mt-0.5 grid place-items-center size-10 rounded-xl border border-border bg-muted/30">
            <ActionIcon kind={props.icon} />
          </div>

          <div className="min-w-0">
            <div className="text-base font-semibold leading-tight truncate">
              {props.title}
            </div>
            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {props.subtitle}
            </div>
          </div>
        </div>

        {props.hotkey && (
          <div className="shrink-0 text-xs px-2 py-1 rounded-md border border-border bg-secondary text-secondary-foreground font-semibold">
            {props.hotkey}
          </div>
        )}
      </div>

      {/* Reason */}
      {props.reason && (
        <div className="mt-3 inline-flex items-center rounded-lg border border-[color:var(--warning)]/25 bg-[color:var(--warning)]/10 px-3 py-2 text-xs font-semibold text-[color:var(--warning-foreground)]">
          {props.reason}
        </div>
      )}


      {/* Bottom button (alineación consistente) */}
      <div className="mt-4">
        <Button
          className="w-full h-11"
          onClick={props.onOpen}
          disabled={Boolean(props.disabled)}
        >
          Abrir
        </Button>
      </div>
    </div>
  );
}
