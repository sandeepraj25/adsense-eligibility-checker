import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  ChevronRight,
  CreditCard,
  FileDown,
  Globe2,
  Hash,
  History,
  Receipt,
  RefreshCw,
  Settings,
  Tag,
  Wallet,
} from "lucide-react";

import {
  Badge,
  PaymentBadge,
  SubscriptionBadge,
} from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { requireUser } from "@/lib/auth/guard";
import {
  getActiveSubscription,
  getLatestSubscription,
  listInvoices,
  listPayments,
  listSubscriptions,
} from "@/lib/db/billing";
import { checkoutOptions, gatewayLabel } from "@/lib/payments";
import { formatDate, formatDateTime, plural } from "@/lib/format";
import { formatINR } from "@/lib/money";

export const metadata: Metadata = {
  title: "Billing — Verdict",
};

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const user = await requireUser("/dashboard/billing");

  const active = getActiveSubscription(user.id);
  const current = active ?? getLatestSubscription(user.id);
  const history = listSubscriptions(user.id);
  const payments = listPayments(user.id);

  const invoiceByPayment = new Map(
    listInvoices(user.id).map((invoice) => [
      invoice.paymentId,
      invoice,
    ]),
  );

  const options = checkoutOptions();

  const simulated =
    options.length > 0 &&
    options.every((option) => option.simulated);

  const sandbox = options.filter(
    (option) =>
      !option.simulated &&
      option.environment === "sandbox",
  );

  const methodNames = options.map(
    (option) => option.label,
  );

  const paid = payments.filter(
    (payment) => payment.status === "paid",
  );

  const totalPaid = paid.reduce(
    (sum, payment) =>
      sum + payment.amountPaise,
    0,
  );

  const scanPercentage =
    current && current.scanLimit > 0
      ? Math.min(
          (current.scansUsed /
            current.scanLimit) *
            100,
          100,
        )
      : 0;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 sm:space-y-10">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="t-eyebrow text-[0.75rem] tracking-[0.22em] text-violet-300">
            BILLING
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-cloud-50 sm:text-4xl lg:text-[2.75rem]">
            Plan and payments
          </h1>

          <p className="mt-3 max-w-xl text-[1rem] leading-relaxed text-cloud-400 sm:text-[1.0625rem]">
            Your monthly plan, every payment attempt,
            and the exact identifiers the payment
            gateway returned.
          </p>
        </div>

        <ButtonLink
          href="/pricing"
          size="md"
          variant="ghost"
          className="h-12 rounded-xl border-violet-400/30 bg-violet-500/[0.06] px-5 text-[0.9375rem] hover:border-violet-400/50 hover:bg-violet-500/[0.12]"
        >
          <CreditCard
            className="size-4"
            aria-hidden
          />
          {active?.isUsable
            ? "Change plan"
            : "See plans"}
        </ButtonLink>
      </section>

      {/* ── Payment environment notice ───────────────────────── */}
      {options.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl border border-amber-400/35 bg-gradient-to-r from-amber-500/[0.08] to-transparent px-5 py-4">
          <div className="absolute inset-y-0 left-0 w-1 bg-amber-400" />

          <div className="flex items-start gap-4">
            <div className="grid size-11 shrink-0 place-items-center rounded-xl border border-amber-400/30 bg-amber-400/10">
              <AlertTriangle
                className="size-5 text-amber-300"
                aria-hidden
              />
            </div>

            <div>
              <p className="text-[0.9375rem] font-semibold text-cloud-50">
                Online payment is unavailable.
              </p>

              <p className="mt-1 text-[0.9375rem] leading-relaxed text-cloud-300">
                No payment method is enabled at the
                moment, so a plan cannot be started or
                changed right now. Nothing has been
                charged. Your existing plan and reports
                are unaffected.
              </p>
            </div>
          </div>
        </div>
      ) : simulated ? (
        <div className="relative overflow-hidden rounded-2xl border border-amber-400/25 bg-gradient-to-r from-amber-400/[0.07] to-transparent px-5 py-4">
          <div className="flex items-start gap-4">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl border border-amber-400/25 bg-amber-400/10">
              <AlertTriangle
                className="size-4 text-amber-300"
                aria-hidden
              />
            </div>

            <p className="pt-0.5 text-[0.9375rem] leading-relaxed text-cloud-200">
              <span className="font-semibold text-cloud-50">
                Test mode.
              </span>{" "}
              Purchases are simulated locally and stored
              as test payments. No money moves and no
              gateway is contacted.
            </p>
          </div>
        </div>
      ) : sandbox.length > 0 ? (
        <div className="relative overflow-hidden rounded-2xl border border-amber-400/25 bg-gradient-to-r from-amber-400/[0.07] to-transparent px-5 py-4">
          <div className="flex items-start gap-4">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl border border-amber-400/25 bg-amber-400/10">
              <AlertTriangle
                className="size-4 text-amber-300"
                aria-hidden
              />
            </div>

            <p className="pt-0.5 text-[0.9375rem] leading-relaxed text-cloud-200">
              <span className="font-semibold text-cloud-50">
                Sandbox mode.
              </span>{" "}
              {sandbox
                .map((option) => option.label)
                .join(", ")}{" "}
              {sandbox.length === 1
                ? "is"
                : "are"}{" "}
              running against test credentials, so
              payments are not real charges.
            </p>
          </div>
        </div>
      ) : null}

      {/* ── Main billing layout ───────────────────────────────── */}
      <section className="grid gap-6 xl:grid-cols-[1.05fr_1fr]">
        {/* Current plan */}
        <div className="glass edge-light relative overflow-hidden rounded-3xl border-violet-400/35 bg-gradient-to-br from-violet-500/[0.08] via-transparent to-transparent p-5 shadow-[0_20px_70px_rgba(74,58,160,0.08)] sm:p-7">
          <div className="absolute -right-24 -top-24 size-64 rounded-full bg-violet-500/[0.08] blur-3xl" />

          <div className="relative">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="t-eyebrow text-[0.75rem] tracking-[0.18em] text-violet-300">
                  CURRENT PLAN
                </p>

                <h2 className="mt-3 text-3xl font-semibold text-cloud-50 sm:text-4xl">
                  {current?.planName ?? "No plan"}
                </h2>
              </div>

              {current ? (
                <SubscriptionBadge
                  status={current.status}
                />
              ) : null}
            </div>

            {current ? (
              <>
                <dl className="mt-7 divide-y divide-white/[0.07]">
                  <BillingRow
                    icon={
                      <Tag
                        className="size-[1.1rem]"
                        aria-hidden
                      />
                    }
                    label="Monthly price"
                  >
                    {current.amountPaise === 0
                      ? "₹0 / month"
                      : `${formatINR(
                          current.amountPaise,
                        )} / month`}
                  </BillingRow>

                  <BillingRow
                    icon={
                      <CalendarDays
                        className="size-[1.1rem]"
                        aria-hidden
                      />
                    }
                    label="Started"
                  >
                    {formatDate(
                      current.startsAt,
                    )}
                  </BillingRow>

                  <BillingRow
                    icon={
                      <RefreshCw
                        className="size-[1.1rem]"
                        aria-hidden
                      />
                    }
                    label={
                      current.isExpired
                        ? "Expired on"
                        : "Next renewal"
                    }
                  >
                    {formatDate(
                      current.expiresAt,
                    )}
                  </BillingRow>

                  <BillingRow
                    icon={
                      <CalendarDays
                        className="size-[1.1rem]"
                        aria-hidden
                      />
                    }
                    label="Billing month"
                  >
                    {current.cycleIndex} ·{" "}
                    {formatDate(
                      current.cycleStart,
                    )}{" "}
                    →{" "}
                    {formatDate(
                      current.cycleEnd,
                    )}
                  </BillingRow>

                  <div className="py-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3 text-cloud-400">
                        <Activity
                          className="size-[1.1rem] text-violet-300"
                          aria-hidden
                        />

                        <span className="text-[0.9375rem]">
                          Scans this month
                        </span>
                      </div>

                      <span className="text-right text-[0.9375rem] font-medium text-cloud-100">
                        {current.scansUsed} of{" "}
                        {current.scanLimit} used ·{" "}
                        {current.scansRemaining} left
                      </span>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.08]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-300 transition-all duration-500"
                        style={{
                          width: `${Math.max(
                            scanPercentage,
                            current.scansUsed > 0
                              ? 3
                              : 0,
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <BillingRow
                    icon={
                      <RefreshCw
                        className="size-[1.1rem]"
                        aria-hidden
                      />
                    }
                    label="Allowance resets"
                  >
                    {formatDate(
                      current.cycleEnd,
                    )}
                  </BillingRow>

                  <BillingRow
                    icon={
                      <Globe2
                        className="size-[1.1rem]"
                        aria-hidden
                      />
                    }
                    label="Websites allowed"
                  >
                    {current.siteLimit === null
                      ? "Unlimited"
                      : current.siteLimit}
                  </BillingRow>

                  <BillingRow
                    icon={
                      <CreditCard
                        className="size-[1.1rem]"
                        aria-hidden
                      />
                    }
                    label="Paid with"
                  >
                    {current.gateway
                      ? gatewayLabel(
                          current.gateway,
                        )
                      : "—"}
                  </BillingRow>

                  <BillingRow
                    icon={
                      <Hash
                        className="size-[1.1rem]"
                        aria-hidden
                      />
                    }
                    label="Order ID"
                    mono
                  >
                    {current.orderId ?? "—"}
                  </BillingRow>

                  <BillingRow
                    icon={
                      <Hash
                        className="size-[1.1rem]"
                        aria-hidden
                      />
                    }
                    label="Payment ID"
                    mono
                  >
                    {current.paymentId ?? "—"}
                  </BillingRow>

                  <BillingRow
                    icon={
                      <Hash
                        className="size-[1.1rem]"
                        aria-hidden
                      />
                    }
                    label="Invoice ID"
                    mono
                  >
                    {current.invoiceId ?? "—"}
                  </BillingRow>
                </dl>

                {current.isCapped &&
                !current.isExpired ? (
                  <div className="mt-5 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3 text-[0.875rem] leading-relaxed text-amber-300">
                    Monthly scan limit reached. Upgrade
                    your plan or wait until your next
                    billing cycle — the allowance resets
                    on{" "}
                    {formatDate(
                      current.cycleEnd,
                    )}
                    .
                  </div>
                ) : null}
              </>
            ) : (
              <p className="mt-6 max-w-xl text-[0.9375rem] leading-relaxed text-cloud-300">
                You are not on a plan yet. The free tier
                gives you a small allowance of scans
                every month; paid plans raise that
                allowance and unlock deeper checks.
              </p>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {/* Paid so far */}
          <div className="glass relative overflow-hidden rounded-3xl p-5 sm:p-7">
            <div className="absolute right-7 top-7 grid size-16 place-items-center rounded-2xl border border-violet-400/25 bg-violet-500/[0.08] shadow-[0_0_30px_rgba(124,92,255,0.12)]">
              <Wallet
                className="size-7 text-violet-300"
                aria-hidden
              />
            </div>

            <p className="t-eyebrow text-[0.75rem] tracking-[0.18em] text-violet-300">
              PAID SO FAR
            </p>

            <p className="mt-4 text-4xl font-semibold tracking-tight text-cloud-50 sm:text-5xl">
              {formatINR(totalPaid)}
            </p>

            <p className="mt-5 max-w-xl pr-16 text-[0.9375rem] leading-7 text-cloud-400">
              Across{" "}
              {plural(
                paid.length,
                "successful payment",
              )}
              . Plans are billed per month
              {active && !active.isExpired
                ? `, and this one renews on ${formatDate(
                    active.expiresAt,
                  )}`
                : ""}
              . Changing plan applies from the next
              payment; the month you have already paid
              for is never shortened.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink
                href="/pricing"
                size="md"
                className="h-12 rounded-xl bg-gradient-to-r from-violet-500 to-violet-700 px-5 shadow-lg shadow-violet-950/30 hover:brightness-110"
              >
                {active?.isUsable
                  ? "Change plan"
                  : "See plans"}

                <ChevronRight
                  className="size-4"
                  aria-hidden
                />
              </ButtonLink>

              <ButtonLink
                href="/dashboard/settings"
                variant="quiet"
                size="md"
                className="h-12 rounded-xl border border-white/[0.09] px-5 hover:border-violet-400/25 hover:bg-violet-500/[0.05]"
              >
                <Settings
                  className="size-4"
                  aria-hidden
                />
                Account settings
              </ButtonLink>
            </div>
          </div>

          {/* Plan history */}
          {history.length > 1 ? (
            <div className="glass relative overflow-hidden rounded-3xl p-5 sm:p-7">
              <div className="absolute right-7 top-7 grid size-12 place-items-center rounded-2xl border border-violet-400/20 bg-violet-500/[0.05]">
                <History
                  className="size-5 text-violet-300"
                  aria-hidden
                />
              </div>

              <p className="t-eyebrow text-[0.75rem] tracking-[0.18em] text-violet-300">
                PLAN HISTORY
              </p>

              <ul className="mt-6 divide-y divide-white/[0.07]">
                {history.map(
                  (subscription) => (
                    <li
                      key={subscription.id}
                      className="flex flex-col gap-4 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="text-[1.05rem] font-medium text-cloud-50">
                          {subscription.planName}
                        </p>

                        <p className="mt-1 text-[0.875rem] text-violet-300">
                          {formatDate(
                            subscription.startsAt,
                          )}{" "}
                          →{" "}
                          {formatDate(
                            subscription.expiresAt,
                          )}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-4">
                        <span
                          className="text-[0.9375rem] font-medium text-cloud-200"
                          title="Scans used in this subscription's current billing month"
                        >
                          {subscription.scansUsed}/
                          {
                            subscription.scanLimit
                          }
                        </span>

                        <SubscriptionBadge
                          status={
                            subscription.status
                          }
                        />
                      </div>
                    </li>
                  ),
                )}
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      {/* ── Payment history ───────────────────────────────────── */}
      <section>
        <div className="mb-5 flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl border border-violet-400/20 bg-violet-500/[0.06]">
            <Receipt
              className="size-4 text-violet-300"
              aria-hidden
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-cloud-50">
              Payment history
            </h2>

            <p className="text-[0.875rem] text-cloud-500">
              Every payment attempt and invoice in one
              place.
            </p>
          </div>
        </div>

        {payments.length === 0 ? (
          <EmptyState
            icon={
              <Receipt
                className="size-5"
                aria-hidden
              />
            }
            title="No payments yet"
            body="Once you start a paid plan, every attempt appears here with the gateway it went through, its order and payment identifiers, and a downloadable invoice for successful payments."
            action={{
              label: "See plans",
              href: "/pricing",
            }}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {payments.map((payment) => {
              const invoice =
                invoiceByPayment.get(
                  payment.id,
                );

              return (
                <div
                  key={payment.id}
                  className="glass group flex flex-col gap-4 rounded-2xl p-5 transition-all duration-300 hover:border-violet-400/20 hover:bg-violet-500/[0.025] sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <p className="text-[1.05rem] font-semibold text-cloud-50">
                        {formatINR(
                          payment.amountPaise,
                        )}
                      </p>

                      <PaymentBadge
                        status={
                          payment.status
                        }
                      />

                      <Badge tone="neutral">
                        {gatewayLabel(
                          payment.gateway,
                        )}
                      </Badge>

                      {payment.mode ===
                      "mock" ? (
                        <Badge tone="brand">
                          Test payment
                        </Badge>
                      ) : payment.environment ===
                        "sandbox" ? (
                        <Badge tone="warn">
                          Sandbox
                        </Badge>
                      ) : null}
                    </div>

                    <p className="mt-2 text-[0.875rem] text-cloud-400">
                      {formatDateTime(
                        payment.createdAt,
                      )}
                      {payment.method
                        ? ` · ${payment.method}`
                        : ""}
                      {payment.failureReason
                        ? ` · ${payment.failureReason}`
                        : ""}
                    </p>

                    <p className="t-data mt-2 text-[0.75rem] leading-relaxed break-all text-cloud-600">
                      Order {payment.orderId}
                      {payment.paymentId
                        ? ` · Payment ${payment.paymentId}`
                        : ""}
                      {invoice
                        ? ` · Invoice ${invoice.number}`
                        : ""}
                    </p>
                  </div>

                  {invoice ? (
                    <Link
                      href={`/dashboard/billing/invoices/${invoice.id}`}
                      className="inline-flex h-11 shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-violet-400/20 bg-violet-500/[0.06] px-4 text-[0.875rem] font-medium text-cloud-50 transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-400/40 hover:bg-violet-500/[0.12] sm:self-auto"
                    >
                      <FileDown
                        className="size-4"
                        aria-hidden
                      />
                      Invoice
                    </Link>
                  ) : (
                    <span className="self-start text-[0.8125rem] text-cloud-600 sm:self-auto">
                      {payment.status === "paid"
                        ? "—"
                        : "No invoice"}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Security note ─────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] px-5 py-4">
        <p className="text-[0.8125rem] leading-relaxed text-cloud-500">
          Card, UPI and account details are handled
          entirely by{" "}
          {methodNames.length > 0
            ? methodNames.join(", ")
            : "the payment gateway"}{" "}
          and never reach this application — only the
          order, payment and invoice identifiers above
          are stored. Every payment is confirmed
          server-side before a plan is activated.
        </p>
      </div>
    </div>
  );
}

/* ── Billing row ─────────────────────────────────────────────── */

function BillingRow({
  icon,
  label,
  children,
  mono = false,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
      <div className="flex items-center gap-3 text-cloud-400">
        <span className="text-violet-300">
          {icon}
        </span>

        <dt className="text-[0.9375rem]">
          {label}
        </dt>
      </div>

      <dd
        className={
          mono
            ? "t-data text-right text-[0.875rem] text-cloud-200"
            : "text-right text-[0.9375rem] font-medium text-cloud-100"
        }
      >
        {children}
      </dd>
    </div>
  );
}