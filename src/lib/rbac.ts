import type { SessionUser } from "./auth";

type Role = "ADMIN" | "MANAGER" | "LOGISTICS";

const ROUTE_PERMISSIONS: { pattern: string; roles: Role[] }[] = [
  { pattern: "/settings", roles: ["ADMIN"] },
  { pattern: "/import", roles: ["ADMIN"] },
  { pattern: "/reports", roles: ["ADMIN", "MANAGER"] },
  { pattern: "/payments", roles: ["ADMIN", "MANAGER"] },
  { pattern: "/documents", roles: ["ADMIN", "MANAGER"] },
  { pattern: "/deals", roles: ["ADMIN", "MANAGER"] },
  { pattern: "/clients", roles: ["ADMIN", "MANAGER"] },
  { pattern: "/assets", roles: ["ADMIN", "MANAGER", "LOGISTICS"] },
  { pattern: "/accessories", roles: ["ADMIN", "MANAGER", "LOGISTICS"] },
  { pattern: "/inventory", roles: ["ADMIN", "MANAGER", "LOGISTICS"] },
  { pattern: "/calendar", roles: ["ADMIN", "MANAGER", "LOGISTICS"] },
];

export function canAccessRoute(pathname: string, user: SessionUser): boolean {
  const role = user.role as Role;
  if (role === "ADMIN") return true;

  for (const rule of ROUTE_PERMISSIONS) {
    if (pathname.startsWith(rule.pattern)) {
      return rule.roles.includes(role);
    }
  }

  return true;
}

export function requireRole(
  user: SessionUser | null,
  ...roles: Role[]
): void {
  if (!user) throw new Error("Не авторизован");
  if (!roles.includes(user.role as Role)) {
    throw new Error("Недостаточно прав");
  }
}
