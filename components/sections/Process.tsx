import Image from "next/image";

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

const steps = [
  {
    title: "Paste your domain",
    body: "No script to install, no DNS record, no account. Just enter your website address and start your scan.",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNl1TQZkOfmLkMB0aLgzLq1NpohX-BHnywfHb0N34MqX4whQOrGFWWvMla&s=10",
    accent: "from-blue-500/40 via-cyan-500/10 to-transparent",
    icon: "🌐",
  },
  {
    title: "We crawl like a reviewer",
    body: "Up to 50 pages are analyzed for content depth, structure, required pages, crawlability, and mobile readiness.",
    image:
      "https://payu.in/blog/wp-content/uploads/2017/02/google-crawlers-on-website.png",
    accent: "from-violet-500/40 via-purple-500/10 to-transparent",
    icon: "🔍",
  },
  {
    title: "Fix the blockers, apply",
    body: "Every issue comes with the exact change needed and the page where it belongs. Fix, rescan, and apply with confidence.",
    image:
      "https://cwatch.comodo.com/images/how-to-fix-website-that-is-down.png",
    accent: "from-emerald-500/40 via-teal-500/10 to-transparent",
    icon: "🚀",
  },
];

export function Process() {
  return (
    <section
      id="process"
      className="relative scroll-mt-24 overflow-hidden py-16 sm:py-20"
    >
      {/* Background glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/[0.05] blur-[160px]"
        aria-hidden
      />

      <Container size="wide">
        {/* CENTERED HEADING */}
        <Reveal>
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="font-[var(--font-poppins)] text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Three steps between you and a{" "}
              <span className="grad-text">clean application</span>
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-[0.95rem] leading-relaxed text-cloud-400 sm:text-base">
              The whole loop takes under a minute. Most sites need one round of
              fixes.
            </p>
          </div>
        </Reveal>

        {/* CARDS */}
        <div className="relative mt-10 sm:mt-12">
          <ol className="relative grid gap-6 lg:grid-cols-3">
            {steps.map((step, i) => (
              <Reveal
                as="li"
                key={step.title}
                delay={i * 0.12}
              >
                <article className="group relative h-full overflow-hidden rounded-[2rem] border border-white/[0.09] bg-white/[0.035] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2 hover:border-violet-400/30 hover:bg-white/[0.06] hover:shadow-[0_30px_90px_-30px_rgba(124,92,255,0.5)]">
                  
                  {/* IMAGE */}
                  <div className="relative h-56 overflow-hidden">
                    <Image
                      src={step.image}
                      alt={step.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />

                    {/* COLOR OVERLAY */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-t ${step.accent}`}
                    />

                    {/* FLOATING ICON */}
                    <div className="absolute bottom-5 right-5 flex size-12 items-center justify-center rounded-2xl border border-white/20 bg-black/40 text-xl backdrop-blur-md">
                      {step.icon}
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div className="relative p-7 sm:p-8">
                    <div className="mb-6 h-px w-full bg-gradient-to-r from-violet-500/60 via-blue-400/20 to-transparent" />

                    <h3 className="font-[var(--font-poppins)] text-xl font-bold tracking-tight text-white sm:text-2xl">
                      {step.title}
                    </h3>

                    <p className="mt-4 text-sm leading-7 text-cloud-400 sm:text-[0.9375rem]">
                      {step.body}
                    </p>

                    {/* Bottom hover line */}
                    <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-violet-500 via-blue-400 to-transparent transition-all duration-700 group-hover:w-full" />
                  </div>
                </article>
              </Reveal>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}