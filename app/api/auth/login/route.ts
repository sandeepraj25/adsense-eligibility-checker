import { fakeVerifyDelay, verifyPassword } from "@/lib/auth/password";
import { startSession } from "@/lib/auth/session";
import { findUserRowByEmail } from "@/lib/db/accounts";
import { expireStaleSubscriptions } from "@/lib/db/billing";
import { jsonError, jsonOk, readJson, str } from "@/lib/http";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { normalizeEmail } from "@/lib/validate";

export const runtime = "nodejs";

const GENERIC = "That email and password combination is not right.";

export async function POST(request: Request) {
  const ip = clientIp(request);
  const body = await readJson(request);
  if (!body) return jsonError("VALIDATION_ERROR", "Send a JSON body.");

  const email = normalizeEmail(str(body.email));
  const password = str(body.password);

  if (!email || !password) {
    return jsonError("VALIDATION_ERROR", "Enter your email and password.", {
      fields: {
        ...(email ? {} : { email: "Enter your email" }),
        ...(password ? {} : { password: "Enter your password" }),
      },
    });
  }

  // Two buckets: one per address so a single account cannot be ground
  // down, one per IP so a spray across many addresses is also capped.
  for (const key of [`login:ip:${ip}`, `login:email:${email}`]) {
    const limit = rateLimit(key, 12, 15 * 60 * 1000);
    if (!limit.ok) {
      return jsonError(
        "RATE_LIMITED",
        `Too many attempts. Try again in ${limit.retryAfterSeconds} seconds.`,
      );
    }
  }

  const row = findUserRowByEmail(email);

  // No such account: burn a comparable amount of time so response
  // latency does not reveal which addresses are registered.
  if (!row) {
    await fakeVerifyDelay();
    return jsonError("INVALID_CREDENTIALS", GENERIC);
  }

  const valid = await verifyPassword(password, row.password_hash);
  if (!valid) return jsonError("INVALID_CREDENTIALS", GENERIC);

  // Checked after the password, not before: a stranger guessing addresses
  // must not learn which ones are suspended. The owner of the account
  // gets the real reason, because they can act on it.
  if (row.status !== "active") {
    return jsonError(
      "ACCOUNT_BLOCKED",
      row.blocked_reason
        ? `This account has been suspended: ${row.blocked_reason} Contact support if you think this is a mistake.`
        : "This account has been suspended. Contact support if you think this is a mistake.",
    );
  }

  expireStaleSubscriptions();

  await startSession(row.id, {
    userAgent: request.headers.get("user-agent"),
    ip,
  });

  return jsonOk({ userId: row.id });
}
