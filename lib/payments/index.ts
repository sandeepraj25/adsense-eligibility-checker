import { createHash, randomBytes } from "node:crypto";

import {
  createPayment,
  findPaymentByOrderId,
  markPaymentFailed,
} from "@/lib/db/billing";
import type {
  GatewayEnvironment,
  GatewayId,
  WebhookOutcome,
} from "@/lib/db/types";
import {
  claimWebhookEvent,
  recordWebhookRejection,
  releaseWebhookEvent,
  setWebhookOutcome,
} from "@/lib/db/webhooks";
import { APP_URL, PAYMENTS_MOCK_MODE } from "@/lib/env";
import type { ApiErrorCode } from "@/lib/http";
import { fulfilPayment, DuplicateFulfilment } from "@/lib/billing/fulfil";
import type { Plan } from "@/lib/plans";

import { enabledGatewayConfigs, gatewayConfig } from "./config";
import { GATEWAYS, gatewayFor } from "./registry";
import { GatewayError, type OrderResult, type VerifyResult, type WebhookVerdict } from "./types";

/**
 * The checkout orchestrator: the only module the routes talk to.
 *
 * Everything gateway-specific lives behind an adapter, so what remains
 * here is the part that must be identical for all three — recording the
 * order before the customer leaves, refusing to grant anything until a
 * server-side verification says so, and making duplicate deliveries
 * harmless.
 *
 * The price is read from the plan record on this side of the wire, every
 * time. No caller passes an amount, so no crafted request can set one.
 */

export { GatewayError } from "./types";
export { GATEWAYS, GATEWAY_LIST, gatewayFor, gatewayLabel } from "./registry";
export {
  allGatewayConfigs,
  enabledGatewayConfigs,
  gatewayConfig,
  gatewayRows,
  gatewayView,
  gatewayViews,
  saveGatewayCredentials,
  setGatewayEnabled,
  setGatewayEnvironment,
  type SaveCredentialsResult,
} from "./config";
export { RAZORPAY_CHECKOUT_SCRIPT } from "./razorpay";
export { paypalRateInrPerUnit } from "./paypal";

/** Where hosted checkouts send the customer back to. */
export const CHECKOUT_RETURN_PATH = "/dashboard/billing/return";

/* ── what checkout may offer ────────────────────────────────────── */

/**
 * A gateway the customer can pick right now. Safe to serialise to the
 * browser: there is nothing here a public pricing page could not show.
 */
export type CheckoutOption = {
  id: GatewayId;
  label: string;
  blurb: string;
  methods: string[];
  environment: GatewayEnvironment;
  /** Cashfree rejects an order with no contact number, so the form asks. */
  requiresPhone: boolean;
  /** The local simulator: no money moves and nothing is charged. */
  simulated: boolean;
};

function requiresPhone(id: GatewayId): boolean {
  return id === "cashfree";
}

/**
 * Gateways a customer may choose, in display order.
 *
 * In mock mode every gateway is offered as a simulator regardless of
 * credentials — that is the point of the switch, and it is unreachable in
 * production because `PAYMENTS_MOCK_MODE` is gated on NODE_ENV. Otherwise
 * only gateways that are both configured and switched on appear, so
 * disabling one in the admin panel removes it from checkout immediately.
 */
export function checkoutOptions(): CheckoutOption[] {
  if (PAYMENTS_MOCK_MODE) {
    return Object.values(GATEWAYS).map((gateway) => ({
      id: gateway.id,
      label: gateway.label,
      blurb: "Simulated locally. No payment is taken and no money moves.",
      methods: gateway.methods,
      environment: "sandbox" as const,
      requiresPhone: false,
      simulated: true,
    }));
  }

  return enabledGatewayConfigs().map((config) => {
    const gateway = GATEWAYS[config.id];
    return {
      id: gateway.id,
      label: gateway.label,
      blurb: gateway.blurb,
      methods: gateway.methods,
      environment: config.environment,
      requiresPhone: requiresPhone(gateway.id),
      simulated: false,
    };
  });
}

