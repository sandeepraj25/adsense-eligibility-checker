"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { Button, ButtonLink } from "@/components/ui/Button";
import { Logomark } from "@/components/illustrations/Logomark";

/**
 * Last-resort boundary for an unhandled server or render error.
 *
 * It deliberately shows no stack, no message from the exception and no
 * identifiers — only the digest Next generates, which is what correlates
 * the screen with the server log. Anything more would leak internals to
 * whoever triggered it.
 */
export default function GlobalRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] unhandled error", error);
  }, [error]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
      <div
        aria-hidden
        className="app-glow pointer-events-none absolute inset-x-0 top-0 h-[60vh]"
      />

      <div className="glass relative w-full max-w-lg rounded-2xl p-7 sm:p-9">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <Logomark size={26} />
          <span className="t-display text-[1.05rem] text-cloud-50">Verdict</span>
        </Link>

        <div className="mt-7 flex gap-3">
          <AlertTriangle
            className="mt-0.5 size-4 shrink-0 text-amber-400"
            aria-hidden
          />
          <div>
            <h1 className="t-h3 text-cloud-50">Something went wrong</h1>
            <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-cloud-400">
              The page could not be rendered. Nothing you had already saved is
              affected — reports, plans and payments are stored server-side, so
              retrying is safe.
            </p>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap gap-2.5">
          <Button size="md" onClick={reset}>
            Try again
          </Button>
          <ButtonLink href="/dashboard" size="md" variant="ghost">
            Go to dashboard
          </ButtonLink>
        </div>

        {error.digest ? (
          <p className="t-data mt-6 border-t border-white/[0.07] pt-4 text-[0.6875rem] text-cloud-600">
            Reference {error.digest}
          </p>
        ) : null}
      </div>
    </main>
  );
}
