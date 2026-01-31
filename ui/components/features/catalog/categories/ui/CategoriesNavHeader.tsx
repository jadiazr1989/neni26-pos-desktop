// src/modules/catalog/categories/ui/tree/CategoriesNavHeader.tsx
"use client";

import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import type { Breadcrumb } from "@/lib/modules/catalog/categories/category.dto";
import { CategoryBreadcrumbs } from "./CategoryBreadcrumbs";

export function CategoriesNavHeader(props: {
  title?: string;

  isSearching: boolean;
  crumbs: Breadcrumb[];
  resultCount?: number;

  onPickCrumb: (idx: number) => void;
  onCloseLast?: () => void;

  onExitSearch?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <CardTitle className="">{props.title ?? "Navegación"}</CardTitle>

      <div className="flex items-center gap-2">
        <CategoryBreadcrumbs
          items={props.crumbs}
          mode={props.isSearching ? "search" : "tree"}
          resultCount={props.isSearching ? props.resultCount : undefined}
          showRootIcon
          onPick={props.onPickCrumb}
          onCloseLast={props.isSearching ? undefined : props.onCloseLast}
        />

        {props.isSearching && props.onExitSearch ? (
          <Button variant="outline" size="sm" onClick={props.onExitSearch}>
            Salir
          </Button>
        ) : null}
      </div>
    </div>
  );
}
