import type { LucideIcon } from "lucide-react";
import {
  LayoutGrid,
  ShoppingCart,
  Undo2,
  Wallet,
  ScanSearch,
  Package,
  Tags,
  ClipboardList,
  BarChart3,
  Users,
  Settings,
  Wrench,
} from "lucide-react";

export type Area = "pos" | "admin";
export type Role = "ADMIN" | "MANAGER" | "CASHIER";

export type NavItem = {
  key: string;
  label: string;
  href: string;
  icon: LucideIcon;
  roles?: Role[]; // si no se pone, visible para todos en esa área
};

export const POS_NAV: NavItem[] = [
  { key: "sale", label: "Venta", href: "/pos", icon: ShoppingCart },
  { key: "cash", label: "Caja", href: "/cash/open", icon: Wallet, roles: ["ADMIN", "MANAGER", "CASHIER"] },
  { key: "returns", label: "Devoluciones", href: "/returns/new", icon: Undo2, roles: ["ADMIN", "MANAGER"] },
  { key: "price", label: "Precio", href: "/catalog", icon: ScanSearch },
];

export const ADMIN_NAV: NavItem[] = [
  { key: "setup", label: "Dashboard", href: "/admin/setup", icon: Wrench, roles: ["ADMIN", "MANAGER"] },
 // { key: "home", label: "Dashboard", href: "/admin", icon: LayoutGrid, roles: ["ADMIN", "MANAGER"] },
  { key: "products", label: "Productos", href: "/admin/products", icon: Tags, roles: ["ADMIN", "MANAGER"] },
  { key: "inventory", label: "Inventario", href: "/admin/inventory", icon: Package, roles: ["ADMIN", "MANAGER"] },
  { key: "purchases", label: "Compras", href: "/admin/purchases", icon: ClipboardList, roles: ["ADMIN", "MANAGER"] },
  { key: "reports", label: "Reportes", href: "/admin/reports", icon: BarChart3, roles: ["ADMIN", "MANAGER"] },
  { key: "users", label: "Usuarios", href: "/admin/users", icon: Users, roles: ["ADMIN"] },
  { key: "settings", label: "Configuración", href: "/admin/settings", icon: Settings, roles: ["ADMIN"] },
];

export function filterByRole(items: NavItem[], role: Role | null): NavItem[] {
  if (!role) return [];
  return items.filter((i) => !i.roles || i.roles.includes(role));
}
