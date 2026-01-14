"use client";

import type { JSX } from "react";
import type { KeyboardEventHandler } from "react";
import { cn } from "@/lib/utils";
import type { Product } from "../types";
import { FavoriteToggle } from "./FavoriteToggle";
import { ProductMeta } from "./ProductMeta";

export function ProductCard(props: {
  product: Product;
  onPick: (p: Product) => void;
}): JSX.Element {
  const p = props.product;

  const onClick = (): void => props.onPick(p);

  const onKeyDown: KeyboardEventHandler<HTMLButtonElement> = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={cn(
        "group relative text-left transition",
        "rounded-xl border border-border bg-card shadow-sm",
        "hover:bg-accent/10",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300"
      )}
    >
      <ProductMeta
        product={p}
        rightSlot={<FavoriteToggle productId={p.id} />}
      />
    </button>
  );
}
