"use client";

import Image from "next/image";
import { Play, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

const approvals = [
  "/video/approval/adsense1.jpeg",
  "/video/approval/adsense2.png",
  "/video/approval/adsense3.webp",
  "/video/approval/adsense4.webp",
  "/video/approval/adsense5.png",
  "/video/approval/adsense6.jpg",
  "/video/approval/adsense7.jpg",
  "/video/approval/adsense8.jpeg",
  "/video/approval/adsense9.png",
  "/video/approval/adsense10.PNG",
];

export function ApprovalGallery() {
  return (
    <section
      id="approvals"
      className="relative overflow-hidden py-24 sm:py-32"
    >
      {/* Background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-violet-500/[0.06] blur-[160px]"
      />

      <Container size="wide">
        {/* Heading */}
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2">
              <Sparkles className="size-4 text-violet-300" />

              <span className="text-xs font-semibold tracking-wide text-violet-200">
                REAL RESULTS
              </span>
            </div>

            <h2 className="font-[var(--font-poppins)] text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Websites that got{" "}
              <span className="grad-text">approved</span>
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-cloud-400 sm:text-lg">
              Real results and success stories from websites that successfully
              received AdSense approval.
            </p>
          </div>
        </Reveal>

        {/* Animated gallery */}
        <div className="relative mt-14 overflow-hidden">
          {/* First row */}
          <div className="flex w-max animate-gallery-left gap-5 py-3">
            {[...approvals, ...approvals].map((image, index) => (
              <div
                key={`top-${index}`}
                className="group relative h-[260px] w-[220px] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/30 sm:h-[320px] sm:w-[280px]"
              >
                <Image
                  src={image}
                  alt={`AdSense approval result ${index + 1}`}
                  fill
                  sizes="280px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>
            ))}
          </div>

          {/* Second row */}
          <div className="mt-5 flex w-max animate-gallery-right gap-5 py-3">
            {[
              ...approvals.slice().reverse(),
              ...approvals.slice().reverse(),
            ].map((image, index) => (
              <div
                key={`bottom-${index}`}
                className="group relative h-[260px] w-[220px] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/30 sm:h-[320px] sm:w-[280px]"
              >
                <Image
                  src={image}
                  alt={`AdSense approval result ${index + 1}`}
                  fill
                  sizes="280px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>
            ))}
          </div>

          {/* Side fade */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-ink-950 to-transparent sm:w-32" />

          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-ink-950 to-transparent sm:w-32" />
        </div>

        {/* Customer review video */}
        <Reveal delay={0.2}>
          <div className="mx-auto mt-24 max-w-5xl">
            <div className="mb-10 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300">
                CUSTOMER REVIEWS
              </p>

              <h3 className="mt-4 font-[var(--font-poppins)] text-3xl font-bold text-white sm:text-5xl">
                Hear it from our{" "}
                <span className="grad-text">users</span>
              </h3>

              <p className="mt-4 text-cloud-400">
                Real customer experiences will be available soon.
              </p>
            </div>

            <div className="relative aspect-video overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-violet-500/10 via-ink-900 to-blue-500/10 p-1 shadow-[0_30px_100px_-40px_rgba(124,92,255,0.5)]">
              <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-[1.8rem] bg-black/40 backdrop-blur-xl">
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/15 blur-[100px]" />

                <div className="relative z-10 flex size-20 items-center justify-center rounded-full border border-white/15 bg-white/10 backdrop-blur-xl">
                  <Play className="ml-1 size-8 fill-white text-white" />
                </div>

                <h4 className="relative z-10 mt-7 font-[var(--font-poppins)] text-2xl font-bold text-white sm:text-4xl">
                  Customer Review Videos
                </h4>

                <div className="relative z-10 mt-7 rounded-full border border-violet-400/20 bg-violet-500/10 px-5 py-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
                    Coming Soon
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}