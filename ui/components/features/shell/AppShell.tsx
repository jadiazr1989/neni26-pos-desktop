"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo } from "react";

import type { MeUser } from "@/lib/cash.types";
import { useSessionStore } from "@/stores/session.store";

import type { Area, Role } from "./nav";
import { ADMIN_NAV, filterByRole, POS_NAV } from "./nav";
import { ShellSidebar } from "./ui/ShellSidebar";
import { ShellTopBar } from "./ui/ShellTopBar";

export function AppShell(props: {
  area: Area;
  initialUser: MeUser;
  children: ReactNode;
}) {
  // ✅ opcional: hidratar store para el resto de la app
  const setUser = useSessionStore((s) => s.setUser);
  const setStatus = useSessionStore((s) => s.setStatus);

  useEffect(() => {
    setUser(props.initialUser);
    setStatus("authenticated");
  }, [props.initialUser, setUser, setStatus]);

  const role = (props.initialUser.role ?? null) as Role | null;

  const items = useMemo(() => {
    return props.area === "admin"
      ? filterByRole(ADMIN_NAV, role)
      : filterByRole(POS_NAV, role);
  }, [props.area, role]);

  return (
    <div className="h-screen w-screen bg-background text-foreground overflow-hidden">
      <ShellTopBar area={props.area} />

      <div className="h-[calc(100vh-56px)] flex min-h-0">
        <ShellSidebar items={items} />

        <main className="flex-1 overflow-auto min-h-0">
          <div className="p-6">{props.children}</div>
        </main>
      </div>

    </div>
  );
}
