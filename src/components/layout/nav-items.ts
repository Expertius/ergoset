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
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    label: "Основное",
    items: [
      { title: "Дашборд", href: "/", icon: LayoutDashboard },
      { title: "Календарь", href: "/calendar", icon: CalendarDays },
    ],
  },
  {
    label: "Операции",
    items: [
      { title: "Сделки", href: "/deals", icon: FileText },
      { title: "Клиенты", href: "/clients", icon: Users },
    ],
  },
  {
    label: "Активы",
    items: [
      { title: "Станции", href: "/assets", icon: Armchair },
      { title: "Аксессуары", href: "/accessories", icon: Wrench },
      { title: "Склад", href: "/inventory", icon: Package },
    ],
  },
  {
    label: "Финансы",
    items: [
      { title: "Платежи", href: "/payments", icon: CreditCard },
      { title: "Отчёты", href: "/reports", icon: BarChart3 },
    ],
  },
  {
    label: "Система",
    items: [
      { title: "Документы", href: "/documents", icon: FileText },
      { title: "Импорт", href: "/import", icon: Upload },
      { title: "Настройки", href: "/settings", icon: Settings },
    ],
  },
];
