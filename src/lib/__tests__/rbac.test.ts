import { describe, it, expect } from "vitest";
import {
  canAccessRoute,
  requireRole,
  getHomeRoute,
  isStaffRole,
  buildDealScope,
  buildLeadScope,
  sanitizePrices,
  canSeeFinancials,
  canSeeRetailPrices,
  canSeeExpenses,
} from "../rbac";
import type { SessionUser } from "../auth";

const admin: SessionUser = { id: "1", email: "a@a.com", fullName: "Admin", role: "ADMIN" };
const manager: SessionUser = { id: "2", email: "m@m.com", fullName: "Manager", role: "MANAGER" };
const logistics: SessionUser = { id: "3", email: "l@l.com", fullName: "Logistics", role: "LOGISTICS" };
const client: SessionUser = { id: "4", email: "c@c.com", fullName: "Client", role: "CLIENT" };

describe("canAccessRoute", () => {
  it("ADMIN can access any route", () => {
    expect(canAccessRoute("/settings", admin)).toBe(true);
    expect(canAccessRoute("/deals", admin)).toBe(true);
    expect(canAccessRoute("/cabinet", admin)).toBe(true);
    expect(canAccessRoute("/logistics", admin)).toBe(true);
  });

  it("MANAGER can access allowed routes", () => {
    expect(canAccessRoute("/deals", manager)).toBe(true);
    expect(canAccessRoute("/clients", manager)).toBe(true);
    expect(canAccessRoute("/payments", manager)).toBe(true);
    expect(canAccessRoute("/calendar", manager)).toBe(true);
    expect(canAccessRoute("/dashboard", manager)).toBe(true);
  });

  it("MANAGER cannot access restricted routes", () => {
    expect(canAccessRoute("/settings", manager)).toBe(false);
    expect(canAccessRoute("/import", manager)).toBe(false);
    expect(canAccessRoute("/reports", manager)).toBe(false);
    expect(canAccessRoute("/logistics", manager)).toBe(false);
    expect(canAccessRoute("/inventory", manager)).toBe(false);
  });

  it("LOGISTICS can access logistics routes", () => {
    expect(canAccessRoute("/logistics", logistics)).toBe(true);
    expect(canAccessRoute("/inventory", logistics)).toBe(true);
    expect(canAccessRoute("/assets", logistics)).toBe(true);
    expect(canAccessRoute("/calendar", logistics)).toBe(true);
  });

  it("LOGISTICS cannot access finance routes", () => {
    expect(canAccessRoute("/deals", logistics)).toBe(false);
    expect(canAccessRoute("/payments", logistics)).toBe(false);
    expect(canAccessRoute("/clients", logistics)).toBe(false);
  });

  it("CLIENT can only access cabinet", () => {
    expect(canAccessRoute("/cabinet", client)).toBe(true);
    expect(canAccessRoute("/cabinet/profile", client)).toBe(true);
    expect(canAccessRoute("/deals", client)).toBe(false);
    expect(canAccessRoute("/dashboard", client)).toBe(false);
  });
});

describe("requireRole", () => {
  it("throws if user is null", () => {
    expect(() => requireRole(null, "ADMIN")).toThrow("Не авторизован");
  });

  it("throws if user role does not match", () => {
    expect(() => requireRole(manager, "ADMIN")).toThrow("Недостаточно прав");
  });

  it("passes for matching role", () => {
    expect(() => requireRole(admin, "ADMIN")).not.toThrow();
    expect(() => requireRole(manager, "ADMIN", "MANAGER")).not.toThrow();
  });
});

describe("getHomeRoute", () => {
  it("returns /cabinet for CLIENT", () => {
    expect(getHomeRoute("CLIENT")).toBe("/cabinet");
  });

  it("returns /dashboard for staff roles", () => {
    expect(getHomeRoute("ADMIN")).toBe("/dashboard");
    expect(getHomeRoute("MANAGER")).toBe("/dashboard");
    expect(getHomeRoute("LOGISTICS")).toBe("/dashboard");
  });
});

describe("isStaffRole", () => {
  it("returns true for staff", () => {
    expect(isStaffRole("ADMIN")).toBe(true);
    expect(isStaffRole("MANAGER")).toBe(true);
    expect(isStaffRole("LOGISTICS")).toBe(true);
  });

  it("returns false for CLIENT", () => {
    expect(isStaffRole("CLIENT")).toBe(false);
  });
});

describe("buildDealScope", () => {
  it("returns empty for ADMIN", () => {
    expect(buildDealScope(admin)).toEqual({});
  });

  it("scopes by createdById for MANAGER", () => {
    expect(buildDealScope(manager)).toEqual({ createdById: "2" });
  });
});

describe("buildLeadScope", () => {
  it("returns empty for ADMIN", () => {
    expect(buildLeadScope(admin)).toEqual({});
  });

  it("scopes by assignedToId for MANAGER", () => {
    expect(buildLeadScope(manager)).toEqual({ assignedToId: "2" });
  });
});

describe("sanitizePrices", () => {
  const data = { name: "Test", purchasePrice: 1000, dealerPrice: 800, retailPrice: 1500 };

  it("returns all fields for ADMIN", () => {
    const result = sanitizePrices(data, "ADMIN");
    expect(result.purchasePrice).toBe(1000);
    expect(result.dealerPrice).toBe(800);
  });

  it("strips sensitive prices for non-ADMIN", () => {
    const result = sanitizePrices(data, "MANAGER");
    expect(result.purchasePrice).toBeUndefined();
    expect(result.dealerPrice).toBeUndefined();
    expect(result.retailPrice).toBe(1500);
  });
});

describe("canSeeFinancials", () => {
  it("only ADMIN can see financials", () => {
    expect(canSeeFinancials("ADMIN")).toBe(true);
    expect(canSeeFinancials("MANAGER")).toBe(false);
  });
});

describe("canSeeRetailPrices", () => {
  it("ADMIN and MANAGER can see retail prices", () => {
    expect(canSeeRetailPrices("ADMIN")).toBe(true);
    expect(canSeeRetailPrices("MANAGER")).toBe(true);
    expect(canSeeRetailPrices("LOGISTICS")).toBe(false);
  });
});

describe("canSeeExpenses", () => {
  it("only ADMIN can see expenses", () => {
    expect(canSeeExpenses("ADMIN")).toBe(true);
    expect(canSeeExpenses("MANAGER")).toBe(false);
  });
});
