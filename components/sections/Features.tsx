"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Search,
  Settings2,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Globe,
  Loader2,
  ScanLine,
} from "lucide-react";

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

const scanSteps = [
  {
    number: "01",
    title: "Required pages",
    subtitle: "Privacy, Terms & Contact",
    icon: FileText,
    issues: [
      { text: "Privacy policy found", type: "pass" },
      { text: "Contact page missing", type: "fail" },
      { text: "Terms page found", type: "pass" },
    ],
  },
  {
    number: "02",
    title: "Content quality",
    subtitle: "Depth & originality",
    icon: Search,
    issues: [
      { text: "Duplicate content detected", type: "fail" },
      { text: "AI-like content detected", type: "warn" },
      { text: "Thin content on 3 pages", type: "warn" },
    ],
  },
  {
    number: "03",
    title: "Technical setup",
    subtitle: "Structure & crawlability",
    icon: Settings2,
    issues: [
      { text: "HTTPS configured", type: "pass" },
      { text: "ads.txt not found", type: "fail" },
      { text: "Crawler access open", type: "pass" },
    ],
  },
  {
    number: "04",
    title: "Mobile experience",
    subtitle: "Responsive rendering",
    icon: Smartphone,
    issues: [
      { text: "Mobile layout detected", type: "pass" },
      { text: "Layout overflow found", type: "warn" },
      { text: "LCP needs improvement", type: "warn" },
    ],
  },
  {
    number: "05",
    title: "Policy signals",
    subtitle: "Approval blockers",
    icon: ShieldCheck,
    issues: [
      { text: "Restricted content check", type: "pass" },
      { text: "Potential policy issue", type: "warn" },
      { text: "Ad placement looks safe", type: "pass" },
    ],
  },
];

const statusStyles = {
  pass: {
    icon: CheckCircle2,
    className:
      "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300",
  },
  warn: {
    icon: AlertTriangle,
    className:
      "border-amber-400/20 bg-amber-400/[0.08] text-amber-300",
  },
  fail: {
    icon: XCircle,
    className:
      "border-rose-400/20 bg-rose-400/[0.08] text-rose-300",
  },
};

