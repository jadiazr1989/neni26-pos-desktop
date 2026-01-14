"use client";

import type { JSX, KeyboardEventHandler, MouseEventHandler } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/stores/favorites.store";

export function FavoriteToggleImpl(props: { productId: string }): JSX.Element {
  const isFav = useFavorites((s) => s.isFav(props.productId));
  const toggle = useFavorites((s) => s.toggle);

  const onClick: MouseEventHandler<HTMLSpanElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(props.productId);
  };

  const onKeyDown: KeyboardEventHandler<HTMLSpanElement> = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      toggle(props.productId);
    }
  };

  return (
    <span
      role="button"
      tabIndex={0}
      aria-label={isFav ? "Quitar de favoritos" : "Agregar a favoritos"}
      aria-pressed={isFav}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={cn(
        "grid place-items-center size-9 rounded-xl transition cursor-pointer",
        "bg-background/70 hover:bg-background",
        "border border-border/70",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300"
      )}
    >
      <Star
        aria-hidden="true"
        className={cn(
          "size-4",
          isFav ? "fill-yellow-400 text-yellow-500" : "text-muted-foreground"
        )}
      />
    </span>
  );
}
