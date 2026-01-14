"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { NavItem } from "../nav";

export function ShellSidebar(props: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <aside className="h-[calc(100vh-56px)] w-72 shrink-0 border-r border-border bg-card flex flex-col">
      {/* Header fijo del sidebar */}
      <div className="px-4 py-3 border-b border-border">
        <div className="text-xs text-muted-foreground">Menú</div>
      </div>

      {/* Nav scrolleable si crece */}
      <nav className="px-3 py-3 grid gap-1 overflow-y-auto">
        {props.items.map((it) => {
          const active = isActive(pathname, it.href);
          const Icon = it.icon;

          return (
            <Link
              key={it.key}
              href={it.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-accent text-foreground relative " +
                    "before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r before:bg-primary"
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

function isActive(pathname: string, href: string): boolean {
  // ✅ evita doble activo por prefijos tipo "/admin" vs "/admin/setup"
  if (href === "/") return pathname === "/";
  if (href === "/admin") return pathname === "/admin";
  if (href === "/pos") return pathname === "/pos";

  return pathname === href || pathname.startsWith(href + "/");
}
