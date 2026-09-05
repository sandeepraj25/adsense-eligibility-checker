/**
 * Deliberately free of node builtins: `middleware.ts` runs on the edge
 * runtime and must be able to import this, while lib/auth/session.ts
 * (which uses node:crypto) must not be imported there.
 */
export const SESSION_COOKIE = "aec_session";

/** 30 days. Applied to both the cookie and the database row. */
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/** Renew once the session is inside its last 5 days. */
export const SESSION_RENEW_THRESHOLD_MS = 5 * 24 * 60 * 60 * 1000;