export function checkoutIsPossible(): boolean {
  return checkoutOptions().length > 0;
}

/**
 * The gateway to preselect. First enabled one in display order, so
 * Razorpay leads for a rupee-priced product unless an admin turned it off.
 */
export function defaultCheckoutGateway(): GatewayId | null {
  return checkoutOptions()[0]?.id ?? null;
}

/* ── opening an order ───────────────────────────────────────────── */

export type StartCheckoutInput = {
  userId: string;
  /** Read from the plan catalogue by the caller. Supplies the price. */
  plan: Plan;
  gateway: GatewayId;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  /** Overrides the default return path. Must be an absolute URL. */
  returnUrl?: string;
};

export type StartCheckoutResult =
  | {
      ok: true;
      gateway: GatewayId;
      orderId: string;
      amountPaise: number;
      currency: string;
      planId: string;
      planName: string;
      simulated: boolean;
      handoff: OrderResult["handoff"];
    }
  | { ok: false; code: ApiErrorCode; message: string };

function newReceipt(): string {
  return `rcpt_${Date.now().toString(36)}_${randomBytes(4).toString("hex")}`;
}

export async function startCheckout(
  input: StartCheckoutInput,
): Promise<StartCheckoutResult> {
  const { plan } = input;

  if (plan.amountPaise <= 0) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      message: "That plan has no charge, so there is nothing to pay for.",
    };
  }

  const options = checkoutOptions();
  if (options.length === 0) {
    return {
      ok: false,
      code: "PAYMENTS_UNCONFIGURED",
      message:
        "Online payment is unavailable right now. No payment gateway is enabled on this site.",
    };
  }

  const option = options.find((entry) => entry.id === input.gateway);
  if (!option) {
    return {
      ok: false,
      code: "GATEWAY_DISABLED",
      message: `${gatewayFor(input.gateway)?.label ?? "That payment method"} is not available. Choose another payment method.`,
    };
  }

  if (option.requiresPhone && !input.customerPhone?.trim()) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      message: `${option.label} needs a contact number for the order.`,
    };
  }

  const receipt = newReceipt();
  const request = {
    amountPaise: plan.amountPaise,
    currency: plan.currency,
    receipt,
    planId: plan.id,
    planName: plan.name,
    userId: input.userId,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone?.trim() || undefined,
    returnUrl: input.returnUrl ?? `${APP_URL}${CHECKOUT_RETURN_PATH}`,
  };

  let order: OrderResult;
  let environment: GatewayEnvironment;

  if (option.simulated) {
    // No gateway call at all. The row is stamped mode='mock', which is what
    // stops the verification path below from ever settling it as real.
    const orderId = `order_mock_${randomBytes(9).toString("hex")}`;
    order = { orderId, handoff: { kind: "mock", orderId } };
    environment = "sandbox";
  } else {
    const config = gatewayConfig(input.gateway);
    environment = config.environment;
    try {
      order = await GATEWAYS[input.gateway].createOrder(config, request);
    } catch (error) {
      // The adapter's message is written for the customer — a missing
      // exchange rate, a rejected key — but anything unexpected is logged
      // and replaced, so no gateway response body reaches the browser.
      if (error instanceof GatewayError) {
        console.error(`[checkout:${input.gateway}]`, error);
        return {
          ok: false,
          code: "PAYMENT_FAILED",
          message:
            "We could not reach the payment provider. Try again in a moment.",
        };
      }
      console.error(`[checkout:${input.gateway}]`, error);
      return {
        ok: false,
        code: "PAYMENT_FAILED",
        message:
          error instanceof Error && error.message
            ? error.message
            : "The payment provider refused to open this order.",
      };
    }
  }

  // Recorded *after* the gateway accepted it and *before* the customer
  // leaves, so a return trip or a webhook always finds a row to settle.
  createPayment({
    userId: input.userId,
    planId: plan.id,
    amountPaise: plan.amountPaise,
    currency: plan.currency,
    orderId: order.orderId,
    gateway: input.gateway,
    environment,
    mode: option.simulated ? "mock" : "live",
    receipt,
  });

  return {
    ok: true,
    gateway: input.gateway,
    orderId: order.orderId,
    amountPaise: plan.amountPaise,
    currency: plan.currency,
    planId: plan.id,
    planName: plan.name,
    simulated: option.simulated,
    handoff: order.handoff,
  };
}

