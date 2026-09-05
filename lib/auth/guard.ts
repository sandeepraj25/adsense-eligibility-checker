import { notFound, redirect } from "next/navigation";
import type { NextResponse } from "next/server";

import type { User } from "@/lib/db/types";
import { accountBlock } from "@/lib/entitlement";
import { jsonError, type ApiFailure } from "@/lib/http";
import { getSessionUser, type ActiveSession } from "./session";

/**
 * For server components. Sends anonymous visitors to the login page with
 * a `next` parameter so they land back where they were headed.
 *
 * middleware.ts already turns away requests with no session cookie; this
 * is the authoritative check, because a cookie's presence proves nothing.
 */
export async function requireUser(nextPath = "/dashboard"): Promise<User> {
  const session = await getSessionUser();
  if (!session) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  return session.user;
}

export async function requireSession(
  nextPath = "/dashboard",
): Promise<ActiveSession> {
  const session = await getSessionUser();
  if (!session) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  return session;
}

/** For route handlers, which answer with JSON rather than a redirect. */
export async function optionalUser(): Promise<User | null> {
  const session = await getSessionUser();
  return session?.user ?? null;
}

/* ── admin ──────────────────────────────────────────────────────── */

/**
 * The gate on every admin page.
 *
 * Blocking a user already deletes their sessions, and the role is read
 * from the row on each request rather than from the cookie, so a
 * demotion or a block takes effect on the admin's very next navigation —
 * there is no signed claim to go stale.
 *
 * A signed-in non-admin gets a 404 rather than a redirect or a "you are
 * not allowed" page: there is no reason to confirm to a customer which
 * internal URLs exist. An admin who lands here after being demoted will
 * see the same 404, which is the price of not leaking the panel.
 */
export async function requireAdmin(nextPath = "/admin"): Promise<User> {
  const session = await getSessionUser();
  if (!session) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  if (!session.user.isAdmin || session.user.isBlocked) notFound();
  return session.user;
}

/** For rendering the admin link in navigation. Never a control. */
export async function viewerIsAdmin(): Promise<boolean> {
  const session = await getSessionUser();
  return Boolean(session?.user.isAdmin && !session.user.isBlocked);
}

export type AdminGuard =
  | { ok: true; admin: User }
  | { ok: false; response: NextResponse<ApiFailure> };

/**
 * The same gate for route handlers.
 *
 * Every admin API route calls this first. Hiding the links in the UI is
 * not a control — a mutation endpoint that only checked the referring
 * page would be one `curl` away from letting a customer re-price the Pro
 * plan. The status codes differ from the page guard on purpose: an API
 * client benefits from knowing whether to log in again (401) or to stop
 * (403), and neither answer tells an anonymous stranger anything, since
 * you must already hold a valid session to see the 403.
 */
export async function requireAdminApi(): Promise<AdminGuard> {
  const session = await getSessionUser();

  if (!session) {
    return {
      ok: false,
      response: jsonError("UNAUTHENTICATED", "Log in to continue."),
    };
  }

  const blocked = accountBlock(session.user);
  if (blocked) {
    return { ok: false, response: jsonError(blocked.code, blocked.message) };
  }

  if (!session.user.isAdmin) {
    return {
      ok: false,
      response: jsonError(
        "ADMIN_REQUIRED",
        "This action needs an administrator account.",
      ),
    };
  }

  return { ok: true, admin: session.user };
}
