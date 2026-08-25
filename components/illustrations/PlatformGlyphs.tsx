/**
 * Original geometric glyphs for the publishing platforms the scanner
 * understands. Deliberately abstract shapes rather than reproductions of
 * anyone's trademark — the wordmark beside each one does the naming.
 */

type GlyphProps = { className?: string };

export function GlyphWordPress({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <circle cx="10" cy="10" r="8.2" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M5.2 7.2 8 14l1.6-4.2M9 7.2l2.6 6.8 2.2-6.8"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GlyphGhost({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path
        d="M3.2 15.4V8.6a6.8 6.8 0 0 1 13.6 0v6.8l-2.3-1.4-2.2 1.4-2.3-1.4-2.3 1.4-2.3-1.4Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M7.6 9.2h1M11.4 9.2h1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function GlyphWebflow({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path
        d="M2 6.4h3.1l2 5.1 2-5.1h3l2 5.1 2-5.1H18l-4.4 8.3h-2.4L9.6 10l-1.7 4.7H5.5L2 6.4Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GlyphBlogger({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <rect
        x="2.6"
        y="2.6"
        width="14.8"
        height="14.8"
        rx="4.4"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d="M7 7.6h3.4M7 12.4h6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="13.4" cy="7.6" r="1.15" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function GlyphWix({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path
        d="M2.4 6.6 5 13.4l2.4-5.2 2.4 5.2 2.5-6.8"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.2 6.6l3.4 6.8M17.6 6.6l-3.4 6.8"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function GlyphSquarespace({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <rect
        x="2.4"
        y="7.6"
        width="10"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <rect
        x="7.6"
        y="2.4"
        width="10"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.3"
      />
    </svg>
  );
}

export const platforms = [
  { name: "WordPress", Glyph: GlyphWordPress },
  { name: "Ghost", Glyph: GlyphGhost },
  { name: "Webflow", Glyph: GlyphWebflow },
  { name: "Blogger", Glyph: GlyphBlogger },
  { name: "Wix", Glyph: GlyphWix },
  { name: "Squarespace", Glyph: GlyphSquarespace },
];
