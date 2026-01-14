export enum UserRole {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  CASHIER = "CASHIER",
}

export type RouteGroup = "public" | "boot" | "admin" | "pos";

export type RouteMeta = {
  id: string;
  path: string;
  group: RouteGroup;
  requiresAuth: boolean;
  requiresTerminal: boolean;
  requiresCashOpen: boolean;
  rolesAllowed?: UserRole[]; // undefined = cualquier usuario autenticado (si requiresAuth=true)
};

export const ROUTES = {
  login:      { id: "login", path: "/login", group: "public", requiresAuth: false, requiresTerminal: false, requiresCashOpen: false },
  boot:       { id: "boot", path: "/boot", group: "boot", requiresAuth: true,  requiresTerminal: false, requiresCashOpen: false },
  setup:      { id: "setup", path: "/setup", group: "admin", requiresAuth: true,  requiresTerminal: false, requiresCashOpen: false, rolesAllowed: [UserRole.ADMIN, UserRole.MANAGER] },

  dashboard:  { id: "dashboard", path: "/dashboard", group: "pos", requiresAuth: true,  requiresTerminal: true,  requiresCashOpen: false, rolesAllowed: [UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER] },

  cashOpen:   { id: "cashOpen", path: "/cash/open", group: "pos", requiresAuth: true,  requiresTerminal: true,  requiresCashOpen: false, rolesAllowed: [UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER] },
  cashActive: { id: "cashActive", path: "/cash/active", group: "pos", requiresAuth: true,  requiresTerminal: true,  requiresCashOpen: true,  rolesAllowed: [UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER] },

  salesNew:   { id: "salesNew", path: "/sales/new", group: "pos", requiresAuth: true,  requiresTerminal: true,  requiresCashOpen: true,  rolesAllowed: [UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER] },
  salesVoid:  { id: "salesVoid", path: "/sales/[id]/void", group: "pos", requiresAuth: true,  requiresTerminal: true,  requiresCashOpen: true,  rolesAllowed: [UserRole.ADMIN, UserRole.MANAGER] },

  adminDevice:{ id: "adminDevice", path: "/admin/device", group: "admin", requiresAuth: true,  requiresTerminal: false, requiresCashOpen: false, rolesAllowed: [UserRole.ADMIN] },
} as const satisfies Record<string, RouteMeta>;

export type RouteId = keyof typeof ROUTES;
