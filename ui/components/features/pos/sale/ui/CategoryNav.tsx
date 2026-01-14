// ui/components/features/pos/sales/ui/CategoryNav.tsx
"use client";

import type { JSX } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export type CategoryNavItem = {
  id: string;
  name: string;
  imageUrl?: string | null;
};

function InitialBadge(props: { name: string }) {
  return (
    <div className="size-9 shrink-0 rounded-xl bg-yellow-50 flex items-center justify-center text-xs font-semibold">
      {props.name.slice(0, 1).toUpperCase()}
    </div>
  );
}

function CategoryAvatar(props: { name: string; imageUrl?: string | null }) {
  if (!props.imageUrl) return <InitialBadge name={props.name} />;

  return (
    <div className="size-9 shrink-0 rounded-xl overflow-hidden bg-yellow-50">
      <Image
        src={props.imageUrl}
        alt={props.name}
        width={36}
        height={36}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

export function CategoryNav(props: {
  items: CategoryNavItem[];
  activeId: string;
  onSelect: (id: string) => void;

  className?: string;

  favoritesId?: string; // default "favorites"
  favoritesLabel?: string; // default "Favoritos"
}): JSX.Element {
  const favoritesId = props.favoritesId ?? "favorites";
  const favoritesLabel = props.favoritesLabel ?? "Favoritos";

  // Favoritos siempre arriba
  const list: CategoryNavItem[] = [
    { id: favoritesId, name: favoritesLabel },
    ...props.items.filter((x) => x.id !== favoritesId),
  ];

  return (
    <div className={cn("h-full min-h-0 flex flex-col", props.className)}>
      <div className="flex-1 min-h-0 overflow-y-auto">
        <ul className="divide-y divide-border">
          {list.map((c) => {
            const active = c.id === props.activeId;
            const isFavorites = c.id === favoritesId;

            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => props.onSelect(c.id)}
                  className={cn(
                    "w-full text-left px-5 py-4 flex items-center gap-3 relative",
                    "transition-colors duration-150",
                    "hover:bg-yellow-50 active:bg-yellow-100",
                    active && "bg-yellow-100",
                    // borde lateral + “glow” sutil
                    active && "border-l-4 border-yellow-400 pl-4 shadow-[inset_0_1px_0_0_rgba(0,0,0,0.02)]",
                    "focus:outline-none focus:ring-2 focus:ring-yellow-300"
                  )}
                >
                  {/* Avatar */}
                  {isFavorites ? (
                    <div className="size-9 shrink-0 rounded-xl bg-yellow-100 flex items-center justify-center text-sm font-bold">
                      ★
                    </div>
                  ) : (
                    <CategoryAvatar name={c.name} imageUrl={c.imageUrl} />
                  )}

                  {/* Nombre */}
                  <div className="min-w-0 flex-1">
                    <div className={cn("text-sm truncate", active && "font-semibold")}>
                      {c.name}
                    </div>
                  </div>

                  {/* indicador visual mínimo (sin texto) */}
                  <div className={cn("size-2 rounded-full", active ? "bg-yellow-400" : "bg-transparent")} />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
