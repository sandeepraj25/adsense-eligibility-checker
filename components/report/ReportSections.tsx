import Link from "next/link";
import { Lock } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { cheapestPlanWith } from "@/lib/plan-catalogue";
import { FEATURE_META, type FeatureKey } from "@/lib/plans";
import { formatINR } from "@/lib/money";
import type {
  PageScore,
  PolicyRisk,
  Recommendation,
  ReportMetrics,
} from "@/lib/db/types";

/* ── measured signals ─────────────────────────────────────────────── */

const AI_BAND_LABEL: Record<"low" | "moderate" | "elevated", string> = {
  low: "Reads as human-written",
  moderate: "Mixed signals",
  elevated: "Reads as machine-written",
};

const RISK_LABEL: Record<
  "low" | "moderate" | "elevated" | "high",
  string
> = {
  low: "Low",
  moderate: "Moderate",
  elevated: "Elevated",
  high: "High",
};

export function SignalGrid({ metrics }: { metrics: ReportMetrics }) {
  const cells: { label: string; value: string; hint?: string }[] = [];

  if (metrics.totalWords !== undefined) {
    cells.push({
      label: "Words read",
      value: metrics.totalWords.toLocaleString("en-IN"),
      hint:
        metrics.averageWords !== undefined
          ? `${metrics.averageWords.toLocaleString(
              "en-IN",
            )} words per page on average`
          : undefined,
    });
  }

  if (metrics.aiLikelihood !== undefined) {
    cells.push({
      label: "AI-written estimate",
      value: `${metrics.aiLikelihood}%`,
      hint: `${
        metrics.aiBand ? `${AI_BAND_LABEL[metrics.aiBand]} · ` : ""
      }${
        metrics.aiReliable === false
          ? "Too little text to be reliable"
          : "A signal, not a determination"
      }`,
    });
  }

  if (metrics.humanSignalScore !== undefined) {
    cells.push({
      label: "Human authorship signals",
      value: `${metrics.humanSignalScore}%`,
      hint: "Bylines, dates, first-person voice and editorial structure",
    });
  }

  if (metrics.originality !== undefined) {
    cells.push({
      label: "Originality signal",
      value: `${metrics.originality}%`,
      hint: "Boilerplate and stock phrasing measured on your own text",
    });
  }

  if (metrics.duplicatePairs !== undefined) {
    cells.push({
      label: "Duplicate pages",
      value: String(metrics.duplicatePairs),
      hint:
        metrics.duplicateShare !== undefined
          ? `${metrics.duplicateShare}% of read pages overlap heavily`
          : "Pairs of pages that overlap heavily",
    });
  }

  if (metrics.adDensity !== undefined) {
    cells.push({
      label: "Ad density",
      value: `${metrics.adDensity}%`,
      hint:
        metrics.adSlots !== undefined
          ? `${metrics.adSlots} ad slot${
              metrics.adSlots === 1 ? "" : "s"
            } found`
          : undefined,
    });
  }

  if (metrics.sitemapUrls !== undefined) {
    cells.push({
      label: "Sitemap URLs",
      value: metrics.sitemapUrls.toLocaleString("en-IN"),
      hint: "Parsed from your sitemap",
    });
  }

  if (metrics.maxDepth !== undefined) {
    cells.push({
      label: "Structure depth",
      value: String(metrics.maxDepth),
      hint:
        metrics.averageDepth !== undefined
          ? `${metrics.averageDepth} average · ${
              metrics.orphanPages ?? 0
            } orphan page(s)`
          : undefined,
    });
  }

  if (metrics.brokenLinks !== undefined) {
    cells.push({
      label: "Broken internal links",
      value: String(metrics.brokenLinks),
      hint: "Links we followed that did not resolve",
    });
  }

  if (metrics.riskLevel !== undefined) {
    cells.push({
      label: "Policy risk",
      value: RISK_LABEL[metrics.riskLevel],
      hint: "Our reading of the findings, not Google's assessment",
    });
  }

  if (cells.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cells.map((cell) => (
        <div
          key={cell.label}
          className={cn(
            "glass rounded-2xl border border-white/[0.08] p-5",
            "transition-all duration-300",
            "hover:-translate-y-0.5 hover:border-white/[0.14]",
            "hover:bg-white/[0.025]",
          )}
        >
          <p className="text-[0.875rem] font-medium text-cloud-200">
            {cell.label}
          </p>

          <p className="t-display mt-3 text-[1.85rem] leading-none text-cloud-50">
            {cell.value}
          </p>

          {cell.hint ? (
            <p className="mt-3 text-[0.875rem] leading-relaxed text-cloud-400">
              {cell.hint}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

/* ── page-by-page ─────────────────────────────────────────────────── */

function scoreTone(score: number): string {
  if (score >= 85) return "text-mint-400";
  if (score >= 60) return "text-amber-400";
  return "text-rose-400";
}

export function PageTable({ pages }: { pages: PageScore[] }) {
  return (
    <div className="glass overflow-hidden rounded-2xl border border-white/[0.08]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[46rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.025]">
              <Th>Page</Th>
              <Th align="right">Status</Th>
              <Th align="right">Words</Th>
              <Th align="right">AI est.</Th>
              <Th align="right">Findings</Th>
              <Th align="right">Score</Th>
            </tr>
          </thead>

          <tbody>
            {pages.map((page) => (
              <tr
                key={page.url}
                className={cn(
                  "border-b border-white/[0.06] last:border-0",
                  "transition-colors duration-200 hover:bg-white/[0.025]",
                )}
              >
                <td className="px-5 py-4">
                  <a
                    href={page.url}
                    target="_blank"
                    rel="noreferrer nofollow noopener"
                    className="block max-w-[20rem] truncate text-[0.9375rem] font-medium text-cloud-50 underline decoration-cloud-600 underline-offset-4 transition-colors hover:text-white"
                  >
                    {page.path || "/"}
                  </a>

                  {page.title ? (
                    <p className="mt-1.5 max-w-[20rem] truncate text-[0.8125rem] text-cloud-400">
                      {page.title}
                    </p>
                  ) : null}
                </td>

                <Td>{page.status}</Td>

                <Td>{page.words.toLocaleString("en-IN")}</Td>

                <Td>
                  {page.aiLikelihood === null
                    ? "—"
                    : `${page.aiLikelihood}%`}
                </Td>

                <Td>{page.issues}</Td>

                <td className="px-5 py-4 text-right">
                  <span
                    className={cn(
                      "t-display text-[1.125rem]",
                      scoreTone(page.score),
                    )}
                  >
                    {page.score}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={cn(
        "px-5 py-4 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-cloud-300",
        align === "right" && "text-right",
      )}
    >
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td className="px-5 py-4 text-right text-[0.9375rem] font-medium text-cloud-100">
      {children}
    </td>
  );
}

/* ── remediation plan ─────────────────────────────────────────────── */

const priorityTone: Record<
  Recommendation["priority"],
  "fail" | "warn" | "neutral"
> = {
  high: "fail",
  medium: "warn",
  low: "neutral",
};

export function RecommendationList({
  items,
}: {
  items: Recommendation[];
}) {
  return (
    <ol className="flex flex-col gap-4">
      {items.map((item) => (
        <li
          key={item.rank}
          className={cn(
            "glass group relative overflow-hidden rounded-2xl",
            "border border-white/[0.08] p-5",
            "transition-all duration-300",
            "hover:border-white/[0.14] hover:bg-white/[0.025]",
          )}
        >
          <div className="flex gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04]">
              <span className="t-data text-[0.875rem] font-medium text-cloud-200">
                {String(item.rank).padStart(2, "0")}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-[1rem] font-semibold text-cloud-50 sm:text-[1.0625rem]">
                  {item.title}
                </h3>

                <Badge
                  tone={
                    (priorityTone[item.priority] ?? "neutral") as
                      | "fail"
                      | "warn"
                      | "neutral"
                  }
                >
                  {item.priority}
                </Badge>
              </div>

              <p className="mt-3 max-w-3xl text-[0.9375rem] leading-relaxed text-cloud-200">
                {item.action}
              </p>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

/* ── policy risk ──────────────────────────────────────────────────── */

const riskTone: Record<
  PolicyRisk["level"],
  "fail" | "warn" | "neutral"
> = {
  high: "fail",
  moderate: "warn",
  low: "neutral",
};

export function RiskList({ risks }: { risks: PolicyRisk[] }) {
  return (
    <ul className="flex flex-col gap-4">
      {risks.map((risk) => (
        <li
          key={risk.label}
          className={cn(
            "glass rounded-2xl border border-white/[0.08] p-5",
            "transition-all duration-300",
            "hover:border-white/[0.14] hover:bg-white/[0.025]",
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-[1rem] font-semibold text-cloud-50 sm:text-[1.0625rem]">
              {risk.label}
            </h3>

            <Badge tone={riskTone[risk.level]}>
              {risk.level} risk
            </Badge>
          </div>

          <p className="mt-3 max-w-3xl text-[0.9375rem] leading-relaxed text-cloud-200">
            {risk.why}
          </p>
        </li>
      ))}
    </ul>
  );
}

/* ── locked sections ──────────────────────────────────────────────── */

export function LockedFeatures({ locked }: { locked: FeatureKey[] }) {
  if (locked.length === 0) return null;

  const groups = new Map<
    string,
    {
      planName: string;
      price: number;
      features: FeatureKey[];
    }
  >();

  for (const feature of locked) {
    const plan = cheapestPlanWith(feature);

    if (!plan) continue;

    const entry = groups.get(plan.id) ?? {
      planName: plan.name,
      price: plan.amountPaise,
      features: [],
    };

    entry.features.push(feature);
    groups.set(plan.id, entry);
  }

  if (groups.size === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      {[...groups.entries()].map(([planId, group]) => (
        <div
          key={planId}
          className="glass rounded-2xl border border-iris-500/20 bg-iris-500/[0.05] p-5 sm:p-6"
        >
          <div className="flex flex-wrap items-center gap-3">
            <div className="grid size-9 place-items-center rounded-xl border border-iris-500/20 bg-iris-500/[0.08]">
              <Lock
                className="size-4 text-azure-300"
                aria-hidden
              />
            </div>

            <p className="text-[1rem] font-semibold text-cloud-50">
              {group.features.length} check
              {group.features.length === 1 ? "" : "s"} did not run on
              this plan
            </p>

            <Badge tone="brand">
              {group.planName} · {formatINR(group.price)}/month
            </Badge>
          </div>

          <ul className="mt-5 flex flex-col gap-4">
            {group.features.map((feature) => (
              <li
                key={feature}
                className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-4"
              >
                <p className="text-[0.9375rem] font-medium text-cloud-50">
                  {FEATURE_META[feature].label}
                </p>

                <p className="mt-1.5 max-w-3xl text-[0.875rem] leading-relaxed text-cloud-300">
                  {FEATURE_META[feature].does}
                </p>
              </li>
            ))}
          </ul>

          <p className="mt-5 text-[0.875rem] leading-relaxed text-cloud-300">
            <Link
              href="/pricing"
              className="font-medium text-azure-300 underline decoration-azure-300/40 underline-offset-4 transition-colors hover:text-white"
            >
              Upgrade to {group.planName}
            </Link>{" "}
            and re-run this scan to unlock these checks. Your existing
            reports will remain unchanged.
          </p>
        </div>
      ))}
    </div>
  );
}