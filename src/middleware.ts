import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "ergoset-session";

type JWTPayload = {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
};

async function decodeJWT(token: string): Promise<JWTPayload | null> {
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "ergoset-dev-jwt-secret-2026"
    );
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

const STAFF_ROUTE_PERMISSIONS: { pattern: string; roles: string[] }[] = [
  { pattern: "/settings", roles: ["ADMIN"] },
  { pattern: "/import", roles: ["ADMIN"] },
  { pattern: "/reports", roles: ["ADMIN"] },
  { pattern: "/payments", roles: ["ADMIN", "MANAGER"] },
  { pattern: "/documents", roles: ["ADMIN", "MANAGER"] },
  { pattern: "/deals", roles: ["ADMIN", "MANAGER"] },
  { pattern: "/clients", roles: ["ADMIN", "MANAGER"] },
  { pattern: "/leads", roles: ["ADMIN", "MANAGER"] },
  { pattern: "/logistics", roles: ["ADMIN", "LOGISTICS"] },
  { pattern: "/assets", roles: ["ADMIN", "MANAGER", "LOGISTICS"] },
  { pattern: "/accessories", roles: ["ADMIN", "MANAGER", "LOGISTICS"] },
  { pattern: "/inventory", roles: ["ADMIN", "LOGISTICS"] },
  { pattern: "/calendar", roles: ["ADMIN", "MANAGER", "LOGISTICS"] },
  { pattern: "/dashboard", roles: ["ADMIN", "MANAGER", "LOGISTICS"] },
];

function canAccessRoute(pathname: string, role: string): boolean {
  if (role === "ADMIN") return true;

  if (role === "CLIENT") {
    return pathname.startsWith("/cabinet");
  }

  for (const rule of STAFF_ROUTE_PERMISSIONS) {
    if (pathname.startsWith(rule.pattern)) {
      return rule.roles.includes(role);
    }
  }

  return false;
}

function getHomeRoute(role: string): string {
  return role === "CLIENT" ? "/cabinet" : "/dashboard";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/public") ||
    pathname.startsWith("/contract") ||
    pathname.startsWith("/invite") ||
    pathname.includes(".");

  const isLoginPage = pathname === "/login";
  const isLanding = pathname === "/";

  if (isPublic) return NextResponse.next();

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const user = token ? await decodeJWT(token) : null;

  if (!user && !isLoginPage && !isLanding) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (!user) return NextResponse.next();

  if (isLoginPage || isLanding) {
    const url = request.nextUrl.clone();
    url.pathname = getHomeRoute(user.role);
    return NextResponse.redirect(url);
  }

  if (!canAccessRoute(pathname, user.role)) {
    const url = request.nextUrl.clone();
    url.pathname = getHomeRoute(user.role);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
