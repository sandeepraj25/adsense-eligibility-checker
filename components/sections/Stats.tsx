import {
  ShieldCheck,
  Zap,
  TrendingUp,
  Globe2,
} from "lucide-react";

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { CountUp } from "@/components/ui/CountUp";
import { stats } from "@/lib/checks";

const statIcons = [
  ShieldCheck,
  Zap,
  TrendingUp,
  Globe2,
];

const statStyles = [
  {
    icon: "text-blue-400",
    glow: "bg-blue-500/10",
  },
  {
    icon: "text-violet-400",
    glow: "bg-violet-500/10",
  },
  {
    icon: "text-emerald-400",
    glow: "bg-emerald-500/10",
  },
  {
    icon: "text-orange-400",
    glow: "bg-orange-500/10",
  },
];

export function Stats() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      {/* Subtle background glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/[0.05] blur-[140px]"
        aria-hidden
      />

      <Container size="wide">
        {/* Section Heading */}
        <Reveal>
          <div className="relative mx-auto mb-14 max-w-2xl text-center">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-violet-400">
              Built for clarity
            </p>

            <h2 className="font-[var(--font-poppins)] text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Know exactly where{" "}
              <span className="grad-text">your site stands.</span>
            </h2>

            <p className="mt-5 text-base leading-7 text-cloud-500">
              Clear signals, practical checks, and actionable insights for
              every website you scan.
            </p>
          </div>
        </Reveal>

        {/* Stats */}
        <ul className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => {
            const Icon = statIcons[i] ?? ShieldCheck;
            const style = statStyles[i] ?? statStyles[0];

            return (
              <Reveal
                as="li"
                key={stat.label}
                delay={i * 0.08}
              >
                <div className="group relative h-full overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.035] p-6 transition-all duration-500 hover:-translate-y-2 hover:border-violet-400/30 hover:bg-white/[0.06] hover:shadow-[0_25px_70px_-25px_rgba(124,92,255,0.45)]">
                  
                  {/* Card glow */}
                  <div
                    className={`absolute -right-12 -top-12 h-36 w-36 rounded-full ${style.glow} blur-3xl transition-all duration-500 group-hover:scale-125`}
                  />

                  {/* Icon */}
                  <div
                    className={`relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.05] ${style.icon}`}
                  >
                    <Icon className="size-5" strokeWidth={2} />
                  </div>

                  {/* Number */}
                  <div className="relative mt-9">
                    <p className="t-display flex items-baseline gap-1 text-[clamp(2.8rem,4vw,3.7rem)] tabular-nums text-white">
                      <span className="grad-text">
                        <CountUp to={stat.value} />
                      </span>

                      {stat.suffix ? (
                        <span className="grad-text">
                          {stat.suffix}
                        </span>
                      ) : null}
                    </p>

                    {/* Label */}
                    <p className="mt-4 text-base font-semibold text-cloud-100">
                      {stat.label}
                    </p>

                    {/* Description */}
                    <p className="t-data mt-2 text-xs leading-relaxed text-cloud-500">
                      {stat.note}
                    </p>
                  </div>

                  {/* Bottom line */}
                  <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-violet-500 via-blue-400 to-transparent transition-all duration-700 group-hover:w-full" />
                </div>
              </Reveal>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}