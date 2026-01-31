// ui/components/features/shell/ShellSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { NavItem } from "../nav";
import { navHref } from "../nav";
import { useTerminalStore } from "@/stores/terminal.store";

export function ShellSidebar(props: { items: NavItem[] }) {
  const pathname = usePathname();
  const xTerminalId = useTerminalStore((s) => s.xTerminalId);
  const hydrated = useTerminalStore((s) => s.hydrated);

  const terminalReady = hydrated && Boolean(xTerminalId);

  const visibleItems = terminalReady
    ? props.items
    : props.items.filter((it) => it.key === "setup" || it.key === "device");

  const activeKey = pickActiveKey(pathname, visibleItems);

  return (
    <aside className="h-[calc(100vh-56px)] w-72 shrink-0 border-r border-border bg-card flex flex-col">
      <div className="px-4 py-3 border-b border-border">
        <div className="text-xs text-muted-foreground">Menú</div>
      </div>

      <nav className="px-3 py-3 grid gap-1 overflow-y-auto">
        {visibleItems.map((it) => {
          const href = navHref(it);
          const active = it.key === activeKey;
          const Icon = it.icon;

          const disabled = !terminalReady && it.key !== "device" && it.key !== "setup";

          return (
            <Link
              key={it.key}
              href={disabled ? "/admin/device" : href}
              aria-disabled={disabled}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/40 hover:text-foreground",
                disabled ? "pointer-events-none opacity-60" : ""
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

function pickActiveKey(pathname: string, items: NavItem[]): string | null {
  let best: { key: string; len: number } | null = null;

  for (const it of items) {
    const href = navHref(it);
    const match = pathname === href || pathname.startsWith(href + "/");
    if (!match) continue;

    const len = href.length;
    if (!best || len > best.len) best = { key: it.key, len };
  }

  return best?.key ?? null;
}
