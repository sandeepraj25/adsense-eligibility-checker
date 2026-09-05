import { getSessionUser } from "@/lib/auth/session";
import { updateUserName } from "@/lib/db/accounts";
import { jsonError, jsonOk, readJson, str } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { validateName } from "@/lib/validate";

export const runtime = "nodejs";

/** Renames the signed-in account. Email is deliberately not editable here. */
export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session) return jsonError("UNAUTHENTICATED", "Log in to change this.");

  const limit = rateLimit(`profile:${session.user.id}`, 20, 10 * 60 * 1000);
  if (!limit.ok) {
    return jsonError(
      "RATE_LIMITED",
      `Too many changes. Try again in ${limit.retryAfterSeconds} seconds.`,
    );
  }

  const body = await readJson(request);
  if (!body) return jsonError("VALIDATION_ERROR", "Send a JSON body.");

  const name = str(body.name).trim();
  const problem = validateName(name);
  if (problem) {
    return jsonError("VALIDATION_ERROR", problem, { fields: { name: problem } });
  }

  updateUserName(session.user.id, name);
  return jsonOk({ name });
}
