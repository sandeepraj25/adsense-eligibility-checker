"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";
import type { ApiErrorCode } from "@/lib/http";
import type { CheckoutOption } from "@/lib/payments";
import type { PlanId } from "@/lib/plans";

/**
 * Checkout for whichever gateways an administrator has switched on.
 *
 * Three things this component is careful about:
 *
 *  - It offers only the methods the server said are enabled. When that list
 *    is empty there is no button to press: the customer is told payment is
 *    unavailable rather than being walked into a dead end.
 *  - No gateway script is fetched until somebody has actually chosen to pay,
 *    so a pricing view loads no third-party JavaScript.
 *  - Nothing here decides that a payment succeeded. Razorpay's callback,
 *    Cashfree's redirect and PayPal's approval all end at the same place —
 *    a server verification — and the plan is granted only by that.
 */

const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";
const CASHFREE_SCRIPT = "https://sdk.cashfree.com/js/v3/cashfree.js";

type RazorpaySuccess = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayInstance = { open: () => void };
type RazorpayConstructor = new (options: Record<string, unknown>) => RazorpayInstance;

type CashfreeInstance = {
  checkout: (options: {
    paymentSessionId: string;
    redirectTarget?: string;
  }) => Promise<unknown> | void;
};
type CashfreeFactory = (options: { mode: string }) => CashfreeInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
    Cashfree?: CashfreeFactory;
  }
}

/** Mirrors `OrderResult["handoff"]`, which is deliberately secret-free. */
type Handoff =
  | { kind: "razorpay_checkout"; keyId: string; orderId: string }
  | { kind: "cashfree_session"; sessionId: string; mode: "live" | "sandbox" }
  | { kind: "redirect"; url: string }
  | { kind: "mock"; orderId: string };

type OrderResponse = {
  ok: true;
  gateway: string;
  orderId: string;
  amountPaise: number;
  currency: string;
  planId: PlanId;
  planName: string;
  simulated: boolean;
  handoff: Handoff;
  prefill: { name: string; email: string };
};

type Failure = { ok: false; code: ApiErrorCode; message: string };

/** Loads a gateway's script once, and resolves on the copy already there. */
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${src}"]`,
    );
    if (existing) {
      if (existing.dataset.loaded === "1") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("script")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = "1";
      resolve();
    };
    script.onerror = () => reject(new Error("script"));
    document.head.appendChild(script);
  });
}

