import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Simple password gate middleware.
 *
 * - Reads SITE_PASSWORD from environment variable.
 * - If the user has a valid "auth" cookie matching the password hash, they pass.
 * - Otherwise they are redirected to /login.
 * - The /login page and /api/login route are always accessible.
 */

const PUBLIC_PATHS = ["/login", "/api/login", "/_next", "/favicon.ico"];

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public paths
    if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
        return NextResponse.next();
    }

    // Check auth cookie
    const authCookie = request.cookies.get("costume-auth")?.value;
    const password = process.env.SITE_PASSWORD || "";

    if (!password) {
        // No password configured — allow through (dev mode)
        return NextResponse.next();
    }

    // Simple comparison: the cookie stores a token we set on login
    if (authCookie === hashPassword(password)) {
        return NextResponse.next();
    }

    // Redirect to login
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
}

/**
 * Simple hash for the password cookie value.
 * This is NOT cryptographic security — it's an internal tool with a shared password.
 * It just prevents the raw password from sitting in a cookie.
 */
function hashPassword(pw: string): string {
    let hash = 0;
    for (let i = 0; i < pw.length; i++) {
        const char = pw.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32-bit integer
    }
    return "cal_" + Math.abs(hash).toString(36);
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
