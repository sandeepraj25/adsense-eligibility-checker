import { optionalUser } from "@/lib/auth/guard";
import { accountBlock } from "@/lib/entitlement";
import { jsonError, jsonOk, jsonServerError, readJson, str } from "@/lib/http";
import { checkoutOptions, startCheckout } from "@/lib/payments";
import { getPlan } from "@/lib/plan-catalogue";
import { isGatewayId } from "@/lib/db/types";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * Opens an order with the chosen gateway.
 *
 * The request names a plan and a payment method; it does not name a price.
 * The amount is read from the plan catalogue on this side, so a crafted
 * body cannot buy Pro for a rupee. What comes back is the minimum the
 * browser needs to open checkout — an order id, a public key, or a
 * redirect URL — and never a secret.
 */
export async function POST(request: Request) {
  const user = await optionalUser();
  if (!user) {
    return jsonError("UNAUTHENTICATED", "Log in to continue to payment.");
  }

  const blocked = accountBlock(user);
  if (blocked) return jsonError(blocked.code, blocked.message);

  const limit = rateLimit(`order:${user.id}`, 20, 10 * 60 * 1000);
  if (!limit.ok) {
    return jsonError(
      "RATE_LIMITED",
      `Too many checkout attempts. Try again in ${limit.retryAfterSeconds} seconds.`,
    );
  }

  const body = await readJson(request);
  if (!body) return jsonError("VALIDATION_ERROR", "Send a JSON body.");

  const plan = getPlan(str(body.planId));
  if (!plan) {
    return jsonError("VALIDATION_ERROR", "Choose one of the listed plans.");
  }
  if (!plan.active || !plan.purchasable) {
    return jsonError("VALIDATION_ERROR", "That plan cannot be purchased.");
  }

  const options = checkoutOptions();
  if (options.length === 0) {
    return jsonError(
      "PAYMENTS_UNCONFIGURED",
      "Online payment is unavailable right now. No payment gateway is enabled — please try again later or contact support.",
    );
  }

  // An absent gateway means "whatever you have"; a named one that is off
  // gets a specific refusal rather than a silent substitution.
  const requested = str(body.gateway);
  if (requested && !isGatewayId(requested)) {
    return jsonError("VALIDATION_ERROR", "Choose one of the listed payment methods.");
  }
  const gateway = isGatewayId(requested) ? requested : options[0].id;

  try {
    const result = await startCheckout({
      userId: user.id,
      plan,
      gateway,
      customerName: user.name,
      customerEmail: user.email,
      customerPhone: str(body.phone),
    });

    if (!result.ok) {
      return jsonError(result.code, result.message);
    }

    return jsonOk({
      gateway: result.gateway,
      orderId: result.orderId,
      amountPaise: result.amountPaise,
      currency: result.currency,
      planId: result.planId,
      planName: result.planName,
      simulated: result.simulated,
      // Narrow by construction: an id, a public key, or a redirect. No
      // adapter is able to put a secret in here.
      handoff: result.handoff,
      prefill: { name: user.name, email: user.email },
    });
  } catch (error) {
    return jsonServerError("checkout/order", error);
  }
}

/**
 * The payment methods a customer may choose, for rendering the checkout
 * form. Public information only: labels, methods and the sandbox flag.
 */
export async function GET() {
  const user = await optionalUser();
  if (!user) return jsonError("UNAUTHENTICATED", "Log in to continue to payment.");
  return jsonOk({ options: checkoutOptions() });
}
