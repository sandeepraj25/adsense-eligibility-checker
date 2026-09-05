"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  CreditCard,
  ExternalLink,
  Gauge,
  Layers,
  Menu,
  Receipt,
  ScrollText,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

import { cn } from "@/lib/cn";

const NAV = [
  { label: "Overview", href: "/admin", icon: Gauge },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Plans", href: "/admin/plans", icon: Layers },
  {
    label: "Subscriptions",
    href: "/admin/subscriptions",
    icon: Receipt,
  },
  {
    label: "Payment gateways",
    href: "/admin/payment-gateways",
    icon: CreditCard,
  },
  {
    label: "Audit log",
    href: "/admin/logs",
    icon: ScrollText,
  },
];

export function AdminShell({
  admin,
  children,
}: {
  admin: { name: string; email: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="relative min-h-screen bg-ink-950">
      <div
        aria-hidden
        className="app-glow no-print pointer-events-none fixed inset-x-0 top-0 h-[60vh]"
      />

      {/* ── Mobile header ─────────────────────────────────────── */}
      <header className="glass-deep no-print sticky top-0 z-40 flex items-center justify-between border-b border-white/[0.07] px-4 py-3 lg:hidden">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/[0.10] bg-white/[0.04]">
            <Image
              src="/logo.png"
              alt="Verdict"
              width={28}
              height={28}
              priority
              className="size-7 object-contain"
            />
          </div>

          <div>
            <p className="text-[0.9375rem] font-semibold text-white">
              Admin panel
            </p>

            <div className="mt-1 flex items-center gap-1.5">
              <ShieldCheck
                className="size-3 text-amber-400"
                aria-hidden
              />
              <span className="text-[0.6875rem] font-medium text-white/70">
                Administrator
              </span>
            </div>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="admin-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className="glass rounded-xl p-2.5 text-white transition-colors hover:bg-white/[0.08]"
        >
          {open ? (
            <X className="size-5" />
          ) : (
            <Menu className="size-5" />
          )}
        </button>
      </header>

      {/* ── Desktop sidebar ───────────────────────────────────── */}
      <aside className="no-print fixed inset-y-0 left-0 z-30 hidden w-[17.75rem] flex-col border-r border-white/[0.08] bg-ink-950 lg:flex">
        {/* Top user panel */}
        <div className="border-b border-white/[0.07] p-4">
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-xl px-1 py-1 transition-colors hover:bg-white/[0.03]"
          >
            {/* Logo */}
            <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/[0.10] bg-white/[0.04] shadow-lg shadow-black/20">
              <Image
                src="/logo.png"
                alt="Verdict"
                width={42}
                height={42}
                priority
                className="size-8 object-contain"
              />
            </div>

            {/* Admin info */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-[0.9375rem] font-semibold text-white">
                  {admin.name}
                </p>

                <span className="inline-flex items-center gap-1 rounded-md border border-amber-400/30 bg-amber-400/[0.10] px-1.5 py-0.5 text-[0.5625rem] font-semibold tracking-[0.1em] text-amber-300 uppercase">
                  <ShieldCheck
                    className="size-2.5"
                    aria-hidden
                  />
                  Admin
                </span>
              </div>

              <p className="mt-1 truncate text-[0.75rem] text-white/60">
                {admin.email}
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-3 py-5">
          <p className="mb-2 px-3.5 text-[0.625rem] font-semibold tracking-[0.16em] text-white/45 uppercase">
            Administration
          </p>

          <NavList pathname={pathname} />
        </div>

        {/* Bottom area */}
        <div className="border-t border-white/[0.07] p-4">
          <Link
            href="/dashboard"
            className="glass flex items-center justify-between gap-2 rounded-xl px-3.5 py-3 text-[0.875rem] text-white transition-all duration-200 hover:border-white/[0.16] hover:bg-white/[0.06]"
          >
            <span>Customer dashboard</span>

            <ExternalLink
              className="size-3.5 shrink-0 text-white/60"
              aria-hidden
            />
          </Link>

          <div className="mt-3 flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.035] p-3">
            <span
              aria-hidden
              className="grid size-9 shrink-0 place-items-center rounded-full bg-amber-400/15 text-[0.8125rem] font-semibold text-amber-300 ring-1 ring-amber-400/25"
            >
              {admin.name.trim().charAt(0).toUpperCase() || "A"}
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.8125rem] font-medium text-white">
                {admin.name}
              </p>

              <p className="mt-0.5 truncate text-[0.6875rem] text-white/60">
                {admin.email}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Mobile drawer ─────────────────────────────────────── */}
      <AnimatePresence>
        {open ? (
          <motion.div
            id="admin-nav"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{
              duration: 0.24,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="fixed inset-x-0 top-[4.5rem] z-40 border-b border-white/[0.07] bg-ink-950 px-4 pt-4 pb-5 shadow-2xl lg:hidden"
          >
            {/* Mobile admin info */}
            <div className="mb-4 flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.035] p-3">
              <div className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/[0.10] bg-white/[0.04]">
                <Image
                  src="/logo.png"
                  alt="Verdict"
                  width={28}
                  height={28}
                  className="size-7 object-contain"
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-[0.875rem] font-semibold text-white">
                    {admin.name}
                  </p>

                  <span className="inline-flex items-center gap-1 text-[0.5625rem] font-semibold text-amber-300 uppercase">
                    <ShieldCheck
                      className="size-3"
                      aria-hidden
                    />
                    Admin
                  </span>
                </div>

                <p className="mt-1 truncate text-[0.6875rem] text-white/60">
                  {admin.email}
                </p>
              </div>
            </div>

            <NavList pathname={pathname} />

            <Link
              href="/dashboard"
              className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-3.5 py-3 text-[0.875rem] text-white"
            >
              Customer dashboard

              <ExternalLink
                className="size-3.5 shrink-0 text-white/60"
                aria-hidden
              />
            </Link>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* ── Content ───────────────────────────────────────────── */}
      <div className="dash-content relative lg:pl-[17.75rem]">
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavList({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="Admin">
      <ul className="space-y-1">
        {NAV.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          const Icon = item.icon;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                data-active={active}
                className={cn(
                  "relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[0.9375rem] transition-all duration-300",
                  active
                    ? "bg-gradient-to-r from-amber-400/[0.16] to-transparent font-medium text-white"
                    : "text-white hover:bg-white/[0.05]",
                )}
              >
                {active ? (
                  <span className="absolute left-0 h-5 w-[3px] rounded-r-full bg-amber-400" />
                ) : null}

                <Icon
                  className={cn(
                    "size-[1.05rem] shrink-0",
                    active ? "text-amber-300" : "text-white/75",
                  )}
                  aria-hidden
                />

                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}