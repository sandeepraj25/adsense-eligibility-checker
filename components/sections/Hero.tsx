import { Container } from "@/components/ui/Container";
import { UrlForm } from "@/components/ui/UrlForm";
import { Reveal } from "@/components/ui/Reveal";
import { Aurora } from "@/components/illustrations/Aurora";
import Image from "next/image";
import AdSenseLogo from "@/Image/Google-Adsense-Logo.png";

export function Hero() {
  return (
    <section
      id="top"
      className="relative isolate overflow-hidden pb-20 pt-32 sm:pb-28 sm:pt-40"
    >
      <Aurora />

      <div
        className="dot-field pointer-events-none absolute inset-0 -z-10"
        aria-hidden
      />

      <div
        className="noise pointer-events-none absolute inset-0 -z-10 opacity-[0.35]"
        aria-hidden
      />

      <Container size="wide">
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] lg:gap-16">
          
          {/* LEFT: HERO CONTENT */}
          <div>
            <Reveal delay={0.08}>
              <h1 className="t-display t-h1 mt-6 text-balance font-[var(--font-poppins)] font-bold">
                Is Your{" "}
                <span className="whitespace-nowrap">
                  Website <span className="grad-text">Ready</span>
                </span>{" "}
                AdSense?
              </h1>

              <Image
                src={AdSenseLogo}
                alt="Google AdSense"
                width={350}
                height={100}
                className="mb-1 mt-1 h-auto w-[350px]"
              />
            </Reveal>

            <Reveal delay={0.24}>
              <div className="mt-7 max-w-[34rem]">
                <UrlForm />
              </div>
            </Reveal>
          </div>

          {/* RIGHT: DEMO VIDEO */}
          <Reveal delay={0.2}>
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl shadow-violet-500/10">
              <video
                src="/video/adsense-video.mp4"
                autoPlay
                muted
                loop
                playsInline
                controls
                className="block aspect-video w-full object-cover"
              />
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}