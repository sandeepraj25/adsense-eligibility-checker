import { Check, Crown, Minus, Sparkles, Zap } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { convertPaiseByRate, formatUSD } from "@/lib/money";
import { checkCountFor } from "@/lib/analysis/checks";
import { FEATURE_META, type Plan } from "@/lib/plans";

/**
 * One plan card, rendered from the live catalogue.
 *
 * Every number and every line comes from the plan record, so an admin who
 * re-prices Basic or switches a feature off changes this card without a
 * deploy.
 */
export function PlanCard({
  plan,
  current = false,
  inherits,
  cta,
  usdRate,
  className,
}: {
  plan: Plan;
  current?: boolean;
  inherits?: string;
  cta: React.ReactNode;
  /** Rupees per US dollar, for displaying `plan.amountPaise` in USD. */
  usdRate: number;
  className?: string;
}) {
  const featured = plan.featured;
  const free = plan.amountPaise === 0;
  const checks = checkCountFor(plan.features);

  const planName = plan.name.toLowerCase();

  return (
    <article
      className={cn(
        "glass relative flex flex-col overflow-hidden rounded-3xl border border-white/[0.08] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.14] hover:shadow-2xl",
        featured &&
          "grad-hairline edge-light border-iris-400/30 shadow-[0_20px_80px_rgba(99,102,241,0.12)]",
        current &&
          !featured &&
          "border-mint-400/30 ring-1 ring-mint-400/20",
        className,
      )}
    >
      {/* Background glow for featured plan */}
      {featured ? (
        <div
          aria-hidden
          className="pointer-events-none absolute -top-28 -right-16 size-64 rounded-full bg-iris-500/18 blur-3xl"
        />
      ) : null}

      {/* Premium glow for current plan */}
      {current && !featured ? (
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-12 size-56 rounded-full bg-mint-400/[0.08] blur-3xl"
        />
      ) : null}

      {/* Header */}
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            {/* Free */}
            {planName === "free" ? (
              <span className="flex size-8 items-center justify-center rounded-xl border border-sky-400/20 bg-sky-400/[0.08]">
                <Zap
                  className="size-4 fill-sky-400 text-sky-400"
                  strokeWidth={2.4}
                  aria-hidden
                />
              </span>
            ) : null}

            {/* Basic */}
            {planName === "basic" ? (
              <span className="flex size-8 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-400/[0.08]">
                <Sparkles
                  className="size-4 text-violet-300"
                  strokeWidth={2.4}
                  aria-hidden
                />
              </span>
            ) : null}

            {/* Pro */}
            {planName === "pro" ? (
              <span className="flex size-8 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/[0.08] shadow-[0_0_20px_rgba(251,191,36,0.10)]">
                <Crown
                  className="size-4 text-amber-400"
                  strokeWidth={2.4}
                  aria-hidden
                />
              </span>
            ) : null}

            <h3 className="t-h3 text-[1.5rem] text-cloud-50">
              {plan.name}
            </h3>
          </div>

          <div
            className={cn(
              "mt-3 h-px w-10 bg-white/15",
              planName === "free" && "bg-sky-400/60",
              planName === "basic" && "bg-violet-400/60",
              planName === "pro" && "bg-amber-400/70",
              featured && "bg-iris-400/60",
              current && !featured && "bg-mint-400/60",
            )}
          />
        </div>

        {current ? (
          <Badge tone="pass" dot>
            Your plan
          </Badge>
        ) : featured ? (
          <Badge tone="brand">Most chosen</Badge>
        ) : null}
      </div>

      {/* Description */}
      <p className="relative mt-4 min-h-[2.5rem] text-[0.9375rem] leading-relaxed text-cloud-400">
        {plan.tagline}
      </p>

      {/* Price */}
      <div className="relative mt-7">
        <div className="flex items-end gap-2">
          <span className="t-display text-[3.2rem] leading-none tracking-tight text-cloud-50">
            {free ? "$0" : formatUSD(convertPaiseByRate(plan.amountPaise, usdRate))}
          </span>

          <span className="mb-1 text-[0.875rem] text-cloud-500">
            /month
          </span>
        </div>

        <p className="t-data mt-4 text-[0.8125rem] text-cloud-400">
          {plan.scanLimit} scans / month · {plan.siteLimit} website
          {plan.siteLimit === 1 ? "" : "s"} · {checks} check
          {checks === 1 ? "" : "s"}
        </p>
      </div>

      {/* Highlights */}
      {plan.highlights.length > 0 ? (
        <ul className="relative mt-6 space-y-2 border-t border-white/[0.07] pt-5">
          {plan.highlights.map((line) => (
            <li
              key={line}
              className="text-[0.875rem] leading-relaxed text-cloud-200"
            >
              {line}
            </li>
          ))}
        </ul>
      ) : null}

      {/* Features */}
      <div className="relative mt-6 flex-1 border-t border-white/[0.07] pt-5">
        {inherits ? (
          <p className="mb-4 text-[0.8125rem] font-medium text-cloud-400">
            Everything in {inherits}, plus:
          </p>
        ) : null}

        <ul className="space-y-3">
          {plan.showcase.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-3 text-[0.9375rem]"
            >
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-mint-400/[0.08]">
                <Check
                  className="size-3 text-mint-400"
                  strokeWidth={3}
                  aria-hidden
                />
              </span>

              <span className="leading-snug text-cloud-200">
                {FEATURE_META[feature].label}
              </span>
            </li>
          ))}

          {plan.excluded.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-3 text-[0.9375rem]"
            >
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-white/[0.03]">
                <Minus
                  className="size-3 text-cloud-600"
                  strokeWidth={2.6}
                  aria-hidden
                />
              </span>

              <span className="leading-snug text-cloud-600">
                No {FEATURE_META[feature].label.toLowerCase()}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <div className="relative mt-auto pt-8">{cta}</div>
    </article>
  );
}