// core/routing/routeRegistry.ts
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
  rolesAllowed: readonly UserRole[] | null; // ✅ siempre existe
};

export const ROUTES = {
  // PUBLIC / BOOT
  login: {
    id: "login",
    path: "/login",
    group: "public",
    requiresAuth: false,
    requiresTerminal: false,
    requiresCashOpen: false,
    rolesAllowed: null,
  },
  boot: {
    id: "boot",
    path: "/boot",
    group: "boot",
    requiresAuth: true,
    requiresTerminal: false,
    requiresCashOpen: false,
    rolesAllowed: null,
  },

  // ADMIN
  setup: {
    id: "setup",
    path: "/admin/setup",
    group: "admin",
    requiresAuth: true,
    requiresTerminal: false,
    requiresCashOpen: false,
    rolesAllowed: [UserRole.ADMIN, UserRole.MANAGER] as UserRole[],
  },
  adminDevice: {
    id: "adminDevice",
    path: "/admin/device",
    group: "admin",
    requiresAuth: true,
    requiresTerminal: false,
    requiresCashOpen: false,
    rolesAllowed: [UserRole.ADMIN] as UserRole[],
  },
  adminInventory: {
    id: "adminInventory",
    path: "/admin/inventory",
    group: "admin",
    requiresAuth: true,
    requiresTerminal: false,
    requiresCashOpen: false,
    rolesAllowed: [UserRole.ADMIN, UserRole.MANAGER] as UserRole[],
  },
  adminPurchases: {
    id: "adminPurchases",
    path: "/admin/purchases",
    group: "admin",
    requiresAuth: true,
    requiresTerminal: false,
    requiresCashOpen: false,
    rolesAllowed: [UserRole.ADMIN, UserRole.MANAGER] as UserRole[],
  },
  adminReports: {
    id: "adminReports",
    path: "/admin/reports",
    group: "admin",
    requiresAuth: true,
    requiresTerminal: false,
    requiresCashOpen: false,
    rolesAllowed: [UserRole.ADMIN, UserRole.MANAGER] as UserRole[],
  },
  adminUsers: {
    id: "adminUsers",
    path: "/admin/users",
    group: "admin",
    requiresAuth: true,
    requiresTerminal: false,
    requiresCashOpen: false,
    rolesAllowed: [UserRole.ADMIN] as UserRole[],
  },
  adminSettings: {
    id: "adminSettings",
    path: "/admin/settings",
    group: "admin",
    requiresAuth: true,
    requiresTerminal: false,
    requiresCashOpen: false,
    rolesAllowed: [UserRole.ADMIN] as UserRole[],
  },

  // ✅ AGREGA ESTOS DOS porque tu NAV los usa:
  adminProducts: {
    id: "adminProducts",
    path: "/admin/products",
    group: "admin",
    requiresAuth: true,
    requiresTerminal: false,
    requiresCashOpen: false,
    rolesAllowed: [UserRole.ADMIN, UserRole.MANAGER] as UserRole[],
  },
  adminCategories: {
    id: "adminCategories",
    path: "/admin/categories",
    group: "admin",
    requiresAuth: true,
    requiresTerminal: false,
    requiresCashOpen: false,
    rolesAllowed: [UserRole.ADMIN, UserRole.MANAGER] as UserRole[],
  },

  // POS
  dashboard: {
    id: "dashboard",
    path: "/pos",
    group: "pos",
    requiresAuth: true,
    requiresTerminal: true,
    requiresCashOpen: false,
    rolesAllowed: [UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER] as UserRole[],
  },
  cashOpen: {
    id: "cashOpen",
    path: "/cash/open",
    group: "pos",
    requiresAuth: true,
    requiresTerminal: true,
    requiresCashOpen: false,
    rolesAllowed: [UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER] as UserRole[],
  },
  cashActive: {
    id: "cashActive",
    path: "/cash/active",
    group: "pos",
    requiresAuth: true,
    requiresTerminal: true,
    requiresCashOpen: true,
    rolesAllowed: [UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER] as UserRole[],
  },
  salesNew: {
    id: "salesNew",
    path: "/sales/new",
    group: "pos",
    requiresAuth: true,
    requiresTerminal: true,
    requiresCashOpen: true,
    rolesAllowed: [UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER] as UserRole[],
  },
  salesVoid: {
    id: "salesVoid",
    path: "/sales/[id]/void",
    group: "pos",
    requiresAuth: true,
    requiresTerminal: true,
    requiresCashOpen: true,
    rolesAllowed: [UserRole.ADMIN, UserRole.MANAGER] as UserRole[],
  },
} as const satisfies Record<string, RouteMeta>;

export type RouteId = keyof typeof ROUTES;
