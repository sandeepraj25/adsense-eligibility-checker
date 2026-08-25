/**
 * Ambient atmosphere: two blurred gradient fields plus a faint
 * concentric "sweep range" grid, echoing a radar plot. Purely
 * decorative, so it is hidden from assistive tech and drifts slowly.
 */
export function Aurora({ className }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
      aria-hidden
    >
      <svg
        className="absolute left-1/2 top-[-18%] h-[130%] w-[150%] -translate-x-1/2"
        viewBox="0 0 1200 900"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="au-blue" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#4F7DFF" stopOpacity="0.55" />
            <stop offset="60%" stopColor="#4F7DFF" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#4F7DFF" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="au-violet" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#B45CFF" stopOpacity="0.45" />
            <stop offset="62%" stopColor="#7C5CFF" stopOpacity="0.09" />
            <stop offset="100%" stopColor="#7C5CFF" stopOpacity="0" />
          </radialGradient>
          <filter id="au-soft" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="52" />
          </filter>
        </defs>

        <g filter="url(#au-soft)">
          <ellipse
            className="drift-slow"
            cx="430"
            cy="250"
            rx="330"
            ry="220"
            fill="url(#au-blue)"
          />
          <ellipse
            className="drift-slower"
            cx="830"
            cy="330"
            rx="300"
            ry="240"
            fill="url(#au-violet)"
          />
        </g>

        {/* sweep range rings */}
        <g stroke="#9AB4FF" strokeOpacity="0.075" fill="none">
          <circle cx="600" cy="300" r="180" />
          <circle cx="600" cy="300" r="320" />
          <circle cx="600" cy="300" r="470" />
          <circle cx="600" cy="300" r="640" />
        </g>
      </svg>
    </div>
  );
}
