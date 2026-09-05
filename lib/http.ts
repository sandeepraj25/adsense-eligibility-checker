import { NextResponse } from "next/server";

/**
 * One vocabulary of failures for the whole API. The client switches on
 * `code`; `message` is already written for a human to read, so the UI
 * can surface it directly without inventing its own copy.
 */
export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "ADMIN_REQUIRED"
  | "ACCOUNT_BLOCKED"
  | "EMAIL_TAKEN"
  | "INVALID_CREDENTIALS"
  | "NO_ACTIVE_PLAN"
  | "PLAN_EXPIRED"
  | "LIMIT_REACHED"
  | "SITE_LIMIT_REACHED"
  | "FEATURE_LOCKED"
  | "INVALID_URL"
  | "URL_NOT_ALLOWED"
  | "SITE_UNREACHABLE"
  | "DNS_FAILURE"
  | "PAYMENTS_UNCONFIGURED"
  | "GATEWAY_DISABLED"
  | "PAYMENT_FAILED"
  | "PAYMENT_CANCELLED"
  | "PAYMENT_VERIFICATION_FAILED"
  | "WEBHOOK_INVALID"
  | "ORDER_NOT_FOUND"
  | "ANALYSIS_FAILED"
  | "RATE_LIMITED"
  | "NOT_FOUND"
  | "SERVER_ERROR";

export type ApiFailure = {
  ok: false;
  code: ApiErrorCode;
  message: string;
  /** Field-level messages keyed by input name, for forms. */
  fields?: Record<string, string>;
};

export type ApiSuccess<T> = { ok: true } & T;

export function jsonOk<T extends object>(
  data: T,
  status = 200,
): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ ok: true, ...data } as ApiSuccess<T>, { status });
}

const DEFAULT_STATUS: Record<ApiErrorCode, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  ADMIN_REQUIRED: 403,
  ACCOUNT_BLOCKED: 403,
  EMAIL_TAKEN: 409,
  INVALID_CREDENTIALS: 401,
  NO_ACTIVE_PLAN: 402,
  PLAN_EXPIRED: 402,
  LIMIT_REACHED: 402,
  SITE_LIMIT_REACHED: 402,
  FEATURE_LOCKED: 402,
  INVALID_URL: 400,
  // A refusal, not a malformed input: the address parsed fine, we simply
  // will not dial it.
  URL_NOT_ALLOWED: 400,
  SITE_UNREACHABLE: 422,
  DNS_FAILURE: 422,
  PAYMENTS_UNCONFIGURED: 503,
  GATEWAY_DISABLED: 503,
  PAYMENT_FAILED: 402,
  PAYMENT_CANCELLED: 409,
  PAYMENT_VERIFICATION_FAILED: 400,
  WEBHOOK_INVALID: 400,
  ORDER_NOT_FOUND: 404,
  ANALYSIS_FAILED: 502,
  RATE_LIMITED: 429,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
};

/**
 * Turns an unexpected exception into a response.
 *
 * The message the caller sees is fixed copy; the real error goes to the
 * server log. A stack trace or a SQL fragment in a JSON body tells an
 * attacker about the inside of the system and tells the user nothing they
 * can act on.
 */
export function jsonServerError(
  context: string,
  error: unknown,
): NextResponse<ApiFailure> {
  console.error(`[${context}]`, error);
  return jsonError(
    "SERVER_ERROR",
    "Something went wrong on our side. Try again in a moment.",
  );
}

export function jsonError(
  code: ApiErrorCode,
  message: string,
  options?: { status?: number; fields?: Record<string, string> },
): NextResponse<ApiFailure> {
  const body: ApiFailure = { ok: false, code, message };
  if (options?.fields) body.fields = options.fields;
  return NextResponse.json(body, {
    status: options?.status ?? DEFAULT_STATUS[code],
  });
}

/** Parses a JSON body without letting a malformed payload throw a 500. */
export async function readJson(
  request: Request,
): Promise<Record<string, unknown> | null> {
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      return null;
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/**
 * A whole number from a JSON body, or null when the value is not one.
 *
 * Strings are accepted because a number typed into a form arrives as one,
 * but "12abc" and "" are refused rather than coerced — `parseInt` alone
 * would turn the first into 12 and `Number("")` would turn the second
 * into 0, and an admin form is the wrong place to guess.
 */
export function int(value: unknown): number | null {
  if (typeof value === "number") return Number.isInteger(value) ? value : null;
  if (typeof value === "string" && /^-?\d+$/.test(value.trim())) {
    const parsed = Number.parseInt(value.trim(), 10);
    return Number.isSafeInteger(parsed) ? parsed : null;
  }
  return null;
}

/** JSON booleans, plus the "true"/"false" strings a form field sends. */
export function bool(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (value === "true" || value === "1") return true;
  if (value === "false" || value === "0") return false;
  return null;
}

/** A JSON array of strings, or null for anything else. */
export function strList(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  return value.every((item) => typeof item === "string")
    ? (value as string[])
    : null;
}