export function Features() {
  const [activeStep, setActiveStep] = useState(0);
  const [visibleIssues, setVisibleIssues] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function runScanner() {
      setActiveStep(0);
      setVisibleIssues(0);
      setCompletedSteps([]);
      setFinished(false);

      await new Promise((resolve) => setTimeout(resolve, 700));

      for (let stepIndex = 0; stepIndex < scanSteps.length; stepIndex++) {
        if (cancelled) return;

        setActiveStep(stepIndex);
        setVisibleIssues(0);

        for (
          let issueIndex = 1;
          issueIndex <= scanSteps[stepIndex].issues.length;
          issueIndex++
        ) {
          await new Promise((resolve) => setTimeout(resolve, 700));

          if (cancelled) return;

          setVisibleIssues(issueIndex);
        }

        await new Promise((resolve) => setTimeout(resolve, 500));

        if (cancelled) return;

        setCompletedSteps((prev) => [...prev, stepIndex]);
      }

      await new Promise((resolve) => setTimeout(resolve, 800));

      if (!cancelled) {
        setFinished(true);

        await new Promise((resolve) => setTimeout(resolve, 4000));

        if (!cancelled) {
          runScanner();
        }
      }
    }

    runScanner();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      id="features"
      className="relative overflow-hidden py-24 sm:py-32"
    >
      {/* Background */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/[0.06] blur-[160px]"
        aria-hidden
      />

      <Container size="wide">
        {/* HEADER */}
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/[0.06] px-4 py-2">
              <ScanLine className="size-4 text-violet-300" />
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-200">
                How the scanner works
              </span>
            </div>

            <h2 className="font-[var(--font-poppins)] text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Your website is checked
              <br />
              <span className="grad-text">from multiple angles</span>
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-cloud-400 sm:text-lg">
              Watch the scanner analyze your website step by step and surface
              the issues that may affect your AdSense approval.
            </p>
          </div>
        </Reveal>

        {/* SCANNER */}
        <Reveal delay={0.15}>
          <div className="relative mt-16 overflow-hidden rounded-[2rem] border border-white/[0.1] bg-[#090b16]/90 p-5 shadow-[0_40px_120px_-40px_rgba(124,92,255,0.35)] backdrop-blur-xl sm:p-8 lg:p-10">
            
            {/* top status */}
            <div className="flex flex-col gap-4 border-b border-white/[0.07] pb-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="relative flex size-11 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-400/10">
                  <Globe className="size-5 text-violet-300" />

                  <span className="absolute inset-0 animate-ping rounded-xl border border-violet-400/20" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    yourwebsite.com
                  </p>

                  <p className="mt-0.5 text-xs text-cloud-500">
                    Live website analysis
                  </p>
                </div>
              </div>

              <div
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold ${
                  finished
                    ? "border border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                    : "border border-violet-400/20 bg-violet-400/10 text-violet-200"
                }`}
              >
                {finished ? (
                  <>
                    <CheckCircle2 className="size-4" />
                    Scan complete
                  </>
                ) : (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Scanning...
                  </>
                )}
              </div>
            </div>

            {/* HORIZONTAL STEPS */}
            <div className="relative mt-10">
              
              {/* connecting line */}
              <div className="absolute left-0 right-0 top-[3.2rem] hidden h-px bg-white/[0.08] lg:block" />

              {/* animated progress line */}
              <div
                className="absolute left-0 top-[3.2rem] hidden h-px bg-gradient-to-r from-violet-500 via-blue-400 to-violet-400 transition-all duration-700 lg:block"
                style={{
                  width: `${
                    finished
                      ? 100
                      : ((activeStep + 0.5) / scanSteps.length) * 100
                  }%`,
                }}
              />

              <div className="grid gap-6 lg:grid-cols-5">
                {scanSteps.map((step, index) => {
                  const Icon = step.icon;

                  const isActive = activeStep === index && !finished;
                  const isCompleted = completedSteps.includes(index);

                  return (
                    <div
                      key={step.number}
                      className="relative min-h-[260px] lg:min-h-[320px]"
                    >
                      {/* NODE */}
                      <div className="relative z-10 mb-6 flex justify-center">
                        <div
                          className={`relative flex size-[6.4rem] items-center justify-center rounded-[1.7rem] border transition-all duration-500 ${
                            isActive
                              ? "scale-110 border-violet-400/50 bg-violet-500/20 shadow-[0_0_40px_rgba(124,92,255,0.35)]"
                              : isCompleted
                                ? "border-emerald-400/30 bg-emerald-400/10"
                                : "border-white/[0.08] bg-white/[0.035]"
                          }`}
                        >
                          <Icon
                            className={`size-8 ${
                              isActive
                                ? "text-violet-200"
                                : isCompleted
                                  ? "text-emerald-300"
                                  : "text-cloud-500"
                            }`}
                          />

                          {isActive && (
                            <>
                              <div className="absolute inset-[-6px] animate-ping rounded-[2rem] border border-violet-400/30" />

                              <div className="absolute -bottom-1 h-[2px] w-10 animate-pulse rounded-full bg-violet-300" />
                            </>
                          )}

                          {isCompleted && (
                            <div className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400 text-ink-950">
                              <CheckCircle2 className="size-4" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* TEXT */}
                      <div className="text-center">
                        <div
                          className={`text-[0.65rem] font-bold tracking-[0.2em] ${
                            isActive
                              ? "text-violet-300"
                              : isCompleted
                                ? "text-emerald-300"
                                : "text-cloud-600"
                          }`}
                        >
                          {step.number}
                        </div>

                        <h3
                          className={`mt-2 text-base font-bold tracking-tight transition-colors ${
                            isActive || isCompleted
                              ? "text-white"
                              : "text-cloud-400"
                          }`}
                        >
                          {step.title}
                        </h3>

                        <p className="mt-1 text-xs text-cloud-600">
                          {step.subtitle}
                        </p>
                      </div>

                      {/* ISSUES POPUP */}
                      <div className="mt-5 space-y-2">
                        {step.issues.map((issue, issueIndex) => {
                          const StatusIcon =
                            statusStyles[issue.type].icon;

                          const isVisible =
                            isCompleted || index < activeStep
                              ? true
                              : isActive &&
                                issueIndex < visibleIssues;

                          return (
                            <div
                              key={issue.text}
                              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-[0.68rem] font-medium transition-all duration-500 ${
                                isVisible
                                  ? `translate-y-0 scale-100 opacity-100 ${statusStyles[issue.type].className}`
                                  : "pointer-events-none translate-y-3 scale-95 border-transparent opacity-0"
                              }`}
                            >
                              <StatusIcon className="size-3.5 shrink-0" />

                              <span className="leading-tight">
                                {issue.text}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* BOTTOM SCAN BAR */}
            <div className="mt-10 flex flex-col gap-4 border-t border-white/[0.07] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                {!finished ? (
                  <>
                    <span className="relative flex size-3">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-violet-400 opacity-75" />
                      <span className="relative inline-flex size-3 rounded-full bg-violet-400" />
                    </span>

                    <p className="text-sm text-cloud-400">
                      {visibleIssues > 0
                        ? scanSteps[activeStep].issues[
                            Math.max(0, visibleIssues - 1)
                          ].text
                        : "Preparing scanner..."}
                    </p>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-5 text-emerald-400" />

                    <p className="text-sm font-medium text-emerald-300">
                      Analysis complete — your report is ready
                    </p>
                  </>
                )}
              </div>

              {/* progress */}
              <div className="flex items-center gap-3">
                <div className="h-2 w-36 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 via-blue-400 to-violet-400 transition-all duration-700"
                    style={{
                      width: `${
                        finished
                          ? 100
                          : ((activeStep + visibleIssues / 3) /
                              scanSteps.length) *
                            100
                      }%`,
                    }}
                  />
                </div>

                <span className="text-xs font-semibold tabular-nums text-cloud-500">
                  {finished
                    ? "100%"
                    : `${Math.min(
                        99,
                        Math.round(
                          ((activeStep + visibleIssues / 3) /
                            scanSteps.length) *
                            100,
                        ),
                      )}%`}
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}