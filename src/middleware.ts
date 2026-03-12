import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/password-hash";

const AUTH_COOKIE = "costume-auth";

function isPublicPath(pathname: string): boolean {
  return (
    pathname === "/login" ||
    pathname === "/api/login" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/sitemap") ||
    pathname.startsWith("/robots")
  );
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const sitePassword = process.env.SITE_PASSWORD || "";
  if (!sitePassword) {
    return NextResponse.next();
  }

  const cookieValue = request.cookies.get(AUTH_COOKIE)?.value;
  const expected = hashPassword(sitePassword);

  if (cookieValue === expected) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
