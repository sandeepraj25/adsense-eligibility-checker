import Image from "next/image";

import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";

const approvals = [
  "adsense1.jpeg",
  "adsense2.png",
  "adsense3.webp",
  "adsense4.webp",
  "adsense5.png",
  "adsense6.jpg",
  "adsense7.jpg",
  "adsense8.jpeg",
  "adsense9.png",
  "adsense10.PNG",
];

export function ApprovalGallery() {
  return (
    <section
      id="approval-gallery"
      className="relative overflow-hidden py-24 sm:py-32"
    >
      <Container size="wide">
        <SectionHeader
          eyebrow="SUCCESS STORIES"
          title={
            <>
              Real sites. Real{" "}
              <span className="grad-text">AdSense approvals</span>
            </>
          }
          lede="A collection of approval and AdSense success screenshots from website owners."
        />

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {approvals.map((image, i) => (
            <Reveal key={image} delay={i * 0.05}>
              <div className="group relative overflow-hidden rounded-2xl border border-white/[0.1] bg-white/[0.03]">
                <div className="relative aspect-video w-full">
                  <Image
                    src={`/video/approval/${image}`}
                    alt={`AdSense success story ${i + 1}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <div className="mt-20 overflow-hidden rounded-3xl border border-white/[0.1] bg-white/[0.03] p-8 sm:p-12">
            <div className="flex flex-col items-center text-center">
              <span className="t-eyebrow text-cloud-500">
                CUSTOMER REVIEWS
              </span>

              <h3 className="t-h2 mt-4">
                Video reviews are{" "}
                <span className="grad-text">coming soon</span>
              </h3>

              <p className="mt-4 max-w-xl text-cloud-400">
                We&apos;re collecting video reviews from our users. They&apos;ll
                appear here soon.
              </p>

              <div className="relative mt-8 flex aspect-video w-full max-w-3xl items-center justify-center overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-900">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-blue-500/10" />

                <div className="relative flex flex-col items-center">
                  <div className="grid size-16 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-2xl">
                    ▶
                  </div>

                  <span className="mt-4 text-sm font-medium text-cloud-300">
                    Video testimonials coming soon
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}