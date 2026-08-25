/**
 * Custom illustrations for the three-step process. Each one draws the
 * actual artifact of that step: the address you paste, the crawl across
 * your page tree, and the fix list you get back.
 */

const stroke = {
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  fill: "none",
};

function Defs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="1" x2="1" y2="0">
        <stop offset="0%" stopColor="#4F7DFF" />
        <stop offset="55%" stopColor="#7C5CFF" />
        <stop offset="100%" stopColor="#C684FF" />
      </linearGradient>
    </defs>
  );
}

export function StepSubmit({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 132 96" className={className} aria-hidden>
      <Defs id="st-1" />
      {/* address field */}
      <rect
        x="10"
        y="30"
        width="112"
        height="30"
        rx="9"
        stroke="url(#st-1)"
        {...stroke}
      />
      <circle cx="26" cy="45" r="5.5" stroke="url(#st-1)" {...stroke} />
      <path d="M20.5 45h11M26 39.5v11" stroke="url(#st-1)" {...stroke} opacity="0.5" />
      {/* typed domain as dashes */}
      <path
        d="M40 45h34"
        stroke="url(#st-1)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M78 45h9" stroke="#5A6088" strokeWidth="3" strokeLinecap="round" />
      {/* caret */}
      <path d="M92 38v14" stroke="#C684FF" strokeWidth="2" strokeLinecap="round" />
      {/* cursor */}
      <path
        d="m101 62 4 16 3.2-6.4 6.8-1.6L101 62Z"
        stroke="url(#st-1)"
        {...stroke}
      />
      {/* click ripple */}
      <circle cx="66" cy="18" r="5" stroke="url(#st-1)" {...stroke} opacity="0.55" />
      <circle cx="66" cy="18" r="10" stroke="url(#st-1)" {...stroke} opacity="0.22" />
    </svg>
  );
}

export function StepCrawl({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 132 96" className={className} aria-hidden>
      <Defs id="st-2" />
      {/* page tree */}
      <rect x="52" y="8" width="28" height="18" rx="4" stroke="url(#st-2)" {...stroke} />
      <path d="M66 26v12M28 50V38h76v12M66 38v12" stroke="#2A3057" {...stroke} />
      <rect x="14" y="50" width="28" height="18" rx="4" stroke="url(#st-2)" {...stroke} opacity="0.85" />
      <rect x="52" y="50" width="28" height="18" rx="4" stroke="url(#st-2)" {...stroke} opacity="0.85" />
      <rect x="90" y="50" width="28" height="18" rx="4" stroke="url(#st-2)" {...stroke} opacity="0.85" />
      {/* sweep line */}
      <path
        d="M6 78h120"
        stroke="url(#st-2)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M6 78 L40 30 M40 78 L66 22 M78 78 L104 32"
        stroke="url(#st-2)"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.35"
      />
      {/* read markers */}
      <circle cx="28" cy="59" r="2" fill="#34D399" />
      <circle cx="66" cy="59" r="2" fill="#FBBF24" />
      <circle cx="104" cy="59" r="2" fill="#34D399" />
    </svg>
  );
}

export function StepFix({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 132 96" className={className} aria-hidden>
      <Defs id="st-3" />
      {/* report sheet */}
      <path
        d="M22 10h58l16 16v60H22V10Z"
        stroke="url(#st-3)"
        {...stroke}
      />
      <path d="M80 10v16h16" stroke="url(#st-3)" {...stroke} opacity="0.6" />
      {/* rows */}
      <path d="M34 40h30M34 54h38M34 68h22" stroke="#5A6088" strokeWidth="2.5" strokeLinecap="round" />
      {/* ticks */}
      <path d="m70 38 3 3 5-6" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M78 52.5h1" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" />
      <path d="m62 66 3 3 5-6" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* verdict seal */}
      <circle cx="104" cy="66" r="16" stroke="url(#st-3)" {...stroke} />
      <path
        d="m96 66 5.5 5.5L112 60"
        stroke="url(#st-3)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
