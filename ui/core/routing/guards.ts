import type { RouteMeta, UserRole } from "./routeRegistry";

export type GuardContext = {
  route: RouteMeta;
  sessionStatus: "unknown" | "authenticated" | "unauthenticated";
  userRole: UserRole | null;
  xTerminalId: string | null;
  cashOpen: boolean;
};

export type GuardResult =
  | { ok: true }
  | { ok: false; redirectTo: string; reason: string };

export function evaluateAccess(ctx: GuardContext): GuardResult {
  const r = ctx.route;

  if (r.requiresAuth && ctx.sessionStatus !== "authenticated") {
    return { ok: false, redirectTo: "/login", reason: "needs_auth" };
  }

  if (r.rolesAllowed && ctx.userRole && !r.rolesAllowed.includes(ctx.userRole)) {
    return { ok: false, redirectTo: "/403", reason: "role_forbidden" };
  }

  // Setup es el único lugar donde no hay terminal todavía
  if (r.requiresTerminal && !ctx.xTerminalId) {
    // si tiene permisos de setup → setup; si no → boot
    const canSetup = ctx.userRole === "ADMIN" || ctx.userRole === "MANAGER";
    return { ok: false, redirectTo: canSetup ? "/setup" : "/boot", reason: "needs_terminal" };
  }

  if (r.requiresCashOpen && !ctx.cashOpen) {
    return { ok: false, redirectTo: "/cash/open", reason: "needs_cash_open" };
  }

  return { ok: true };
}
