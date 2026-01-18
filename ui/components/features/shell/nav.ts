// ui/components/features/shell/nav.ts
import type { LucideIcon } from "lucide-react";
import {
  ShoppingCart,
  Wallet,
  Package,
  Tags,
  ClipboardList,
  BarChart3,
  Users,
  Settings,
  Monitor,
  FolderTree,
  LayoutGrid,
  BadgeCheck,
} from "lucide-react";

import { ROUTES, type RouteId, type UserRole } from "@/core/routing/routeRegistry";

export type Area = "pos" | "admin";
export type Role = UserRole;

export type NavItem = {
  key: string;
  label: string;
  routeId: RouteId;
  icon: LucideIcon;
};

export function navHref(item: NavItem): string {
  return ROUTES[item.routeId].path;
}

export const POS_NAV: NavItem[] = [
  { key: "pos", label: "Venta", routeId: "dashboard", icon: ShoppingCart },
  { key: "cash", label: "Caja", routeId: "cashOpen", icon: Wallet },
];

export const ADMIN_NAV: NavItem[] = [
  { key: "setup", label: "Dashboard", routeId: "setup", icon: LayoutGrid },
  { key: "products", label: "Productos", routeId: "adminProducts", icon: Tags },
  { key: "categories", label: "Categorías", routeId: "adminCategories", icon: FolderTree },
  { key: "brands", label: "Marcas", routeId: "adminBrands", icon: BadgeCheck },

  { key: "inventory", label: "Inventario", routeId: "adminInventory", icon: Package },
  { key: "purchases", label: "Compras", routeId: "adminPurchases", icon: ClipboardList },
  { key: "reports", label: "Reportes", routeId: "adminReports", icon: BarChart3 },
  { key: "users", label: "Usuarios", routeId: "adminUsers", icon: Users },
  { key: "settings", label: "Configuración", routeId: "adminSettings", icon: Settings },
  { key: "device", label: "Dispositivo", routeId: "adminDevice", icon: Monitor },
];

export function filterByRole(items: NavItem[], role: Role | null): NavItem[] {
  if (!role) return [];
  return items.filter((it) => {
    const allowed = ROUTES[it.routeId].rolesAllowed;
    return allowed === null || allowed.includes(role);
  });
}