/* ── settling one ───────────────────────────────────────────────── */

export type VerifyCheckoutResult =
  | {
      ok: true;
      status: "fulfilled" | "already";
      subscriptionId: string;
      invoiceId: string | null;
      planId: string;
      simulated: boolean;
    }
  | {
      ok: false;
      code: ApiErrorCode;
      message: string;
      /**
       * Nothing failed — the gateway simply has not finished. The route
       * answers 202 and the webhook completes it, so the customer is told
       * to wait rather than to try again.
       */
      pending?: boolean;
    };

/**
 * Turns a browser callback into entitlement, or refuses to.
 *
 * The order id is the only thing taken from the payload at face value, and
 * only as a lookup key. Everything that decides whether the plan is
 * granted — the status, the amount, the payment id — comes from a
 * server-to-server verification the browser cannot influence.
 */
export async function verifyCheckout(input: {
  userId: string;
  orderId: string;
  /** Whatever the gateway handed the browser. Passed to the adapter as-is. */
  payload: Record<string, unknown>;
}): Promise<VerifyCheckoutResult> {
  const payment = findPaymentByOrderId(input.orderId);
  if (!payment) {
    return {
      ok: false,
      code: "ORDER_NOT_FOUND",
      message: "We have no record of that order.",
    };
  }

  // An order belongs to the person who opened it. Without this check
  // anyone holding an order id could attach someone else's payment to
  // their own account.
  if (payment.userId !== input.userId) {
    return {
      ok: false,
      code: "FORBIDDEN",
      message: "That order belongs to a different account.",
    };
  }

  const gateway = gatewayFor(payment.gateway);
  if (!gateway) {
    return {
      ok: false,
      code: "SERVER_ERROR",
      message: "That order was opened with a payment method we no longer support.",
    };
  }

  // The simulator, and only for rows it created. A live payment can never
  // take this path, even if the environment variable were flipped on a
  // production box.
  if (payment.mode === "mock") {
    if (!PAYMENTS_MOCK_MODE) {
      return {
        ok: false,
        code: "PAYMENT_VERIFICATION_FAILED",
        message: "Simulated payments cannot be settled on this deployment.",
      };
    }
    return settle({
      orderId: input.orderId,
      gatewayPaymentId: `pay_mock_${randomBytes(9).toString("hex")}`,
      method: "simulated",
      amountPaise: payment.amountPaise,
      currency: payment.currency,
      rawStatus: "mock",
      simulated: true,
    });
  }

  const config = gatewayConfig(payment.gateway);
  if (config.source === "none") {
    return {
      ok: false,
      code: "PAYMENTS_UNCONFIGURED",
      message:
        "This order cannot be confirmed because its payment method is no longer configured. Contact support.",
    };
  }

  let verdict: VerifyResult;
  try {
    verdict = await gateway.verifyReturn(config, {
      ...input.payload,
      order_id: input.payload.order_id ?? input.orderId,
    });
  } catch (error) {
    console.error(`[verify:${payment.gateway}]`, error);
    return {
      ok: false,
      code: "PAYMENT_VERIFICATION_FAILED",
      message: "We could not confirm this payment with the provider. If money left your account, the webhook will settle it shortly.",
    };
  }

  if (!verdict.ok) {
    if (verdict.kind === "rejected" || verdict.kind === "cancelled") {
      markPaymentFailed(
        input.orderId,
        verdict.message,
        verdict.kind === "cancelled" ? "cancelled" : "failed",
      );
    }
    return {
      ok: false,
      code:
        verdict.kind === "cancelled"
          ? "PAYMENT_CANCELLED"
          : verdict.kind === "pending"
            ? "PAYMENT_FAILED"
            : "PAYMENT_VERIFICATION_FAILED",
      message: verdict.message,
      pending: verdict.kind === "pending",
    };
  }

  // The verified payment must belong to the order we looked up. A gateway
  // that echoed a different one would otherwise settle the wrong row.
  if (verdict.orderId !== input.orderId) {
    return {
      ok: false,
      code: "PAYMENT_VERIFICATION_FAILED",
      message: "That payment belongs to a different order.",
    };
  }

  return settle({
    orderId: input.orderId,
    gatewayPaymentId: verdict.gatewayPaymentId,
    method: verdict.method,
    amountPaise: verdict.amountPaise,
    currency: verdict.currency,
    rawStatus: verdict.rawStatus,
    simulated: false,
  });
}

