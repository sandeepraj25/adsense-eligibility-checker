"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "ghost" | "quiet";
type Size = "sm" | "md" | "lg";

const base =
  "group relative inline-flex items-center justify-center gap-2 rounded-xl font-medium " +
  "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] " +
  "disabled:cursor-not-allowed disabled:opacity-55";

const variants: Record<Variant, string> = {
  /* The one loud element: brand gradient with a lifted glow on hover. */
  primary:
    "grad-brand text-white shadow-[0_10px_36px_-12px_rgba(124,92,255,0.85)] " +
    "hover:shadow-[0_16px_48px_-10px_rgba(124,92,255,0.95)] hover:-translate-y-0.5 " +
    "active:translate-y-0",
  ghost:
    "glass text-cloud-50 hover:border-white/16 hover:bg-white/[0.07] " +
    "hover:-translate-y-0.5 active:translate-y-0",
  quiet:
    "text-cloud-400 hover:text-cloud-50 hover:bg-white/[0.045] border border-transparent",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[0.8125rem]",
  md: "h-11 px-5 text-[0.9375rem]",
  lg: "h-[3.25rem] px-6 text-[0.9375rem]",
};

type CommonProps = {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  ...rest
}: CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...rest}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  children,
  href,
  variant = "primary",
  size = "md",
  className,
  onClick,
}: CommonProps & { href: string; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(base, variants[variant], sizes[size], className)}
    >
      {children}
    </Link>
  );
}
