import type { RouteMeta, UserRole } from "./routeRegistry";

export type GuardContext = {
  route: RouteMeta;
  sessionStatus: "unknown" | "authenticated" | "unauthenticated";
  userRole: UserRole | null;
  terminalHydrated: boolean;      // ✅ NUEVO
  xTerminalId: string | null;
  cashOpen: boolean;
};


export type GuardResult =
  | { ok: true }
  | { ok: false; redirectTo: string; reason: string }
  | { ok: false; redirectTo: null; reason: "Cargando" }; // ✅ WAIT


export function evaluateAccess(ctx: GuardContext): GuardResult {
  const r = ctx.route;

  // Auth
  if (r.requiresAuth) {
    if (ctx.sessionStatus === "unknown") return { ok: false, redirectTo: null, reason: "Cargando" };
    if (ctx.sessionStatus !== "authenticated") return { ok: false, redirectTo: "/login", reason: "needs_auth" };
  }

  // Role
  if (r.rolesAllowed) {
    if (!ctx.userRole) return { ok: false, redirectTo: null, reason: "Cargando" }; // role aún no listo
    if (!r.rolesAllowed.includes(ctx.userRole)) return { ok: false, redirectTo: "/403", reason: "role_forbidden" };
  }

  // Terminal
  if (r.requiresTerminal) {
    // ✅ Si todavía no hidratamos storage, NO decidas nada aún.
    if (!ctx.terminalHydrated) return { ok: false, redirectTo: null, reason: "Cargando" };

    if (!ctx.xTerminalId) {
      const canSetup = ctx.userRole === "ADMIN" || ctx.userRole === "MANAGER";
      return { ok: false, redirectTo: canSetup ? "/admin/dashboard" : "/terminal-required", reason: "needs_terminal" };
    }
  }

  // Cash open
  if (r.requiresCashOpen) {
    // cashOpen depende de llamadas/estado; si lo calculas async, también aplica loading:
    // (si tienes cashHydrated o cashCheckedOnce, úsalo)
    if (!ctx.cashOpen) return { ok: false, redirectTo: "/pos", reason: "needs_cash_open" };
  }

  return { ok: true };
}

