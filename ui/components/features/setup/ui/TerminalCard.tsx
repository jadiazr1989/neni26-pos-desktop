import { JSX } from "react";
import { Button } from "@/components/ui/button";
import type { TerminalDTO } from "../hooks/useTerminals";

export function TerminalCard(props: {
  terminal: TerminalDTO;
  disabled?: boolean;
  onSelect: () => void;
}): JSX.Element {
  const t = props.terminal;

  const usable = t.isActive && Boolean(t.code);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-zinc-100">{t.name}</div>
          <div className="text-xs text-zinc-400">
            Code: <span className="text-zinc-200">{t.code ?? "—"}</span>
          </div>
          <div className="text-xs text-zinc-500 font-mono break-all">
            Warehouse: {t.warehouseId}
          </div>
          <div className="text-xs">
            Status:{" "}
            <span className={t.isActive ? "text-emerald-300" : "text-red-300"}>
              {t.isActive ? "ACTIVE" : "INACTIVE"}
            </span>
            {!usable && (
              <span className="text-amber-200"> · Needs code</span>
            )}
          </div>
        </div>

        <Button
          onClick={props.onSelect}
          disabled={props.disabled || !usable}
          className="shrink-0"
        >
          Use this terminal
        </Button>
      </div>
    </div>
  );
}
