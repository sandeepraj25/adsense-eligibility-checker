"use client";

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

const platforms = [
  { name: "Wix", logo: "https://cdn.simpleicons.org/wix" },
  { name: "WordPress", logo: "https://cdn.simpleicons.org/wordpress" },
  { name: "Webflow", logo: "https://cdn.simpleicons.org/webflow" },
  { name: "Squarespace", logo: "https://cdn.simpleicons.org/squarespace" },
  { name: "Shopify", logo: "https://cdn.simpleicons.org/shopify" },
  { name: "Framer", logo: "https://cdn.simpleicons.org/framer" },
  {
    name: "Hostinger Website Builder",
    logo: "https://cdn.simpleicons.org/hostinger",
  },
  { name: "Elementor", logo: "https://cdn.simpleicons.org/elementor" },
  { name: "Blogger", logo: "https://cdn.simpleicons.org/blogger" },
  { name: "PHP", logo: "https://cdn.simpleicons.org/php" },
  { name: "Node.js", logo: "https://cdn.simpleicons.org/nodedotjs" },
];

export function TrustBar() {
  // Double the list for seamless infinite scrolling
  const marqueePlatforms = [...platforms, ...platforms];

  return (
    <section className="relative overflow-hidden border-y border-white/[0.06] bg-ink-900/40 py-10 sm:py-12">
      <Container size="wide">
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:gap-16">
          {/* TITLE */}
          <Reveal className="shrink-0">
            <h2 className="font-[var(--font-poppins)] text-center text-4xl font-extrabold leading-[0.95] tracking-tight text-white sm:text-5xl lg:text-left">
              Reads Sites
              <br />
              <span className="grad-text">Built On</span>
            </h2>
          </Reveal>

          {/* MOVING LOGOS */}
          <Reveal delay={0.1} className="w-full overflow-hidden">
            <div className="relative w-full">
              {/* LEFT FADE */}
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-ink-900 via-ink-900/80 to-transparent sm:w-20" />

              {/* RIGHT FADE */}
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-ink-900 via-ink-900/80 to-transparent sm:w-20" />

              {/* LOGO ANIMATION */}
              <div className="flex w-max animate-platform-marquee items-center gap-6 py-4 sm:gap-10">
                {marqueePlatforms.map((platform, index) => (
                  <div
                    key={`${platform.name}-${index}`}
                    className="flex h-20 w-24 shrink-0 items-center justify-center"
                    title={platform.name}
                    aria-label={platform.name}
                  >
                    <img
                      src={platform.logo}
                      alt={platform.name}
                      className="h-12 w-12 object-contain transition-transform duration-300 hover:scale-110 sm:h-14 sm:w-14"
                    />
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}