// ui/components/features/pos/shell/ui/PosCenterInfoBar.tsx
"use client";

import type { JSX } from "react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Tag, UserRound, Keyboard, Layers, Search } from "lucide-react";
import { usePosWorkspaceUi } from "@/stores/posWorkspaceUi.store";

export function PosCenterInfoBar(props: { className?: string }): JSX.Element {
  const categoryLabel = usePosWorkspaceUi((s) => s.categoryLabel);
  const query = usePosWorkspaceUi((s) => s.query);

  const saleText = "Venta rápida";
  const customerText = "Sin cliente"; // luego lo conectas igual con store de sale/customer
  const categoryText = categoryLabel || "Todas";

  const queryText = useMemo(() => query.trim(), [query]);

  return (
    <div
      className={cn(
        "h-full w-full px-4 py-2",
        "bg-background/60",
        "flex items-center justify-center",
        props.className
      )}
      aria-label="Contexto de venta"
    >
      <div className="w-full max-w-xl min-w-0">
        <div className="min-w-0 flex items-center justify-center gap-3">
          <span className="inline-flex items-center gap-2 min-w-0">
            <Layers className="size-4 text-muted-foreground" />
            <span className="text-sm font-semibold truncate">{saleText}</span>
          </span>

          <span className="text-muted-foreground">·</span>

          <span className="inline-flex items-center gap-2 min-w-0">
            <UserRound className="size-4 text-muted-foreground" />
            <span className="text-sm text-foreground/90 truncate">{customerText}</span>
          </span>

          <span className="text-muted-foreground">·</span>

          <span className="inline-flex items-center gap-2 min-w-0">
            <Tag className="size-4 text-muted-foreground" />
            <span className="text-sm text-foreground/90 truncate">{categoryText}</span>
          </span>

          {queryText ? (
            <>
              <span className="text-muted-foreground">·</span>
              <span className="inline-flex items-center gap-2 min-w-0">
                <Search className="size-4 text-muted-foreground" />
                <span className="text-sm text-foreground/90 truncate">
                  {queryText}
                </span>
              </span>
            </>
          ) : null}
        </div>

        <div className="mt-1 flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
          <Keyboard className="size-3" />
          <span className="whitespace-nowrap">F2 Buscar</span>
          <span>·</span>
          <span className="whitespace-nowrap">Enter Cobrar</span>
          <span>·</span>
          <span className="whitespace-nowrap">Esc Menú</span>
        </div>
      </div>
    </div>
  );
}
