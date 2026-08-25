import { ScanProvider } from "@/components/ScanContext";
import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { TrustBar } from "@/components/sections/TrustBar";
import { Stats } from "@/components/sections/Stats";
import { Process } from "@/components/sections/Process";
import { Features } from "@/components/sections/Features";
import { ApprovalGallery } from "@/components/sections/ApprovalGallery";
import { FinalCta } from "@/components/sections/FinalCta";
import { Footer } from "@/components/sections/Footer";

export default function HomePage() {
  return (
    <ScanProvider>
      <a
        href="#top"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-ink-800 focus:px-4 focus:py-2 focus:text-sm"
      >
        Skip to content
      </a>

      <Navbar />

      <main>
        <Hero />
        <TrustBar />
        <Stats />
        <Process />
        <Features />
        <ApprovalGallery />
        <FinalCta />
      </main>

      <Footer />
    </ScanProvider>
  );
}