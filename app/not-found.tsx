import type { Metadata } from "next";
import Link from "next/link";

import { ButtonLink } from "@/components/ui/Button";
import { Logomark } from "@/components/illustrations/Logomark";

export const metadata: Metadata = {
  title: "Page not found — Verdict",
};

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
      <div
        aria-hidden
        className="app-glow pointer-events-none absolute inset-x-0 top-0 h-[60vh]"
      />
      <div
        aria-hidden
        className="dot-field pointer-events-none absolute inset-0 opacity-40"
      />

      <div className="glass edge-light relative w-full max-w-lg rounded-2xl p-7 text-center sm:p-9">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 transition-transform duration-300 hover:scale-[1.02]"
        >
          <Logomark size={28} />
          <span className="t-display text-[1.05rem] text-cloud-50">Verdict</span>
        </Link>

        <p className="t-display mt-7 text-[3.25rem] leading-none">
          <span className="grad-text">404</span>
        </p>

        <h1 className="t-h3 mt-4 text-cloud-50">This page does not exist</h1>

        <p className="mx-auto mt-3 max-w-sm text-[0.9375rem] leading-relaxed text-cloud-400">
          The link may be out of date, or the report you are looking for was
          deleted. Your reports are always listed in your dashboard.
        </p>

        <div className="mt-7 flex flex-wrap justify-center gap-2.5">
          <ButtonLink href="/" size="md" variant="ghost">
            Back to homepage
          </ButtonLink>
          <ButtonLink href="/dashboard" size="md" variant="quiet">
            Go to dashboard
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