export function CheckoutButton({
  planId,
  planName,
  label,
  options,
  carryUrl,
  variant = "primary",
  className,
}: {
  planId: PlanId;
  planName: string;
  label: string;
  /** Enabled gateways, resolved on the server. Empty means checkout is shut. */
  options: CheckoutOption[];
  /** Domain the visitor was trying to audit, carried through the purchase. */
  carryUrl?: string;
  variant?: "primary" | "ghost";
  className?: string;
}) {
  const router = useRouter();
  const { toast, success, error } = useToast();
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [gatewayId, setGatewayId] = useState(options[0]?.id ?? "");
  const [phone, setPhone] = useState("");

  const chosen = options.find((option) => option.id === gatewayId) ?? options[0];

  const afterPurchase = useCallback(() => {
    const target = carryUrl
      ? `/dashboard/checker?url=${encodeURIComponent(carryUrl)}&run=1`
      : "/dashboard/billing";
    router.push(target);
    router.refresh();
  }, [carryUrl, router]);

  const confirm = useCallback(
    async (payload: Record<string, string>) => {
      try {
        const res = await fetch("/api/checkout/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = (await res.json()) as
          | { ok: true; alreadyActive?: boolean }
          | Failure;

        if (!data.ok) {
          // 202 means the gateway has not finished, not that it refused.
          if (res.status === 202) {
            toast({
              tone: "info",
              title: "Payment is still settling",
              detail: `${data.message} Your billing page will update by itself.`,
            });
            router.push("/dashboard/billing");
            router.refresh();
            return;
          }
          error("Payment not confirmed", data.message);
          setBusy(false);
          return;
        }

        success(
          data.alreadyActive
            ? `${planName} is already active`
            : `${planName} activated`,
          data.alreadyActive
            ? "We found this payment was already processed."
            : "Your invoice is on the billing page.",
        );
        afterPurchase();
      } catch {
        error(
          "Could not confirm the payment",
          "If money left your account, open the billing page — the gateway's own notification will finish it.",
        );
        setBusy(false);
      }
    },
    [afterPurchase, error, planName, router, success, toast],
  );

  async function start() {
    if (busy || !chosen) return;

    if (chosen.requiresPhone && phone.trim().length < 8) {
      error(
        "Contact number needed",
        `${chosen.label} will not open an order without a phone number.`,
      );
      return;
    }

    setBusy(true);

    let order: OrderResponse;
    try {
      const res = await fetch("/api/checkout/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          gateway: chosen.id,
          ...(chosen.requiresPhone ? { phone: phone.trim() } : {}),
        }),
      });
      const data = (await res.json()) as OrderResponse | Failure;

      if (!data.ok) {
        if (data.code === "UNAUTHENTICATED") {
          router.push(`/login?next=${encodeURIComponent("/pricing")}`);
          return;
        }
        error("Checkout could not start", data.message);
        setBusy(false);
        return;
      }
      order = data;
    } catch {
      error(
        "Could not reach the server",
        "Check your connection and try again. Nothing has been charged.",
      );
      setBusy(false);
      return;
    }

    const dismissed = () => {
      setBusy(false);
      void fetch("/api/checkout/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.orderId }),
      });
      toast({
        tone: "info",
        title: "Checkout closed",
        detail: "Nothing was charged. Your plan is unchanged.",
      });
    };

    switch (order.handoff.kind) {
      /* The local simulator. The payment row is stamped mock, so it can
         never be mistaken for a real collection. */
      case "mock": {
        toast({
          tone: "info",
          title: "Test mode",
          detail: "No gateway is configured, so this purchase is simulated.",
        });
        await confirm({ orderId: order.handoff.orderId });
        return;
      }

      case "razorpay_checkout": {
        const handoff = order.handoff;
        try {
          await loadScript(RAZORPAY_SCRIPT);
        } catch {
          error(
            "Razorpay did not load",
            "A network problem or a content blocker may be blocking checkout.razorpay.com.",
          );
          setBusy(false);
          return;
        }
        const Razorpay = window.Razorpay;
        if (!Razorpay) {
          error("Razorpay did not load", "Reload the page and try again.");
          setBusy(false);
          return;
        }

        new Razorpay({
          key: handoff.keyId,
          amount: order.amountPaise,
          currency: order.currency,
          order_id: handoff.orderId,
          name: "Verdict",
          description: `${order.planName} — monthly`,
          prefill: order.prefill,
          theme: { color: "#4f7dff" },
          handler: (response: RazorpaySuccess) => {
            void confirm({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
          },
          modal: { ondismiss: dismissed },
        }).open();
        return;
      }

      /* Cashfree takes over the tab and returns to /dashboard/billing/return,
         which is where the verification happens. */
      case "cashfree_session": {
        const handoff = order.handoff;
        try {
          await loadScript(CASHFREE_SCRIPT);
        } catch {
          error(
            "Cashfree did not load",
            "A network problem or a content blocker may be blocking sdk.cashfree.com.",
          );
          setBusy(false);
          return;
        }
        const factory = window.Cashfree;
        if (!factory) {
          error("Cashfree did not load", "Reload the page and try again.");
          setBusy(false);
          return;
        }
        try {
          await factory({
            mode: handoff.mode === "live" ? "production" : "sandbox",
          }).checkout({
            paymentSessionId: handoff.sessionId,
            redirectTarget: "_self",
          });
        } catch {
          error("Cashfree could not open", "Nothing has been charged.");
          setBusy(false);
        }
        return;
      }

      /* PayPal, and anything else hosted. */
      case "redirect": {
        window.location.assign(order.handoff.url);
        return;
      }
    }
  }

  /* ── nothing enabled ──────────────────────────────────────────── */

  if (options.length === 0 || !chosen) {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        <Button
          variant="primary"
          size="md"
          disabled
          className="bg-azure-500 text-white hover:bg-azure-400"
        >
          <Lock className="size-3.5 opacity-70" aria-hidden />
          Purchase Now
        </Button>

      </div>
    );
  }

  const needsChoice = options.length > 1 || chosen.requiresPhone;

  /* ── one method, nothing to ask ───────────────────────────────── */

  if (!needsChoice) {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        <Button
          variant={variant}
          size="md"
          onClick={() => void start()}
          disabled={busy}
          aria-busy={busy}
        >
          {busy ? (
            <>
              <Spinner />
              Opening {chosen.label}
            </>
          ) : (
            <>
              {label}
              {variant === "primary" ? (
                <ArrowRight className="size-4" aria-hidden />
              ) : (
                <Lock className="size-3.5 opacity-70" aria-hidden />
              )}
            </>
          )}
        </Button>
        <MethodNote option={chosen} />
      </div>
    );
  }

  /* ── pick a method ────────────────────────────────────────────── */

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {!open ? (
        <>
          <Button variant={variant} size="md" onClick={() => setOpen(true)}>
            {label}
            {variant === "primary" ? (
              <ArrowRight className="size-4" aria-hidden />
            ) : (
              <Lock className="size-3.5 opacity-70" aria-hidden />
            )}
          </Button>
          <p className="text-center text-[0.8125rem] text-cloud-600">
            {options.map((option) => option.label).join(" · ")}
          </p>
        </>
      ) : (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
          <p className="t-eyebrow text-[0.625rem] text-cloud-600">
            Pay with
          </p>

          <div
            role="radiogroup"
            aria-label="Payment method"
            className="mt-2 grid gap-1.5"
          >
            {options.map((option) => {
              const selected = option.id === chosen.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={busy}
                  onClick={() => setGatewayId(option.id)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-left transition-colors",
                    selected
                      ? "border-azure-400/40 bg-azure-400/[0.08]"
                      : "border-white/[0.07] hover:border-white/15 hover:bg-white/[0.03]",
                    busy && "opacity-60",
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-[0.875rem] text-cloud-50">
                      {option.label}
                    </span>
                    {option.simulated ? (
                      <span className="text-[0.6875rem] text-amber-400">
                        simulated
                      </span>
                    ) : option.environment === "sandbox" ? (
                      <span className="text-[0.6875rem] text-amber-400">
                        sandbox
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block text-[0.75rem] leading-snug text-cloud-600">
                    {option.methods.join(", ")}
                  </span>
                </button>
              );
            })}
          </div>

          {chosen.requiresPhone ? (
            <div className="mt-3">
              <Field
                label="Contact number"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                hint={`${chosen.label} requires a phone number on the order.`}
              />
            </div>
          ) : null}

          <div className="mt-3 flex flex-col gap-2">
            <Button
              variant={variant}
              size="md"
              onClick={() => void start()}
              disabled={busy}
              aria-busy={busy}
            >
              {busy ? (
                <>
                  <Spinner />
                  Opening {chosen.label}
                </>
              ) : (
                <>
                  Continue to {chosen.label}
                  <ArrowRight className="size-4" aria-hidden />
                </>
              )}
            </Button>
            {!busy ? (
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-[0.8125rem] text-cloud-600 transition-colors hover:text-cloud-200"
              >
                Cancel
              </button>
            ) : null}
          </div>

          <MethodNote option={chosen} />
        </div>
      )}
    </div>
  );
}

function MethodNote({ option }: { option: CheckoutOption }) {
  return (
    <p className="mt-2 flex items-start gap-1.5 text-[0.75rem] leading-snug text-cloud-600">
      <ShieldCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden />
      <span>
        {option.simulated
          ? "Simulated locally. No money moves and nothing is charged."
          : option.environment === "sandbox"
            ? `${option.label} is in sandbox mode: this is a test order, not a real payment.`
            : `${option.blurb} Your plan activates only after ${option.label} confirms the payment to our server.`}
      </span>
    </p>
  );
}
