import { AlertTriangle, Check, ChevronDown, Wrench } from "lucide-react";

import { Badge, PriorityBadge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { CATEGORY_META, type CategoryKey } from "@/lib/analysis/types";
import type { ReportIssue, IssueStatus } from "@/lib/db/types";

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 } as const;

function sortIssues(issues: ReportIssue[]): ReportIssue[] {
  return [...issues].sort(
    (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority],
  );
}

export function IssueList({ issues }: { issues: ReportIssue[] }) {
  const critical = sortIssues(issues.filter((i) => i.status === "fail"));
  const warnings = sortIssues(issues.filter((i) => i.status === "warn"));
  const passed = issues.filter((i) => i.status === "pass");

  return (
    <div className="flex flex-col gap-10">
      {critical.length > 0 ? (
        <Group
          status="fail"
          title="Blockers"
          lede="Fix these before you apply. Each one is a common, documented reason for rejection."
          issues={critical}
        />
      ) : null}

      {warnings.length > 0 ? (
        <Group
          status="warn"
          title="Worth fixing"
          lede="Not fatal on their own, but they weaken the application and they are cheap to fix."
          issues={warnings}
        />
      ) : null}

      {passed.length > 0 ? <PassedGroup issues={passed} /> : null}
    </div>
  );
}

/* ── severity groups ────────────────────────────────────────────── */

const groupIcon: Record<"fail" | "warn", React.ReactNode> = {
  fail: <AlertTriangle className="size-5 text-rose-400" aria-hidden />,
  warn: <Wrench className="size-5 text-amber-400" aria-hidden />,
};

function Group({
  status,
  title,
  lede,
  issues,
}: {
  status: "fail" | "warn";
  title: string;
  lede: string;
  issues: ReportIssue[];
}) {
  return (
    <section>
      <div className="flex items-center gap-3">
        {groupIcon[status]}

        <h2 className="text-[1.25rem] font-semibold tracking-tight text-white">
          {title}
        </h2>

        <span className="rounded-full border border-white/[0.10] bg-white/[0.04] px-2.5 py-1 text-[0.75rem] font-medium text-cloud-300">
          {issues.length}
        </span>
      </div>

      <p className="mt-2 max-w-3xl text-[0.9375rem] leading-relaxed text-white/65 sm:text-[1rem]">
        {lede}
      </p>

      <div className="mt-5 flex flex-col gap-3.5">
        {issues.map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </div>
    </section>
  );
}

const accent: Record<IssueStatus, string> = {
  fail: "before:bg-rose-400",
  warn: "before:bg-amber-400",
  pass: "before:bg-mint-400",
};

function IssueCard({ issue }: { issue: ReportIssue }) {
  const meta = CATEGORY_META[issue.categoryId as CategoryKey];

  return (
    <article
      className={cn(
        "glass group relative overflow-hidden rounded-2xl",
        "border border-white/[0.09] bg-gradient-to-br from-white/[0.055] to-white/[0.015]",
        "p-5 pl-6 sm:p-6 sm:pl-7",
        "shadow-[0_12px_35px_rgba(0,0,0,0.18)]",
        "transition-all duration-300",
        "hover:-translate-y-0.5 hover:border-white/[0.16] hover:bg-white/[0.06]",
        "before:absolute before:inset-y-0 before:left-0 before:w-[3px]",
        accent[issue.status],
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-5 gap-y-3">
        <h3 className="text-[1rem] font-semibold text-white sm:text-[1.0625rem]">
          {issue.label}
        </h3>

        <div className="flex shrink-0 items-center gap-2">
          <Badge>{meta?.name ?? issue.categoryId}</Badge>
          <PriorityBadge priority={issue.priority} />
        </div>
      </div>

      <p className="mt-4 text-[0.9375rem] leading-relaxed text-white/85 sm:text-[1rem]">
        {issue.detail}
      </p>

      {issue.evidence ? (
        <div className="mt-4 rounded-xl border border-white/[0.05] bg-black/20 px-4 py-3">
          <p className="t-data text-[0.8125rem] leading-relaxed break-words text-cloud-300 sm:text-[0.875rem]">
            {issue.evidence}
          </p>
        </div>
      ) : null}

      {issue.recommendation ? (
        <div className="mt-5 flex gap-3 border-t border-white/[0.08] pt-4">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-azure-400/15 bg-azure-400/[0.06]">
            <Wrench
              className="size-3.5 text-azure-300"
              aria-hidden
            />
          </div>

          <div>
            <span className="mb-1.5 block text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-cloud-400">
              Fix
            </span>

            <p className="text-[0.9375rem] leading-relaxed text-white/90 sm:text-[1rem]">
              {issue.recommendation}
            </p>
          </div>
        </div>
      ) : null}

      <p className="t-data mt-4 text-[0.75rem] text-cloud-500">
        {issue.checkId}
      </p>
    </article>
  );
}

/* ── passed checks ──────────────────────────────────────────────── */

function PassedGroup({ issues }: { issues: ReportIssue[] }) {
  const byCategory = new Map<string, ReportIssue[]>();

  for (const issue of issues) {
    const bucket = byCategory.get(issue.categoryId);

    if (bucket) {
      bucket.push(issue);
    } else {
      byCategory.set(issue.categoryId, [issue]);
    }
  }

  return (
    <details className="group/passed">
      <summary
        className={cn(
          "glass flex cursor-pointer list-none items-center gap-3 rounded-2xl",
          "border border-white/[0.09] bg-white/[0.025] px-5 py-4",
          "transition-all duration-300",
          "hover:border-white/[0.16] hover:bg-white/[0.06]",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azure-400",
        )}
      >
        <div className="grid size-8 place-items-center rounded-lg border border-mint-400/15 bg-mint-400/[0.06]">
          <Check className="size-4 text-mint-400" aria-hidden />
        </div>

        <span className="text-[1rem] font-medium text-white">
          {issues.length} checks passed
        </span>

        <ChevronDown
          className="ml-auto size-5 text-cloud-500 transition-transform duration-300 group-open/passed:rotate-180"
          aria-hidden
        />
      </summary>

      <div className="mt-4 flex flex-col gap-6">
        {[...byCategory.entries()].map(([categoryId, list]) => (
          <div key={categoryId}>
            <p className="text-[0.75rem] font-medium uppercase tracking-[0.16em] text-cloud-400">
              {CATEGORY_META[categoryId as CategoryKey]?.name ?? categoryId}
            </p>

            <ul className="mt-3 flex flex-col gap-2.5">
              {list.map((issue) => (
                <li
                  key={issue.id}
                  className={cn(
                    "flex gap-3 rounded-xl",
                    "border border-white/[0.07] bg-white/[0.025]",
                    "px-4 py-3.5",
                    "transition-colors duration-300 hover:bg-white/[0.05]",
                  )}
                >
                  <Check
                    className="mt-0.5 size-4 shrink-0 text-mint-400"
                    aria-hidden
                  />

                  <div className="min-w-0">
                    <p className="text-[0.9375rem] font-medium text-white/90">
                      {issue.label}
                    </p>

                    <p className="mt-1 text-[0.875rem] leading-relaxed text-white/60">
                      {issue.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </details>
  );
}