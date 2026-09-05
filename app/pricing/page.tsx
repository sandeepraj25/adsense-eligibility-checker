import type { Metadata } from "next";
import Link from "next/link";
import { Globe, ShieldCheck } from "lucide-react";

import { PlanCard } from "@/components/pricing/PlanCard";
import { CheckoutButton } from "@/components/pricing/CheckoutButton";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { ToastProvider } from "@/components/ui/Toast";
import { optionalUser } from "@/lib/auth/guard";
import {
  expireStaleSubscriptions,
  getActiveSubscription,
} from "@/lib/db/billing";
import { normalizeDomain } from "@/lib/domain";
import { formatDate } from "@/lib/format";
import {
  checkoutOptions,
  gatewayConfig,
  paypalRateInrPerUnit,
} from "@/lib/payments";
import { DEFAULT_INR_PER_USD } from "@/lib/money";
import { listActivePlans } from "@/lib/plan-catalogue";
import { PLAN_RANK } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Pricing — Verdict",
  description:
    "Three monthly plans. Every allowance resets each billing month, and you can change or cancel your plan whenever you like.",
};

export const dynamic = "force-dynamic";

const faqs = [
  {
    q: "Is AdSense Eligibility Checker an official Google service?",
    a: "No. AdSense Eligibility Checker is an independent pre-review tool designed to help you identify potential AdSense approval issues before applying. Final approval is always decided by Google.",
  },
  {
    q: "What counts as one scan?",
    a: "Each website analysis counts as one scan. You can run another scan after making changes to check whether your issues have been resolved.",
  },
  {
    q: "Do unused scans carry forward?",
    a: "No. Your scan allowance resets with each billing cycle, and unused scans do not carry forward to the next month.",
  },
  {
    q: "Can I change or upgrade my plan?",
    a: "Yes. You can upgrade your plan whenever you need more scans or additional checks. Your new plan features become available after payment is verified.",
  },
  {
    q: "Does AdSense Eligibility Checker guarantee AdSense approval?",
    a: "No. AdSense Eligibility Checker helps you identify potential issues and improve your website before applying, but the final AdSense approval decision is always made by Google.",
  },
];

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ url?: string }>;
}) {
  const { url } = await searchParams;
  const carryUrl = normalizeDomain(url ?? "") ?? undefined;

  const user = await optionalUser();

  if (user) {
    expireStaleSubscriptions();
  }

  const subscription = user ? getActiveSubscription(user.id) : null;

  const plans = listActivePlans();
  const options = checkoutOptions();

  // Same rate PayPal itself will charge at, when an admin has set one;
  // otherwise a fixed placeholder so the page has something to show
  // before that configuration exists. Real checkout never uses this
  // fallback — paypal.ts refuses to open an order without a real rate.
  const usdRate =
    paypalRateInrPerUnit(gatewayConfig("paypal")) ?? DEFAULT_INR_PER_USD;

  const signupHref = (planId: string) => {
    const next = `/pricing${
      carryUrl ? `?url=${encodeURIComponent(carryUrl)}` : ""
    }`;

    const params = new URLSearchParams({
      next,
      plan: planId,
    });

    if (carryUrl) {
      params.set("url", carryUrl);
    }

    return `/signup?${params.toString()}`;
  };

  const methodNames = options.map((option) => option.label);

  return (
    <ToastProvider>
      <Navbar />

      <main>
        {/* ── Header ───────────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-10 pb-10 sm:pt-28">
          <div
            aria-hidden
            className="app-glow pointer-events-none absolute inset-0 -top-32"
          />

          <div
            aria-hidden
            className="dot-field pointer-events-none absolute inset-0 opacity-40"
          />

          <Container size="wide" className="relative">
            <h1 className="t-h1 text-center text-cloud-50">
              Monthly Plans.
            </h1>

            {carryUrl ? (
              <div className="mx-auto mt-8 flex max-w-xl items-center justify-center gap-2.5 rounded-xl border border-azure-400/20 bg-azure-400/[0.06] px-4 py-3">
                <Globe
                  className="size-4 shrink-0 text-azure-300"
                  aria-hidden
                />

                <p className="text-[0.9375rem] text-cloud-200">
                  Pick a plan and we will scan{" "}
                  <span className="t-data text-cloud-50">{carryUrl}</span>{" "}
                  straight after.
                </p>
              </div>
            ) : null}
          </Container>
        </section>

        {/* ── Plans ────────────────────────────────────────────── */}
        <section className="pb-20">
          <Container size="wide">
            <div className="grid gap-5 lg:grid-cols-3">
              {plans.map((plan, index) => {
                const isCurrent = subscription?.planId === plan.id;
                const previous = index > 0 ? plans[index - 1] : null;

                const inherits =
                  previous &&
                  previous.features.length > 0 &&
                  previous.features.every((feature) =>
                    plan.features.includes(feature),
                  ) &&
                  plan.showcase.length < plan.features.length
                    ? previous.name
                    : undefined;

                const currentRank = subscription
                  ? PLAN_RANK[subscription.planId]
                  : 0;

                const verb =
                  PLAN_RANK[plan.id] > currentRank
                    ? "Upgrade to"
                    : "Switch to";

                let cta: React.ReactNode;

                if (!plan.purchasable) {
                  cta = user ? (
                    <p className="text-center text-[0.875rem] text-white">
                      {isCurrent
                        ? "Active on your account"
                        : "Included when you sign up"}
                    </p>
                  ) : (
                    <ButtonLink
                      href={signupHref(plan.id)}
                      variant="ghost"
                      size="md"
                    >
                      Start free
                    </ButtonLink>
                  );
                } else if (isCurrent) {
                  cta = (
                    <p className="text-center text-[0.875rem] leading-snug text-white">
                      Your current plan. Renews{" "}
                      {formatDate(subscription?.expiresAt ?? Date.now())}.
                    </p>
                  );
                } else if (!user) {
                  cta = (
                    <ButtonLink
                      href={signupHref(plan.id)}
                      variant={plan.featured ? "primary" : "ghost"}
                      size="md"
                    >
                      Get {plan.name}
                    </ButtonLink>
                  );
                } else {
                  cta = (
                    <CheckoutButton
                      planId={plan.id}
                      planName={plan.name}
                      label={`${verb} ${plan.name}`}
                      options={options}
                      carryUrl={carryUrl}
                      variant={plan.featured ? "primary" : "ghost"}
                    />
                  );
                }

                return (
                  <Reveal key={plan.id} delay={index * 0.06}>
                    <PlanCard
                      plan={plan}
                      current={isCurrent}
                      {...(inherits ? { inherits } : {})}
                      cta={cta}
                      usdRate={usdRate}
                      className="h-full"
                    />
                  </Reveal>
                );
              })}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[0.875rem] text-white">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="size-4" aria-hidden />

                {methodNames.length > 0
                  ? `Payments handled by ${methodNames.join(", ")}`
                  : "Online payment is available"}
              </span>

              <span>
                Prices in USD per month, inclusive of applicable taxes
              </span>

              <span>Invoice issued for every payment</span>
            </div>
          </Container>
        </section>

        {/* ── Questions ────────────────────────────────────────── */}
        <section className="border-t border-white/[0.06] py-20">
          <Container>
            <div>
              <p className="text-[0.875rem] font-semibold uppercase tracking-[0.18em] text-cloud-500">
                Before you buy
              </p>

              <h2 className="t-h2 mt-3 text-cloud-50">
                The honest answers
              </h2>
            </div>

            <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {faqs.map((faq) => (
                <Reveal key={faq.q}>
                  <h3 className="t-h3 text-cloud-50">{faq.q}</h3>

                  <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-cloud-400">
                    {faq.a}
                  </p>
                </Reveal>
              ))}
            </div>

            <p className="mt-12 text-[0.9375rem] text-cloud-600">
              Still deciding?{" "}
              <Link
                href={user ? "/dashboard/checker" : signupHref("free")}
                className="text-cloud-200 underline decoration-cloud-600 underline-offset-4 transition-colors hover:text-white"
              >
                Run the free scan first
              </Link>{" "}
              — same engine, fewer checks.
            </p>
          </Container>
        </section>
      </main>

      <Footer />
    </ToastProvider>
  );
}