"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type TriState = "all" | "active" | "inactive";
type Mode = "full" | "searchOnly";

type BaseProps = {
  search: string;
  onSearchChange: (v: string) => void;
  onSearchSubmit?: () => void;

  busy?: boolean;
  rightSlot?: React.ReactNode;
  placeholder?: string;
  searchButtonText?: string;

  mode?: Mode;
};

type FullProps = BaseProps & {
  mode?: "full";
  filter: TriState;
  onFilterChange: (v: TriState) => void;
  counts: { all: number; active: number; inactive: number };
};

type SearchOnlyProps = BaseProps & {
  mode: "searchOnly";
};

type Props = FullProps | SearchOnlyProps;

function isFull(p: Props): p is FullProps {
  // ✅ si no especificas mode, asumimos full (backward compatible)
  return (p.mode ?? "full") === "full";
}

export function TriStateFilterBar(props: Props) {
  const busy = !!props.busy;

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 gap-2">
        <Input
          value={props.search}
          onChange={(e) => props.onSearchChange(e.target.value)}
          placeholder={props.placeholder ?? "Buscar…"}
          disabled={busy}
          onKeyDown={(e) => {
            if (e.key === "Enter" && props.onSearchSubmit) {
              e.preventDefault();
              props.onSearchSubmit();
            }
          }}
        />

        {props.onSearchSubmit ? (
          <Button variant="secondary" onClick={props.onSearchSubmit} disabled={busy || !props.search.trim()}>
            {props.searchButtonText ?? "Buscar"}
          </Button>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-2">
        {isFull(props) ? (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={props.filter === "all" ? "secondary" : "outline"}
              onClick={() => props.onFilterChange("all")}
              disabled={busy}
            >
              Todas ({props.counts.all})
            </Button>

            <Button
              size="sm"
              variant={props.filter === "active" ? "secondary" : "outline"}
              onClick={() => props.onFilterChange("active")}
              disabled={busy}
            >
              Activas ({props.counts.active})
            </Button>

            <Button
              size="sm"
              variant={props.filter === "inactive" ? "secondary" : "outline"}
              onClick={() => props.onFilterChange("inactive")}
              disabled={busy}
            >
              OFF ({props.counts.inactive})
            </Button>
          </div>
        ) : null}

        {props.rightSlot ? <div className="flex gap-2">{props.rightSlot}</div> : null}
      </div>
    </div>
  );
}
