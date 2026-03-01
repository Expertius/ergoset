import {
  LayoutDashboard,
  Armchair,
  Wrench,
  Package,
  Users,
  FileText,
  CalendarDays,
  CreditCard,
  BarChart3,
  Upload,
  Settings,
  Truck,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/lib/rbac";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  roles: Role[];
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    label: "Основное",
    items: [
      { title: "Дашборд", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "MANAGER", "LOGISTICS"] },
      { title: "Календарь", href: "/calendar", icon: CalendarDays, roles: ["ADMIN", "MANAGER", "LOGISTICS"] },
    ],
  },
  {
    label: "Операции",
    items: [
      { title: "Лиды", href: "/leads", icon: UserPlus, roles: ["ADMIN", "MANAGER"] },
      { title: "Сделки", href: "/deals", icon: FileText, roles: ["ADMIN", "MANAGER"] },
      { title: "Клиенты", href: "/clients", icon: Users, roles: ["ADMIN", "MANAGER"] },
      { title: "Логистика", href: "/logistics", icon: Truck, roles: ["ADMIN", "LOGISTICS"] },
    ],
  },
  {
    label: "Активы",
    items: [
      { title: "Станции", href: "/assets", icon: Armchair, roles: ["ADMIN", "MANAGER", "LOGISTICS"] },
      { title: "Аксессуары", href: "/accessories", icon: Wrench, roles: ["ADMIN", "MANAGER", "LOGISTICS"] },
      { title: "Склад", href: "/inventory", icon: Package, roles: ["ADMIN", "LOGISTICS"] },
    ],
  },
  {
    label: "Финансы",
    items: [
      { title: "Платежи", href: "/payments", icon: CreditCard, roles: ["ADMIN", "MANAGER"] },
      { title: "Отчёты", href: "/reports", icon: BarChart3, roles: ["ADMIN"] },
    ],
  },
  {
    label: "Система",
    items: [
      { title: "Документы", href: "/documents", icon: FileText, roles: ["ADMIN", "MANAGER"] },
      { title: "Импорт", href: "/import", icon: Upload, roles: ["ADMIN"] },
      { title: "Настройки", href: "/settings", icon: Settings, roles: ["ADMIN"] },
    ],
  },
];

export function getFilteredNavGroups(role: string): NavGroup[] {
  return navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        item.roles.includes(role as Role)
      ),
    }))
    .filter((group) => group.items.length > 0);
}
