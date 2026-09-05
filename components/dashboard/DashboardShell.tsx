"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  CreditCard,
  Crown,
  FileText,
  Headphones,
  LayoutDashboard,
  LogOut,
  Menu,
  Radar,
  Settings,
  X,
} from "lucide-react";

import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";

const NAV = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "New Scan",
    href: "/dashboard/checker",
    icon: Radar,
  },
  {
    label: "Reports",
    href: "/dashboard/reports",
    icon: FileText,
  },
  {
    label: "Billing",
    href: "/dashboard/billing",
    icon: CreditCard,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export type ShellPlan = {
  planName: string;
  scansUsed: number;
  scanLimit: number;
  isUsable: boolean;
} | null;

export function DashboardShell({
  user,
  plan,
  children,
}: {
  user: {
    name: string;
    email: string;
  };
  plan: ShellPlan;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent page scrolling when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="min-h-screen bg-ink-950 font-['Inter'] text-white">
      {/* Background glow */}
      <div
        aria-hidden
        className="app-glow no-print pointer-events-none fixed inset-x-0 top-0 h-[60vh]"
      />

      {/* ================= MOBILE HEADER ================= */}
      <header className="glass-deep no-print sticky top-0 z-50 flex items-center justify-between border-b border-white/[0.08] px-4 py-3 lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Logo"
            width={42}
            height={42}
            className="h-9 w-auto object-contain"
          />

          <span className="text-base font-semibold text-white">
            Dashboard
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="dash-nav"
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

      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="no-print fixed inset-y-0 left-0 z-40 hidden w-[22rem] p-5 font-['Inter'] text-white lg:block">
        <div className="glass-deep edge-light flex h-full flex-col overflow-hidden rounded-[2rem] border border-white/[0.08]">

          {/* ================= LOGO + USER ================= */}
          <div className="border-b border-white/[0.08] p-6">
            <Link
              href="/dashboard"
              className="group flex items-center gap-4"
            >
              <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04]">
                <Image
                  src="/logo.png"
                  alt="Website logo"
                  width={48}
                  height={48}
                  className="h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <div className="min-w-0">
                <p className="text-base font-semibold text-white">
                  {user.name}
                </p>

                <p className="mt-1 truncate text-xs text-white/70">
                  {user.email}
                </p>
              </div>
            </Link>
          </div>

          {/* ================= NAVIGATION ================= */}
          <div className="flex-1 overflow-y-auto px-4 py-5">
            <NavList pathname={pathname} />
          </div>

          {/* ================= BOTTOM ================= */}
          <div className="border-t border-white/[0.08] p-4">
            <PlanChip plan={plan} />

            <Link
              href="/dashboard/settings"
              className="mb-3 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/[0.08]"
            >
              <Headphones className="size-[1.05rem] text-white" />
              Support
            </Link>

            <AccountRow user={user} />
          </div>
        </div>
      </aside>

      {/* ================= MOBILE DRAWER ================= */}
      <AnimatePresence>
        {open ? (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
              onClick={() => setOpen(false)}
            />

            {/* Drawer */}
            <motion.aside
              id="dash-nav"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{
                duration: 0.25,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="glass-deep fixed inset-y-0 left-0 z-50 flex w-[19rem] flex-col border-r border-white/[0.08] font-['Inter'] text-white lg:hidden"
            >
              {/* Mobile top */}
              <div className="flex items-center justify-between border-b border-white/[0.08] p-5">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3"
                >
                  <Image
                    src="/logo.png"
                    alt="Website logo"
                    width={42}
                    height={42}
                    className="h-10 w-auto object-contain"
                  />

                  <span className="font-semibold text-white">
                    Dashboard
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="rounded-xl p-2 text-white transition-colors hover:bg-white/[0.08]"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Mobile navigation */}
              <div className="flex-1 overflow-y-auto px-4 py-5">
                <NavList pathname={pathname} />
              </div>

              {/* Mobile bottom */}
              <div className="border-t border-white/[0.08] p-4">
                <PlanChip plan={plan} />

                <Link
                  href="/dashboard/settings"
                  className="mb-3 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/[0.08]"
                >
                  <Headphones className="size-[1.05rem] text-white" />
                  Support
                </Link>

                <AccountRow user={user} />
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      {/* ================= MAIN CONTENT ================= */}
      <div className="relative min-h-screen lg:pl-[22rem]">
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}

/* =========================================================
   NAVIGATION
========================================================= */

function NavList({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="Dashboard">
      <ul className="space-y-2">
        {NAV.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          const Icon = item.icon;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-4 py-3 text-[0.9375rem] font-medium transition-all duration-300",
                  active
                    ? "bg-gradient-to-r from-azure-500/90 to-violet-500/80 text-white shadow-lg shadow-azure-500/15"
                    : "text-white hover:bg-white/[0.08] hover:text-white",
                )}
              >
                <Icon
                  className={cn(
                    "size-[1.05rem] shrink-0",
                    active
                      ? "text-white"
                      : "text-white/90 group-hover:text-white",
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

/* =========================================================
   PLAN CARD
========================================================= */

function PlanChip({ plan }: { plan: ShellPlan }) {
  if (!plan) {
    return (
      <Link
        href="/pricing"
        className="glass mb-4 block rounded-2xl border border-white/[0.08] p-4 text-white transition-colors hover:bg-white/[0.05]"
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
          No active plan
        </p>

        <p className="mt-2 text-sm text-white">
          Choose a plan to run scans
        </p>
      </Link>
    );
  }

  return (
    <Link
      href="/dashboard/billing"
      className="glass edge-light mb-4 block rounded-2xl border border-white/[0.08] p-4 text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-400/30 hover:bg-white/[0.06]"
    >
      <div className="flex items-center gap-2">
        <Crown
          className="size-3.5 text-amber-400"
          strokeWidth={2.4}
        />
  
        <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
          {plan.planName} plan
        </p>
      </div>
  
      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="text-sm text-white">
          <span
            className={cn(
              "font-semibold",
              plan.isUsable ? "text-white" : "text-amber-400",
            )}
          >
            {plan.scansUsed} / {plan.scanLimit}
          </span>{" "}
          scans this month
        </p>
  
        <span className="text-xs font-medium text-white/50">
          {Math.round(
            (plan.scansUsed / plan.scanLimit) * 100,
          )}
          %
        </span>
      </div>
  
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/[0.10]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-400 to-indigo-400 transition-all duration-500"
          style={{
            width: `${Math.min(
              100,
              (plan.scansUsed / plan.scanLimit) * 100,
            )}%`,
          }}
        />
      </div>
    </Link>
  );
}

/* =========================================================
   ACCOUNT ROW
========================================================= */

function AccountRow({
  user,
}: {
  user: {
    name: string;
    email: string;
  };
}) {
  const router = useRouter();
  const { error } = useToast();

  const [busy, setBusy] = useState(false);

  const initial =
    user.name.trim().charAt(0).toUpperCase() || "?";

  async function logout() {
    if (busy) return;

    setBusy(true);

    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Logout failed");
      }

      router.replace("/");
      router.refresh();
    } catch {
      error(
        "Could not log out",
        "Check your connection and try again.",
      );

      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-3">
      {/* Avatar */}
      <span
        aria-hidden
        className="grad-brand grid size-10 shrink-0 place-items-center rounded-full text-sm font-semibold text-white"
      >
        {initial}
      </span>

      {/* User info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">
          {user.name}
        </p>

        <p className="truncate text-xs text-white/70">
          {user.email}
        </p>
      </div>

      {/* Logout */}
      <button
        type="button"
        onClick={logout}
        disabled={busy}
        aria-label="Log out"
        title="Log out"
        className="shrink-0 rounded-xl p-2 text-white/80 transition-colors hover:bg-rose-400/[0.12] hover:text-rose-400 disabled:opacity-55"
      >
        {busy ? (
          <Spinner className="size-4" />
        ) : (
          <LogOut className="size-4" />
        )}
      </button>
    </div>
  );
}