/**
 * Brand mark — a radar sweep enclosed in a shield notch. Drawn from the
 * subject's two ideas: reviewing (shield) and scanning (sweep).
 */
export function Logomark({
  className,
  size = 30,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="lm-a" x1="4" y1="28" x2="28" y2="4">
          <stop offset="0%" stopColor="#4F7DFF" />
          <stop offset="55%" stopColor="#7C5CFF" />
          <stop offset="100%" stopColor="#B45CFF" />
        </linearGradient>
      </defs>
      {/* shield silhouette */}
      <path
        d="M16 2.6 27.2 6.4v9.3c0 6.5-4.4 12-11.2 13.8C9.2 27.7 4.8 22.2 4.8 15.7V6.4L16 2.6Z"
        stroke="url(#lm-a)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* sweep arcs */}
      <path
        d="M10.4 17.4a5.9 5.9 0 0 1 5.6-7.9"
        stroke="url(#lm-a)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M13.3 18.6a3 3 0 0 1 2.7-4.4"
        stroke="url(#lm-a)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {/* verdict tick */}
      <path
        d="m13.6 21.6 3 3 6.2-8"
        stroke="url(#lm-a)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={className}>
      <span className="t-display text-[1.0625rem] tracking-[-0.03em]">
        Verdict
      </span>
    </span>
  );
}