function settle(input: {
  orderId: string;
  gatewayPaymentId: string;
  method: string | null;
  amountPaise: number | null;
  currency: string | null;
  rawStatus: string | null;
  simulated: boolean;
}): VerifyCheckoutResult {
  let result;
  try {
    result = fulfilPayment({
      orderId: input.orderId,
      gatewayPaymentId: input.gatewayPaymentId,
      method: input.method,
      observedAmountPaise: input.amountPaise,
      observedCurrency: input.currency,
      rawStatus: input.rawStatus,
    });
  } catch (error) {
    // Two callers raced and the other one won. Nothing is wrong; re-read.
    if (error instanceof DuplicateFulfilment) {
      const payment = findPaymentByOrderId(input.orderId);
      return {
        ok: true,
        status: "already",
        subscriptionId: payment?.subscriptionId ?? "",
        invoiceId: null,
        planId: payment?.planId ?? "",
        simulated: input.simulated,
      };
    }
    throw error;
  }

  switch (result.status) {
    case "fulfilled":
    case "already":
      return {
        ok: true,
        status: result.status,
        subscriptionId: result.subscriptionId,
        invoiceId: result.invoiceId,
        planId: result.planId,
        simulated: input.simulated,
      };
    case "not_found":
      return {
        ok: false,
        code: "ORDER_NOT_FOUND",
        message: "We have no record of that order.",
      };
    case "closed":
      return { ok: false, code: "PAYMENT_CANCELLED", message: result.reason };
    case "mismatch":
      return {
        ok: false,
        code: "PAYMENT_VERIFICATION_FAILED",
        message: result.reason,
      };
  }
}

/* ── webhooks ───────────────────────────────────────────────────── */

export type WebhookResult = {
  /** What to answer the gateway. 2xx stops the retries. */
  httpStatus: number;
  outcome: WebhookOutcome;
  detail: string;
};

function hashOf(rawBody: string): string {
  return createHash("sha256").update(rawBody).digest("hex").slice(0, 32);
}

/**
 * The authoritative settlement path.
 *
 * A browser can close its tab halfway through a redirect; a webhook
 * arrives anyway. So this does the same job as `verifyCheckout` and is
 * expected to race it — which is safe, because both funnel into
 * `fulfilPayment`, whose guarded UPDATE lets exactly one of them win.
 *
 * Signature first, then the idempotency claim, then the work. An unsigned
 * or badly-signed delivery never reaches the ledger's `processed` state
 * and never touches a payment row.
 */
