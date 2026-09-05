import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/cookie";

/**
 * A cheap gate, not the security boundary.
 *
 * Middleware runs on the edge runtime, where the database is not
 * reachable, so all it can do is check whether a session cookie is
 * present and bounce obvious anonymous traffic before it costs a render.
 * Every protected page and route handler independently resolves the
 * session against the database — that check is the real one, and it is
 * what rejects a forged or expired cookie.
 */
export function middleware(request: NextRequest) {
  const hasCookie = request.cookies.has(SESSION_COOKIE);
  if (hasCookie) return NextResponse.next();

  const login = new URL("/login", request.url);
  login.searchParams.set(
    "next",
    request.nextUrl.pathname + request.nextUrl.search,
  );
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
