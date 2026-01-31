"use client";

import * as React from "react";
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

function useEndReached(params: {
  enabled: boolean;
  onEndReached?: () => void;
  root?: React.RefObject<HTMLElement | null>;
}) {
  const { enabled, onEndReached, root } = params;
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!enabled) return;
    if (!onEndReached) return;

    const el = sentinelRef.current;
    if (!el) return;

    const rootEl = root?.current ?? null;

    const obs = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting) onEndReached();
      },
      {
        root: rootEl,
        rootMargin: "240px", // prefetch antes de llegar al final
        threshold: 0,
      }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [enabled, onEndReached, root]);

  return sentinelRef;
}

export function CategoryNav(props: {
  items: CategoryNavItem[];
  activeId: string;
  onSelect: (id: string) => void;

  className?: string;

  // built-ins arriba
  favoritesId?: string; // default "favorites"
  favoritesLabel?: string; // default "Favoritos"

  allId?: string; // default "all"
  allLabel?: string; // default "Todas"
  showAll?: boolean; // default true

  // infinite scroll
  loading?: boolean;
  hasMore?: boolean;
  onEndReached?: () => void;

  emptyLabel?: string; // default "Sin categorías."
}): JSX.Element {
  const favoritesId = props.favoritesId ?? "favorites";
  const favoritesLabel = props.favoritesLabel ?? "Favoritos";

  const allId = props.allId ?? "all";
  const allLabel = props.allLabel ?? "Todas";
  const showAll = props.showAll ?? true;

  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  const sentinelRef = useEndReached({
    enabled: Boolean(props.hasMore) && !props.loading,
    onEndReached: props.onEndReached,
    root: scrollRef,
  });

  const list: CategoryNavItem[] = React.useMemo(() => {
    const base = props.items ?? [];

    const clean = base.filter((x) => x.id !== favoritesId && x.id !== allId);

    const head: CategoryNavItem[] = [];
    if (showAll) head.push({ id: allId, name: allLabel });
    head.push({ id: favoritesId, name: favoritesLabel });

    return [...head, ...clean];
  }, [props.items, favoritesId, allId, favoritesLabel, allLabel, showAll]);

  return (
    <div className={cn("h-full min-h-0 flex flex-col", props.className)}>
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto">
        {list.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">
            {props.emptyLabel ?? "Sin categorías."}
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {list.map((c) => {
              const active = c.id === props.activeId;
              const isFavorites = c.id === favoritesId;
              const isAll = c.id === allId;

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
                      active &&
                        "border-l-4 border-yellow-400 pl-4 shadow-[inset_0_1px_0_0_rgba(0,0,0,0.02)]",
                      "focus:outline-none focus:ring-2 focus:ring-yellow-300"
                    )}
                  >
                    {/* Avatar */}
                    {isFavorites ? (
                      <div className="size-9 shrink-0 rounded-xl bg-yellow-100 flex items-center justify-center text-sm font-bold">
                        ★
                      </div>
                    ) : isAll ? (
                      <div className="size-9 shrink-0 rounded-xl bg-yellow-50 flex items-center justify-center text-xs font-semibold">
                        ALL
                      </div>
                    ) : (
                      <CategoryAvatar name={c.name} imageUrl={c.imageUrl} />
                    )}

                    {/* Nombre */}
                    <div className="min-w-0 flex-1">
                      <div className={cn("text-sm truncate", active && "font-semibold")}>{c.name}</div>
                    </div>

                    {/* indicador */}
                    <div className={cn("size-2 rounded-full", active ? "bg-yellow-400" : "bg-transparent")} />
                  </button>
                </li>
              );
            })}

            {/* sentinel + loading footer */}
            <li className="px-5 py-3">
              <div ref={sentinelRef} />
              {props.loading ? (
                <div className="text-xs text-muted-foreground">Cargando…</div>
              ) : props.hasMore ? (
                <div className="text-xs text-muted-foreground">Cargar más…</div>
              ) : null}
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}
