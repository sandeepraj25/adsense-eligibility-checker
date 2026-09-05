import Link from "next/link";
import { ChevronRight, Clock3, CircleAlert } from "lucide-react";

import { Badge, DemoBadge, VerdictBadge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import type { Report } from "@/lib/db/types";
import { formatAge, formatDuration } from "@/lib/format";

const scoreTone: Record<string, string> = {
  ready: "#34d399",
  needs_improvement: "#fbbf24",
  not_ready: "#fb7185",
};

export function ReportRow({
  report,
  now,
  className,
}: {
  report: Report;
  now: number;
  className?: string;
}) {
  const running = report.state === "running";
  const failed = report.state === "failed";

  const scoreColor =
    scoreTone[report.verdict] ?? "#a78bfa";

  const score = Math.max(0, Math.min(100, report.score ?? 0));

  return (
    <Link
      href={`/dashboard/reports/${report.id}`}
      className={cn(
        "glass group flex flex-col gap-5 rounded-[1.25rem] border border-white/[0.10] p-5 transition-all duration-300",
        "hover:border-white/[0.16] hover:bg-white/[0.035]",
        "sm:flex-row sm:items-center sm:justify-between sm:p-6",
        className,
      )}
    >
      {/* LEFT SIDE */}
      <div className="flex min-w-0 items-center gap-5 sm:gap-6">
        {/* SCORE CIRCLE */}
        <div
          className="relative grid size-[6.8rem] shrink-0 place-items-center rounded-full p-[0.42rem]"
          style={{
            background:
              running || failed
                ? "rgba(255,255,255,0.08)"
                : `conic-gradient(
                    ${scoreColor} ${score * 3.6}deg,
                    rgba(255,255,255,0.12) ${score * 3.6}deg
                  )`,
          }}
        >
          <div className="grid size-full place-items-center rounded-full bg-[#0d111c]">
            {running || failed ? (
              <span className="t-data text-[1.6rem] text-cloud-500">
                —
              </span>
            ) : (
              <div className="text-center">
                <span className="t-display block text-[2rem] leading-none text-white">
                  {report.score}
                </span>

                <span className="mt-1 block text-[0.75rem] text-cloud-500">
                  /100
                </span>
              </div>
            )}
          </div>
        </div>

        {/* DOMAIN + COUNTS */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="t-data truncate text-[1.3rem] font-medium text-white sm:text-[1.45rem]">
              {report.domain}
            </h3>

            {report.analysisMode === "demo" ? <DemoBadge /> : null}
          </div>

          {!running && !failed ? (
            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              {/* PASSED */}
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-3.5 py-1.5 text-[0.875rem] font-medium text-emerald-300">
                {report.passedCount} passed
              </span>

              {/* TO FIX */}
              <span className="rounded-full border border-rose-400/20 bg-rose-400/[0.06] px-3.5 py-1.5 text-[0.875rem] font-medium text-rose-300">
                {report.warningCount} to fix
              </span>

              {/* BLOCKERS */}
              <span className="text-[0.95rem] text-cloud-400">
                <span className="mr-2 text-cloud-600">•</span>
                {report.criticalCount} blocker
                {report.criticalCount === 1 ? "" : "s"}
              </span>
            </div>
          ) : (
            <p className="mt-3 text-[0.875rem] text-cloud-500">
              {running
                ? "Running now…"
                : report.errorMessage ?? "The run did not finish"}
            </p>
          )}
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex shrink-0 items-center gap-5 self-end sm:self-center">
        <div className="flex flex-col items-end gap-3">
          {running ? (
            <Badge tone="brand" dot>
              Running
            </Badge>
          ) : failed ? (
            <Badge tone="fail">Failed</Badge>
          ) : (
            <VerdictBadge verdict={report.verdict} />
          )}

          <div className="flex items-center gap-3 text-[0.875rem] text-cloud-500">
            <Clock3 className="size-4" aria-hidden />

            <span>
              {formatAge(report.startedAt, now)}
              {report.durationMs
                ? ` · ${formatDuration(report.durationMs)}`
                : ""}
            </span>
          </div>
        </div>

        <ChevronRight
          className="size-7 shrink-0 text-cloud-500 transition-all duration-300 group-hover:translate-x-1 group-hover:text-white"
          aria-hidden
        />
      </div>
    </Link>
  );
} 