import {
  CircleCheck,
  Info,
  ShieldCheck,
} from "lucide-react";

import {
  GatewayForm,
  type GatewayFormState,
} from "@/components/admin/GatewayForm";
import { NoRows, Panel } from "@/components/admin/Panels";
import { PageHeading } from "@/components/dashboard/PageHeading";
import { listAdminLogs } from "@/lib/db/admin";
import { APP_URL } from "@/lib/env";
import { formatDateTime } from "@/lib/format";
import { GATEWAYS, gatewayViews } from "@/lib/payments";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Payment gateways — Verdict admin",
};

/**
 * Gateway credentials and the checkout switchboard.
 *
 * The page is assembled server-side from `gatewayViews()`, which is the
 * only reader of the credential store that is allowed to cross into a
 * component: it returns the last four characters of each secret and nothing
 * else. The plaintext never enters a props object, so it cannot end up in
 * the serialised payload the browser receives.
 */
export default async function AdminGatewaysPage() {
  const views = gatewayViews();

  const history = listAdminLogs({
    targetType: "gateway",
    limit: 20,
  });

  const gateways: GatewayFormState[] = views.map((view) => {
    const adapter = GATEWAYS[view.id];

    return {
      id: view.id,
      label: adapter.label,
      blurb: adapter.blurb,
      methods: adapter.methods,
      enabled: view.enabled,
      configured: view.configured,
      environment: view.environment,
      source: view.source,
      masked: view.masked,

      missing: adapter.fields
        .filter((field) => !view.masked[field.key])
        .map((field) => field.label),

      updatedAt: view.updatedAt,
      updatedBy: view.updatedBy,

      webhookUrl: `${APP_URL}/api/webhooks/${view.id}`,

      fields: adapter.fields.map((field) => ({
        key: field.key,
        label: field.label,
        hint: field.hint,
        secret: field.secret,
        optional: field.optional === true,
      })),
    };
  });

  const live = gateways.filter(
    (gateway) => gateway.enabled,
  );

  const sandboxEnabled = live.some(
    (gateway) => gateway.environment === "sandbox",
  );

  return (
    <div className="space-y-8">
      {/* PAGE HEADER */}
      <PageHeading
        eyebrow="Administration"
        title="Payment gateways"
        lede="Credentials are encrypted before they are stored and are never sent back to a browser. Only the last four characters of each secret appear on this page."
      />

      {/* CHECKOUT STATUS */}
      <section className="relative overflow-hidden rounded-[26px] border border-violet-500/25 bg-gradient-to-br from-[#11182a] via-[#0d1322] to-[#151027] p-1 shadow-[0_0_50px_rgba(124,58,237,0.08)]">
        <div className="relative overflow-hidden rounded-[22px] border border-white/[0.04] bg-[#0b1020]/80 p-5 backdrop-blur-xl sm:p-7">
          {/* Background glow */}
          <div className="pointer-events-none absolute right-[-80px] top-[-100px] h-[300px] w-[300px] rounded-full bg-violet-600/10 blur-[100px]" />

          {/* HEADER */}
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              {/* STATUS ICON */}
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-violet-400/30 bg-violet-500/15 text-violet-300 shadow-[0_0_30px_rgba(124,58,237,0.18)]">
                <ShieldCheck
                  className="h-7 w-7"
                  strokeWidth={1.8}
                />
              </div>

              <div>
                <h2 className="mb-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  Checkout status
                </h2>

                <p className="max-w-3xl text-base leading-relaxed text-cloud-300 sm:text-[17px]">
                  {live.length === 0
                    ? "No gateway is enabled. Checkout is currently closed until at least one payment gateway is configured and enabled."
                    : "Customers can choose from the enabled payment gateways at checkout."}
                </p>
              </div>
            </div>

            {/* STATUS BADGE */}
            <div
              className={`inline-flex shrink-0 items-center gap-2 self-start rounded-full border px-4 py-2 text-sm font-medium sm:self-auto ${
                live.length === 0
                  ? "border-violet-400/20 bg-violet-500/10 text-violet-300"
                  : "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  live.length === 0
                    ? "bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.9)]"
                    : "bg-emerald-400 shadow-[0_0_10px_rgba(74,222,128,0.9)]"
                }`}
              />

              {live.length === 0
                ? "Checkout closed"
                : "Checkout active"}
            </div>
          </div>

          {/* DIVIDER */}
          <div className="relative my-7 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

          {/* PAYMENT GATEWAY CARDS */}
          <div className="relative grid gap-4 md:grid-cols-3">
            {gateways.map((gateway) => {
              const isLive =
                gateway.enabled &&
                gateway.environment === "live";

              const isSandbox =
                gateway.enabled &&
                gateway.environment === "sandbox";

              const logoSrc =
                gateway.id === "razorpay"
                  ? "/razorpay.png"
                  : gateway.id === "cashfree"
                    ? "/cashfree.png"
                    : gateway.id === "paypal"
                      ? "/paypal.png"
                      : "";

              return (
                <div
                  key={gateway.id}
                  className={`group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 ${
                    gateway.enabled
                      ? "border-violet-400/30 bg-violet-500/[0.06] shadow-[0_0_25px_rgba(124,58,237,0.06)]"
                      : "border-white/[0.08] bg-white/[0.025]"
                  }`}
                >
                  {/* Hover glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.035] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  <div className="relative flex items-center gap-4">
                    {/* ACTUAL GATEWAY LOGO */}
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden bg-transparent">
                      {logoSrc ? (
                        <img
                          src={logoSrc}
                          alt={`${gateway.label} logo`}
                          className="h-full w-full object-contain"
                        />
                      ) : null}
                    </div>

                    {/* GATEWAY INFORMATION */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-lg font-semibold text-white">
                        {gateway.label}
                      </p>

                      <div className="mt-2 flex items-center gap-2">
                        {isLive ? (
                          <>
                            <CircleCheck className="h-4 w-4 text-emerald-400" />

                            <span className="text-sm font-medium text-emerald-300">
                              Live
                            </span>
                          </>
                        ) : isSandbox ? (
                          <>
                            <Info className="h-4 w-4 text-amber-400" />

                            <span className="text-sm font-medium text-amber-300">
                              Sandbox
                            </span>
                          </>
                        ) : (
                          <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-sm text-cloud-300">
                            {gateway.configured
                              ? "Disabled"
                              : "Not configured"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* SANDBOX NOTICE */}
          {sandboxEnabled ? (
            <div className="relative mt-5 flex items-start gap-3 rounded-xl border border-amber-400/15 bg-amber-400/[0.05] p-4">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />

              <p className="text-base leading-relaxed text-amber-100/90">
                A sandbox gateway is currently enabled. Orders placed through
                it are test orders. Subscriptions can still activate, but
                payments are marked as sandbox and excluded from revenue.
              </p>
            </div>
          ) : null}
        </div>
      </section>

      {/* PAYMENT GATEWAY FORMS */}
      {gateways.map((gateway) => (
        <GatewayForm
          key={gateway.id}
          gateway={gateway}
        />
      ))}

      {/* PAYMENT FLOW */}
      <Panel
        title="How a payment becomes a subscription"
        description="Stated because the sequence is the reason the credentials above matter."
      >
        <ol className="grid gap-4 text-base leading-relaxed text-cloud-300">
          <li className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-sm font-semibold text-violet-300">
              1
            </span>

            <span>
              The server creates the order with the gateway, using the plan
              price read from the database — never an amount sent by the
              browser.
            </span>
          </li>

          <li className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-sm font-semibold text-violet-300">
              2
            </span>

            <span>
              The customer pays at the gateway, then returns to us.
            </span>
          </li>

          <li className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-sm font-semibold text-violet-300">
              3
            </span>

            <span>
              The server verifies what came back — Razorpay&apos;s HMAC
              signature, or a fresh capture/status call to Cashfree and
              PayPal. A browser saying &ldquo;paid&rdquo; is never sufficient.
            </span>
          </li>

          <li className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-sm font-semibold text-violet-300">
              4
            </span>

            <span>
              The webhook arrives independently, is verified against the
              webhook secret, and activates the subscription if step three did
              not. Duplicate deliveries of the same event are recognised and
              ignored.
            </span>
          </li>

          <li className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-sm font-semibold text-violet-300">
              5
            </span>

            <span>
              Only then is the subscription active, with the price, limits and
              features snapshotted at purchase.
            </span>
          </li>
        </ol>
      </Panel>

      {/* GATEWAY HISTORY */}
      <Panel
        title="Gateway change history"
        description="Which credentials changed and who changed them. The values themselves are never written to the log."
      >
        {history.length === 0 ? (
          <NoRows>
            No gateway has been changed from this panel.
          </NoRows>
        ) : (
          <ul className="divide-y divide-white/[0.05]">
            {history.map((entry) => (
              <li
                key={entry.id}
                className="py-4 first:pt-0 last:pb-0"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="flex items-center gap-2 text-base">
                    <span className="t-data font-medium text-white">
                      {entry.action}
                    </span>

                    <span className="text-cloud-400">
                      {entry.targetLabel}
                    </span>
                  </p>

                  <p className="t-data text-sm text-cloud-500">
                    {formatDateTime(entry.createdAt)}
                  </p>
                </div>

                <p className="mt-2 text-sm leading-relaxed text-cloud-300">
                  {entry.detail ?? "—"}
                </p>

                <p className="mt-1 text-sm text-cloud-500">
                  by {entry.adminEmail}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}