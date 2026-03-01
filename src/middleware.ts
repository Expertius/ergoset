import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { ROUTE_PERMISSIONS } from "@/lib/rbac";

const COOKIE_NAME = "ergoset-session";

type JWTPayload = {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
};

const JWT_SECRET = process.env.JWT_SECRET
  ? new TextEncoder().encode(process.env.JWT_SECRET)
  : null;

async function decodeJWT(token: string): Promise<JWTPayload | null> {
  if (!JWT_SECRET) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

function canAccessRoute(pathname: string, role: string): boolean {
  if (role === "ADMIN") return true;

  if (role === "CLIENT") {
    return pathname.startsWith("/cabinet");
  }

  for (const rule of ROUTE_PERMISSIONS) {
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
