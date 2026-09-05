import Link from "next/link";
import {
  Activity,
  BadgeIndianRupee,
  CheckCircle2,
  Clock3,
  CreditCard,
  RefreshCw,
  ShieldCheck,
  WalletCards,
  XCircle,
} from "lucide-react";

import {
  FilterTabs,
  NoRows,
  Panel,
  Td,
  TableShell,
  Th,
  Tr,
} from "@/components/admin/Panels";
import { PageHeading } from "@/components/dashboard/PageHeading";
import { Badge, SubscriptionBadge } from "@/components/ui/Badge";
import {
  adminStats,
  listAllPayments,
  listAllSubscriptions,
} from "@/lib/db/admin";
import {
  GATEWAY_IDS,
  type SubscriptionPaymentStatus,
} from "@/lib/db/types";
import { formatDate, formatDateTime } from "@/lib/format";
import { formatINR } from "@/lib/money";
import { gatewayLabel } from "@/lib/payments";
import { isPlanId, type PlanId } from "@/lib/plans";

export const dynamic = "force-dynamic";

export const metadata = { title: "Subscriptions — Verdict admin" };

const ROWS = 100;

export default async function AdminSubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const statusParam = single(params.status);
  const status =
    statusParam === "active" ||
    statusParam === "expired" ||
    statusParam === "cancelled"
      ? statusParam
      : undefined;

  const planParam = single(params.plan);
  const plan: PlanId | undefined = isPlanId(planParam)
    ? planParam
    : undefined;

  const gatewayParam = single(params.gateway);
  const gateway = (GATEWAY_IDS as readonly string[]).includes(gatewayParam)
    ? gatewayParam
    : undefined;

  const payParam = single(params.payment);
  const paymentStatus =
    payParam === "paid" ||
    payParam === "failed" ||
    payParam === "created" ||
    payParam === "cancelled"
      ? payParam
      : undefined;

  const subscriptions = listAllSubscriptions({
    ...(status ? { status } : {}),
    ...(plan ? { planId: plan } : {}),
    limit: ROWS,
  });

  const payments = listAllPayments({
    ...(paymentStatus ? { status: paymentStatus } : {}),
    ...(gateway ? { gateway } : {}),
    limit: ROWS,
  });

  const stats = adminStats();

  const subHref = (patch: Record<string, string | undefined>) =>
    build({
      status: status ?? "",
      plan: plan ?? "",
      gateway: gateway ?? "",
      payment: paymentStatus ?? "",
      ...patch,
    });

  const payHref = subHref;

  return (
    <div className="space-y-8">
      {/* PAGE HEADER */}
      <PageHeading
        eyebrow="Administration"
        title="Subscriptions & payments"
        lede="Monitor active subscriptions, payment activity and verified revenue from one central dashboard."
      />

      {/* STATS */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* ACTIVE */}
        <div className="group relative overflow-hidden rounded-[22px] border border-emerald-400/15 bg-gradient-to-br from-emerald-400/[0.10] via-[#101724] to-[#0c111c] p-5 shadow-[0_12px_40px_rgba(16,185,129,0.04)]">
          <div className="absolute right-[-40px] top-[-40px] h-32 w-32 rounded-full bg-emerald-400/[0.08] blur-3xl" />

          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-cloud-400">
                Active subscriptions
              </p>

              <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
                {stats.subscriptions.active}
              </p>

              <p className="mt-2 text-xs text-cloud-500">
                Currently active accounts
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.10] text-emerald-300">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* EXPIRED */}
        <div className="group relative overflow-hidden rounded-[22px] border border-amber-400/15 bg-gradient-to-br from-amber-400/[0.08] via-[#101724] to-[#0c111c] p-5 shadow-[0_12px_40px_rgba(245,158,11,0.03)]">
          <div className="absolute right-[-40px] top-[-40px] h-32 w-32 rounded-full bg-amber-400/[0.07] blur-3xl" />

          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-cloud-400">
                Expired subscriptions
              </p>

              <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
                {stats.subscriptions.expired}
              </p>

              <p className="mt-2 text-xs text-cloud-500">
                Plans that need renewal
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/[0.10] text-amber-300">
              <Clock3 className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* CANCELLED */}
        <div className="group relative overflow-hidden rounded-[22px] border border-rose-400/15 bg-gradient-to-br from-rose-400/[0.08] via-[#101724] to-[#0c111c] p-5 shadow-[0_12px_40px_rgba(244,63,94,0.03)]">
          <div className="absolute right-[-40px] top-[-40px] h-32 w-32 rounded-full bg-rose-400/[0.07] blur-3xl" />

          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-cloud-400">
                Cancelled subscriptions
              </p>

              <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
                {stats.subscriptions.cancelled}
              </p>

              <p className="mt-2 text-xs text-cloud-500">
                Cancelled plan access
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-400/20 bg-rose-400/[0.10] text-rose-300">
              <XCircle className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* REVENUE */}
        <div className="group relative overflow-hidden rounded-[22px] border border-violet-400/20 bg-gradient-to-br from-violet-500/[0.10] via-[#111526] to-[#0c111c] p-5 shadow-[0_12px_40px_rgba(124,58,237,0.05)]">
          <div className="absolute right-[-40px] top-[-40px] h-32 w-32 rounded-full bg-violet-500/[0.10] blur-3xl" />

          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-cloud-400">
                Verified revenue
              </p>

              <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
                {formatINR(stats.revenuePaise)}
              </p>

              <p className="mt-2 text-xs text-cloud-500">
                {stats.payments.paid} paid ·{" "}
                {stats.payments.failed} failed
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/[0.10] text-violet-300">
              <BadgeIndianRupee className="h-6 w-6" />
            </div>
          </div>
        </div>
      </section>

      {/* SUBSCRIPTIONS */}
      <section className="relative overflow-hidden rounded-[26px] border border-white/[0.08] bg-[#0d131f] shadow-[0_18px_70px_rgba(0,0,0,0.18)]">
        <div className="pointer-events-none absolute left-[-100px] top-[-100px] h-[280px] w-[280px] rounded-full bg-violet-500/[0.05] blur-[100px]" />

        {/* HEADER */}
        <div className="relative border-b border-white/[0.06] px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/[0.10] text-violet-300">
                <RefreshCw className="h-5 w-5" />
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                    Subscriptions
                  </h2>

                  <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-cloud-400">
                    {subscriptions.length} shown
                  </span>
                </div>

                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-cloud-400 sm:text-[15px]">
                  Manage customer plans, billing cycles and monthly scan usage.
                  Allowances reset automatically on the date shown below.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-3 py-2 text-xs text-emerald-300">
              <Activity className="h-3.5 w-3.5" />
              Live subscription monitoring
            </div>
          </div>
        </div>

        {/* FILTERS */}
        <div className="relative space-y-4 border-b border-white/[0.06] bg-white/[0.015] px-5 py-5 sm:px-7">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-cloud-600">
              Subscription status
            </p>

            <FilterTabs
              current={status ?? "all"}
              options={[
                {
                  label: "All",
                  value: "all",
                  href: subHref({ status: undefined }),
                },
                {
                  label: "Active",
                  value: "active",
                  href: subHref({ status: "active" }),
                  count: stats.subscriptions.active,
                },
                {
                  label: "Expired",
                  value: "expired",
                  href: subHref({ status: "expired" }),
                  count: stats.subscriptions.expired,
                },
                {
                  label: "Cancelled",
                  value: "cancelled",
                  href: subHref({ status: "cancelled" }),
                  count: stats.subscriptions.cancelled,
                },
              ]}
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-cloud-600">
              Plan
            </p>

            <FilterTabs
              current={plan ?? "any"}
              options={[
                {
                  label: "Any plan",
                  value: "any",
                  href: subHref({ plan: undefined }),
                },
                {
                  label: "Free",
                  value: "free",
                  href: subHref({ plan: "free" }),
                  count: stats.plans.free,
                },
                {
                  label: "Basic",
                  value: "basic",
                  href: subHref({ plan: "basic" }),
                  count: stats.plans.basic,
                },
                {
                  label: "Pro",
                  value: "pro",
                  href: subHref({ plan: "pro" }),
                  count: stats.plans.pro,
                },
              ]}
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="relative p-3 sm:p-5">
          {subscriptions.length === 0 ? (
            <NoRows>No subscription matches those filters.</NoRows>
          ) : (
            <TableShell
              head={
                <>
                  <Th>Account</Th>
                  <Th>Plan</Th>
                  <Th>Paid</Th>
                  <Th>Status</Th>
                  <Th>Payment</Th>
                  <Th>Gateway</Th>
                  <Th>Started</Th>
                  <Th>Renews / ends</Th>
                  <Th>Scans</Th>
                </>
              }
            >
              {subscriptions.map((row) => (
                <Tr key={row.id}>
                  <Td>
                    <Link
                      href={`/admin/users/${row.userId}`}
                      className="block min-w-[11rem] transition-opacity hover:opacity-80"
                    >
                      <span className="block text-sm font-medium text-white">
                        {row.userName}
                      </span>

                      <span className="mt-1 block truncate text-xs text-cloud-500">
                        {row.userEmail}
                      </span>
                    </Link>
                  </Td>

                  <Td>
                    <span className="font-medium text-cloud-100">
                      {row.planName}
                    </span>
                  </Td>

                  <Td mono>
                    <span className="font-medium text-cloud-100">
                      {row.amountPaise === 0
                        ? "Free"
                        : formatINR(row.amountPaise)}
                    </span>
                  </Td>

                  <Td>
                    <span className="flex items-center gap-1.5">
                      <SubscriptionBadge status={row.status} />

                      {row.status === "active" && row.isExpired ? (
                        <Badge tone="warn">Lapsed</Badge>
                      ) : null}

                      {row.isCapped ? (
                        <Badge tone="warn">Capped</Badge>
                      ) : null}
                    </span>
                  </Td>

                  <Td>
                    <SubPaymentBadge status={row.paymentStatus} />
                  </Td>

                  <Td>
                    <span className="text-sm text-cloud-200">
                      {row.gateway
                        ? gatewayLabel(row.gateway)
                        : "—"}
                    </span>
                  </Td>

                  <Td mono>
                    <span className="text-sm text-cloud-200">
                      {formatDate(row.startsAt)}
                    </span>
                  </Td>

                  <Td mono>
                    <span className="text-sm text-cloud-200">
                      {formatDate(row.expiresAt)}
                    </span>

                    <span className="mt-1 block max-w-[12rem] text-[11px] leading-relaxed text-cloud-600">
                      {row.isExpired
                        ? "Billing period passed"
                        : `Cycle #${row.cycleIndex} · resets ${formatDate(
                            row.cycleEnd,
                          )}`}
                    </span>
                  </Td>

                  <Td mono>
                    <span
                      className={`font-medium ${
                        row.isCapped
                          ? "text-amber-300"
                          : "text-cloud-200"
                      }`}
                    >
                      {row.scansUsed} / {row.scanLimit}
                    </span>
                  </Td>
                </Tr>
              ))}
            </TableShell>
          )}
        </div>
      </section>

      {/* PAYMENTS */}
      <section className="relative overflow-hidden rounded-[26px] border border-white/[0.08] bg-[#0d131f] shadow-[0_18px_70px_rgba(0,0,0,0.18)]">
        <div className="pointer-events-none absolute right-[-100px] top-[-100px] h-[280px] w-[280px] rounded-full bg-blue-500/[0.05] blur-[100px]" />

        {/* HEADER */}
        <div className="relative border-b border-white/[0.06] px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/[0.10] text-blue-300">
                <WalletCards className="h-5 w-5" />
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                    Payments
                  </h2>

                  <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-cloud-400">
                    {payments.length} shown
                  </span>
                </div>

                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-cloud-400 sm:text-[15px]">
                  Review every payment attempt, including successful, failed,
                  pending, sandbox and mock transactions.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start rounded-full border border-blue-400/15 bg-blue-400/[0.06] px-3 py-2 text-xs text-blue-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              Gateway verified
            </div>
          </div>
        </div>

        {/* FILTERS */}
        <div className="relative space-y-4 border-b border-white/[0.06] bg-white/[0.015] px-5 py-5 sm:px-7">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-cloud-600">
              Payment status
            </p>

            <FilterTabs
              current={paymentStatus ?? "all"}
              options={[
                {
                  label: "All",
                  value: "all",
                  href: payHref({ payment: undefined }),
                },
                {
                  label: "Paid",
                  value: "paid",
                  href: payHref({ payment: "paid" }),
                  count: stats.payments.paid,
                },
                {
                  label: "Awaiting",
                  value: "created",
                  href: payHref({ payment: "created" }),
                },
                {
                  label: "Failed",
                  value: "failed",
                  href: payHref({ payment: "failed" }),
                },
                {
                  label: "Cancelled",
                  value: "cancelled",
                  href: payHref({ payment: "cancelled" }),
                },
              ]}
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-cloud-600">
              Payment gateway
            </p>

            <FilterTabs
              current={gateway ?? "any"}
              options={[
                {
                  label: "Any gateway",
                  value: "any",
                  href: payHref({ gateway: undefined }),
                },
                ...GATEWAY_IDS.map((id) => ({
                  label: gatewayLabel(id),
                  value: id,
                  href: payHref({ gateway: id }),
                })),
              ]}
            />
          </div>
        </div>

        {/* PAYMENT TABLE */}
        <div className="relative p-3 sm:p-5">
          {payments.length === 0 ? (
            <NoRows>No payment matches those filters.</NoRows>
          ) : (
            <TableShell
              head={
                <>
                  <Th>When</Th>
                  <Th>Account</Th>
                  <Th>Plan</Th>
                  <Th>Amount</Th>
                  <Th>Status</Th>
                  <Th>Gateway</Th>
                  <Th>Order</Th>
                  <Th>Verified</Th>
                  <Th>Reason</Th>
                </>
              }
            >
              {payments.map((payment) => (
                <Tr key={payment.id}>
                  <Td mono>
                    <span className="text-xs text-cloud-300">
                      {formatDateTime(payment.createdAt)}
                    </span>
                  </Td>

                  <Td>
                    <span className="block min-w-[11rem] text-sm font-medium text-white">
                      {payment.userName}
                    </span>

                    <span className="mt-1 block truncate text-xs text-cloud-500">
                      {payment.userEmail}
                    </span>
                  </Td>

                  <Td>
                    <span className="font-medium text-cloud-100">
                      {payment.planId}
                    </span>
                  </Td>

                  <Td mono>
                    <span className="font-medium text-cloud-100">
                      {formatINR(payment.amountPaise)}
                    </span>
                  </Td>

                  <Td>
                    <PayBadge status={payment.status} />
                  </Td>

                  <Td>
                    <span className="flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5 text-cloud-500" />

                      <span className="text-sm text-cloud-200">
                        {gatewayLabel(payment.gateway)}
                      </span>

                      {payment.mode === "mock" ? (
                        <Badge tone="warn">Mock</Badge>
                      ) : payment.environment === "sandbox" ? (
                        <Badge tone="warn">Sandbox</Badge>
                      ) : null}
                    </span>
                  </Td>

                  <Td
                    mono
                    className="max-w-[12rem] truncate text-xs text-cloud-400"
                  >
                    {payment.orderId}
                  </Td>

                  <Td mono>
                    <span className="text-xs text-cloud-400">
                      {payment.verifiedAt
                        ? formatDateTime(payment.verifiedAt)
                        : "—"}
                    </span>
                  </Td>

                  <Td className="max-w-[14rem] truncate text-xs text-cloud-500">
                    {payment.failureReason ?? "—"}
                  </Td>
                </Tr>
              ))}
            </TableShell>
          )}

          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-violet-400/10 bg-violet-500/[0.035] p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-violet-300" />

            <p className="text-sm leading-relaxed text-cloud-400">
              A subscription is activated only after the payment is verified by
              the payment gateway. Browser-reported success alone never grants
              plan access.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function SubPaymentBadge({
  status,
}: {
  status: SubscriptionPaymentStatus;
}) {
  if (status === "paid") {
    return <Badge tone="pass">Paid</Badge>;
  }

  if (status === "free") {
    return <Badge tone="neutral">Free</Badge>;
  }

  if (status === "pending") {
    return <Badge tone="warn">Pending</Badge>;
  }

  return <Badge tone="fail">Failed</Badge>;
}

function PayBadge({ status }: { status: string }) {
  if (status === "paid") {
    return <Badge tone="pass">Paid</Badge>;
  }

  if (status === "created") {
    return <Badge tone="warn">Awaiting</Badge>;
  }

  if (status === "failed") {
    return <Badge tone="fail">Failed</Badge>;
  }

  if (status === "cancelled") {
    return <Badge tone="neutral">Cancelled</Badge>;
  }

  return <Badge tone="neutral">{status}</Badge>;
}

function build(values: Record<string, string | undefined>): string {
  const next = new URLSearchParams();

  for (const [key, value] of Object.entries(values)) {
    if (value) {
      next.set(key, value);
    }
  }

  const query = next.toString();

  return query
    ? `/admin/subscriptions?${query}`
    : "/admin/subscriptions";
}

function single(value: string | string[] | undefined): string {
  return Array.isArray(value)
    ? (value[0] ?? "")
    : (value ?? "");
}