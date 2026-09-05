import Image from "next/image";

import { Container } from "@/components/ui/Container";
import { Navbar } from "@/components/sections/Navbar";

export function AuthShell({
  title,
  lede,
  children,
  footer,
}: {
  title: React.ReactNode;
  lede: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  proof: string[];
}) {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Existing Navbar */}
      <Navbar />

      {/* Existing website background */}
      <div
        aria-hidden
        className="app-glow pointer-events-none absolute inset-0"
      />

      <div
        aria-hidden
        className="dot-field pointer-events-none absolute inset-0 opacity-40"
      />

      <Container
        size="wide"
        className="relative flex min-h-screen items-center pt-24 pb-8"
      >
        <div className="grid w-full items-center lg:grid-cols-[1fr_auto_1fr]">
          {/* Left side — Original Logo */}
          <div className="flex items-center justify-center py-10 lg:justify-start lg:py-0">
            <Image
              src="/logo.png"
              alt="AdSense Eligibility Checker"
              width={350}
              height={120}
              className="h-auto w-[280px] sm:w-[320px] lg:w-[350px]"
              priority
            />
          </div>

          {/* Vertical divider */}
          <div className="hidden h-[430px] w-px bg-white/[0.12] lg:block" />

          {/* Right side — Login / Signup */}
          <div className="flex justify-center py-10 lg:py-0 lg:pl-20">
            <div className="w-full max-w-md">
              <div className="text-center">
                <h1 className="t-display text-[2.15rem] leading-[1.05] tracking-tight text-cloud-50 sm:text-[2.5rem]">
                  {title}
                </h1>

                <p className="mx-auto mt-3 max-w-sm text-[0.9375rem] leading-relaxed text-cloud-400">
                  {lede}
                </p>
              </div>

              <div className="mt-8">{children}</div>

              <div className="mt-7 text-center text-[0.9375rem] text-cloud-400">
                {footer}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}