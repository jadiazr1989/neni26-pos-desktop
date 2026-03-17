"use client";

import type { ReactNode } from "react";
import * as React from "react";
import { usePathname, useRouter } from "next/navigation";

import type { MeUser } from "@/lib/cash.types";
import { useSessionStore } from "@/stores/session.store";
import { useTerminalStore } from "@/stores/terminal.store";

import type { Area, Role } from "./nav";
import { ADMIN_NAV, filterByRole, POS_NAV } from "./nav";
import { ShellSidebar } from "./ui/ShellSidebar";
import { ShellTopBar } from "./ui/ShellTopBar";

function isAdminArea(area: Area): area is "admin" {
  return area === "admin";
}

function isDeviceRoute(pathname: string): boolean {
  return pathname === "/admin/device" || pathname.startsWith("/admin/device/");
}

export function AppShell(props: {
  area: Area;
  initialUser: MeUser;
  children: ReactNode;
}): React.JSX.Element {
  const router = useRouter();
  const pathname = usePathname();

  // session store
  const setUser = useSessionStore((s) => s.setUser);
  const setStatus = useSessionStore((s) => s.setStatus);

  // terminal store
  const hydrateTerminal = useTerminalStore((s) => s.hydrate);
  const terminalHydrated = useTerminalStore((s) => s.hydrated);
  const xTerminalId = useTerminalStore((s) => s.xTerminalId);

  React.useEffect(() => {
    setUser(props.initialUser);
    setStatus("authenticated");
  }, [props.initialUser, setUser, setStatus]);

  React.useEffect(() => {
    void hydrateTerminal();
  }, [hydrateTerminal]);

  const terminalReady = terminalHydrated && Boolean(xTerminalId);

  // ✅ GUARD: en admin, si no hay terminal, solo permitir /admin/device
  React.useEffect(() => {
    if (!isAdminArea(props.area)) return;
    if (!terminalHydrated) return;

    if (!terminalReady && !isDeviceRoute(pathname)) {
      router.replace("/admin/device");
    }
  }, [props.area, terminalHydrated, terminalReady, pathname, router]);

  const role = (props.initialUser.role ?? null) as Role | null;

  const rawItems = React.useMemo(() => {
    return props.area === "admin"
      ? filterByRole(ADMIN_NAV, role)
      : filterByRole(POS_NAV, role);
  }, [props.area, role]);

  // ✅ UX: si no hay terminal en admin, solo muestra Device (+ Setup opcional)
    // ✅ UX: si no hay terminal en admin, SOLO muestra Device
  const items = React.useMemo(() => {
    if (!isAdminArea(props.area)) return rawItems;
    if (!terminalHydrated) return rawItems.filter((it) => it.key === "device");
    if (terminalReady) return rawItems;

    return rawItems.filter((it) => it.key === "device");
  }, [props.area, rawItems, terminalHydrated, terminalReady]);


  return (
  <div className="min-h-dvh w-full bg-background text-foreground overflow-x-hidden">
    <ShellTopBar area={props.area} />

    {/* body */}
    <div className="flex min-h-[calc(100dvh-56px)]">
      <ShellSidebar items={items} />

      {/* main scroll */}
      <main className="flex-1 min-w-0">
        <div className="h-[calc(100dvh-56px)] overflow-auto">
          {/* ✅ container: mantiene proporción y evita deformación */}
          <div className="mx-auto w-full max-w-[1440px] p-6">
            {props.children}
          </div>
        </div>
      </main>
    </div>
  </div>
);
}
