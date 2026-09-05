import {
  gatewayFetch,
  pick,
  pickNumber,
  pickString,
  type Gateway,
  type GatewayConfig,
  type OrderRequest,
  type OrderResult,
  type VerifyResult,
  type WebhookVerdict,
} from "./types";
import { convertPaiseByRate } from "@/lib/money";

/**
 * PayPal Orders v2, for customers outside India.
 *
 * Two honest complications, both surfaced rather than papered over.
 *
 * PayPal will not settle INR for most merchant accounts, so an amount in
 * rupees has to be charged in a convertible currency. Inventing an
 * exchange rate would be worse than useless, so the rate is an explicit
 * credential the admin sets and maintains, and the gateway refuses to
 * open an order without it. The customer sees the converted figure before
 * paying, and the invoice records the rupee amount that was agreed.
 *
 * And there is no HMAC to check. PayPal verifies a webhook by having you
 * ask PayPal, so `verifyWebhook` makes a server-to-server call to the
 * verification endpoint. A deployment without PAYPAL_WEBHOOK_ID cannot
 * verify anything, and unverified deliveries are rejected rather than
 * trusted.
 */

function base(config: GatewayConfig): string {
  return config.environment === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

function basicAuth(config: GatewayConfig): string {
  const raw = `${config.credentials.clientId ?? ""}:${config.credentials.clientSecret ?? ""}`;
  return `Basic ${Buffer.from(raw).toString("base64")}`;
}

/**
 * Access tokens last hours; caching one avoids an OAuth round trip on
 * every checkout. Keyed by client id and environment so switching either
 * cannot serve a token minted for the other.
 */
const tokens = new Map<string, { token: string; expiresAt: number }>();

async function accessToken(config: GatewayConfig): Promise<string> {
  const key = `${config.environment}:${config.credentials.clientId ?? ""}`;
  const cached = tokens.get(key);
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token;

  const response = await gatewayFetch("paypal", `${base(config)}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: basicAuth(config) },
    form: { grant_type: "client_credentials" },
  });

  const token = pickString(response.json, "access_token");
  if (!response.ok || !token) {
    throw new Error(
      pickString(response.json, "error_description") ??
        `PayPal refused the credentials (${response.status}).`,
    );
  }

  const ttl = pickNumber(response.json, "expires_in") ?? 3_000;
  tokens.set(key, { token, expiresAt: Date.now() + ttl * 1_000 });
  return token;
}

function settlementCurrency(config: GatewayConfig): string {
  const raw = (config.credentials.currency ?? "USD").trim().toUpperCase();
  return /^[A-Z]{3}$/.test(raw) ? raw : "USD";
}

/**
 * The rupees-per-settlement-unit rate an admin has actually configured,
 * or null if none is set (or it isn't a positive number).
 *
 * Exported so the pricing page can show a customer the same rate PayPal
 * will actually be charged at. Display and checkout must read this from
 * one place, not compute it independently, or the two figures could
 * silently drift apart.
 */
export function paypalRateInrPerUnit(config: GatewayConfig): number | null {
  const rate = Number.parseFloat(config.credentials.rateInrPerUnit ?? "");
  return Number.isFinite(rate) && rate > 0 ? rate : null;
}

/**
 * Converts our authoritative paise figure into the settlement currency.
 *
 * `rate` is how many rupees one unit of the settlement currency is worth
 * — 88.5 means one dollar costs ₹88.50. Rounded up to the cent so the
 * merchant is never short-changed by rounding, and refused outright when
 * the rate is missing or nonsensical.
 */
function convert(
  config: GatewayConfig,
  amountPaise: number,
): { value: string; currency: string } {
  const currency = settlementCurrency(config);
  if (currency === "INR") {
    return { value: (amountPaise / 100).toFixed(2), currency };
  }

  const rate = paypalRateInrPerUnit(config);
  if (!rate) {
    throw new Error(
      `PayPal is set to charge in ${currency}, but no ₹-per-${currency} rate is configured. Set it in the admin panel before enabling PayPal.`,
    );
  }

  return { value: convertPaiseByRate(amountPaise, rate).toFixed(2), currency };
}

export const paypal: Gateway = {
  id: "paypal",
  label: "PayPal",
  blurb: "Cards and PayPal balance, for customers paying from outside India.",
  methods: ["PayPal balance", "International cards"],

  fields: [
    {
      key: "clientId",
      label: "Client ID",
      hint: "PayPal Developer Dashboard → Apps & Credentials. Public; appears in the redirect.",
      secret: false,
    },
    {
      key: "clientSecret",
      label: "Client Secret",
      hint: "The other half of the app credentials. Used only server-side, for OAuth.",
      secret: true,
    },
    {
      key: "webhookId",
      label: "Webhook ID",
      hint: "The ID of the webhook you registered. Without it, deliveries cannot be verified and are rejected.",
      secret: false,
      optional: true,
    },
    {
      key: "currency",
      label: "Settlement currency",
      hint: "Three-letter code, e.g. USD. PayPal will not settle INR for most accounts.",
      secret: false,
      optional: true,
    },
    {
      key: "rateInrPerUnit",
      label: "Rupees per unit",
      hint: "How many rupees one unit of the settlement currency costs, e.g. 88.50. Required unless settling in INR. You maintain this figure.",
      secret: false,
      optional: true,
    },
  ],

  isConfigured(credentials) {
    if (!credentials.clientId || !credentials.clientSecret) return false;
    const currency = (credentials.currency ?? "USD").toUpperCase();
    if (currency === "INR") return true;
    const rate = Number.parseFloat(credentials.rateInrPerUnit ?? "");
    return Number.isFinite(rate) && rate > 0;
  },

  async createOrder(
    config: GatewayConfig,
    request: OrderRequest,
  ): Promise<OrderResult> {
    const token = await accessToken(config);
    const money = convert(config, request.amountPaise);

    const response = await gatewayFetch(
      "paypal",
      `${base(config)}/v2/checkout/orders`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // PayPal deduplicates on this, so a double-submitted checkout
          // opens one order rather than two.
          "PayPal-Request-Id": request.receipt,
        },
        body: {
          intent: "CAPTURE",
          purchase_units: [
            {
              reference_id: request.receipt,
              custom_id: `${request.userId}:${request.planId}`,
              description: `${request.planName} plan — 1 month`,
              amount: {
                currency_code: money.currency,
                value: money.value,
              },
            },
          ],
          payment_source: {
            paypal: {
              experience_context: {
                user_action: "PAY_NOW",
                return_url: request.returnUrl,
                cancel_url: `${request.returnUrl}?cancelled=1`,
              },
            },
          },
        },
      },
    );

    const orderId = pickString(response.json, "id");
    if (!response.ok || !orderId) {
      throw new Error(
        pickString(response.json, "message") ??
          `PayPal returned ${response.status}`,
      );
    }

    const links = pick(response.json, "links");
    const approve = Array.isArray(links)
      ? links.find((link) => {
          const rel = pickString(link, "rel");
          return rel === "payer-action" || rel === "approve";
        })
      : null;
    const url = pickString(approve, "href");
    if (!url) {
      throw new Error("PayPal did not return an approval link.");
    }

    return { orderId, handoff: { kind: "redirect", url } };
  },

  /**
   * The capture call *is* the verification: it is a server-to-server
   * request authenticated with our own client credentials, so the browser
   * cannot fake its result. The requested and captured amounts are then
   * compared, which catches a payer who approved a different figure.
   */
  async verifyReturn(
    config: GatewayConfig,
    payload: Record<string, unknown>,
  ): Promise<VerifyResult> {
    const orderId = pickString(payload, "token") ?? pickString(payload, "order_id");
    if (!orderId) {
      return {
        ok: false,
        kind: "rejected",
        message: "The payment response named no order.",
      };
    }

    const token = await accessToken(config);
    const response = await gatewayFetch(
      "paypal",
      `${base(config)}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "PayPal-Request-Id": `capture_${orderId}`,
        },
        body: {},
      },
    );

    // A previously-captured order comes back as a 422 with this issue.
    // That is not an error: it means somebody already completed this, and
    // fulfilment is idempotent, so read the capture and carry on.
    const issue = pickString(response.json, "details", "0", "issue");
    if (!response.ok && issue !== "ORDER_ALREADY_CAPTURED") {
      const detail = pickString(response.json, "details", "0", "description");
      return {
        ok: false,
        kind:
          issue === "INSTRUMENT_DECLINED" || issue === "PAYER_ACTION_REQUIRED"
            ? "rejected"
            : "error",
        message:
          detail ??
          pickString(response.json, "message") ??
          "PayPal could not complete the payment.",
      };
    }

    const status = pickString(response.json, "status");
    if (status && status !== "COMPLETED" && status !== "APPROVED") {
      return {
        ok: false,
        kind: status === "VOIDED" ? "cancelled" : "pending",
        message:
          status === "VOIDED"
            ? "That PayPal order was cancelled."
            : "PayPal has not completed this payment yet.",
      };
    }

    const unit = pick(response.json, "purchase_units", "0");
    const capture = pick(unit, "payments", "captures", "0");
    const captureId = pickString(capture, "id");
    if (!captureId) {
      return {
        ok: false,
        kind: "pending",
        message: "PayPal approved the order but has not captured it yet.",
      };
    }

    const requested = pickNumber(unit, "amount", "value");
    const taken = pickNumber(capture, "amount", "value");
    if (requested !== null && taken !== null && Math.abs(requested - taken) > 0.001) {
      return {
        ok: false,
        kind: "rejected",
        message: "The amount captured does not match the amount ordered.",
      };
    }

    // The settlement currency is not rupees, so there is no paise figure
    // that could honestly be compared against our own record. The
    // cross-check that matters — ordered against captured — has already
    // happened above, in the currency the money actually moved in.
    const currency = pickString(capture, "amount", "currency_code");
    const isRupees = currency === "INR";

    return {
      ok: true,
      orderId,
      gatewayPaymentId: captureId,
      method: "paypal",
      amountPaise: isRupees && taken !== null ? Math.round(taken * 100) : null,
      currency: isRupees ? currency : null,
      rawStatus: `${pickString(capture, "status") ?? status ?? "COMPLETED"} · ${taken ?? "?"} ${currency ?? "?"}`,
    };
  },

  /**
   * PayPal has no signing secret to compare against. Verification is a
   * call to their own endpoint with the delivery's headers and body; if
   * that does not answer SUCCESS, the delivery is rejected.
   */
  async verifyWebhook(
    config: GatewayConfig,
    rawBody: string,
    requestHeaders: Headers,
  ): Promise<WebhookVerdict> {
    const webhookId = config.credentials.webhookId ?? "";
    if (!webhookId) {
      return {
        ok: false,
        kind: "unsigned",
        message:
          "No PayPal webhook ID is configured, so deliveries cannot be verified.",
      };
    }

    const required = [
      "paypal-auth-algo",
      "paypal-cert-url",
      "paypal-transmission-id",
      "paypal-transmission-sig",
      "paypal-transmission-time",
    ];
    const present: Record<string, string> = {};
    for (const name of required) {
      const value = requestHeaders.get(name);
      if (!value) {
        return {
          ok: false,
          kind: "unsigned",
          message: `The delivery was missing ${name}.`,
        };
      }
      present[name] = value;
    }

    let body: unknown;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return { ok: false, kind: "malformed", message: "The body was not JSON." };
    }

    let token: string;
    try {
      token = await accessToken(config);
    } catch {
      return {
        ok: false,
        kind: "invalid",
        message: "PayPal credentials were rejected while verifying a webhook.",
      };
    }

    const check = await gatewayFetch(
      "paypal",
      `${base(config)}/v1/notifications/verify-webhook-signature`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: {
          auth_algo: present["paypal-auth-algo"],
          cert_url: present["paypal-cert-url"],
          transmission_id: present["paypal-transmission-id"],
          transmission_sig: present["paypal-transmission-sig"],
          transmission_time: present["paypal-transmission-time"],
          webhook_id: webhookId,
          // Must be the parsed body: PayPal re-serialises it their way.
          webhook_event: body,
        },
      },
    );

    if (!check.ok || pickString(check.json, "verification_status") !== "SUCCESS") {
      return {
        ok: false,
        kind: "invalid",
        message: "PayPal did not confirm the webhook signature.",
      };
    }

    const eventType = pickString(body, "event_type") ?? "unknown";
    const eventId = pickString(body, "id") ?? present["paypal-transmission-id"];
    const resource = pick(body, "resource");

    // A capture's `supplementary_data` carries the order it belongs to.
    const orderId =
      pickString(
        resource,
        "supplementary_data",
        "related_ids",
        "order_id",
      ) ?? pickString(resource, "id");
    const captureId = pickString(resource, "id");
    const currency = pickString(resource, "amount", "currency_code");
    const value = pickNumber(resource, "amount", "value");

    const completed = eventType === "PAYMENT.CAPTURE.COMPLETED";
    const failed =
      eventType === "PAYMENT.CAPTURE.DENIED" ||
      eventType === "PAYMENT.CAPTURE.REVERSED" ||
      eventType === "CHECKOUT.ORDER.VOIDED";

    return {
      ok: true,
      eventId,
      eventType,
      payment:
        completed && orderId && captureId
          ? {
              orderId,
              gatewayPaymentId: captureId,
              method: "paypal",
              amountPaise:
                currency === "INR" && value !== null ? Math.round(value * 100) : null,
              currency: currency === "INR" ? currency : null,
              rawStatus: `${pickString(resource, "status") ?? "COMPLETED"} · ${value ?? "?"} ${currency ?? "?"}`,
            }
          : null,
      failure:
        failed && orderId
          ? {
              orderId,
              reason:
                eventType === "CHECKOUT.ORDER.VOIDED"
                  ? "The PayPal order was cancelled."
                  : "PayPal denied or reversed the capture.",
            }
          : null,
    };
  },
};