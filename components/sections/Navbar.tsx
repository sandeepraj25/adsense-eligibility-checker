"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const links = [
  { label: "Home", href: "/" },
  { label: "How it works", href: "/#process" },
  { label: "Pricing", href: "/pricing" },
  { label: "Tools", href: "/#tools" },
  { label: "Team", href: "/team" },
  { label: "Success Stories", href: "/#report" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      setScrolled(currentScrollY > 20);

      if (currentScrollY < 80) {
        setVisible(true);
      } else if (currentScrollY < lastScrollY) {
        // Scroll up → show navbar
        setVisible(true);
      } else if (currentScrollY > lastScrollY) {
        // Scroll down → hide navbar
        setVisible(false);
        setOpen(false);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <motion.header
      initial={{ y: 0, opacity: 1 }}
      animate={{
        y: visible ? 0 : -120,
        opacity: visible ? 1 : 0,
      }}
      transition={{
        duration: 0.35,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="fixed inset-x-0 top-0 z-50 px-3 sm:px-5"
    >
      <Container size="wide">
        <nav
          className={cn(
            "relative mx-auto flex items-center justify-between transition-all duration-500",
            scrolled
              ? "mt-3 max-w-[1400px] rounded-2xl border border-white/[0.12] bg-ink-900/90 px-4 py-3 shadow-[0_15px_60px_rgba(0,0,0,0.30)] backdrop-blur-xl sm:px-6"
              : "mt-4 px-2 py-3 sm:px-4",
          )}
        >
          {/* Logo */}
          <Link
            href="#top"
            className="group flex shrink-0 items-center"
            aria-label="Home"
          >
            <span className="transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="Logo"
                width={206}
                height={206}
                priority
              />
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div
            className={cn(
              "hidden items-center md:flex",
              scrolled
                ? "rounded-full border border-white/[0.10] bg-white/[0.05] p-1.5"
                : "gap-1",
            )}
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="cursor-pointer rounded-full px-3.5 py-2.5 text-[1rem] font-medium text-white transition-all duration-300 hover:bg-white/[0.08] hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden shrink-0 items-center gap-2 md:flex">
            <Link
              href="/login"
              className="cursor-pointer rounded-xl px-4 py-2.5 text-[1rem] font-medium text-white transition-all duration-300 hover:bg-white/[0.06]"
            >
              Log in
            </Link>

            <Link
              href="#top"
              className="cursor-pointer rounded-xl bg-azure-500 px-5 py-2.5 text-[1rem] font-semibold text-white shadow-[0_8px_25px_rgba(56,189,248,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-azure-400"
            >
              Check My Site
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="text-white md:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? (
              <X className="size-5 text-white" aria-hidden />
            ) : (
              <Menu className="size-5 text-white" aria-hidden />
            )}
          </Button>
        </nav>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {open && (
            <motion.div
              id="mobile-nav"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{
                duration: 0.25,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mt-2 overflow-hidden rounded-2xl border border-white/[0.10] bg-ink-900/95 p-3 shadow-2xl backdrop-blur-xl md:hidden"
            >
              <div className="flex flex-col gap-1">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="cursor-pointer rounded-xl px-4 py-3.5 text-[1rem] font-medium text-white transition-colors hover:bg-white/[0.08]"
                  >
                    {link.label}
                  </Link>
                ))}

                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="cursor-pointer rounded-xl px-4 py-3.5 text-[1rem] font-medium text-white transition-colors hover:bg-white/[0.08]"
                >
                  Log in
                </Link>

                <Link
                  href="#top"
                  onClick={() => setOpen(false)}
                  className="mt-2 cursor-pointer rounded-xl bg-azure-500 px-4 py-3.5 text-center text-[1rem] font-semibold text-white transition-colors hover:bg-azure-400"
                >
                  Check My Site
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </motion.header>
  );
}