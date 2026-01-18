// src/modules/catalog/categories/ui/tree/CategoryBreadcrumbs.tsx
"use client";

import * as React from "react";
import { Home, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Breadcrumb } from "@/lib/modules/catalog/categories/category.dto";
import { cn } from "@/lib/utils";

export type BreadcrumbMode = "tree" | "search";

export function CategoryBreadcrumbs(props: {
  items: Breadcrumb[];
  mode?: BreadcrumbMode;
  resultCount?: number;
  showRootIcon?: boolean;

  onPick: (index: number) => void;
  onCloseLast?: () => void;

  className?: string;
}) {
  const mode = props.mode ?? "tree";
  const showRootIcon = props.showRootIcon ?? true;

  const keyOf = (b: Breadcrumb, idx: number) => b.id ?? (idx === 0 ? "root" : `null-${idx}`);

  return (
    <div className={cn("flex flex-wrap items-center gap-2", props.className)}>
      {props.items.map((b, idx) => {
        const isLast = idx === props.items.length - 1;

        const label =
          mode === "search" && idx === 0
            ? props.resultCount != null
              ? `Resultados (${props.resultCount})`
              : "Resultados"
            : b.label;

        return (
          <React.Fragment key={keyOf(b, idx)}>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={isLast ? "secondary" : "ghost"}
                size="sm"
                onClick={() => props.onPick(idx)}
                className={cn("h-8 rounded-full px-3 max-w-[240px] flex items-center gap-2")}
                title={label}
              >
                {idx === 0 && showRootIcon && mode === "tree" ? <Home className="size-4" /> : null}
                <span className="truncate">{label}</span>
              </Button>

              {isLast && props.onCloseLast && props.items.length > 1 && mode === "tree" ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={props.onCloseLast}
                  className="h-8 w-8 rounded-full"
                  title="Volver al padre"
                >
                  <X className="size-4" />
                </Button>
              ) : null}
            </div>

            {!isLast && <span className="text-xs text-muted-foreground">/</span>}
          </React.Fragment>
        );
      })}
    </div>
  );
}
