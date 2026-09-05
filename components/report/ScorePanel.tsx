import {
  Check,
  CircleAlert,
  FileText,
  Gauge,
  Info,
  Navigation,
  ShieldCheck,
  Smartphone,
  Wrench,
} from "lucide-react";

import { ScoreArc } from "@/components/ui/ScoreArc";
import { DemoBadge, VerdictBadge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { CATEGORY_META, type CategoryKey } from "@/lib/analysis/types";
import type { CategoryScore, Report } from "@/lib/db/types";

const verdictCopy: Record<Report["verdict"], string> = {
  ready:
    "Nothing here would obviously block an application. Fix the remaining warnings if you want the margin, then apply.",

  needs_improvement:
    "The foundation is there, but a reviewer would find something to object to. Clear the blockers first, then re-check.",

  not_ready:
    "There is enough missing here that an application would very likely be rejected. Work through the high-priority items below.",
};

/* ── score panel ─────────────────────────────────────────────── */

export function ScorePanel({ report }: { report: Report }) {
  return (
    <div className="glass edge-light relative overflow-hidden rounded-2xl p-5 sm:p-7">
      <div className="flex flex-col items-start gap-7 sm:flex-row sm:items-center sm:gap-9">
        <ScoreArc value={report.score} size={176} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <VerdictBadge verdict={report.verdict} />

            {report.analysisMode === "demo" ? <DemoBadge /> : null}
          </div>

          <h2 className="t-h3 mt-4 text-cloud-50">
            {report.domain}
          </h2>

          <p className="mt-2.5 max-w-lg text-[0.9375rem] leading-relaxed text-cloud-400">
            {verdictCopy[report.verdict]}
          </p>

          <div className="mt-5 flex flex-wrap gap-x-7 gap-y-3">
            <Tally
              label="Passed"
              value={report.passedCount}
              tone="pass"
            />

            <Tally
              label="To fix"
              value={report.warningCount}
              tone="warn"
            />

            <Tally
              label="Blockers"
              value={report.criticalCount}
              tone="fail"
            />
          </div>
        </div>
      </div>

      {report.analysisMode === "demo" ? (
        <p className="mt-6 rounded-xl border border-iris-500/25 bg-iris-500/[0.07] px-4 py-3 text-[0.875rem] leading-relaxed text-cloud-200">
          <span className="font-medium text-cloud-50">
            This report is seeded demo data.
          </span>{" "}
          The site could not be reached from this server, so the figures below
          were generated deterministically from the domain name to demonstrate
          the report. They are not an observation of your website, and they are
          not a Google decision.
        </p>
      ) : null}
    </div>
  );
}

/* ── tally ───────────────────────────────────────────────────── */

function Tally({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "pass" | "warn" | "fail";
}) {
  const toneClass = {
    pass: "text-mint-400",
    warn: "text-amber-400",
    fail: "text-rose-400",
  }[tone];

  return (
    <div>
      <p
        className={cn(
          "t-display text-[1.5rem] leading-none",
          toneClass,
        )}
      >
        {value}
      </p>

      <p className="t-eyebrow mt-1.5 text-[0.625rem] text-cloud-600">
        {label}
      </p>
    </div>
  );
}

/* ── category styling ────────────────────────────────────────── */

function categoryStyle(id: string) {
  switch (id) {
    case "content":
    case "content_quality":
      return {
        icon: FileText,
        iconClass:
          "border-violet-400/60 bg-violet-500/[0.06] text-violet-400",
        bar: "bg-violet-400",
      };

    case "seo":
      return {
        icon: Gauge,
        iconClass:
          "border-orange-400/60 bg-orange-500/[0.06] text-orange-400",
        bar: "bg-orange-400",
      };

    case "navigation":
      return {
        icon: Navigation,
        iconClass:
          "border-mint-400/60 bg-mint-500/[0.06] text-mint-400",
        bar: "bg-mint-400",
      };

    case "mobile":
    case "mobile_experience":
      return {
        icon: Smartphone,
        iconClass:
          "border-amber-400/60 bg-amber-500/[0.06] text-amber-400",
        bar: "bg-amber-400",
      };

    case "privacy":
    case "privacy_legal":
    case "privacy_and_legal":
      return {
        icon: ShieldCheck,
        iconClass:
          "border-cyan-400/60 bg-cyan-500/[0.06] text-cyan-400",
        bar: "bg-cyan-400",
      };

    case "technical":
    case "technical_health":
      return {
        icon: Wrench,
        iconClass:
          "border-blue-400/60 bg-blue-500/[0.06] text-blue-400",
        bar: "bg-blue-400",
      };

    default:
      return {
        icon: FileText,
        iconClass:
          "border-violet-400/60 bg-violet-500/[0.06] text-violet-400",
        bar: "bg-violet-400",
      };
  }
}

/* ── category status ─────────────────────────────────────────── */

function getStatus(score: number) {
  if (score >= 85) {
    return {
      label: "Excellent",
      tone: "text-mint-300",
      icon: Check,
    };
  }

  if (score >= 70) {
    return {
      label: "Good",
      tone: "text-violet-300",
      icon: Check,
    };
  }

  return {
    label: "Needs work",
    tone: "text-amber-300",
    icon: CircleAlert,
  };
}

/* ── category breakdown ──────────────────────────────────────── */

export function CategoryBreakdown({
  categories,
}: {
  categories: CategoryScore[];
}) {
  return (
    <section className="glass w-full rounded-2xl p-5 sm:p-6 lg:p-7">
      {/* Heading */}

      <div className="flex flex-col">
        <div className="flex items-center gap-2.5">
          <h2 className="text-[1.45rem] font-semibold tracking-tight text-cloud-50 sm:text-[1.6rem]">
            Category Scores
          </h2>

          <div className="flex size-7 items-center justify-center rounded-full border border-violet-400/60 text-violet-300">
            <Info className="size-3.5" />
          </div>
        </div>

        <p className="mt-1.5 text-[0.85rem] text-cloud-400">
          Snapshot of your website&apos;s overall performance
        </p>
      </div>

      {/* Category Cards */}

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const meta = CATEGORY_META[category.id as CategoryKey];

          const style = categoryStyle(category.id);
          const status = getStatus(category.score);

          const Icon = style.icon;
          const StatusIcon = status.icon;

          return (
            <div
              key={category.id}
              className="glass rounded-xl border border-white/[0.10] p-4 sm:p-5"
            >
              {/* Icon + Score */}

              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "flex size-[52px] shrink-0 items-center justify-center rounded-full border",
                    style.iconClass,
                  )}
                >
                  <Icon
                    className="size-5"
                    strokeWidth={1.8}
                  />
                </div>

                <p className="t-display text-[2.7rem] leading-none tracking-tight text-cloud-50 sm:text-[3rem]">
                  {category.score}
                </p>
              </div>

              {/* Category name */}

              <h3 className="mt-4 text-[1rem] font-semibold text-cloud-50 sm:text-[1.05rem]">
                {category.name}
              </h3>

              {/* Category code */}

              

              {/* Progress bar */}

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.10]">
                <span
                  className={cn(
                    "block h-full rounded-full transition-all duration-500",
                    style.bar,
                  )}
                  style={{
                    width: `${Math.max(category.score, 2)}%`,
                  }}
                />
              </div>

              {/* Status */}

              <div
                className={cn(
                  "mt-4 flex items-center gap-2 text-[0.8rem] font-medium",
                  status.tone,
                )}
              >
                <StatusIcon
                  className="size-4"
                  strokeWidth={2}
                />

                <span>{status.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}