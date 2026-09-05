"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Globe, Loader2 } from "lucide-react";
import { useScan } from "@/components/ScanContext";
import { normalizeDomain } from "@/lib/domain";
import { cn } from "@/lib/cn";

export function UrlForm({
  size = "lg",
  className,
  cta = "Run free scan",
}: {
  size?: "md" | "lg";
  className?: string;
  cta?: string;
}) {
  const { runScan } = useScan();
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const tall = size === "lg";

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;

    const domain = normalizeDomain(value);

    if (!domain) {
      setError("Enter a domain like yourdomain.com");
      return;
    }

    setError(null);
    setBusy(true);

    // Keeps any on-page preview in sync, then hands off to /start, which
    // decides where this visitor goes: signup if anonymous, straight to
    // the checker if they already have a session and an active plan.
    // `busy` is intentionally left true — the page is being replaced.
    runScan(domain);
    router.push(`/start?url=${encodeURIComponent(domain)}`);
  }

  return (
    <div className={cn("w-full", className)}>
      <form
        onSubmit={handleSubmit}
        noValidate
        className={cn(
          "group flex w-full flex-col gap-2 rounded-2xl border border-white/40 bg-white/[0.04] p-2 sm:flex-row sm:items-center",
          "shadow-[0_15px_50px_-20px_rgba(0,0,0,0.7)]",
          "transition-all duration-300",
          "focus-within:border-white/70 focus-within:bg-white/[0.06] focus-within:shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_18px_60px_-24px_rgba(124,92,255,0.6)]",
        )}
      >
        <label htmlFor={`url-${size}`} className="sr-only">
          Your website address
        </label>

        <div className="flex flex-1 items-center gap-3 px-4">
          <Globe
            className="size-5 shrink-0 text-white/50 transition-colors duration-300 group-focus-within:text-white/90"
            aria-hidden
          />

          <input
            id={`url-${size}`}
            name="url"
            type="text"
            inputMode="url"
            autoComplete="url"
            spellCheck={false}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError(null);
            }}
            placeholder="yourdomain.com"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `url-${size}-error` : undefined}
            className={cn(
              "w-full bg-transparent font-sans font-medium text-white/90 outline-none",
              "placeholder:text-white/45",
              tall ? "h-14 text-[1.05rem]" : "h-11 text-[0.95rem]",
            )}
          />
        </div>

        <button
          type="submit"
          disabled={busy}
          className={cn(
            "grad-brand relative inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-7 font-semibold text-white",
            "shadow-[0_10px_35px_-10px_rgba(124,92,255,0.8)]",
            "transition-all duration-300",
            "hover:-translate-y-0.5 hover:shadow-[0_18px_45px_-10px_rgba(124,92,255,1)]",
            "active:translate-y-0 active:scale-[0.98]",
            "disabled:opacity-70",
            tall ? "h-14 text-[1rem]" : "h-11 text-[0.9rem]",
          )}
        >
          {busy ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Scanning
            </>
          ) : (
            <>
              {cta}
              <ArrowRight
                className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                aria-hidden
              />
            </>
          )}
        </button>
      </form>

      <div className="mt-3 min-h-5 px-1">
        {error ? (
          <p
            id={`url-${size}-error`}
            role="alert"
            className="font-sans text-sm text-rose-400"
          >
            {error}
          </p>
        ) : (
          <p className="font-sans text-sm font-medium text-white/65">
            Enter Your Website Link and check Adsense Approval.
          </p>
        )}
      </div>
    </div>
  );
}