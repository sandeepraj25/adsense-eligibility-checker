import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";

const columns = [
  {
    heading: "Product",
    links: [
      { label: "How it works", href: "/#process" },
      { label: "What gets checked", href: "/#features" },
      { label: "Sample report", href: "/#approval-gallery" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Rejection reasons", href: "/#features" },
      { label: "Required pages guide", href: "/#features" },
      { label: "ads.txt reference", href: "/#features" },
      { label: "Changelog", href: "/#top" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/#top" },
      { label: "Contact", href: "/#top" },
      { label: "Privacy", href: "/#top" },
      { label: "Terms", href: "/#top" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative border-t border-white/[0.07] bg-ink-900/50">
      <Container size="wide">
        <div className="grid gap-12 py-14 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Link href="#top" className="inline-flex items-center">
              <Image
                src="/logo.png"
                alt="Logo"
                width={306}
                height={306}
              />
            </Link>

            <p className="mt-5 max-w-sm text-[1.0625rem] leading-relaxed text-cloud-300">
              Check your website for potential AdSense approval issues before
              applying.
            </p>
          </div>

          {columns.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <h2 className="font-[var(--font-poppins)] text-[0.9rem] font-semibold tracking-wide text-cloud-300">
                {column.heading}
              </h2>

              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[1.0625rem] text-cloud-400 transition-colors duration-300 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flex flex-col gap-4 border-t border-white/[0.06] py-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="t-data text-[0.875rem] text-cloud-600">
            © {new Date().getFullYear()} All Rights Reserved.
          </p>

          <p className="t-data text-[0.875rem] text-cloud-600">
            Made by Sandeep -{" "}
            <a
              href="https://skillforever.com"
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer text-cloud-400 underline decoration-cloud-600 underline-offset-4 transition-colors duration-300 hover:text-white"
            >
              skillforever.com
            </a>
          </p>
        </div>
      </Container>
    </footer>
  );
}