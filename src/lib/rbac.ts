import type { SessionUser } from "./auth";

export type Role = "ADMIN" | "MANAGER" | "LOGISTICS" | "CLIENT";

export const ROUTE_PERMISSIONS: { pattern: string; roles: Role[] }[] = [
  // System
  { pattern: "/settings", roles: ["ADMIN"] },
  { pattern: "/import", roles: ["ADMIN"] },
  // Finance & reports
  { pattern: "/reports", roles: ["ADMIN"] },
  { pattern: "/payments", roles: ["ADMIN", "MANAGER"] },
  // Operations
  { pattern: "/documents", roles: ["ADMIN", "MANAGER"] },
  { pattern: "/deals", roles: ["ADMIN", "MANAGER"] },
  { pattern: "/clients", roles: ["ADMIN", "MANAGER"] },
  { pattern: "/leads", roles: ["ADMIN", "MANAGER"] },
  { pattern: "/logistics", roles: ["ADMIN", "LOGISTICS"] },
  // Assets & inventory
  { pattern: "/assets", roles: ["ADMIN", "MANAGER", "LOGISTICS"] },
  { pattern: "/accessories", roles: ["ADMIN", "MANAGER", "LOGISTICS"] },
  { pattern: "/inventory", roles: ["ADMIN", "LOGISTICS"] },
  // General
  { pattern: "/calendar", roles: ["ADMIN", "MANAGER", "LOGISTICS"] },
  { pattern: "/dashboard", roles: ["ADMIN", "MANAGER", "LOGISTICS"] },
  // Client portal
  { pattern: "/cabinet", roles: ["CLIENT"] },
];

export function canAccessRoute(pathname: string, user: SessionUser): boolean {
  const role = user.role as Role;
  if (role === "ADMIN") return true;

  for (const rule of ROUTE_PERMISSIONS) {
    if (pathname.startsWith(rule.pattern)) {
      return rule.roles.includes(role);
    }
  }

  return false;
}

export function requireRole(
  user: SessionUser | null,
  ...roles: Role[]
): asserts user is SessionUser {
  if (!user) throw new Error("Не авторизован");
  if (!roles.includes(user.role as Role)) {
    throw new Error("Недостаточно прав");
  }
}

export function getHomeRoute(role: string): string {
  if (role === "CLIENT") return "/cabinet";
  return "/dashboard";
}

export function isStaffRole(role: string): boolean {
  return role === "ADMIN" || role === "MANAGER" || role === "LOGISTICS";
}

// ─── Data scoping helpers ────────────────────────────────

export type DealScopeFilter = {
  createdById?: string;
};

export type LeadScopeFilter = {
  assignedToId?: string;
};

/**
 * Returns Prisma `where` clause additions for Deal queries based on role.
 * MANAGER sees only deals they created.
 */
export function buildDealScope(user: SessionUser): DealScopeFilter {
  if (user.role === "MANAGER") {
    return { createdById: user.id };
  }
  return {};
}

/**
 * Returns Prisma `where` clause additions for Lead queries based on role.
 * MANAGER sees only leads assigned to them.
 */
export function buildLeadScope(user: SessionUser): LeadScopeFilter {
  if (user.role === "MANAGER") {
    return { assignedToId: user.id };
  }
  return {};
}

// ─── Field-level sanitization ────────────────────────────

const PRICE_FIELDS = [
  "purchasePrice",
  "dealerPrice",
] as const;

/**
 * Strips sensitive price fields from asset/accessory data for non-admin roles.
 */
export function sanitizePrices<T extends Record<string, unknown>>(
  data: T,
  role: string,
): T {
  if (role === "ADMIN") return data;

  const sanitized = { ...data };
  for (const field of PRICE_FIELDS) {
    if (field in sanitized) {
      delete sanitized[field];
    }
  }
  return sanitized;
}

/**
 * Whether the user can see financial data (revenue, expenses, profit, etc.).
 */
export function canSeeFinancials(role: string): boolean {
  return role === "ADMIN";
}

/**
 * Whether the user can see retail prices (visible to ADMIN and MANAGER).
 */
export function canSeeRetailPrices(role: string): boolean {
  return role === "ADMIN" || role === "MANAGER";
}

/**
 * Whether the user can see expense data.
 */
export function canSeeExpenses(role: string): boolean {
  return role === "ADMIN";
}
