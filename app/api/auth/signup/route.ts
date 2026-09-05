import { EmailTakenError, createUser } from "@/lib/db/accounts";
import { createSubscription } from "@/lib/db/billing";
import { hashPassword } from "@/lib/auth/password";
import { startSession } from "@/lib/auth/session";
import { jsonError, jsonOk, readJson, str } from "@/lib/http";
import { requirePlan } from "@/lib/plan-catalogue";
import { DEFAULT_PLAN_ID } from "@/lib/plans";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import {
  normalizeEmail,
  validateConfirmPassword,
  validateEmail,
  validateName,
  validatePassword,
  type FieldErrors,
} from "@/lib/validate";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limit = rateLimit(`signup:${ip}`, 10, 60 * 60 * 1000);
  if (!limit.ok) {
    return jsonError(
      "RATE_LIMITED",
      `Too many sign-up attempts. Try again in ${limit.retryAfterSeconds} seconds.`,
    );
  }

  const body = await readJson(request);
  if (!body) return jsonError("VALIDATION_ERROR", "Send a JSON body.");

  const name = str(body.name).trim();
  const email = normalizeEmail(str(body.email));
  const password = str(body.password);
  const confirmPassword = str(body.confirmPassword);

  const fields: FieldErrors = {};
  const nameError = validateName(name);
  if (nameError) fields.name = nameError;
  const emailError = validateEmail(email);
  if (emailError) fields.email = emailError;
  const passwordError = validatePassword(password);
  if (passwordError) fields.password = passwordError;
  const confirmError = validateConfirmPassword(password, confirmPassword);
  if (confirmError) fields.confirmPassword = confirmError;

  if (Object.keys(fields).length > 0) {
    return jsonError("VALIDATION_ERROR", "Check the highlighted fields.", {
      fields,
    });
  }

  const passwordHash = await hashPassword(password);

  let userId: string;
  try {
    const user = createUser({ name, email, passwordHash });
    userId = user.id;
  } catch (error) {
    if (error instanceof EmailTakenError) {
      return jsonError("EMAIL_TAKEN", "An account already uses that email.", {
        fields: { email: "An account already uses that email" },
      });
    }
    throw error;
  }

  // Every new account starts on the free tier, so the dashboard is never
  // empty and a first scan needs no card. The plan is read from the live
  // catalogue rather than the shipped defaults: an admin who changes the
  // Free allowance must have that apply to accounts created afterwards,
  // otherwise the pricing page and the granted subscription disagree.
  createSubscription({
    userId,
    plan: requirePlan(DEFAULT_PLAN_ID),
    paymentStatus: "free",
    amountPaise: 0,
  });

  await startSession(userId, {
    userAgent: request.headers.get("user-agent"),
    ip,
  });

  return jsonOk({ userId }, 201);
}
