import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { UrlForm } from "@/components/ui/UrlForm";
import { GridPlane } from "@/components/illustrations/GridPlane";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden pb-24 pt-12 sm:pb-32 sm:pt-16">
      <GridPlane className="absolute inset-x-0 bottom-0 -z-10 h-[22rem] w-full" />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[30rem] bg-[radial-gradient(60%_70%_at_50%_100%,rgba(124,92,255,0.28),transparent_70%)]"
      />

      <Container size="narrow">
        <Reveal className="text-center">
          <h2 className="t-display text-balance text-[clamp(2rem,5vw,3.25rem)] leading-[1.05] tracking-[-0.03em]">
            Check Your Website Before You{" "}
            <span className="grad-text">Apply</span>
          </h2>
        </Reveal>

        <Reveal delay={0.12} className="mx-auto mt-9 max-w-xl">
          <UrlForm cta="Check My Website" />
        </Reveal>
      </Container>
    </section>
  );
}