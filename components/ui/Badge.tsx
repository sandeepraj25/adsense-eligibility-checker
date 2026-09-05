import { cn } from "@/lib/cn";
import type {
  IssuePriority,
  PaymentStatus,
  SubscriptionStatus,
  Verdict,
} from "@/lib/db/types";
import { VERDICT_LABEL } from "@/lib/analysis/types";

/**
 * Small caps-label chip. Semantic colour only ever comes from the
 * mint/amber/rose family — the brand gradient never signals status.
 */
type Tone = "neutral" | "brand" | "pass" | "warn" | "fail";

const tones: Record<Tone, string> = {
  neutral: "border-white/10 bg-white/[0.04] text-cloud-400",
  brand: "border-iris-500/30 bg-iris-500/10 text-azure-300",
  pass: "border-mint-400/25 bg-mint-400/10 text-mint-400",
  warn: "border-amber-400/25 bg-amber-400/10 text-amber-400",
  fail: "border-rose-400/25 bg-rose-400/10 text-rose-400",
};

export function Badge({
  children,
  tone = "neutral",
  dot = false,
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1",
        "t-data text-[0.6875rem] font-medium whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {dot ? (
        <span className="size-1.5 rounded-full bg-current opacity-90" />
      ) : null}
      {children}
    </span>
  );
}

/* ── verdict ────────────────────────────────────────────────────── */

const verdictTone: Record<Verdict, Tone> = {
  ready: "pass",
  needs_improvement: "warn",
  not_ready: "fail",
};

export function VerdictBadge({
  verdict,
  className,
}: {
  verdict: Verdict;
  className?: string;
}) {
  return (
    <Badge tone={verdictTone[verdict]} dot className={className}>
      {VERDICT_LABEL[verdict]}
    </Badge>
  );
}

/* ── issue priority ─────────────────────────────────────────────── */

const priorityTone: Record<IssuePriority, Tone> = {
  high: "fail",
  medium: "warn",
  low: "neutral",
};

const priorityLabel: Record<IssuePriority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export function PriorityBadge({
  priority,
  className,
}: {
  priority: IssuePriority;
  className?: string;
}) {
  return (
    <Badge tone={priorityTone[priority]} className={className}>
      {priorityLabel[priority]} priority
    </Badge>
  );
}

/* ── subscription + payment ─────────────────────────────────────── */

const subscriptionTone: Record<SubscriptionStatus, Tone> = {
  active: "pass",
  expired: "warn",
  cancelled: "neutral",
};

export function SubscriptionBadge({
  status,
  className,
}: {
  status: SubscriptionStatus;
  className?: string;
}) {
  return (
    <Badge tone={subscriptionTone[status]} dot className={className}>
      {status === "active"
        ? "Active"
        : status === "expired"
          ? "Expired"
          : "Cancelled"}
    </Badge>
  );
}

const paymentTone: Record<PaymentStatus, Tone> = {
  paid: "pass",
  created: "warn",
  failed: "fail",
  cancelled: "neutral",
};

const paymentLabel: Record<PaymentStatus, string> = {
  paid: "Paid",
  created: "Pending",
  failed: "Failed",
  cancelled: "Cancelled",
};

export function PaymentBadge({
  status,
  className,
}: {
  status: PaymentStatus;
  className?: string;
}) {
  return (
    <Badge tone={paymentTone[status]} className={className}>
      {paymentLabel[status]}
    </Badge>
  );
}

/**
 * Marks a report that came from the seeded demo engine rather than a
 * live crawl. Phase 8 requires demo data to be unmistakable, so this
 * is deliberately visible rather than a footnote.
 */
export function DemoBadge({ className }: { className?: string }) {
  return (
    <Badge tone="brand" className={cn("uppercase", className)}>
      Demo data
    </Badge>
  );
}
