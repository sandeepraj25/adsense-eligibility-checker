import Link from "next/link";
import {
  Activity,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Crown,
  FileText,
  Globe,
  Gift,
  IndianRupee,
  RefreshCw,
  Rocket,
  ScanLine,
  ShieldAlert,
  ShieldCheck,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";

import { Panel } from "@/components/admin/Panels";
import { Badge } from "@/components/ui/Badge";
import { requireAdmin } from "@/lib/auth/guard";
import { adminStats, recentActivity } from "@/lib/db/admin";
import { formatAge } from "@/lib/format";
import { formatINR } from "@/lib/money";
import { gatewayLabel, gatewayViews } from "@/lib/payments";
import { listPlans } from "@/lib/plan-catalogue";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin — Verdict",
};

export default async function AdminOverviewPage() {
  const admin = await requireAdmin();
  const stats = adminStats();
  const activity = recentActivity(14);
  const plans = listPlans();
  const gateways = gatewayViews();
  const now = Date.now();

  const liveGateways = gateways.filter((view) => view.enabled);

  const scanTotal = stats.scans.total;

  const successRate =
    scanTotal > 0
      ? Math.round((stats.scans.successful / scanTotal) * 100)
      : null;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ============================================================
          OVERVIEW HERO
      ============================================================ */}
      <section className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-gradient-to-br from-white/[0.035] via-white/[0.015] to-transparent p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:p-8">
        {/* Background glows */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 right-0 size-80 rounded-full bg-iris-500/[0.08] blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-1/3 size-64 rounded-full bg-azure-500/[0.04] blur-3xl"
        />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="t-data text-[0.6875rem] font-semibold tracking-[0.22em] text-iris-300 uppercase">
              Administration
            </p>

            <h1 className="mt-3 t-display text-[2.4rem] leading-none tracking-tight text-white sm:text-[3.2rem]">
              Overview
            </h1>

            <p className="mt-4 max-w-2xl text-[0.9375rem] leading-relaxed text-cloud-400 sm:text-[1rem]">
              Signed in as{" "}
              <span className="font-medium text-iris-300">
                {admin.email}
              </span>
              . Everything on this page is read live from the database.
            </p>
          </div>

          <Link
            href="/admin"
            className="inline-flex shrink-0 items-center justify-center gap-2.5 rounded-xl border border-iris-400/20 bg-iris-500/[0.08] px-5 py-3 text-[0.875rem] font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-iris-400/40 hover:bg-iris-500/[0.14] hover:shadow-lg hover:shadow-iris-500/10"
          >
            <RefreshCw className="size-4 text-iris-300" aria-hidden />
            Refresh
          </Link>
        </div>

        {/* ========================================================
            TOP METRICS
        ======================================================== */}
        <div className="relative mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <OverviewCard
            label="Registered Users"
            value={stats.users.total}
            description={`${stats.users.admins} administrator${
              stats.users.admins === 1 ? "" : "s"
            }`}
            icon={Users}
            iconClass="text-iris-300"
            iconBoxClass="border-iris-400/20 bg-iris-500/[0.10]"
          />

          <OverviewCard
            label="Active"
            value={stats.users.active}
            description={
              stats.users.total > 0
                ? `${Math.round(
                    (stats.users.active / stats.users.total) * 100,
                  )}% active`
                : "No users yet"
            }
            icon={Activity}
            iconClass="text-mint-400"
            iconBoxClass="border-mint-400/20 bg-mint-400/[0.09]"
            valueClass="text-mint-300"
          />

          <OverviewCard
            label="Suspended"
            value={stats.users.blocked}
            description={
              stats.users.blocked > 0 ? "Cannot sign in" : "None blocked"
            }
            icon={ShieldCheck}
            iconClass="text-amber-400"
            iconBoxClass="border-amber-400/20 bg-amber-400/[0.09]"
          />

          <OverviewCard
            label="Verified Revenue"
            value={formatINR(stats.revenuePaise)}
            description="Live payments only"
            icon={IndianRupee}
            iconClass="text-iris-300"
            iconBoxClass="border-iris-400/20 bg-iris-500/[0.10]"
          />
        </div>

        {/* ========================================================
            PLAN MIX
        ======================================================== */}
        <div className="relative mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-[1.25rem] font-semibold tracking-tight text-white">
                Plan mix
              </h2>

              <p className="mt-1.5 max-w-2xl text-[0.875rem] leading-relaxed text-cloud-500">
                Accounts counted by the plan on their live subscription.
              </p>
            </div>

            <Link
              href="/admin/plans"
              className="inline-flex items-center gap-2 self-start rounded-xl border border-iris-400/20 bg-iris-500/[0.06] px-4 py-2.5 text-[0.8125rem] font-medium text-iris-200 transition-all hover:border-iris-400/40 hover:bg-iris-500/[0.12]"
            >
              Edit plans
              <span aria-hidden>→</span>
            </Link>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {plans.map((plan) => {
              const planName = plan.name.toLowerCase();
              const isFree = plan.amountPaise === 0;
              const isFeatured = plan.featured;
              const isPro = planName === "pro";

              const PlanIcon = isFree
                ? Gift
                : isFeatured
                  ? Crown
                  : isPro
                    ? Rocket
                    : BadgeCheck;

              return (
                <div
                  key={plan.id}
                  className={[
                    "relative overflow-hidden rounded-2xl border p-5 transition-all duration-300",
                    isFeatured
                      ? "border-iris-400/60 bg-gradient-to-br from-iris-500/[0.10] via-iris-500/[0.04] to-transparent shadow-[0_0_32px_rgba(139,92,246,0.10)]"
                      : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.14]",
                  ].join(" ")}
                >
                  {isFeatured ? (
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -top-10 right-0 size-32 rounded-full bg-iris-500/[0.10] blur-3xl"
                    />
                  ) : null}

                  <div className="relative flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="text-[1.125rem] font-semibold text-white">
                          {plan.name}
                        </h3>

                        {plan.active && plan.featured ? (
                          <span className="rounded-lg border border-iris-400/25 bg-iris-500/[0.12] px-2.5 py-1 text-[0.6875rem] font-semibold tracking-wide text-iris-200">
                            Highlighted
                          </span>
                        ) : null}

                        {!plan.active ? (
                          <span className="rounded-lg border border-amber-400/20 bg-amber-400/[0.08] px-2.5 py-1 text-[0.6875rem] font-semibold tracking-wide text-amber-300">
                            Inactive
                          </span>
                        ) : null}
                      </div>

                      <p className="mt-5 t-data text-[2rem] leading-none text-white">
                        {stats.plans[plan.id]}
                      </p>
                    </div>

                    <div
                      className={[
                        "grid size-14 shrink-0 place-items-center rounded-2xl border",
                        isFree
                          ? "border-white/[0.10] bg-white/[0.04] text-cloud-300"
                          : isFeatured
                            ? "border-iris-400/25 bg-iris-500/[0.10] text-iris-300"
                            : isPro
                              ? "border-iris-400/20 bg-iris-500/[0.08] text-iris-300"
                              : "border-azure-400/20 bg-azure-500/[0.08] text-azure-300",
                      ].join(" ")}
                    >
                      <PlanIcon className="size-6" aria-hidden />
                    </div>
                  </div>

                  <p className="relative mt-5 text-[0.8125rem] text-cloud-400">
                    {plan.amountPaise === 0
                      ? "Free"
                      : `${formatINR(plan.amountPaise)}/month`}
                    <span className="mx-1.5 text-cloud-600">•</span>
                    {plan.scanLimit} scans
                    <span className="mx-1.5 text-cloud-600">•</span>
                    {plan.siteLimit} site
                    {plan.siteLimit === 1 ? "" : "s"}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================
          SYSTEM METRICS
      ============================================================ */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Active Subscriptions"
          value={stats.subscriptions.active}
          hint={`${stats.subscriptions.paid} ever paid for`}
          icon={CalendarDays}
          tone="green"
        />

        <MetricCard
          label="Expired"
          value={stats.subscriptions.expired}
          hint={`${stats.subscriptions.cancelled} cancelled`}
          icon={CalendarDays}
          tone="neutral"
        />

        <MetricCard
          label="Websites"
          value={stats.websites}
          icon={Globe}
          tone="blue"
        />

        <MetricCard
          label="Reports"
          value={stats.reports.total}
          hint={
            stats.reports.running > 0
              ? `${stats.reports.running} running now`
              : "None running"
          }
          icon={FileText}
          tone="purple"
        />

        <MetricCard
          label="Scans Attempted"
          value={stats.scans.total}
          icon={ScanLine}
          tone="purple"
        />

        <MetricCard
          label="Successful"
          value={stats.scans.successful}
          hint={
            successRate === null
              ? "No scans yet"
              : `${successRate}% of attempts`
          }
          icon={CheckCircle2}
          tone="green"
        />

        <MetricCard
          label="Failed"
          value={stats.scans.failed}
          hint="Unreachable sites and aborted runs"
          icon={XCircle}
          tone={stats.scans.failed > 0 ? "red" : "neutral"}
        />

        <MetricCard
          label="Payments"
          value={stats.payments.total}
          hint={`${stats.payments.paid} paid · ${stats.payments.failed} failed`}
          icon={CreditCard}
          tone="amber"
        />
      </section>

      {/* ============================================================
          CHECKOUT READINESS
      ============================================================ */}
      <Panel
        title="Checkout readiness"
        description={
          liveGateways.length === 0
            ? "No payment gateway is enabled, so nobody can buy a plan. Configure one before announcing pricing."
            : "Customers can choose any enabled gateway at checkout."
        }
        action={
          <Link
            href="/admin/payment-gateways"
            className="text-[0.8125rem] font-medium text-iris-300 transition-colors hover:text-iris-200"
          >
            Configure →
          </Link>
        }
      >
        <div className="flex flex-wrap gap-2.5">
          {gateways.map((view) => (
            <span
              key={view.id}
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-3.5 py-2.5 text-[0.8125rem] text-cloud-200"
            >
              <CreditCard
                className="size-3.5 text-iris-300"
                aria-hidden
              />

              {gatewayLabel(view.id)}

              {view.enabled ? (
                <Badge
                  tone={view.environment === "live" ? "pass" : "warn"}
                  dot
                >
                  {view.environment === "live" ? "Live" : "Sandbox"}
                </Badge>
              ) : (
                <Badge tone="neutral">
                  {view.configured ? "Disabled" : "Not configured"}
                </Badge>
              )}
            </span>
          ))}
        </div>
      </Panel>

      {/* ============================================================
          RECENT ACTIVITY
      ============================================================ */}
      <Panel
        title="Recent activity"
        description="Signups, scans, payments and administrative changes, most recent first."
        action={
          <Link
            href="/admin/logs"
            className="text-[0.8125rem] font-medium text-iris-300 transition-colors hover:text-iris-200"
          >
            Full audit log →
          </Link>
        }
      >
        {activity.length === 0 ? (
          <p className="py-6 text-center text-[0.875rem] text-cloud-600">
            Nothing has happened yet.
          </p>
        ) : (
          <ul className="divide-y divide-white/[0.06]">
            {activity.map((entry, index) => (
              <li
                key={`${entry.kind}-${entry.at}-${index}`}
                className="flex items-start gap-3 py-4 first:pt-0 last:pb-0"
              >
                <span
                  aria-hidden
                  className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-iris-300"
                >
                  <ActivityIcon kind={entry.kind} />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-[0.875rem] font-medium leading-snug text-cloud-200">
                    {entry.title}
                  </p>

                  <p className="mt-1 truncate text-[0.75rem] text-cloud-600">
                    {entry.detail}
                  </p>
                </div>

                <span className="t-data shrink-0 text-[0.75rem] text-cloud-600">
                  {formatAge(entry.at, now)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {/* ============================================================
          QUICK ACTIONS
      ============================================================ */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-[0.875rem] text-cloud-200 transition-all hover:-translate-y-0.5 hover:border-iris-400/25 hover:bg-white/[0.045]"
        >
          <Users className="size-4 text-iris-300" aria-hidden />
          Manage users
        </Link>

        <Link
          href="/admin/subscriptions"
          className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-[0.875rem] text-cloud-200 transition-all hover:-translate-y-0.5 hover:border-iris-400/25 hover:bg-white/[0.045]"
        >
          <FileText className="size-4 text-iris-300" aria-hidden />
          Subscriptions and payments
        </Link>
      </div>
    </div>
  );
}

/* ================================================================
   OVERVIEW CARD
================================================================ */

function OverviewCard({
  label,
  value,
  description,
  icon: Icon,
  iconClass,
  iconBoxClass,
  valueClass,
}: {
  label: string;
  value: React.ReactNode;
  description: string;
  icon: React.ElementType;
  iconClass: string;
  iconBoxClass: string;
  valueClass?: string;
}) {
  return (
    <div className="group rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.14] hover:bg-white/[0.04]">
      <div className="flex items-start gap-4">
        <div
          className={`grid size-14 shrink-0 place-items-center rounded-2xl border ${iconBoxClass}`}
        >
          <Icon className={`size-7 ${iconClass}`} strokeWidth={1.8} />
        </div>

        <div className="min-w-0">
          <p className="text-[0.875rem] font-medium text-cloud-300">
            {label}
          </p>

          <p
            className={`mt-1.5 t-data text-[2rem] leading-none text-white ${
              valueClass ?? ""
            }`}
          >
            {value}
          </p>

          <p className="mt-4 text-[0.8125rem] text-cloud-500">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   METRIC CARD
================================================================ */

function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon: React.ElementType;
  tone: "green" | "blue" | "purple" | "red" | "amber" | "neutral";
}) {
  const tones = {
    green:
      "border-mint-400/20 bg-mint-400/[0.09] text-mint-400",
    blue:
      "border-azure-400/20 bg-azure-500/[0.09] text-azure-300",
    purple:
      "border-iris-400/20 bg-iris-500/[0.09] text-iris-300",
    red:
      "border-red-400/20 bg-red-500/[0.08] text-red-400",
    amber:
      "border-amber-400/20 bg-amber-400/[0.08] text-amber-400",
    neutral:
      "border-white/[0.10] bg-white/[0.04] text-cloud-400",
  };

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.14] hover:bg-white/[0.04]">
      <div className="flex items-start gap-4">
        <div
          className={`grid size-12 shrink-0 place-items-center rounded-xl border ${tones[tone]}`}
        >
          <Icon className="size-5" strokeWidth={1.9} />
        </div>

        <div className="min-w-0">
          <p className="text-[0.875rem] font-medium text-cloud-300">
            {label}
          </p>

          <p className="mt-1 t-data text-[2rem] leading-none text-white">
            {value}
          </p>

          {hint ? (
            <p className="mt-3 text-[0.8125rem] leading-relaxed text-cloud-500">
              {hint}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   ACTIVITY ICON
================================================================ */

function ActivityIcon({
  kind,
}: {
  kind: "signup" | "scan" | "payment" | "admin";
}) {
  const className = "size-4";

  if (kind === "signup") {
    return <UserPlus className={className} />;
  }

  if (kind === "scan") {
    return <Globe className={className} />;
  }

  if (kind === "payment") {
    return <CreditCard className={className} />;
  }

  return <ShieldAlert className={className} />;
}