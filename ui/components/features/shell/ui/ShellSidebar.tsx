"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { NavItem } from "../nav";
import { navHref } from "../nav";

export function ShellSidebar(props: { items: NavItem[] }) {
  const pathname = usePathname();

  const activeKey = pickActiveKey(pathname, props.items);

  return (
    <aside className="h-[calc(100vh-56px)] w-72 shrink-0 border-r border-border bg-card flex flex-col">
      <div className="px-4 py-3 border-b border-border">
        <div className="text-xs text-muted-foreground">Menú</div>
      </div>

      <nav className="px-3 py-3 grid gap-1 overflow-y-auto">
        {props.items.map((it) => {
          const href = navHref(it);
          const active = it.key === activeKey;
          const Icon = it.icon;

          return (
            <Link
              key={it.key}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
              )}
            >
              <Icon className={cn("size-4", active ? "opacity-100" : "opacity-80")} />
              <span className="truncate">{it.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

/**
 * ✅ Activo único: el href con match más largo.
 * Ej: pathname "/admin/categories/123" -> marca "/admin/categories" y NO "/admin"
 */
function pickActiveKey(pathname: string, items: NavItem[]): string | null {
  let best: { key: string; len: number } | null = null;

  for (const it of items) {
    const href = navHref(it);

    const isExact = pathname === href;
    const isNested = pathname.startsWith(href + "/"); // ✅ evita "/admin" marcando todo
    const match = isExact || isNested;

    if (!match) continue;

    const len = href.length;
    if (!best || len > best.len) best = { key: it.key, len };
  }

  return best?.key ?? null;
}