export async function processWebhook(
  gatewayId: unknown,
  rawBody: string,
  headers: Headers,
): Promise<WebhookResult> {
  const gateway = gatewayFor(gatewayId);
  if (!gateway) {
    return {
      httpStatus: 404,
      outcome: "rejected",
      detail: "Unknown payment gateway.",
    };
  }

  const payloadHash = hashOf(rawBody);
  const config = gatewayConfig(gateway.id);

  if (config.source === "none") {
    recordRejection(gateway.id, payloadHash, "ignored", "Gateway not configured.");
    return {
      httpStatus: 503,
      outcome: "ignored",
      detail: "That gateway is not configured here.",
    };
  }

  let verdict: WebhookVerdict;
  try {
    verdict = await gateway.verifyWebhook(config, rawBody, headers);
  } catch (error) {
    console.error(`[webhook:${gateway.id}]`, error);
    // A transient verification failure must be retried, so answer 5xx and
    // claim nothing.
    return {
      httpStatus: 503,
      outcome: "rejected",
      detail: "Verification is temporarily unavailable.",
    };
  }

  if (!verdict.ok) {
    recordRejection(gateway.id, payloadHash, "rejected", verdict.message);
    console.warn(`[webhook:${gateway.id}] ${verdict.kind}: ${verdict.message}`);
    // 400, deliberately: a bad signature will not become good on a retry,
    // and the delivery is recorded so a misconfiguration is visible in the
    // admin panel rather than silent.
    return { httpStatus: 400, outcome: "rejected", detail: verdict.message };
  }

  const claimed = claimWebhookEvent({
    id: `${gateway.id}:${verdict.eventId}`,
    gateway: gateway.id,
    eventType: verdict.eventType,
    payloadHash,
  });
  if (!claimed) {
    return {
      httpStatus: 200,
      outcome: "duplicate",
      detail: "Already processed.",
    };
  }

  const eventKey = `${gateway.id}:${verdict.eventId}`;

  try {
    if (verdict.payment) {
      const result = settle({
        orderId: verdict.payment.orderId,
        gatewayPaymentId: verdict.payment.gatewayPaymentId,
        method: verdict.payment.method,
        amountPaise: verdict.payment.amountPaise,
        currency: verdict.payment.currency,
        rawStatus: verdict.payment.rawStatus,
        simulated: false,
      });

      if (result.ok) {
        setWebhookOutcome(
          eventKey,
          "processed",
          `${verdict.eventType} → ${result.status} ${result.subscriptionId}`,
        );
        return {
          httpStatus: 200,
          outcome: "processed",
          detail: `Subscription ${result.status}.`,
        };
      }

      // An order we have no row for is usually another deployment sharing
      // the same gateway account. Acknowledged so the gateway stops
      // retrying, but recorded as ignored rather than processed.
      const ignorable = result.code === "ORDER_NOT_FOUND";
      setWebhookOutcome(
        eventKey,
        ignorable ? "ignored" : "rejected",
        `${verdict.eventType}: ${result.message}`,
      );
      return {
        httpStatus: 200,
        outcome: ignorable ? "ignored" : "rejected",
        detail: result.message,
      };
    }

    if (verdict.failure) {
      markPaymentFailed(
        verdict.failure.orderId,
        verdict.failure.reason,
        verdict.eventType.toLowerCase().includes("dropped") ||
          verdict.eventType.toLowerCase().includes("void")
          ? "cancelled"
          : "failed",
      );
      setWebhookOutcome(
        eventKey,
        "processed",
        `${verdict.eventType}: ${verdict.failure.reason}`,
      );
      return {
        httpStatus: 200,
        outcome: "processed",
        detail: "Payment marked failed.",
      };
    }

    // Signed, understood, and about something we do not act on — a refund
    // notification, a settlement report. Kept in the ledger so the admin
    // panel shows that deliveries are arriving.
    setWebhookOutcome(eventKey, "ignored", `${verdict.eventType}: no action`);
    return {
      httpStatus: 200,
      outcome: "ignored",
      detail: "Event acknowledged; nothing to do.",
    };
  } catch (error) {
    // The claim is given back so the gateway's retry is reprocessed rather
    // than dismissed as a duplicate. Double processing is already harmless;
    // never processing is not.
    releaseWebhookEvent(eventKey);
    console.error(`[webhook:${gateway.id}]`, error);
    return {
      httpStatus: 500,
      outcome: "rejected",
      detail: "Processing failed; retry expected.",
    };
  }
}

function recordRejection(
  gateway: GatewayId,
  payloadHash: string,
  outcome: Exclude<WebhookOutcome, "processed">,
  detail: string,
): void {
  // Synthetic id: a rejected delivery has no trustworthy event id, and two
  // identical rejections a second apart should both be visible.
  recordWebhookRejection({
    id: `${gateway}:rejected:${payloadHash}:${Date.now()}`,
    gateway,
    payloadHash,
    outcome,
    detail,
  });
}