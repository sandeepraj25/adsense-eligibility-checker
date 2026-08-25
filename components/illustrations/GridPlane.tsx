/**
 * A receding grid plane for the closing section — the "site map" the
 * crawler walks, drawn in perspective so the CTA sits on a horizon.
 */
export function GridPlane({ className }: { className?: string }) {
  const verticals = Array.from({ length: 19 }, (_, i) => i);
  const horizons = [0.06, 0.14, 0.24, 0.36, 0.5, 0.66, 0.84, 1];

  return (
    <div
      className={`pointer-events-none overflow-hidden ${className ?? ""}`}
      aria-hidden
    >
      <svg
        viewBox="0 0 1200 340"
        preserveAspectRatio="none"
        className="h-full w-full"
        fill="none"
      >
        <defs>
          <linearGradient id="gp-line" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7C5CFF" stopOpacity="0" />
            <stop offset="45%" stopColor="#7C5CFF" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#4F7DFF" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id="gp-horizon" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#4F7DFF" stopOpacity="0" />
            <stop offset="50%" stopColor="#9AB4FF" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#B45CFF" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* vanishing verticals */}
        <g stroke="url(#gp-line)" strokeWidth="1">
          {verticals.map((i) => {
            const spread = (i - 9) / 9;
            return (
              <line
                key={i}
                x1={600 + spread * 90}
                y1="0"
                x2={600 + spread * 1500}
                y2="340"
              />
            );
          })}
        </g>

        {/* accelerating horizontals */}
        <g stroke="url(#gp-line)" strokeWidth="1">
          {horizons.map((t) => (
            <line key={t} x1="0" y1={t * 340} x2="1200" y2={t * 340} />
          ))}
        </g>

        {/* the horizon itself */}
        <line
          x1="0"
          y1="0.5"
          x2="1200"
          y2="0.5"
          stroke="url(#gp-horizon)"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}
