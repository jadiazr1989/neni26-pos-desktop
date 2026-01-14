import { JSX } from "react";
import type { TerminalDTO } from "../hooks/useTerminals";
import { TerminalCard } from "./TerminalCard";

export function TerminalList(props: {
  terminals: TerminalDTO[];
  selecting?: boolean;
  onSelect: (t: TerminalDTO) => void;
}): JSX.Element {
  if (props.terminals.length === 0) {
    return (
      <div className="text-sm text-zinc-400">
        No terminals found. Create one to continue.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {props.terminals.map((t) => (
        <TerminalCard
          key={t.id}
          terminal={t}
          disabled={props.selecting}
          onSelect={() => props.onSelect(t)}
        />
      ))}
    </div>
  );
}
